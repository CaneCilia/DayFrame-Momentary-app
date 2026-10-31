# Profile Space & Settings Menu Architecture Plan (V2.5)

> **Document Status:** Planning & Design Specification  
> **Target Version:** DayFrame V2.5  
> **Core Objective:** Establish a refined, editorial Profile Space featuring cloud storage connectors (Google Drive, OneDrive) and social platform connectors (Instagram, Snapchat, Pinterest), alongside an exhaustive, categorized Settings Menu Page.

---

## 1. Executive Summary & Vision

DayFrame is built on a **local-first, privacy-respecting foundation** where user memories live directly on the device first, while enabling optional, robust synchronization to personal cloud drives and expressive sharing across social ecosystems.

To achieve this, we are introducing two tightly-connected screens:

1. **Profile Screen (`ProfileScreen.tsx`)**:
   - The user's personal identity space and memory hub.
   - Visual identity: Avatar, name, handle, bio, and join date.
   - Journal telemetry: Real-time streak tracking, memory volume, and storage metrics.
   - **Cloud Archive Connectors**: High-trust integration cards for **Google Drive** and **Microsoft OneDrive**.
   - **Social Platform Connectors**: Instant sharing and channel pairing for **Instagram**, **Snapchat**, and **Pinterest**.
   - Direct pathway to the Settings Menu.

2. **Settings Menu Screen (`SettingsScreen.tsx`)**:
   - A comprehensive, production-grade system preferences screen.
   - Apple-grade grouped section hierarchy:
     1. Account & Identity
     2. Cloud Synchronization & Automatic Archives
     3. Social & Story Sharing Defaults
     4. Camera & Capture Preferences
     5. Notifications & Daily Reminder Rituals
     6. Storage, Media Cache & Database Health
     7. Privacy, Biometrics & Data Sovereignty
     8. About, Licensing & Support

---

## 2. Profile Page Specification (`ProfileScreen.tsx`)

### 2.1 Visual Hierarchy & Layout Sections

```
+-------------------------------------------------------+
|  <- Back                    Profile           (Gear)  |
+-------------------------------------------------------+
|                                                       |
|                     [ User Avatar ]                   |
|                   [ Edit Photo Badge ]                |
|                                                       |
|                       Alex Morgan                     |
|                  @alexmorgan · DayFrame Pro           |
|         "Preserving everyday light and quiet moments" |
|                                                       |
|               [ Edit Profile ]  [ Share Card ]        |
|                                                       |
+-------------------------------------------------------+
|  JOURNAL TELEMETRY                                    |
|  +---------------+---------------+------------------+ |
|  |      48       |    12 Days    |    1.4 GB        | |
|  |   Memories    | Current Streak|   Archived       | |
|  +---------------+---------------+------------------+ |
+-------------------------------------------------------+
|  CLOUD STORAGE ARCHIVES                               |
|  +--------------------------------------------------+ |
|  | [Drive Icon]  Google Drive       [CONNECTED (v)] | |
|  |               alex.morgan@gmail.com              | |
|  |               Auto-backup: Active · /DayFrame    | |
|  |               [ Manage ]     [ Disconnect ]      | |
|  +--------------------------------------------------+ |
|  | [OneDrive]    Microsoft OneDrive [CONNECT (+)]   | |
|  |               Not linked                         | |
|  |               Preserve high-res backup in Cloud  | |
|  |               [ Connect OneDrive ]               | |
|  +--------------------------------------------------+ |
+-------------------------------------------------------+
|  SOCIAL & SHARING CHANNELS                            |
|  +--------------------------------------------------+ |
|  | [Instagram]   Instagram          [CONNECTED]     | |
|  |               @alex.captures                     | |
|  |               Story export · Polaroid Preset     | |
|  +--------------------------------------------------+ |
|  | [Snapchat]    Snapchat           [CONNECT]       | |
|  |               Share daily snaps to camera & story| |
|  +--------------------------------------------------+ |
|  | [Pinterest]   Pinterest          [CONNECT]       | |
|  |               Auto-pin to "DayFrame Diary" board | |
|  +--------------------------------------------------+ |
+-------------------------------------------------------+
|  PREFERENCES                                          |
|  [>]  All App Settings & System Preferences           |
+-------------------------------------------------------+
```

### 2.2 Profile Components Breakdown

