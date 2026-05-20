# IU Library Management System

Web application for **International University (HCMIU)** library — borrow/return books, advance orders, and deadline reminders. UI styled to match the IU Office of Student Services portal (navy `#1a3d6b`, red `#d32f2f`).

## Features

- **Login / Register** — Students and lecturers
- **User dashboard** — Search catalog, borrow, return, order unavailable books
- **Reminders** — Due dates, overdue penalties (5,000đ/day), ready orders
- **Role limits** — Students: 3 books / 14 days; Lecturers: 8 books / 30 days

## Demo accounts

| Role      | ID       | Password |
|-----------|----------|----------|
| Student   | IT12345  | 123456   |
| Lecturer  | LEC8901  | 123456   |

## Run locally

```bash
cd iu-library
npm install
npm run dev
```

Open http://localhost:5173

## Tech stack

- React 19 + TypeScript
- React Router 7
- Vite 6
- Local storage for session (demo; replace with backend API for production)

## Next steps (backend)

- Connect to Academic Affairs student import API
- Staff: CRUD books, reports
- Manager: staff management
- Email/push notifications for reminders
