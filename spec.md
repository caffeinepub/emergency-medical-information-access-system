# Emergency Medical Information Access System

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- Full-stack web application for emergency medical information access
- Role-based access control: patient and doctor roles
- Patient registration, login, and medical profile management
- QR code generation per patient, downloadable
- Emergency QR View page (public read-only, accessible by scanning QR)
- Doctor login and dashboard with patient search, record updates, notes, and change history
- Landing page with tagline, how-it-works section, register and scan QR CTAs

### Modify
- N/A (new project)

### Remove
- N/A (new project)

## Implementation Plan

### Backend (Motoko)
- User authentication with roles: patient, doctor
- Patient medical profile: name, age, blood group, allergies, medical conditions, current medications, emergency contact
- Store profiles keyed by principal
- Generate unique patient ID used as QR code payload (URL-based)
- Doctor functions: search patient by name/ID, view full profile, update records, add notes
- Change history log per patient record (timestamp, actor, field changed, old/new value)
- Public read-only endpoint to retrieve critical medical info by patient ID (no auth required)
- Role assignment on signup

### Frontend
- Landing page: tagline, 3-step how it works, Register and Scan QR buttons
- Patient auth: sign up (with role=patient) and login forms
- Patient dashboard: profile overview, edit medical details, QR code display and download
- Medical profile form: all required fields
- Emergency QR View page: large text, critical info only, no edit UI, accessible without login
- Doctor login page (separate from patient login)
- Doctor dashboard: search patient, view full medical history, update records, add notes, change history log
- Mobile-first responsive layout
- Clean navigation with role-aware routing
