# Events & Attendance

Create mandal events, mark attendance, and optionally auto-generate fines for absentees.

**Service Entity:** `AdminService.MandalEvents` → `Events`

**Main Fields:** title, event_date, location, has_fine, fine_amount

**Object Page Sections:**
- Event Details (title, description, date, time, location, mandal)
- Fine Configuration (has_fine, fine_amount, fine_deadline)
- Attendance (table — user, status, marked_by, marked_at, remarks)

**Dev URL:** [http://localhost:4004/admin/eventsandattendance/webapp/index.html](http://localhost:4004/admin/eventsandattendance/webapp/index.html)
