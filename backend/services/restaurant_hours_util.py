"""Compute open/closed status and display strings from restaurant_hours rows."""
from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, time, timedelta, timezone
from typing import Iterable, Optional

try:
    from zoneinfo import ZoneInfo

    APP_TZ = ZoneInfo("Africa/Lagos")
except Exception:
    # Windows without tzdata package — Lagos is UTC+1 (WAT), no DST
    APP_TZ = timezone(timedelta(hours=1))
# Matches Python weekday(): Monday=0 … Sunday=6
DAY_LABELS = ("Mon", "Tue", "Wed", "Thurs", "Fri", "Sat", "Sun")
FULL_DAY_LABELS = (
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
)


@dataclass
class HoursRow:
    day_of_week: int
    open_time: Optional[time]
    close_time: Optional[time]
    is_closed: bool


def parse_hhmm(value: Optional[str]) -> Optional[time]:
    if not value:
        return None
    parts = value.split(":")
    if len(parts) < 2:
        return None
    return time(int(parts[0]), int(parts[1]))


def format_time_12h(t: Optional[time]) -> str:
    if t is None:
        return ""
    hour = t.hour % 12 or 12
    minute = t.minute
    suffix = "AM" if t.hour < 12 else "PM"
    if minute == 0:
        return f"{hour}:00 {suffix}"
    return f"{hour}:{minute:02d} {suffix}"


def _schedule_key(row: HoursRow) -> tuple:
    if row.is_closed or not row.open_time or not row.close_time:
        return ("closed",)
    return ("open", row.open_time, row.close_time)


def _format_day_range(start_dow: int, end_dow: int) -> str:
    if not (0 <= start_dow <= 6 and 0 <= end_dow <= 6):
        return f"Day {start_dow}"
    if start_dow == end_dow:
        return DAY_LABELS[start_dow]
    return f"{DAY_LABELS[start_dow]} – {DAY_LABELS[end_dow]}"


def _format_schedule_line(key: tuple) -> str:
    if key == ("closed",):
        return "Closed"
    _, open_t, close_t = key
    return f"{format_time_12h(open_t)} – {format_time_12h(close_t)}"


def format_operating_hours_text(rows: Iterable[HoursRow]) -> str:
    ordered = sorted(rows, key=lambda r: r.day_of_week)
    if not ordered:
        return "No hours configured for this restaurant yet."

    groups: list[tuple[int, int, tuple]] = []
    i = 0
    while i < len(ordered):
        key = _schedule_key(ordered[i])
        start_dow = ordered[i].day_of_week
        end_dow = start_dow
        j = i
        while (
            j + 1 < len(ordered)
            and _schedule_key(ordered[j + 1]) == key
            and ordered[j + 1].day_of_week == ordered[j].day_of_week + 1
        ):
            j += 1
            end_dow = ordered[j].day_of_week
        groups.append((start_dow, end_dow, key))
        i = j + 1

    lines = [
        f"{_format_day_range(start, end)}: {_format_schedule_line(key)}"
        for start, end, key in groups
    ]
    return "\n".join(lines)


def _row_for_weekday(rows: list[HoursRow], weekday: int) -> Optional[HoursRow]:
    for row in rows:
        if row.day_of_week == weekday:
            return row
    return None


def _is_open_at(rows: list[HoursRow], at: datetime) -> bool:
    row = _row_for_weekday(rows, at.weekday())
    if not row or row.is_closed or not row.open_time or not row.close_time:
        return False
    now_t = at.time()
    if row.close_time > row.open_time:
        return row.open_time <= now_t < row.close_time
    # Overnight window (e.g. 22:00 – 02:00)
    return now_t >= row.open_time or now_t < row.close_time


def _next_opening(rows: list[HoursRow], at: datetime) -> tuple[datetime, HoursRow] | None:
    for offset in range(1, 8):
        candidate_day = at + timedelta(days=offset)
        row = _row_for_weekday(rows, candidate_day.weekday())
        if row and not row.is_closed and row.open_time:
            open_dt = datetime.combine(candidate_day.date(), row.open_time, tzinfo=at.tzinfo)
            return open_dt, row
    return None


def compute_hours_display(
    rows: list[HoursRow],
    *,
    fallback_is_open: Optional[bool] = None,
    now: Optional[datetime] = None,
) -> tuple[Optional[bool], str, str]:
    """
    Returns (is_open_now, status_line, operating_hours_text).
    status_line examples: "Closes at 10:00 PM", "Opens at 9:00 AM tomorrow"
    """
    operating_text = format_operating_hours_text(rows)
    if not rows:
        if fallback_is_open is True:
            return True, "Open", operating_text
        if fallback_is_open is False:
            return False, "Closed", operating_text
        return None, "Hours not available", operating_text

    at = now or datetime.now(APP_TZ)
    if at.tzinfo is None:
        at = at.replace(tzinfo=APP_TZ)
    else:
        at = at.astimezone(APP_TZ)

    open_now = _is_open_at(rows, at)
    today = _row_for_weekday(rows, at.weekday())

    if open_now and today and today.close_time:
        status = f"Closes at {format_time_12h(today.close_time)}"
        return True, status, operating_text

    if not open_now:
        # Same-day opening later today
        if today and not today.is_closed and today.open_time and at.time() < today.open_time:
            status = f"Opens at {format_time_12h(today.open_time)}"
            return False, status, operating_text

        nxt = _next_opening(rows, at)
        if nxt:
            open_dt, row = nxt
            day_delta = (open_dt.date() - at.date()).days
            if day_delta == 1:
                status = f"Opens at {format_time_12h(row.open_time)} tomorrow"
            elif day_delta <= 6:
                status = f"Opens {FULL_DAY_LABELS[open_dt.weekday()]} at {format_time_12h(row.open_time)}"
            else:
                status = f"Opens at {format_time_12h(row.open_time)}"
            return False, status, operating_text

        return False, "Closed", operating_text

    return open_now, "Open", operating_text
