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
    category    = Column(Enum(CategoryEnum), nullable=False)
    priority    = Column(Enum(PriorityEnum), nullable=False)
    effort      = Column(Enum(EffortEnum), nullable=False)
    due_date    = Column(DateTime, nullable=False)
    status      = Column(Enum(StatusEnum), default=StatusEnum.Todo)
    owner_id    = Column(Integer, ForeignKey("users.id"), nullable=False)
    owner       = relationship("User", back_populates="tasks")
