"""Expense + History + Notification routes with full multi-tenant user scoping."""
from __future__ import annotations
from datetime import date
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from database.db import get_db
from models.tables import Expense, HistoryEntry, Notification, Farm
from schemas.schemas import (
    ExpenseCreate, ExpenseOut, HistoryCreate, HistoryOut, NotificationOut
)
from auth.deps import get_current_farm

# ── Expenses ───────────────────────────────────────────────────────────────────
expense_router = APIRouter(prefix="/api/expenses", tags=["Expenses"])


@expense_router.get("")
def list_expenses(
    farm: Farm = Depends(get_current_farm),
    db: Session = Depends(get_db)
):
    expenses = db.query(Expense).filter(Expense.farm_id == farm.id)\
        .order_by(Expense.date.desc()).all()
    total = sum(e.amount for e in expenses)
    by_cat: dict[str, float] = {}
    for e in expenses:
        by_cat[e.category] = by_cat.get(e.category, 0) + e.amount
    return {
        "total": total,
        "by_category": by_cat,
        "items": [
            {"id": e.id, "category": e.category, "amount": e.amount,
             "description": e.description, "date": str(e.date)}
            for e in expenses
        ]
    }


@expense_router.post("", response_model=ExpenseOut)
def add_expense(
    expense_in: ExpenseCreate,
    farm: Farm = Depends(get_current_farm),
    db: Session = Depends(get_db)
):
    obj = Expense(farm_id=farm.id, **expense_in.model_dump())
    if not obj.date:
        obj.date = date.today()
    db.add(obj)
    # Also add to history
    db.add(HistoryEntry(
        farm_id=farm.id,
        entry_type="Expense",
        title=f"Expense Added — {expense_in.category}",
        detail=f"₹{expense_in.amount} · {expense_in.description or ''}",
        date=obj.date,
    ))
    db.commit()
    db.refresh(obj)
    return obj


# ── History ────────────────────────────────────────────────────────────────────
history_router = APIRouter(prefix="/api/history", tags=["History"])


@history_router.get("")
def list_history(
    entry_type: Optional[str] = None,
    farm: Farm = Depends(get_current_farm),
    db: Session = Depends(get_db)
):
    q = db.query(HistoryEntry).filter(HistoryEntry.farm_id == farm.id)
    if entry_type:
        q = q.filter(HistoryEntry.entry_type == entry_type)
    entries = q.order_by(HistoryEntry.date.desc(), HistoryEntry.created_at.desc()).all()
    return [
        {"id": e.id, "entry_type": e.entry_type, "title": e.title,
         "detail": e.detail, "date": str(e.date)}
        for e in entries
    ]


@history_router.post("")
def add_history(
    entry_in: HistoryCreate,
    farm: Farm = Depends(get_current_farm),
    db: Session = Depends(get_db)
):
    obj = HistoryEntry(farm_id=farm.id, **entry_in.model_dump())
    if not obj.date:
        obj.date = date.today()
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return {"id": obj.id, "message": "History entry added"}


# ── Notifications ──────────────────────────────────────────────────────────────
notif_router = APIRouter(prefix="/api/notifications", tags=["Notifications"])
from services.notification_service import generate_notifications


@notif_router.get("")
def list_notifications(
    farm: Farm = Depends(get_current_farm),
    db: Session = Depends(get_db)
):
    try:
        generate_notifications(farm.id, db)
    except Exception:
        pass
    notifs = db.query(Notification).filter(Notification.farm_id == farm.id)\
        .order_by(Notification.created_at.desc()).all()
    return [
        {"id": n.id, "priority": n.priority, "title": n.title,
         "body": n.body, "is_read": n.is_read,
         "created_at": n.created_at.isoformat()}
        for n in notifs
    ]


@notif_router.post("/{notif_id}/read")
def mark_read(
    notif_id: str,
    farm: Farm = Depends(get_current_farm),
    db: Session = Depends(get_db)
):
    n = db.query(Notification).filter(Notification.id == notif_id, Notification.farm_id == farm.id).first()
    if not n:
        raise HTTPException(404, "Notification not found on this farm")
    n.is_read = True
    db.commit()
    return {"message": "Marked as read"}


@notif_router.post("/read-all")
def mark_all_read(
    farm: Farm = Depends(get_current_farm),
    db: Session = Depends(get_db)
):
    db.query(Notification).filter(
        Notification.farm_id == farm.id, Notification.is_read == False
    ).update({"is_read": True})
    db.commit()
    return {"message": "All notifications marked as read"}
