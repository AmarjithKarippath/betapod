from typing import Literal

from pydantic import BaseModel, Field

FeedbackKind = Literal["bug", "improvement", "enhancement"]


class FeedbackCreate(BaseModel):
    kind: FeedbackKind
    message: str = Field(min_length=5, max_length=5000)
    page_url: str | None = Field(default=None, max_length=500)
