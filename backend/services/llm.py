"""OpenAI-compatible LLM client with Groq / OpenAI provider switch."""

from __future__ import annotations

import json
import logging
import re
from typing import Any

from openai import AsyncOpenAI

from config import settings

log = logging.getLogger(__name__)


def _provider() -> str:
    return (settings.LLM_PROVIDER or "groq").strip().lower()


def get_llm_client() -> AsyncOpenAI:
    provider = _provider()
    if provider == "openai":
        if not settings.OPENAI_API_KEY:
            raise RuntimeError("OPENAI_API_KEY is not set")
        return AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
    if not settings.GROQ_API_KEY:
        raise RuntimeError("GROQ_API_KEY is not set")
    return AsyncOpenAI(
        api_key=settings.GROQ_API_KEY,
        base_url="https://api.groq.com/openai/v1",
    )


def text_model() -> str:
    return settings.OPENAI_MODEL if _provider() == "openai" else settings.GROQ_MODEL


def vision_model() -> str:
    return (
        settings.OPENAI_VISION_MODEL
        if _provider() == "openai"
        else settings.GROQ_VISION_MODEL
    )


def extract_json_object(raw: str) -> Any:
    """Parse JSON from a model reply (tolerates markdown fences)."""
    text = (raw or "").strip()
    if not text:
        raise ValueError("Empty model response")

    fence = re.search(r"```(?:json)?\s*([\s\S]*?)```", text, re.IGNORECASE)
    if fence:
        text = fence.group(1).strip()

    try:
        return json.loads(text)
    except json.JSONDecodeError:
        start = text.find("{")
        end = text.rfind("}")
        if start >= 0 and end > start:
            return json.loads(text[start : end + 1])
        start = text.find("[")
        end = text.rfind("]")
        if start >= 0 and end > start:
            return json.loads(text[start : end + 1])
        raise


async def chat_json(
    *,
    system: str,
    user: str | list[dict[str, Any]],
    use_vision: bool = False,
) -> Any:
    client = get_llm_client()
    model = vision_model() if use_vision else text_model()
    messages = [
        {"role": "system", "content": system},
        {"role": "user", "content": user},
    ]
    log.info("LLM request provider=%s model=%s vision=%s", _provider(), model, use_vision)
    response = await client.chat.completions.create(
        model=model,
        messages=messages,
        temperature=0.1,
    )
    content = response.choices[0].message.content or ""
    return extract_json_object(content)
