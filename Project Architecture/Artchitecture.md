# DayFrame — System Architecture

## A : System Architecture Plan

## Core Principle
DayFrame follows a local-first architecture.
The app must work offline, while cloud synchronization runs independently in the background.

## Mobile App
- Daily Capture
- Timeline / Calendar
- Memory Detail
- Streak Tracking
- Settings

## Local Data Layer
### SQLite
Stores:
- Memory metadata
- Sync queue
- User/settings
- Sync status

### Local Photo Storage
Stores actual image files separately from SQLite.

Example:
DayFrame/photos/{date}.jpg

## Sync Layer
Capture → Local Photo → SQLite Metadata → Sync Queue → Background Worker

Sync states:
LOCAL_ONLY → UPLOADING → SYNCED
                         ↓
                       FAILED → RETRY

## Cloud Layer
### Cloud Database
Stores:
- User ID
- Memory ID
- Date
- Caption
- Photo URL
- Timestamps
- Sync status

### Object Storage
Stores:
- Original photo
- Thumbnail

## Optional Backup
DayFrame Cloud → Google Drive Backup

Drive backup must not block normal cloud synchronization.

## Authentication
- Not required for local-only MVP
- Required when cloud sync is enabled

## Core Rule
Database stores metadata.
Object storage stores images.
Local storage remains the primary working source.


# B DayFrame — Photo Capture & Save Flow

Home
↓
Today's Empty Frame
↓
Capture Moment
↓
Camera / Gallery
↓
Image Selected
↓
Validate Image
↓
Generate Local Photo File
↓
Save to Internal Storage
↓
Create Memory Record
↓
Save Metadata to SQLite
↓
Commit Successful?
├── No → Show Error / Retry
└── Yes
     ↓
Update UI Immediately
     ↓
Add Sync Job
     ↓
Background Sync

## Daily Rule
One memory per user per calendar day.

Existing memory?
├── Yes → Open / Replace according to edit rules
└── No → Create new memory

## Local Persistence
Photo file and SQLite metadata must be saved before cloud synchronization.

## Sync Status
LOCAL_ONLY → UPLOADING → SYNCED
                         ↓
                       FAILED
                         ↓
                       RETRY