1. **Editorial Identity Header**:
   - **Avatar Container**: Circular framed avatar with image picker support (`expo-image-picker`) and initials fallback if no picture is set.
   - **Identity Details**: Full Name, `@handle`, bio tagline, and membership status badge (e.g. `DayFrame Member since Oct 2026`).
   - **Interactive Profile Actions**:
     - `Edit Profile` button -> Opens a sleek Bottom Sheet / Modal to edit Name, Handle, and Bio.
     - `Share Profile Card` -> Exports a branded summary card of user's photo journal stats.

2. **Journal Telemetry (Stats Grid)**:
   - Dynamic counts computed directly from local SQLite database:
     - `Total Memories`: Count of all entries in the `memories` table.
     - `Current Streak`: Calculated consecutive active days.
     - `Best Streak`: All-time longest streak recorded.
     - `Vault Size`: Combined photo file size on internal storage.

3. **Cloud Storage Connectors**:
   - **Google Drive**:
     - *State*: `connected` | `disconnected` | `syncing`.
     - *Metadata*: User Google account email, last backup timestamp, backup target folder (`/DayFrame/photos/`).
     - *Actions*:
       - `Connect Google Drive`: Triggers `GoogleDriveService.signIn()` with proper Drive scopes.
       - `Disconnect Google Drive`: Revokes tokens and updates local connection status.
       - `Auto-Backup Toggle`: Automatically queues memory uploads to Google Drive upon local save.
   - **Microsoft OneDrive**:
     - *State*: `connected` | `disconnected` | `syncing`.
     - *Metadata*: User Microsoft account email, target directory (`OneDrive/Apps/DayFrame`).
     - *Actions*:
       - `Connect OneDrive`: Microsoft Graph OAuth authentication flow.
       - `Disconnect OneDrive`: Clears access credentials and updates state.
       - `Auto-Backup Toggle`: Enables background syncing to personal OneDrive folder.

4. **Social Platform Connectors**:
   - **Instagram**:
     - *State*: `connected` (`@username`) | `disconnected`.
     - *Capabilities*:
       - Direct 1-tap "Share to Instagram Stories" with Polaroid photo frame preview.
       - Feed posting preview with formatted caption and date timestamp.
     - *Actions*: Connect account modal / username linkage, toggle default Polaroid watermark.
   - **Snapchat**:
     - *State*: `connected` (`@username`) | `disconnected`.
     - *Capabilities*:
       - Creative Kit / Direct Snap deep-link share (`snapchat://creativekit`).
       - Full-bleed 9:16 vertical photo formatting with DayFrame lens sticker overlay.
     - *Actions*: Connect account modal / link handle, quick test share.
   - **Pinterest**:
     - *State*: `connected` (`@username`) | `disconnected`.
     - *Capabilities*:
       - Pin memory directly to user's aesthetic boards (`pinit://` & web API).
       - Select or configure target board (e.g., "DayFrame Daily Journal").
     - *Actions*: Connect account modal / link handle, board selection preference.

---

## 3. Settings Menu Specification (`SettingsScreen.tsx`)

The Settings screen is organized into focused, accessible groups adhering to modern mobile Human Interface Guidelines:

### Section 1: Account & Profile
- **Profile Details**: View profile, edit name, change profile picture.
- **Supabase Cloud Account**: Current logged-in email, account verification status.
- **Authentication Actions**: Switch accounts, Sign Out.

### Section 2: Cloud Sync & Automated Archives
- **Cloud Synchronization Status**: Live sync indicator (`Synced`, `Syncing`, `Offline`).
- **Force Cloud Sync**: Manually triggers `syncWorker` to flush pending queue immediately.
- **Restore from Cloud**: Re-downloads missing memories and assets from Supabase object storage.
- **Google Drive Auto-Backup**: Direct settings toggle and status summary.
- **OneDrive Auto-Backup**: Direct settings toggle and status summary.

### Section 3: Social & Story Sharing Preferences
- **Default Story Format**: Polaroid with Date vs. Minimal Full-Bleed vs. Classic Frame.
- **Auto-Prompt Share on Capture**: Optional subtle toast asking to share to Instagram/Snapchat after saving a memory.
- **Connected Accounts Management**: Direct links to configure Instagram, Snapchat, and Pinterest.

