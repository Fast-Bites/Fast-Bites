from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    DATABASE_URL: str = ""
    # Comma-separated list of allowed origins (e.g., "https://fastbites.com,https://www.fastbites.com")
    CORS_ORIGINS: str = "http://localhost:8080,http://localhost:5173"
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8004
    SUPABASE_URL: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    # Set to "production" to disable localhost origins
    ENVIRONMENT: str = "development"
    
    @property
    def cors_origins_list(self) -> List[str]:
        """Parse CORS_ORIGINS into a list"""
        origins = [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]
        # In development, also allow localhost
        if self.ENVIRONMENT != "production":
            dev_origins = ["http://localhost:8080", "http://localhost:5173", "http://127.0.0.1:5173"]
            for dev in dev_origins:
                if dev not in origins:
                    origins.append(dev)
        return origins
    
    class Config:
        env_file = ".env"

settings = Settings()



