# DayFrame — Momentary

**One photo. Every day.**

DayFrame is a beautifully simple, local-first daily journaling app. It encourages you to capture exactly one meaningful photo per day, helping you build a chronological timeline of your life without the pressure of infinite scrolling or social media.

---

## 📱 Screenshots

<div style="display: flex; flex-direction: row; flex-wrap: wrap; gap: 10px;">
  <img src="./assets/base-screens/Screenshot_20260915_121733_Expo%20Go.jpg" width="24%" />
  <img src="./assets/base-screens/Screenshot_20260915_121739_Expo%20Go.jpg" width="24%" />
  <img src="./assets/base-screens/Screenshot_20260915_123210_Expo%20Go.jpg" width="24%" />
  <img src="./assets/base-screens/Screenshot_20260915_123214_Expo%20Go.jpg" width="24%" />
  <img src="./assets/base-screens/Screenshot_20260915_123220_Expo%20Go.jpg" width="24%" />
  <img src="./assets/base-screens/Screenshot_20260915_123224_Expo%20Go.jpg" width="24%" />
  <img src="./assets/base-screens/Screenshot_20260915_123230_Expo%20Go.jpg" width="24%" />
</div>

---

## 📥 How to Install & Play

We provide pre-built APKs for Android so you can easily install and test the app without needing to set up a development environment!

### Installing via GitHub Releases (Android)
1. Navigate to the **[Releases](../../releases)** tab of this repository on GitHub.
2. Find the latest release (e.g., `Base-Application-Model`).
3. Under the **Assets** section of that release, download the `.apk` file directly to your Android device.
4. Open the downloaded file. Your phone may prompt you to allow installations from "Unknown Sources" (since it's not downloaded from the Google Play Store). Allow it, and install the app!
5. Open **DayFrame** and start capturing your moments!

---

## 🛠️ Features
- **Local-First Architecture:** Your memories are saved instantly to your local device database (SQLite) so they are completely yours.
- **Timeline & Calendar Views:** Easily browse your historical photos sorted by month, or look at a birds-eye view of your streaks via the interactive calendar.
- **True Google Drive Backup:** Link your Google account and safely push backups of your photos to your personal Google Drive for ultimate peace of mind.
- **Fast Full-Text Search:** Powered by SQLite FTS5, instantly find past memories by searching snippets of your captions.
- **Privacy Hub & Storage Management:** Complete transparency into how your data is stored locally, plus the ability to manage or clear your cache to save device space.

---

## 💻 Developer Setup

If you want to run the app locally, build on top of it, or contribute to the code:

1. Clone the repository:
   ```bash
   git clone https://github.com/CaneCilia/DayFrame-Momentary-app.git
   cd DayFrame-Momentary-app
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Expo development server:
   ```bash
   npx expo start
   ```
4. Download the **Expo Go** app on your iOS or Android device and scan the QR code to run the app in development mode! *(Note: Native features like Google Drive backup require compiling an EAS Development Build instead of using Expo Go).*
