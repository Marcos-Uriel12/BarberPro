from dataclasses import dataclass, field
from uuid import UUID


@dataclass
class Admin:
    username: str
    hashed_password: str
    id: UUID | None = field(default=None)

    def __post_init__(self) -> None:
        if not self.username or not self.username.strip():
            raise ValueError("Admin username cannot be empty")
        if len(self.username) > 50:
            raise ValueError("Admin username must be at most 50 characters")
        if not self.hashed_password or not self.hashed_password.strip():
            raise ValueError("Admin hashed_password cannot be empty")
