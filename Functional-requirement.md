1. Functional Requirements (FR)
Functional requirement describe features, behaviors, and system capabilities.
FR-1: User Authenticatin & Roles
FR-1.1 User Registration
System shall allow users to sign up using email and password
System shall allow selecting a role:
Guest
Host
FR-1.2 User Login
System shall allow registered users to log in
System shall maintain user session (JWT / cookies)
FR-2: User Profile Management
System shall allow users to view their profile
System shall allow users to update:
Name
Profile photo (optional)
FR-3: Property Listig Management (Host)
FR-3.1 Create Listing
Host shall be able to create a property listing
Listing shall include:
Title
Descriptio

Location (city)
Price per night
Max guests
Images
FR-3.2 Update Listing
Host shall be able to edit listing details
FR-3.3 Delete Listing
Host shall be able to delete their listing
FR-4: Property Discovry & Search (Guest)
FR-4.1 Browse Listings
System shall display all available listing
FR-4.2 Search Listings
Guest shall be able to search listings by:
Locatio

Date range
Guest count
FR-4.3 Filter Listing
Guest shal be able to filter by:

Price rang
Property type (optional)
FR-5: Listing Details View
System shall display detailed listing information:
Images
Description
Amenities
Price
Availability calendar
FR-6: Booking Manageent
FR-6.1 Create Booking
Guest shall be able to select dates
System shall check availabilit

System shall prevent double booking
System shall create booking record
FR-6.2 View Bookings
Guest shall be able to view:
Upcoming bookings
Past bookings

FR-6.3 Booking Requests (Host)
Host shall be able to view booking request
Host shall be able to accept or reject bookings
FR-7: Host Dashboard
System shall display host listings
System shall display booking requests per listing
FR-8: Guest Dashboard
System shall display guest bookings
FR-9: Notifications (Basic MVP)
System shall notify:
Guest when booking is confirmed
Host when a booking is requested
(Email or in-app notification is sufficient)
FR-10: Authorization & Access Control
System shall restrict:
Listing creation to hosts
Booking actions to guests
Users shall only manage their own data