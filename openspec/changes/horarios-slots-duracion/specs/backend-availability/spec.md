# Delta for Backend Availability & Slots

## ADDED Requirements

### Requirement: Create Availability Entry (Admin)

The system MUST allow authenticated admin users to create availability entries for barbers via HTTP POST.

#### Scenario: Admin creates availability for a barber

- GIVEN an authenticated admin user
- AND a valid barber_id exists
- AND the request body contains valid day_of_week (0-6), start_time (HH:MM), and end_time (HH:MM)
- WHEN POST /api/v1/availability is called with the availability data
- THEN the system creates the availability entry
- AND returns 201 Created with the created availability object

#### Scenario: Unauthorized user attempts to create availability

- GIVEN an unauthenticated or non-admin user
- WHEN POST /api/v1/availability is called
- THEN the system returns 401 Unauthorized or 403 Forbidden

### Requirement: Delete Availability Entry (Admin)

The system MUST allow authenticated admin users to delete availability entries via HTTP DELETE.

#### Scenario: Admin deletes availability entry

- GIVEN an authenticated admin user
- AND an availability entry exists with a valid UUID
- WHEN DELETE /api/v1/availability/{id} is called
- THEN the system removes the availability entry
- AND returns 204 No Content

#### Scenario: Delete non-existent availability

- GIVEN an authenticated admin user
- AND an availability_id that does not exist
- WHEN DELETE /api/v1/availability/{id} is called
- THEN the system returns 404 Not Found

### Requirement: List Availabilities for a Barber

The system MUST return all availability entries for a specific barber via HTTP GET.

#### Scenario: Public user queries barber availability

- GIVEN a valid barber_id
- WHEN GET /api/v1/availability/barbers/{barber_id} is called
- THEN the system returns 200 OK
- AND returns an array of availability entries for that barber
- AND the endpoint is publicly accessible (no auth required)

### Requirement: Query Slots with Service Duration

The system MUST calculate time slots based on the service duration when service_id is provided as a query parameter.

#### Scenario: Query slots with service duration

- GIVEN a barber has availability configured for a specific day
- AND a service exists with duration_minutes = 45
- WHEN GET /api/v1/availability/barbers/{id}/slots?date={date}&service_id={service_id} is called
- THEN the system returns time slots of 45 minutes each
- AND slots are aligned within the barber's availability windows

#### Scenario: Query slots without service (backward compatibility)

- GIVEN a barber has availability configured
- WHEN GET /api/v1/availability/barbers/{id}/slots?date={date} is called (no service_id)
- THEN the system returns time slots of 30 minutes each (default)
- AND maintains backward compatibility with existing clients

### Requirement: Filter Appointments by Barber and Date

The system MUST efficiently filter appointments by barber_id and date when calculating available slots.

#### Scenario: Filter appointments for slot calculation

- GIVEN a barber has existing appointments on a specific date
- WHEN calculating available slots for that barber and date
- THEN the system only considers appointments for that specific barber
- AND only appointments matching the query_date
- AND excludes appointments with status other than "pending" or "confirmed"

## MODIFIED Requirements

### Requirement: Get Slots Use Case

The GetSlotsUseCase MUST accept an optional service_id parameter and inject ServiceRepository to fetch service duration.

The system MUST calculate slot size dynamically based on service.duration_minutes when service_id is provided.

#### Scenario: Calculate slots with custom duration

- GIVEN a barber available from 09:00 to 17:00
- AND a service with duration_minutes = 60
- WHEN GetSlotsUseCase.execute(barber_id, date, service_id) is called
- THEN the system returns slots: 09:00-10:00, 10:00-11:00, ..., 16:00-17:00
- AND each slot has a duration of 60 minutes

#### Scenario: Calculate slots with default duration

- GIVEN a barber available from 09:00 to 10:00
- WHEN GetSlotsUseCase.execute(barber_id, date, null) is called
- THEN the system returns slots: 09:00-09:30, 09:30-10:00
- AND each slot has a duration of 30 minutes (default)

(Previously: GetSlotsUseCase hardcoded 30-minute slots and did not accept service_id parameter)

## REMOVED Requirements

### Requirement: Hardcoded 30-minute Slots

(Reason: Replaced by dynamic slot duration based on service configuration to support services of varying lengths)

### Requirement: Unfiltered Appointment Query

(Reason: Previous implementation fetched all appointments and filtered in memory, causing performance issues and incorrect filtering. Replaced with targeted query by barber_id and date)
