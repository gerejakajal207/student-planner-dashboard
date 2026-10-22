from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app import models, schemas, auth
from app.database import get_db

router = APIRouter(prefix="/decks", tags=["Flashcard Decks"])


@router.get("/", response_model=List[schemas.DeckOut])
def get_user_decks(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    return (
        db.query(models.Deck)
        .filter(models.Deck.user_id == current_user.id)
        .order_by(models.Deck.created_at.desc())
        .all()
    )


@router.post("/", response_model=schemas.DeckOut, status_code=status.HTTP_201_CREATED)
def create_deck(
    data: schemas.DeckCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    deck = models.Deck(
        title=data.title.strip(),
        subject=(data.subject or "").strip() or data.title.strip(),
        difficulty=data.difficulty or "Medium",
        cards=data.cards or [],
        user_id=current_user.id,
    )
    db.add(deck)
    db.commit()
    db.refresh(deck)
    return deck


@router.put("/{deck_id}", response_model=schemas.DeckOut)
def update_deck(
    deck_id: int,
    data: schemas.DeckUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    deck = (
        db.query(models.Deck)
        .filter(models.Deck.id == deck_id, models.Deck.user_id == current_user.id)
        .first()
    )
    if not deck:
        raise HTTPException(status_code=404, detail="Deck not found")

    if data.title is not None:
        deck.title = data.title.strip()
    if data.subject is not None:
        deck.subject = data.subject.strip()
    if data.difficulty is not None:
        deck.difficulty = data.difficulty
    if data.cards is not None:
        deck.cards = data.cards

    db.commit()
    db.refresh(deck)
    return deck


@router.delete("/{deck_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_deck(
    deck_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    deck = (
        db.query(models.Deck)
        .filter(models.Deck.id == deck_id, models.Deck.user_id == current_user.id)
        .first()
    )
    if not deck:
        raise HTTPException(status_code=404, detail="Deck not found")

    db.delete(deck)
    db.commit()
    return None
