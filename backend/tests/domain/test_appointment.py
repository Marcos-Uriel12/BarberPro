"""Appointment entity validation tests — pure Python, no fixtures."""

from datetime import date, time
from uuid import uuid4

import pytest

from app.domain.entities.appointment import Appointment


def test_appointment_creation_with_valid_data():
    appt = Appointment(
        date=date(2026, 5, 20),
        time=time(14, 0),
        barber_id=uuid4(),
        service_id=uuid4(),
        client_name="Juan Pérez",
        client_phone="+5491122334455",
    )
    assert appt.date == date(2026, 5, 20)
    assert appt.time == time(14, 0)
    assert appt.client_name == "Juan Pérez"
    assert appt.client_phone == "+5491122334455"
    assert appt.status == "pending"
    assert appt.id is None


def test_appointment_explicit_status():
    appt = Appointment(
        date=date(2026, 5, 20),
        time=time(14, 0),
        barber_id=uuid4(),
        service_id=uuid4(),
        client_name="Juan Pérez",
        client_phone="+5491122334455",
        status="confirmed",
    )
    assert appt.status == "confirmed"


def test_appointment_invalid_status_raises():
    with pytest.raises(ValueError, match="Invalid status"):
        Appointment(
            date=date(2026, 5, 20),
            time=time(14, 0),
            barber_id=uuid4(),
            service_id=uuid4(),
            client_name="Juan Pérez",
            client_phone="+5491122334455",
            status="unknown",
        )


def test_appointment_completed_status_valid():
    appt = Appointment(
        date=date(2026, 5, 20),
        time=time(14, 0),
        barber_id=uuid4(),
        service_id=uuid4(),
        client_name="Juan Pérez",
        client_phone="+5491122334455",
        status="completed",
    )
    assert appt.status == "completed"


def test_appointment_cancelled_status_valid():
    appt = Appointment(
        date=date(2026, 5, 20),
        time=time(14, 0),
        barber_id=uuid4(),
        service_id=uuid4(),
        client_name="Juan Pérez",
        client_phone="+5491122334455",
        status="cancelled",
    )
    assert appt.status == "cancelled"


def test_appointment_empty_client_name_raises():
    with pytest.raises(ValueError, match="Client name cannot be empty"):
        Appointment(
            date=date(2026, 5, 20),
            time=time(14, 0),
            barber_id=uuid4(),
            service_id=uuid4(),
            client_name="",
            client_phone="+5491122334455",
        )


def test_appointment_empty_client_phone_raises():
    with pytest.raises(ValueError, match="Client phone cannot be empty"):
        Appointment(
            date=date(2026, 5, 20),
            time=time(14, 0),
            barber_id=uuid4(),
            service_id=uuid4(),
            client_name="Juan Pérez",
            client_phone="",
        )
