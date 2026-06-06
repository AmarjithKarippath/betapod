from datetime import datetime

from pydantic import BaseModel, Field, HttpUrl


class RequestCreate(BaseModel):
    app_name: str = Field(min_length=1, max_length=120)
    play_store_url: HttpUrl
    category: str = Field(min_length=1, max_length=60)
    description: str = Field(min_length=1, max_length=5000)
    tester_count: int = Field(gt=0, le=500)
    duration_days: int = Field(gt=0, le=90)
    location: str = Field(min_length=1, max_length=120)


class RequestOut(BaseModel):
    id: int
    owner_id: int
    app_name: str
    play_store_url: str
    category: str
    description: str
    tester_count: int
    duration_days: int
    location: str
    screenshot_path: str | None
    status: str
    created_at: datetime
    enrolled_count: int = 0
    is_enrolled: bool = False
    is_owner: bool = False

    class Config:
        from_attributes = True


class EnrollmentOut(BaseModel):
    id: int
    tester_id: int
    tester_email: str
    tester_name: str
    created_at: datetime
