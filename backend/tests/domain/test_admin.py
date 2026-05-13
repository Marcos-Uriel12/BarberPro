"""Admin entity validation tests — pure Python, no fixtures."""

import pytest

from app.domain.entities.admin import Admin


def test_admin_creation_with_valid_data():
    admin = Admin(username="admin", hashed_password="hashed_abc123")
    assert admin.username == "admin"
    assert admin.hashed_password == "hashed_abc123"
    assert admin.id is None


def test_admin_empty_username_raises():
    with pytest.raises(ValueError, match="Admin username cannot be empty"):
        Admin(username="", hashed_password="hashed_abc123")


def test_admin_whitespace_username_raises():
    with pytest.raises(ValueError, match="Admin username cannot be empty"):
        Admin(username="   ", hashed_password="hashed_abc123")


def test_admin_username_too_long_raises():
    with pytest.raises(
        ValueError, match="Admin username must be at most 50 characters"
    ):
        Admin(username="a" * 51, hashed_password="hashed_abc123")


def test_admin_username_exactly_50_is_valid():
    admin = Admin(username="a" * 50, hashed_password="hashed_abc123")
    assert len(admin.username) == 50


def test_admin_empty_password_raises():
    with pytest.raises(
        ValueError, match="Admin hashed_password cannot be empty"
    ):
        Admin(username="admin", hashed_password="")


def test_admin_whitespace_password_raises():
    with pytest.raises(
        ValueError, match="Admin hashed_password cannot be empty"
    ):
        Admin(username="admin", hashed_password="   ")
