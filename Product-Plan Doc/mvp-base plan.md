# DayFrame — System Design

## 1. Core Architecture

DayFrame should use a local-first architecture with cloud synchronization.

```text
                    DayFrame App
                         |
              ┌──────────┴──────────┐
              |                     |
        Local Storage          Cloud Services
              |                     |
       ┌──────┴──────┐       ┌──────┴────────┐
       |             |       |               |
    SQLite       Image Cache  Database    Image Storage
       |                         |               |
       |                    Metadata          Photos
       |                         |
       └──────────── Sync ───────┘
```

The app should remain usable even when there is no internet connection.

---

# 2. Local Storage

The local device should be the primary source for the user's immediate experience.

Store:

```text
SQLite
├── memories
├── sync_queue
├── settings
└── user
```

And store actual image files separately:

```text
App Internal Storage
└── DayFrame
    └── photos
        ├── 2026-09-13.jpg
        ├── 2026-09-12.jpg
        └── 2026-09-11.jpg
```

SQLite should NOT contain the actual image binary.

Instead:

```text
memory
   |
   └── localPhotoUri
```

Example:

```json
{
  "id": "memory_20260913",
  "date": "2026-09-13",
  "localPhotoUri": ".../DayFrame/photos/2026-09-13.jpg",
  "cloudPhotoId": "cloud_abc123",
  "status": "synced"
}
```

---

# 3. Cloud Database

The cloud database should primarily store metadata.

For example:

```text
users
  └── userId

memories
  └── memoryId
      ├── userId
      ├── date
      ├── caption
      ├── cloudPhotoUrl
      ├── driveFileId
      ├── createdAt
      ├── updatedAt
      └── syncStatus
```

Do not treat the database as an image-storage system.

The database tells the application:

"Here is the memory and here is where its image is stored."

---

# 4. Image Storage

Actual photos should live in object storage.

The architecture becomes:

```text
Photo
  |
  ├── Local copy
  |
  └── Cloud copy
          |
       Object Storage
```

For example, depending on your backend choice, you could use a service such as:

* Firebase Storage
* Supabase Storage
* AWS S3
* Cloudflare R2

The important separation is:

```text
Database = metadata
Object Storage = images
```

---

# 5. User's Drive

This is a separate feature from your application's cloud storage.

There are actually two backup destinations:

```text
                    Photo
                      |
          ┌───────────┴───────────┐
          |                       |
    DayFrame Cloud            User's Drive
          |                       |
    App backup                Personal backup
```

For example:

```text
DayFrame
   ↓
Cloud Storage
   ↓
photo.jpg

Optional:
   ↓
Google Drive
   ↓
DayFrame/
   └── 2026/
       └── September/
           └── 2026-09-13.jpg
```

The Drive integration should be optional.

A user should be able to use DayFrame without giving the application access to their Drive.

---

# 6. Recommended Sync Flow

This is the most important part of the architecture.

When the user takes a photo:

```text
Camera
   ↓
Create Photo
   ↓
Save to Local Storage
   ↓
Save Metadata to SQLite
   ↓
Show photo immediately
   ↓
Add Sync Job
   ↓
Internet Available?
   |
   ├── NO
   |     ↓
   |   Keep Sync Job
   |     ↓
   |   Try Later
   |
   └── YES
         ↓
      Upload Image
         ↓
      Cloud Storage
         ↓
      Receive Cloud URL / ID
         ↓
      Update Cloud Database
         ↓
      Mark Local Record as Synced
```

This gives the user an instant experience.

They shouldn't have to wait for an image upload before today's memory appears.

---

# 7. Sync Queue

You should have a local sync queue.

Example:

```text
sync_queue

id
memoryId
operation
status
attempts
createdAt
```

Example:

```json
{
  "memoryId": "memory_20260913",
  "operation": "UPLOAD_PHOTO",
  "status": "pending",
  "attempts": 0
}
```

If the user takes a photo while offline:

```text
Photo
  ↓
Local Storage
  ↓
SQLite
  ↓
Sync Queue
  ↓
Waiting...
```

When the internet becomes available:

```text
Sync Worker
   ↓
Find pending jobs
   ↓
Upload
   ↓
Update database
   ↓
Remove/complete job
```

This is much more reliable than simply doing:

```text
takePhoto()
   ↓
upload()
```

because uploads can fail.

---

# 8. Image Upload State

Every memory should have a synchronization state.

For example:

```text
LOCAL_ONLY
UPLOADING
SYNCED
FAILED
```

The UI can use this internally.

Example:

```text
Today's Memory

[ Photo ]

Syncing...
```

Then:

