# DayFrame — Step-by-Step Phase Plan

This document breaks down the development of DayFrame into manageable, chronological phases based on the local-first, cloud-backed architecture.

## Phase 1: Project Setup and Foundational Infrastructure
*Objective: Initialize the application and set up the critical local-first data layers.*

* **Step 1.1: App Initialization**
  * Initialize the mobile framework (e.g., React Native / Expo).
  * Configure Git, ESLint, Prettier, and essential dependencies.
* **Step 1.2: App Navigation Setup**
  * Set up routing (e.g., React Navigation).
  * Define core routes: Onboarding, Home, Timeline, Calendar, Memory Detail, Settings.
* **Step 1.3: Local Storage Layer (SQLite)**
  * Initialize local SQLite database.
  * Create tables: `memories`, `sync_queue`, `user`, `settings`.
* **Step 1.4: File System Layer**
  * Implement utility functions to save, read, and delete images in the app's internal storage (`DayFrame/photos/`).
  * Create thumbnail generation utilities.

## Phase 2: Core MVP UI & Local Flow (Offline-First)
*Objective: Build the core daily loop. The app should be 100% functional offline by the end of this phase.*

* **Step 2.1: Onboarding Flow**
  * Build simple introduction screens explaining "One photo. Every day."
* **Step 2.2: Home Screen**
  * Display today's date.
  * Show an empty frame if no photo exists for today, or the completed memory if it does.
* **Step 2.3: Photo Capture & Picker**
  * Integrate Camera and Gallery permissions.
  * Implement photo capture and selection.
  * Add image preview and confirmation step.
* **Step 2.4: The Save Workflow**
  * Save confirmed photo to internal storage.
  * Create memory metadata record in SQLite.
  * Enforce the "One memory per user per calendar day" rule.
  * Update UI immediately upon local save.
* **Step 2.5: Timeline & Calendar Views**
  * Build the chronological scrolling Timeline using generated thumbnails.
  * Build the monthly Calendar view highlighting days with completed memories.
* **Step 2.6: Memory Detail Screen**
  * Display full-resolution photo, date, and optional caption.

## Phase 3: Background Sync & Cloud Integration
*Objective: Connect the app to the cloud for automatic backup and cross-device syncing without blocking the local user experience.*

* **Step 3.1: Backend Infrastructure Setup**
  * Configure backend services (e.g., Supabase, Firebase) for Database and Object Storage.
* **Step 3.2: Authentication**
  * Implement user login (Google Sign-In / Email) to link local data to a cloud identity.
* **Step 3.3: Sync Queue Engine**
  * Implement logic to queue operations (`UPLOAD_PHOTO`) in SQLite when a memory is saved locally.
* **Step 3.4: Background Sync Worker**
  * Monitor network status.
  * When online: Read `sync_queue` -> Upload Image to Object Storage -> Save Metadata to Cloud DB -> Mark local record as `SYNCED`.
  * Handle fail states (`FAILED`, `RETRY`).
* **Step 3.5: Cloud-to-Local Sync (Restore)**
  * Implement logic to fetch memories from the cloud when logging in on a new device.

## Phase 4: Polish, Secondary Backup, and Launch
*Objective: Finalize the MVP, add optional integrations, and prepare for release.*

* **Step 4.1: Google Drive Integration (Optional)**
  * Implement optional background backup to the user's personal Google Drive.
* **Step 4.2: Streak Tracking**
  * Calculate and display the user's current daily photo streak on the Home screen.
* **Step 4.3: Daily Reminders**
  * Set up local push notifications to remind the user to capture their daily moment.
* **Step 4.4: UX Polish**
  * Refine animations, empty states, and error handling UI.
* **Step 4.5: End-to-End Testing**
  * Test offline photo capture, delayed syncing, and edge cases (e.g., taking a photo at 11:59 PM).

## Version plans:

V1.1 — Cloud & Backup
Sign In / Create Account
Cloud Sync Status
Google Drive Backup
Storage & Data
Privacy

🔵 V2 — The "Memory Product"
Monthly Memories
Yearly Timeline
On This Day
Search
Yearly Recap
Export / Share



Everything has been committed and pushed to main.

  We have a few exciting options for what to tackle next:

  1. Monthly Memories: Refactor the Timeline grid to group photos by Month (e.g., separating August from September).
  2. Search Engine: Build the SQLite Full-Text Search (FTS5) to let users search their past captions.
  3. Google Drive Integration (V1.1): Start the rigorous native setup for true Google Drive backup.

  What would you like to focus on next?

## Current To-Do (V1.1 to V2 Transition)

- [x] **1. Google Drive Integration (V1.1)**
  - [x] Implement Drive REST API for silent background photo backup.
  - [x] Add UI toggle in Settings for Drive Backup.
- [ ] **2. Monthly Memories (V2)**
  - Update TimelineScreen to inject sticky headers for each Month.
  - Build "Month Summary" cards.
- [ ] **3. Search Engine (V2)**
  - Add SQLite FTS5 virtual table for searching past captions.
  - Build a real-time Search screen.


## Phase 7: Delight & Sharing (V2)
- [ ] **7.1 Yearly Recap:** Build a specialized horizontal-scrolling "Story" UI (like Spotify Wrapped) to curate the best 12 photos of the year.
- [ ] **7.2 Export / Share:** Implement expo-sharing and react-native-view-shot to export a stylized Polaroid version of a memory.
