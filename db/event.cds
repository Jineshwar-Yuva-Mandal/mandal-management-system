namespace com.samanvay;

using { com.samanvay.Mandals } from './mandal';
using { com.samanvay.Users } from './users';
using { managed, cuid } from '@sap/cds/common';

// ─── Events ───
// Each mandal organizes events; events optionally carry a fine for non-attendance
entity Events : managed, cuid {
  title         : String(200);
  description   : String(1000);
  event_date    : Date;
  start_time    : Time;
  end_time      : Time;
  location      : String(255);
  mandal        : Association to Mandals;

  // Fine configuration (optional per event)
  has_fine      : Boolean default false;
  fine_amount   : Decimal(10,2) default 0;
  fine_deadline  : Date;  // Pay fine before this date

  attendance    : Composition of many EventAttendance on attendance.event = $self;
}

// ─── Event Attendance ───
// Tracks who attended, who missed — basis for fine generation
entity EventAttendance : managed, cuid {
  event         : Association to Events;
  user          : Association to Users;
  mandal        : Association to Mandals;
  status        : String enum { present; absent; excused; } default 'absent';
  marked_by     : Association to Users;  // Admin/assigned member who marked attendance
  marked_at     : Timestamp;
  remarks       : String(500);
}
