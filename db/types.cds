namespace com.samanvay;

// ═══════════════════════════════════════════════════
// Named Enum Types — for proper OData EnumType metadata
// and fixed-value dropdowns in Fiori Elements
// ═══════════════════════════════════════════════════

// ─── Users ───
type Gender : String enum { male; female; other; prefer_not_to_say; };
type MaritalStatus : String enum { single; married; widowed; divorced; prefer_not_to_say; };
type BloodGroup : String enum { A_pos; A_neg; B_pos; B_neg; AB_pos; AB_neg; O_pos; O_neg; NA; };
type Education : String enum { below_10th; ssc; hsc; diploma; graduate; post_graduate; doctorate; other; };
type AnnualIncome : String enum { below_1L; _1L_3L; _3L_5L; _5L_10L; _10L_25L; above_25L; prefer_not_to_say; };
type DietaryPreference : String enum { vegetarian; vegan; jain; no_preference; };
type PlatformRole : String enum { platform_admin; mandal_admin; member; };

// ─── Mandal Memberships ───
type MembershipStatus : String enum { active; inactive; pending; suspended; };

// ─── Approval Workflows ───
type WorkflowType : String enum { member_joining; };
type WorkflowActionType : String enum { approve; notify; };

// ─── Membership Requests ───
type RequestStatus : String enum { submitted; payment_pending; payment_done; under_review; approved; rejected; cancelled; };
type ApprovalDecision : String enum { pending; approved; rejected; };

// ─── Shared ───
type PaymentMode : String enum { cash; upi; bank_transfer; other; };

// ─── Fines ───
type FineStatus : String enum { pending; paid; verified; rejected; waived; };

// ─── Ledger ───
type LedgerEntryType : String enum { fine_income; joining_fee; donation; event_expense; course_expense; misc_income; misc_expense; };
type LedgerDirection : String enum { credit; debit; };
type LedgerStatus : String enum { draft; verified; disputed; };

// ─── Events ───
type AttendanceStatus : String enum { present; absent; excused; };
type RsvpStatus : String enum { attending; not_attending; maybe; };

// ─── Courses ───
type CourseStatus : String enum { active; archived; draft; };
type AssignmentStatus : String enum { assigned; in_progress; completed; overdue; };
type TopicProgressStatus : String enum { not_started; in_progress; completed; };

// ─── Member Field Config ───
type FieldRequirement : String enum { required; optional; hidden; };
