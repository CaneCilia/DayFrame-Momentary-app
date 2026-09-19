# Phase 4.5: End-to-End Testing Plan

## Objective
Ensure the local-first architecture works flawlessly in all conditions, specifically focusing on offline capabilities, background syncing, and edge cases.

## Test Scenarios

### 1. Offline Photo Capture
1. Turn off Wi-Fi and Cellular Data (Airplane Mode).
2. Open DayFrame.
3. Verify Home Screen loads correctly showing today's date.
4. Tap to capture today's moment.
5. Take a photo and confirm.
6. Verify the Home Screen updates immediately with the captured photo.
7. Verify the Timeline shows the new thumbnail.
8. Verify a pending `UPLOAD_PHOTO` job is added to the `sync_queue` table in SQLite.

### 2. Delayed Syncing
1. While still offline, close the app completely (swipe away).
2. Turn on Wi-Fi/Cellular Data.
3. Re-open DayFrame.
4. Verify the Background Sync Worker detects the connection and processes the `sync_queue`.
5. Check Google Drive (in the dedicated DayFrame folder) to ensure the image was uploaded via REST API.
6. Verify the SQLite local `sync_status` updates to `SYNCED`.
7. Verify the Cloud Sync Status Indicator on the Home Screen reflects the `Synced` state.

### 3. Edge Case: 11:59 PM Capture
1. Change the device time manually to 11:58 PM.
2. Open DayFrame and capture a photo.
3. Wait for the time to roll over to 12:00 AM (midnight).
4. Verify the Home Screen resets to an empty frame for the new day.
5. Verify yesterday's photo is still safely stored in the Timeline and Calendar views.

### 4. Streak Tracking
1. Change device dates to create memories for 3 consecutive days.
2. Verify the Home Screen displays a 🔥 3 streak.
3. Skip a day.
4. Capture a photo on the following day.
5. Verify the streak resets to 🔥 1.

### 5. Daily Reminders
1. Go to Settings/Reminder Setup.
2. Enable daily reminders and set a time 2 minutes from now.
3. Background the app.
4. Wait for the notification.
5. Tap the notification and ensure it opens the app.
