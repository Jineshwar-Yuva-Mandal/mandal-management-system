# Samanvay — Mandal Management System

A comprehensive platform for managing mandal operations — members, events, finances, courses, and more.

Built with [SAP Cloud Application Programming Model (CAP)](https://cap.cloud.sap/docs/) and [SAPUI5 Fiori Elements](https://ui5.sap.com/).

## Architecture

| Layer | Technology | Details |
|---|---|---|
| **Backend** | SAP CAP (Node.js) | OData V4 services, SQLite database |
| **Frontend** | SAPUI5 Fiori Elements | List Report + Object Page apps |
| **Shell** | Custom UI5 Component | Launchpad with ShellBar, SideNavigation, tile dashboard |
| **Hosting** | Vercel (UI) + Render (API) | Static frontend, proxied API calls |

## Project Structure

```
├── app/
│   ├── launchpage.html          # Entry point — bootstraps UI5 shell
│   ├── shell/                   # Custom launchpad (Component, views, controller, CSS)
│   ├── vercel.json              # Vercel deployment config
│   └── admin/                   # Fiori Elements apps
│       ├── members/             # Member management
│       ├── joinrequests/        # Membership request review
│       ├── positions/           # Positions & permissions
│       ├── eventsandattendance/ # Events & attendance tracking
│       ├── courses/             # Course & syllabus management
│       ├── fines/               # Fine tracking & payment verification
│       ├── ledger/              # Financial ledger
│       └── mandal/              # Mandal settings
├── db/                          # CDS data models
│   ├── users.cds                # Users entity (80+ fields)
│   ├── mandal.cds               # Mandals & memberships
│   ├── authorization.cds        # Positions, permissions (entity + field level)
│   ├── membership.cds           # Join requests, approval workflows
│   ├── event.cds                # Events & attendance
│   ├── course.cds               # Courses, syllabus, assignments, progress
│   ├── fine.cds                 # Fines lifecycle
│   ├── ledger.cds               # Financial ledger entries
│   └── member_field_config.cds  # Per-mandal registration form config
├── srv/
│   ├── admin-service.cds        # AdminService — mandal admin operations
│   ├── member-service.cds       # MemberService — member self-service
│   ├── platform-service.cds     # PlatformService — platform admin
│   └── public-service.cds       # PublicService — unauthenticated access
└── package.json
```

## Getting Started

### Prerequisites

- Node.js ≥ 20
- npm

### Install & Run

```bash
npm install
cds watch
```

Open [http://localhost:4004/launchpage.html](http://localhost:4004/launchpage.html) in your browser.

### Individual Apps (dev)

```bash
npm run watch-members
npm run watch-fines
# etc. — see package.json for all watch-* scripts
```

## Deployment

### UI (Vercel)

The `app/` folder is deployed as static files. No build step required — UI5 loads from CDN.

| Setting | Value |
|---|---|
| Root Directory | `app` |
| Build Command | _(empty)_ |
| Output Directory | `.` |
| Framework | Other |

API calls to `/api/*` are proxied to the backend via `vercel.json` rewrites.

### Backend (Render)

CAP Node.js server with SQLite. Build command:

```bash
npm install && npx cds deploy --to sqlite:db/samanvay.db
```

## Admin Apps

| App | Entity | Description |
|---|---|---|
| Members | `Users` | Manage mandal members — profiles, contact, family, skills |
| Join Requests | `MembershipRequests` | Review and approve membership applications |
| Positions | `Positions` | Define committee positions and assign CRUD permissions |
| Events & Attendance | `Events` | Create events, mark attendance, auto-generate fines |
| Courses | `Courses` | Manage courses, syllabus topics, member assignments |
| Fines | `Fines` | Track fines, verify payments, link to ledger |
| Financial Ledger | `LedgerEntries` | Central income/expense records with verification |
| Mandal Settings | `Mandals` | Configure mandal info, joining fees, admin ownership |

## License

See [LICENSE](LICENSE).
