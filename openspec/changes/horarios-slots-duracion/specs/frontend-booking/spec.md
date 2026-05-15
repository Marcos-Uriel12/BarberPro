# Delta for Frontend Booking & Admin UI

## ADDED Requirements

### Requirement: Admin UI for Managing Barber Availability

The system MUST provide a UI in the admin panel for managing barber availability schedules.

#### Scenario: Admin opens availability modal from BarbersPage

- GIVEN the admin is viewing the BarbersPage
- AND there is a list of barbers displayed
- WHEN the admin clicks the "Horarios" button on a barber row
- THEN a modal opens showing the 7 days of the week (Monday to Sunday)
- AND each day displays: toggle (active/inactive), start time input, end time input
- AND existing availability for that barber is loaded and displayed

#### Scenario: Admin sets availability for a day

- GIVEN the availability modal is open
- AND a day is toggled as active
- AND start_time and end_time are valid (start < end)
- WHEN the admin clicks "Guardar"
- THEN the system calls POST /api/v1/availability
- AND the modal shows success feedback
- AND the availability is persisted for that day

#### Scenario: Admin removes availability for a day

- GIVEN the availability modal is open
- AND a day has existing availability configured
- WHEN the admin toggles the day as inactive OR clicks a delete button
- THEN the system calls DELETE /api/v1/availability/{id}
- AND the availability is removed from the UI

### Requirement: Booking Context Exposes Service Duration

The BookingContext MUST track and expose the selected service's duration_minutes.

#### Scenario: Service duration is set when selecting a service

- GIVEN a user selects a service in StepServiceSelect
- AND the service has duration_minutes = 45
- WHEN the service is selected
- THEN the BookingContext stores serviceDuration = 45
- AND serviceDuration is available to all booking steps

### Requirement: Availability Hook Accepts Service ID

The useAvailability hook MUST accept an optional serviceId parameter to fetch slots with correct duration.

#### Scenario: Hook fetches slots with service duration

- GIVEN useAvailability is called with barberId, date, and serviceId
- WHEN the hook fetches slots from the API
- THEN it includes service_id as a query parameter
- AND the returned slots have duration matching the service

#### Scenario: Hook fetches slots with default duration

- GIVEN useAvailability is called with barberId and date (no serviceId)
- WHEN the hook fetches slots from the API
- THEN it does not include service_id query parameter
- AND the returned slots have default 30-minute duration

### Requirement: StepSlotSelect Passes Service ID

The StepSlotSelect component MUST pass the serviceId to the useAvailability hook.

#### Scenario: Step displays service-duration slots

- GIVEN a user has selected a barber, service, and date
- AND the service has duration_minutes = 60
- WHEN StepSlotSelect renders
- THEN it calls useAvailability(barberId, date, serviceId)
- AND the displayed slots are 60 minutes apart

## MODIFIED Requirements

### Requirement: BookingContext State Management

The BookingContext MUST include serviceDuration in its state to track the selected service's duration.

The context MUST expose serviceDuration to consumers and persist it in localStorage for session recovery.

#### Scenario: Recover serviceDuration from localStorage

- GIVEN a user previously selected a service with duration_minutes = 45
- AND the session was persisted in localStorage
- WHEN the user reloads the page
- THEN the BookingContext recovers serviceDuration from localStorage
- AND the booking flow continues with correct slot durations

(Previously: BookingContext tracked serviceId but not serviceDuration, requiring re-fetching or recalculating duration on each step)

### Requirement: StepServiceSelect Sets Service Duration

The StepServiceSelect component MUST extract and store the service's duration_minutes when a service is selected.

#### Scenario: User selects a service

- GIVEN the user is on StepServiceSelect
- AND services are loaded with their duration_minutes
- WHEN the user selects a service
- THEN the component calls selectService(serviceId)
- AND sets the serviceDuration in the BookingContext
- AND proceeds to the next step

(Previously: StepServiceSelect only stored serviceId, requiring downstream components to fetch service details separately)

## REMOVED Requirements

### Requirement: Static 30-minute Slot Display

(Reason: Replaced by dynamic slot calculation based on service duration to accurately reflect available time windows for different services)

### Requirement: Manual Date Re-selection for Slot Updates

(Reason: Previously users had to re-select date to refresh slots. Now slots automatically update based on service selection)