### Section 4: Camera & Capture Defaults
- **Camera Grid Lines**: Toggle 3x3 rule-of-thirds grid.
- **Capture Quality**: Standard (0.8 quality, smaller size) vs. High Fidelity (1.0 uncompressed).
- **Default Timer Duration**: Off (0s), 3s, 10s.
- **Front Camera Mirroring**: Save selfies matching camera preview.
- **Save to Device Camera Roll**: Simultaneously save photo to native gallery (`expo-media-library` / camera roll).

### Section 5: Notifications & Habit Reminders
- **Daily Moment Reminder**: Time picker for daily capture prompt (default 8:00 PM).
- **Streak Preservation Alert**: Warning notification if no memory is logged by 10:00 PM.
- **Weekly & Monthly Recap Alerts**: Notification when a month summary is ready.

### Section 6: Storage & Cache Management
- **Local Database Footprint**: SQLite database file size.
- **Photo Storage Usage**: Space used by high-res originals and thumbnails.
- **Clear Thumbnail Cache**: Safe purge of cached image renders (re-generated on demand).
- **Export Full Archive**: Export all memories and metadata into a local ZIP/folder.

### Section 7: Privacy, Biometrics & Security
- **App Lock (FaceID / TouchID / Passcode)**: Require authentication before accessing memories.
- **Local-First Manifesto**: Explanation of DayFrame's device-first data integrity.
- **Telemetry & Analytics**: Privacy toggle (opt-in/opt-out).
- **Delete Account & Data**: Safe, compliant account wiping workflow.

### Section 8: About & Support
- **App Version & Build Number**: e.g., `DayFrame v1.2.0 (Build 24)`.
- **Changelog & Release Notes**.
- **Privacy Policy & Terms of Service**.
- **Contact Support / Feedback**.

---

## 4. Technical Architecture & Data Models

### 4.1 SQLite Schema & State Persistence

In SQLite database (`src/database/db.ts`) and `settings` table:
```sql
-- Settings key-value pairs used:
-- 'profile_name': TEXT
-- 'profile_handle': TEXT
-- 'profile_bio': TEXT
-- 'profile_avatar_uri': TEXT
-- 'service_gdrive_connected': '1' | '0'
-- 'service_gdrive_email': TEXT
-- 'service_gdrive_auto_backup': '1' | '0'
-- 'service_onedrive_connected': '1' | '0'
-- 'service_onedrive_email': TEXT
-- 'service_onedrive_auto_backup': '1' | '0'
-- 'service_instagram_connected': '1' | '0'
-- 'service_instagram_handle': TEXT
-- 'service_snapchat_connected': '1' | '0'
-- 'service_snapchat_handle': TEXT
-- 'service_pinterest_connected': '1' | '0'
-- 'service_pinterest_handle': TEXT
-- 'service_pinterest_board': TEXT
-- 'pref_camera_grid': '1' | '0'
-- 'pref_camera_timer': '0' | '3' | '10'
-- 'pref_high_quality': '1' | '0'
-- 'pref_reminder_time': '20:00'
-- 'pref_app_lock': '1' | '0'
```

### 4.2 Services Layer

1. **`src/services/connectedServices.ts`**:
   - Unified interface for managing all external services.
   - Types:
     ```typescript
     export type ServiceId = 'google_drive' | 'onedrive' | 'instagram' | 'snapchat' | 'pinterest';

     export interface ConnectedServiceAccount {
       id: ServiceId;
       name: string;
       category: 'cloud' | 'social';
       isConnected: boolean;
       accountIdentifier?: string; // email or handle
       lastSynced?: string;
       autoBackup?: boolean;
       extraConfig?: Record<string, any>;
     }
     ```
   - Methods:
     - `getConnectedServices(db: SQLiteDatabase): Promise<Record<ServiceId, ConnectedServiceAccount>>`
     - `connectService(db: SQLiteDatabase, id: ServiceId, data: Partial<ConnectedServiceAccount>): Promise<void>`
     - `disconnectService(db: SQLiteDatabase, id: ServiceId): Promise<void>`
     - `toggleAutoBackup(db: SQLiteDatabase, id: 'google_drive' | 'onedrive', enabled: boolean): Promise<void>`

