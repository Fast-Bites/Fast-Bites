from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = ""
    FRONTEND_URL: str = "http://localhost:8080"
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8004
    SUPABASE_URL: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    
    class Config:
        env_file = ".env"

settings = Settings()



