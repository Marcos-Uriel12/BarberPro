"""Service entity validation tests — pure Python, no fixtures."""

from decimal import Decimal

import pytest

from app.domain.entities.service import Service


def test_service_creation_with_valid_data():
    service = Service(
        name="Corte Clásico", price=Decimal("200.00"), duration_minutes=30
    )
    assert service.name == "Corte Clásico"
    assert service.price == Decimal("200.00")
    assert service.duration_minutes == 30
    assert service.id is None


def test_service_empty_name_raises():
    with pytest.raises(ValueError, match="Service name cannot be empty"):
        Service(name="", price=Decimal("200.00"), duration_minutes=30)


def test_service_zero_price_raises():
    with pytest.raises(ValueError, match="Service price must be positive"):
        Service(
            name="Corte", price=Decimal("0.00"), duration_minutes=30
        )


def test_service_negative_price_raises():
    with pytest.raises(ValueError, match="Service price must be positive"):
        Service(
            name="Corte",
            price=Decimal("-10.00"),
            duration_minutes=30,
        )


def test_service_zero_duration_raises():
    with pytest.raises(
        ValueError, match="Service duration must be positive"
    ):
        Service(
            name="Corte", price=Decimal("200.00"), duration_minutes=0
        )


def test_service_negative_duration_raises():
    with pytest.raises(
        ValueError, match="Service duration must be positive"
    ):
        Service(
            name="Corte", price=Decimal("200.00"), duration_minutes=-5
        )