2. **`src/services/socialSharingService.ts`**:
   - Handles deep links, native share targets, and platform-specific exports.
   - Methods:
     - `shareToInstagramStory(photoUri: string, options?: ShareOptions): Promise<boolean>`
     - `shareToSnapchat(photoUri: string, options?: ShareOptions): Promise<boolean>`
     - `shareToPinterest(photoUri: string, boardName?: string): Promise<boolean>`
     - `checkPlatformInstalled(platform: 'instagram' | 'snapchat' | 'pinterest'): Promise<boolean>`

3. **`src/services/OneDriveService.ts`**:
   - Microsoft OneDrive / Graph API client architecture.
   - Methods:
     - `signIn(): Promise<{ email: string; token: string }>`
     - `signOut(): Promise<void>`
     - `backupPhoto(localPhotoUri: string, filename: string): Promise<string>`

---

## 5. UI/UX & Design System Integration

Strict adherence to the **DayFrame Editorial Design System**:
- **Palette**:
  - Obsidian Ink: `#0F141C` (Primary headers and text)
  - Architectural Cobalt: `#1E4FD9` (Primary action accent)
  - Surface Subtle: `#F4F5F7` (Backgrounds for badges & inputs)
  - Surface Base: `#FFFFFF` (Card surfaces)
  - Border Hairline: `#E2E8F0` / `#F1F5F9` (Subtle 1px dividers)
  - Status Indicators: `#166534` (Forest green connected status)
- **Visual Restraint**:
  - NO neon or vibrating dual-gradients.
  - Generous whitespace, clean 14px/16px padding, subtle 8px/12px border radii.
  - High-clarity typography with crisp metadata labels.

---

## 6. Navigation Integration Plan

1. **`src/navigation/AppNavigator.tsx`**:
   - Add `Profile: undefined;` to `RootStackParamList`.
   - Register `<Stack.Screen name="Profile" component={ProfileScreen} />`.
2. **`src/screens/HomeScreen.tsx`**:
   - Add User Profile Avatar button in top header actions alongside Search, Favorites, and Sync Indicator.
   - Tapping the avatar navigates smoothly to `Profile`.
3. **`src/screens/ProfileScreen.tsx`**:
   - Header contains Back button and Gear (Settings) button.
   - Tapping the Gear button navigates to `Settings`.
4. **`src/screens/SettingsScreen.tsx`**:
   - Full settings menu with back navigation returning to Profile or previous screen.

---

## 7. Step-by-Step Implementation Roadmap

| Step | Scope | Files Impacted | Git Commit Tag |
|---|---|---|---|
| **Step 1** | Planning & Documentation | `Product-Plan Doc/profile-and-settings-plan.md` | `[Feature]` |
| **Step 2** | Services & State Layer | `src/services/connectedServices.ts`, `src/services/socialSharingService.ts`, `src/services/OneDriveService.ts` | `[Feature]` |
| **Step 3** | Profile Screen Implementation | `src/screens/ProfileScreen.tsx`, `src/components/EditProfileModal.tsx`, `src/components/ConnectServiceModal.tsx` | `[Feature]` |
| **Step 4** | Settings Screen Modernization | `src/screens/SettingsScreen.tsx` | `[Refinement]` |
| **Step 5** | Navigation & Header Integration | `src/navigation/AppNavigator.tsx`, `src/screens/HomeScreen.tsx` | `[Update]` |
| **Step 6** | E2E Verification & Type Safety | `App.tsx`, build verification, TypeScript check | `[Refinement]` |

---

## 8. Verification & Quality Assurance

- [ ] **Profile Space Rendering**: Correct display of user avatar, name, bio, and stats.
- [ ] **Cloud Connectors Interaction**:
  - Google Drive: Connect/Disconnect dialog, state persistence in SQLite.
  - OneDrive: Connect/Disconnect dialog, state persistence in SQLite.
  - Auto-backup switches respond dynamically and save preference.
- [ ] **Social Connectors Interaction**:
  - Instagram: Handle linkage dialog, deep link share validation.
  - Snapchat: Handle linkage dialog, Creative Kit export fallback.
  - Pinterest: Handle linkage dialog, board selection dialog.
- [ ] **Settings Menu Navigation**: All 8 categorized sections accessible with intuitive back navigation.
- [ ] **TypeScript & Build**: Zero TypeScript errors (`npx tsc --noEmit`), seamless Expo runtime.