```text
Today's Memory

[ Photo ]

Synced
```

If upload fails:

```text
Today's Memory

[ Photo ]

Waiting for connection
```

The user should still be able to use the app.

---

# 9. Drive Backup Flow

Drive should not block the normal DayFrame upload.

Instead:

```text
Take Photo
     ↓
Local Storage
     ↓
DayFrame Cloud
     ↓
Optional Drive Backup
```

If Drive backup fails:

```text
DayFrame Cloud       SUCCESS
Drive Backup         FAILED
```

The memory itself is still safe in DayFrame.

Later, the sync worker can retry the Drive upload.

---

# 10. Avoid Duplicate Images

Use a deterministic identity for each day's memory.

For example:

```text
userId + date
```

or generate a unique memory ID:

```text
memory_01J...
```

Then cloud storage could use:

```text
/users/{userId}/memories/{memoryId}/original.jpg
```

For example:

```text
users/
  user_123/
    memories/
      memory_abc/
        original.jpg
        thumbnail.jpg
```

This makes the storage structure predictable.

---

# 11. Original + Thumbnail

Don't always download the full-resolution image for the timeline.

Create:

```text
original.jpg
thumbnail.jpg
```

Timeline:

```text
thumbnail.jpg
```

Memory detail:

```text
original.jpg
```

This reduces bandwidth and makes the timeline much faster.

---

# 12. Local Cache Strategy

The local app should keep recently used images.

For example:

```text
Local Storage

Current month
    ↓
Keep locally

Older photos
    ↓
Can be downloaded from cloud when needed
```

However, don't automatically delete the user's only local copy unless your synchronization design is extremely reliable.

The important rule is:

**Cloud backup should be confirmed before treating a local photo as safely backed up.**

---

# 13. Authentication

You will need a user identity once cloud synchronization is introduced.

A simple flow:

```text
Install App
   ↓
Create/Login Account
   ↓
Generate User ID
   ↓
Local Database linked to User ID
   ↓
Cloud Sync
```

You could initially support:

```text
Google Sign-In
Email/Password
```

For an Android-first application, Google authentication can provide a particularly natural experience.

---

# 14. Conflict Handling

This becomes important when the same memory exists on multiple devices.

Example:

```text
Phone A
September 13
Photo A

Phone B
September 13
Photo B
```

You need a rule.

For the MVP:

**One memory per user per calendar day.**

If two devices create different photos for the same day:

```text
Server timestamp / updatedAt
```

can determine which version wins.

Later you could support multiple photos per day, but don't complicate the first version.

---

# 15. Suggested Backend Architecture

A practical architecture could be:

```text
                    Mobile App
                       |
                Authentication
                       |
              ┌────────┴─────────┐
              |                  |
          Cloud DB          Object Storage
              |                  |
          Metadata             Images
              |
         Sync Service
              |
        ┌─────┴──────┐
        |            |
     Mobile       Google Drive
     Devices       Backup
```

A managed backend such as Supabase or Firebase can reduce the amount of infrastructure you need to build yourself.

If you want maximum control, you can instead build:

```text
React Native
     ↓
API
     ↓
Backend
     ↓
PostgreSQL
     ↓
S3-compatible storage
```

But for a first project, I would avoid building your own authentication, file-upload server, database API, and sync infrastructure unless learning backend engineering is itself one of your goals.

---

# 16. Most Important Design Principle

DayFrame should be:

**Local-first, cloud-backed, optionally Drive-backed.**

Not:

**Cloud-first, local-cache-only.**

The difference matters.

The user should be able to:

```text
No Internet
     ↓
Open DayFrame
     ↓
See timeline
     ↓
Take today's photo
     ↓
Save it
     ↓
Close app
```

Then later:

```text
Internet returns
     ↓
Sync automatically
     ↓
Cloud backup completed
     ↓
Optional Drive backup
```

This makes the application feel reliable.

---

# 17. Final Data Flow

The complete system can be thought of as:

```text
                     USER
                      |
                      ↓
                   DAYFRAME
                      |
              ┌───────┴────────┐
              |                |
           SQLite          Local Photos
              |                |
              └───────┬────────┘
                      |
                  Sync Queue
                      |
                Internet
                      |
              ┌───────┴────────┐
              |                |
          Cloud DB        Object Storage
          Metadata            Images
              |                |
              └───────┬────────┘
                      |
                Optional Backup
                      |
                Google Drive
```

The most important thing to establish **before coding the UI** is the data model, synchronization strategy, photo lifecycle, authentication, and backup behavior.

Once those are designed correctly, the Home, Timeline, Calendar, and Memory screens become relatively straightforward to build.
