from sqlalchemy import Column, Integer, String, DateTime, Enum, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from .database import Base
import enum

class CategoryEnum(str, enum.Enum):
    Exam       = "Exam"
    Assignment = "Assignment"
    Class      = "Class"
    Hobby      = "Hobby"

class PriorityEnum(str, enum.Enum):
    Low    = "Low"
    Medium = "Medium"
    High   = "High"

class EffortEnum(str, enum.Enum):
    Low    = "Low"
    Medium = "Medium"
    High   = "High"

class StatusEnum(str, enum.Enum):
    Todo        = "Todo"
    Upcoming    = "Upcoming"
    Pending     = "Pending"
    In_Progress = "In Progress"
    Done        = "Done"


def to_category_enum(val):
    if isinstance(val, CategoryEnum):
        return val
    val_str = str(val or "").strip().lower()
    for c in CategoryEnum:
        if c.value.lower() == val_str or c.name.lower() == val_str:
            return c
    return CategoryEnum.Class


def to_priority_enum(val):
    if isinstance(val, PriorityEnum):
        return val
    val_str = str(val or "").strip().lower()
    for p in PriorityEnum:
        if p.value.lower() == val_str or p.name.lower() == val_str:
            return p
    return PriorityEnum.Medium


def to_effort_enum(val):
    if isinstance(val, EffortEnum):
        return val
    val_str = str(val or "").strip().lower()
    for e in EffortEnum:
        if e.value.lower() == val_str or e.name.lower() == val_str:
            return e
    return EffortEnum.Medium


def to_status_enum(val):
    if isinstance(val, StatusEnum):
        return val
    val_str = str(val or "").strip().lower().replace("_", " ")
    for s in StatusEnum:
        if s.value.lower() == val_str or s.name.lower().replace("_", " ") == val_str:
            return s
    return StatusEnum.Todo


class User(Base):
    __tablename__ = "users"

    id              = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name            = Column(String(100), nullable=False)
    email           = Column(String(255), unique=True, index=True, nullable=False)
    bio             = Column(String(500), default="")
    hashed_password = Column(String(255), nullable=False)

    tasks         = relationship("Task", back_populates="owner", cascade="all, delete-orphan")
    reset_tokens  = relationship("PasswordResetToken", back_populates="user", cascade="all, delete-orphan")


class PasswordResetToken(Base):
    __tablename__ = "password_reset_tokens"

    id         = Column(Integer, primary_key=True, index=True, autoincrement=True)
    token      = Column(String(255), unique=True, index=True, nullable=False)
    user_id    = Column(Integer, ForeignKey("users.id"), nullable=False)
    expires_at = Column(DateTime, nullable=False)
    used       = Column(Boolean, default=False, nullable=False)

    user = relationship("User", back_populates="reset_tokens")


class Task(Base):
    __tablename__ = "tasks"
    id          = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title       = Column(String(200), nullable=False)
    description = Column(Text, default="")
    subject     = Column(String(100), default="")
    category    = Column(Enum(CategoryEnum, name="categoryenum", values_callable=lambda x: [e.value for e in x]), nullable=False, default=CategoryEnum.Class)
    priority    = Column(Enum(PriorityEnum, name="priorityenum", values_callable=lambda x: [e.value for e in x]), nullable=False, default=PriorityEnum.Medium)
    effort      = Column(Enum(EffortEnum, name="effortenum", values_callable=lambda x: [e.value for e in x]), nullable=False, default=EffortEnum.Medium)
    due_date    = Column(DateTime, nullable=False)
    status      = Column(Enum(StatusEnum, name="statusenum", values_callable=lambda x: [e.value for e in x]), default=StatusEnum.Todo)
    owner_id    = Column(Integer, ForeignKey("users.id"), nullable=False)
    owner       = relationship("User", back_populates="tasks")
