from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app import models, schemas, auth
from app.database import get_db

router = APIRouter(prefix="/quizzes", tags=["MCQ Quizzes"])


@router.get("/", response_model=List[schemas.QuizOut])
def get_user_quizzes(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    return (
        db.query(models.Quiz)
        .filter(models.Quiz.user_id == current_user.id)
        .order_by(models.Quiz.created_at.desc())
        .all()
    )


@router.post("/", response_model=schemas.QuizOut, status_code=status.HTTP_201_CREATED)
def create_quiz(
    data: schemas.QuizCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    quiz = models.Quiz(
        title=data.title.strip(),
        subject=(data.subject or "").strip() or data.title.strip(),
        difficulty=data.difficulty or "Medium",
        questions=data.questions or [],
        best_score=data.best_score,
        user_id=current_user.id,
    )
    db.add(quiz)
    db.commit()
    db.refresh(quiz)
    return quiz


@router.patch("/{quiz_id}/score", response_model=schemas.QuizOut)
def update_quiz_score(
    quiz_id: int,
    data: schemas.QuizScoreUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    quiz = (
        db.query(models.Quiz)
        .filter(models.Quiz.id == quiz_id, models.Quiz.user_id == current_user.id)
        .first()
    )
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    # Update best_score to highest achieved
    if quiz.best_score is None or data.score > quiz.best_score:
        quiz.best_score = data.score

    db.commit()
    db.refresh(quiz)
    return quiz


@router.delete("/{quiz_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_quiz(
    quiz_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    quiz = (
        db.query(models.Quiz)
        .filter(models.Quiz.id == quiz_id, models.Quiz.user_id == current_user.id)
        .first()
    )
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    db.delete(quiz)
    db.commit()
    return None
