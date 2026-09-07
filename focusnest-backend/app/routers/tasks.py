from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app import models, schemas, auth
from app.database import get_db

router = APIRouter(prefix="/tasks", tags=["Tasks"])


@router.get("/", response_model=List[schemas.TaskOut])
def get_all_tasks(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    return (
        db.query(models.Task)
        .filter(models.Task.owner_id == current_user.id)
        .order_by(models.Task.due_date.asc())
        .all()
    )


@router.post("/", response_model=schemas.TaskOut, status_code=status.HTTP_201_CREATED)
def create_task(
    data: schemas.TaskCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    task = models.Task(
        title=data.title,
        description=data.description or "",
        subject=data.subject or "",
        category=data.category,
        priority=data.priority,
        effort=data.effort,
        due_date=data.due_date,
        status=models.StatusEnum.Todo,
        owner_id=current_user.id
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.patch("/{task_id}/status", response_model=schemas.TaskOut)
def update_task_status(
    task_id: int,
    data: schemas.TaskStatusUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    task = db.query(models.Task).filter(
        models.Task.id == task_id,
        models.Task.owner_id == current_user.id
    ).first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    task.status = data.status
    db.commit()
    db.refresh(task)
    return task


@router.put("/{task_id}", response_model=schemas.TaskOut)
def update_task(
    task_id: int,
    data: schemas.TaskUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    task = db.query(models.Task).filter(
        models.Task.id == task_id,
        models.Task.owner_id == current_user.id
    ).first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if data.title is not None:
        task.title = data.title
    if data.description is not None:
        task.description = data.description
    if data.subject is not None:
        task.subject = data.subject
    if data.category is not None:
        task.category = data.category
    if data.priority is not None:
        task.priority = data.priority
    if data.effort is not None:
        task.effort = data.effort
    if data.due_date is not None:
        task.due_date = data.due_date
    if data.status is not None:
        task.status = data.status

    db.commit()
    db.refresh(task)
    return task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    task = db.query(models.Task).filter(
        models.Task.id == task_id,
        models.Task.owner_id == current_user.id
    ).first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    db.delete(task)
    db.commit()