from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional
from .models import CategoryEnum, PriorityEnum, EffortEnum, StatusEnum

# ── User Schemas ──

class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    name: str
    email: str
    bio: str

    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    name: Optional[str] = None
    bio:  Optional[str] = None

class PasswordChange(BaseModel):
    current_password: str
    new_password: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut

# ── Task Schemas ──

class TaskCreate(BaseModel):
    title:       str
    description: Optional[str] = ""
    subject:     Optional[str] = ""
    category:    CategoryEnum = CategoryEnum.Class
    priority:    PriorityEnum = PriorityEnum.Medium
    effort:      EffortEnum = EffortEnum.Medium
    due_date:    datetime

    class Config:
        use_enum_values = True

class TaskStatusUpdate(BaseModel):
    status: StatusEnum

    class Config:
        use_enum_values = True

class TaskUpdate(BaseModel):
    title:         Optional[str] = None
    description:   Optional[str] = None
    subject:       Optional[str] = None
    category:      Optional[CategoryEnum] = None
    priority:      Optional[PriorityEnum] = None
    effort:        Optional[EffortEnum] = None
    due_date:      Optional[datetime] = None
    status:        Optional[StatusEnum] = None
    focus_minutes: Optional[int] = None

    class Config:
        use_enum_values = True

class TaskOut(BaseModel):
    id:            int
    title:         str
    description:   str
    subject:       str
    category:      CategoryEnum
    priority:      PriorityEnum
    effort:        EffortEnum
    due_date:      datetime
    status:        StatusEnum
    focus_minutes: int = 0

    class Config:
        from_attributes = True
        use_enum_values = True


# ── Deck (Flashcard) Schemas ──

from typing import List, Any, Dict

class DeckCreate(BaseModel):
    title: str
    subject: Optional[str] = ""
    difficulty: Optional[str] = "Medium"
    cards: Optional[List[Any]] = []

class DeckUpdate(BaseModel):
    title: Optional[str] = None
    subject: Optional[str] = None
    difficulty: Optional[str] = None
    cards: Optional[List[Any]] = None

class DeckOut(BaseModel):
    id: int
    title: str
    subject: str
    difficulty: str
    cards: List[Any]
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ── Quiz (MCQ) Schemas ──

class QuizCreate(BaseModel):
    title: str
    subject: Optional[str] = ""
    difficulty: Optional[str] = "Medium"
    questions: Optional[List[Any]] = []
    best_score: Optional[int] = None

class QuizScoreUpdate(BaseModel):
    score: int

class QuizOut(BaseModel):
    id: int
    title: str
    subject: str
    difficulty: str
    questions: List[Any]
    best_score: Optional[int] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True