"""Availability use cases — get slots, set availability."""

from datetime import date, time, timedelta
from uuid import UUID

from app.domain.entities.availability import Availability
from app.domain.interfaces.repositories import AppointmentRepository, AvailabilityRepository


class GetSlotsUseCase:
    """Get available time slots for a barber on a given date."""

    def __init__(
        self,
        availability_repo: AvailabilityRepository,
        appointment_repo: AppointmentRepository,
    ) -> None:
        self._availability_repo = availability_repo
        self._appointment_repo = appointment_repo

    async def execute(self, barber_id: UUID, query_date: date) -> list[dict]:
        """Return list of {start, end, available} slots for the given date."""
        day_of_week = query_date.weekday()
        availabilities = await self._availability_repo.list_by_barber(barber_id)
        day_avail = [a for a in availabilities if a.day_of_week == day_of_week]

        if not day_avail:
            return []

        appointments = await self._appointment_repo.list(status=None, offset=0, limit=1000)
        booked_times = {
            (appt.time, appt.time)
            for appt in appointments
            if appt.date == query_date and appt.status in ("pending", "confirmed")
        }

        slots: list[dict] = []
        for av in day_avail:
            cursor = self._time_to_minutes(av.start_time)
            end_minutes = self._time_to_minutes(av.end_time)

            while cursor + 30 <= end_minutes:
                slot_start = self._minutes_to_time(cursor)
                slot_end = self._minutes_to_time(cursor + 30)

                is_booked = any(
                    slot_start <= s[0] < slot_end or slot_start < s[1] <= slot_end
                    for s in booked_times
                )

                slots.append({
                    "start": slot_start.strftime("%H:%M"),
                    "end": slot_end.strftime("%H:%M"),
                    "available": not is_booked,
                })
                cursor += 30

        return slots

    @staticmethod
    def _time_to_minutes(t: time) -> int:
        return t.hour * 60 + t.minute

    @staticmethod
    def _minutes_to_time(minutes: int) -> time:
        return time(hour=minutes // 60, minute=minutes % 60)


class SetAvailabilityUseCase:
    """Set availability for a barber on a given day."""

    def __init__(self, repo: AvailabilityRepository) -> None:
        self._repo = repo

    async def execute(
        self,
        barber_id: UUID,
        day_of_week: int,
        start_time: time,
        end_time: time,
    ) -> Availability:
        availability = Availability(
            barber_id=barber_id,
            day_of_week=day_of_week,
            start_time=start_time,
            end_time=end_time,
        )
        return await self._repo.save(availability)
