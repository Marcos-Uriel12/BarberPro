"""Barber entity validation tests — pure Python, no fixtures."""

from decimal import Decimal

import pytest

from app.domain.entities.barber import Barber


def test_barber_creation_with_valid_data():
    barber = Barber(name="Carlos", phone="+5491112345678")
    assert barber.name == "Carlos"
    assert barber.phone == "+5491112345678"
    assert barber.id is None
    assert barber.price is None


def test_barber_creation_with_optional_price():
    barber = Barber(
        name="Carlos", phone="+5491112345678", price=Decimal("150.00")
    )
    assert barber.price == Decimal("150.00")


def test_barber_empty_name_raises():
    with pytest.raises(ValueError, match="Barber name cannot be empty"):
        Barber(name="", phone="+5491112345678")


def test_barber_whitespace_name_raises():
    with pytest.raises(ValueError, match="Barber name cannot be empty"):
        Barber(name="   ", phone="+5491112345678")


def test_barber_empty_phone_raises():
    with pytest.raises(ValueError, match="Barber phone cannot be empty"):
        Barber(name="Carlos", phone="")


def test_barber_negative_price_raises():
    with pytest.raises(ValueError, match="Barber price must be non-negative"):
        Barber(
            name="Carlos",
            phone="+5491112345678",
            price=Decimal("-10.00"),
        )
