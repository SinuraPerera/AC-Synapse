# Phase 0: Payload-First Security TDD Specification (`security_spec.md`)

## 1. Data Invariants

1. **Public Read Collections (`events`, `announcements`, `liveUpdates`)**:
   - Anyone (including unauthenticated campus visitors) can `get` and `list` documents in `/events/{eventId}`, `/announcements/{announcementId}`, and `/liveUpdates/{updateId}`.
   - Only authenticated administrators (`isAdmin()`) can `create`, `update`, or `delete` documents in `/announcements/{announcementId}` and `/liveUpdates/{updateId}`.
   - Only authenticated administrators (`isAdmin()`) can `create` or `delete` documents in `/events/{eventId}`, or modify core event metadata. Authenticated users executing a registration or cancellation transaction may only update `registeredCount` by `+1` or `-1` within `[0, totalSeats]` while keeping all other `Event` fields unchanged.
2. **User-Scoped Registrations (`/registrations/{registrationId}`)**:
   - Every registration document contains `userId` matching `request.auth.uid` on creation, plus validated strings (`ticketCode` matching `^RCP-[A-Z0-9]{4}-[A-Z0-9]{4}$`, `attendeeName`, `email`, `phone`, `eventId`, `status` in `['Confirmed', 'Waitlisted']`).
   - Users can `get`, `list`, `create`, and `delete` only their own registrations (`resource.data.userId == request.auth.uid`), while admins (`isAdmin()`) can read and update (e.g. gate check-in or waitlist promotion) all registrations.
3. **PII Isolation (`/users/{userId}` and `/registrations/{registrationId}`)**:
   - `/users/{userId}` contains `email` and role metadata and is strictly readable only by `request.auth.uid == userId` or `isAdmin()`.
   - Non-admin users cannot self-assign `isAdmin: true` unless their authenticated email matches the designated bootstrap admin accounts (`1geekwiths@gmail.com` or `admin@anandacollege.edu.lk`).

## 2. The "Dirty Dozen" Payloads

1. **Shadow Field Injection on Event (`events/evt-1`)**: Adding `"hacked": true` to an event payload -> Rejected by `hasOnly()`.
2. **Unauthorized Announcement Creation (`announcements/ann-99`)**: Standard student user attempting to create an announcement -> Rejected by `isAdmin()`.
3. **Unauthorized Live Update Creation (`liveUpdates/lu-99`)**: Unauthenticated or student user attempting to post a live score -> Rejected by `isAdmin()`.
4. **Identity Spoofing on Registration (`registrations/reg-1`)**: User `uid_A` attempting to create a registration with `userId: "uid_B"` -> Rejected by `incoming().userId == request.auth.uid`.
5. **Cross-User Registration Read/Scrape (`registrations`)**: User `uid_A` attempting `get` or `list` on registrations where `userId == "uid_B"` -> Rejected by `resource.data.userId == request.auth.uid || isAdmin()`.
6. **Privilege Escalation on User Profile (`users/uid_student`)**: Student setting `isAdmin: true` in their profile update -> Rejected by `incoming().isAdmin == false` for non-admin emails.
7. **Unauthorized Self-Check-In (`registrations/reg-1`)**: Student attempting to update `checkedIn: true` on their own ticket -> Rejected because only `isAdmin()` can update `checkedIn`.
8. **Malformed Ticket Code (`registrations/reg-2`)**: Creating a registration with `ticketCode: "FAKE-123"` -> Rejected by regex `^RCP-[A-Z0-9]{4}-[A-Z0-9]{4}$`.
9. **Oversized String Denial-of-Wallet (`registrations/reg-3`)**: Submitting a 10,000-character `attendeeName` -> Rejected by `.size() <= 160`.
10. **Invalid Path ID Poisoning (`events/invalid..id$$`)**: Writing to a document ID containing illegal characters -> Rejected by `isValidId()`.
11. **Seat Count Tampering (`events/evt-1`)**: Student attempting to change `totalSeats` or `title` during a registration transaction -> Rejected by `affectedKeys().hasOnly(['registeredCount'])`.
12. **Out-of-Bounds Seat Count (`events/evt-1`)**: Attempting to set `registeredCount` greater than `totalSeats` or less than `0` -> Rejected by boundary check `incoming().registeredCount >= 0 && incoming().registeredCount <= existing().totalSeats`.
