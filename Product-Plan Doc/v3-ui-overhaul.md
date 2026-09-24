# App UI — Pages, Elements & Components

> **Core Principle:** Whenever a feature is picked up for development, it must be delivered as a fully complete end-to-end flow. This includes all working functionality, internal mechanisms, and user-facing workflow logic.

## 1. Search Page & Search Engine (V2)

### Main Components
* Search bar (Real-time caption & keyword search)
* Search suggestions
* Category filters
* Featured templates
* Recent searches
* Popular templates

### Search Engine Working Mechanism (User Perspective)
* **Real-Time Feedback:** As the user types, the UI immediately filters past captions and memories. 
* **Deep Content Search:** Powered by a fast local SQLite FTS5 virtual table, users can type vague keywords they remember from their captions, instantly surfacing exact past memories.
* **Workflow Logic:** 
  1. User taps the Search Bar.
  2. Types a keyword (e.g., "beach" or "birthday").
  3. The real-time search screen instantly displays matching photos/videos based on their stored captions and metadata.
  4. Tapping a result jumps directly to that memory in the Timeline.

### Preview & Slideshow
Add a visual preview section for templates and slideshows.

**Template cards should include:**
* Thumbnail/preview image
* Template name
* Category
* Number of photos/slides
* Preview button
* Use Template button

**Slideshow categories:**
* Travel, Birthday, Wedding, Family, Friends, Festival, Memories, Nature, Events, Custom

### Template Preview
When the user opens a template:
* Full-screen preview, Swipe between slides, Play slideshow, Photo placeholders, Music/audio option, Filter/effect options, Edit button, Use Template button

---

## 2. Home Page & Monthly Memories (V2)

Reorder the main sections so that the primary action is more prominent.

### Section 1 — Capture the Moment
**Move this section UP.**
Components:
* Camera/capture button, Take Photo, Record Video, Quick upload, Recent captured memories, Camera effects/filters

**Example CTA:**
**Capture the Moment**
“Save today's moments before they become memories.”

### Section 2 — Memory Contribution
**Move this section DOWN.**
Components:
* Contribute a photo/video, Add a memory, Add description/story, Add date, Add location, Select category, Invite/contribute with others

### Section 3 — Monthly Memories (TimelineScreen V2)
**Working Mechanism & Logic:**
* **Visual Grouping:** Memories are automatically grouped by month (e.g., separating August from September).
* **Sticky Headers:** As the user scrolls down their timeline, a "Month Year" header sticks to the top of the screen to maintain context.
* **Month Summary Cards:** At the end/beginning of a month's cluster, a curated "Month Summary" card highlights the best moments of that month.
* **Workflow Logic:**
  1. User opens the Home/Timeline screen.
  2. Content is instantly organized into discrete monthly buckets.
  3. Scrolling smoothly transitions the sticky header, giving a clear sense of moving through time.

---

## 3. Calendar Page

Create a more visual calendar experience rather than only showing dates.

### Calendar Components
* Monthly calendar, Upcoming events, Important dates, Memory dates, Trip dates, Holidays, Reminders, Birthday/event reminders

### Calendar Highlights
Use different visual indicators for easy identification:
* 📸 Memory day, ✈️ Trip, 🎉 Event, 🎂 Birthday, 🏖️ Holiday, 🔔 Reminder

### Trip Days
When a trip is added, show:
**Trip: Goa**
12 Jun → 16 Jun
**5 Days**
Include: Trip start/end date, Number of days, Photos/memories, Trip timeline

### Calendar Graph / Statistics
Add a simple visual graph showing activity over time (e.g., monthly memory-activity trend as a line chart).

---

## 4. Delight & Sharing (Phase 7 / V2)

To make the app truly rewarding, we integrate features that curate and export memories beautifully.

### 4.1 Yearly Recap
**Working Mechanism & Logic:**
* **Story UI:** A specialized horizontal-scrolling interface similar to "Spotify Wrapped".
* **Curation:** The app intelligently curates the best 12 photos of the year.
* **Workflow Logic:** At the end of the year (or on demand), the user is greeted with a "Your Year in Review" banner. Tapping it opens an immersive, music-backed story UI to relive their best moments.

### 4.2 Export / Share
**Working Mechanism & Logic:**
* **Polaroid Export:** Allows users to export a stylized Polaroid version of any memory.
* **Workflow Logic:** 
  1. User views a memory and taps "Share".
  2. The app uses `expo-sharing` and `react-native-view-shot` to render a beautiful Polaroid layout containing the image, date, and caption.
  3. The native share sheet appears, letting them seamlessly post to Instagram, WhatsApp, or save to their camera roll.

---

## 5. Easy Categories

Make categories accessible throughout the app using consistent category components.

### Recommended Categories
* **Memories:** 📸 Photos, 🎥 Videos, ❤️ Favorites, 👨👩👧 Family, 🧑🤝🧑 Friends
* **Activities:** ✈️ Trips, 🎉 Events, 🎂 Birthdays, 🏖️ Holidays, 🏆 Achievements
* **Content:** Stories, Albums, Slideshows, Templates, Contributions

### Category UI
Use:
* Rounded category chips, Icons + labels, Horizontal scrolling, Search/filter, Recently used categories, Custom category option

## Overall Navigation

**Home**
→ Capture the Moment
→ Memory Contribution
→ Recent Memories
→ Monthly Summaries & Timeline

**Search**
→ Real-time Query (Captions & FTS5)
→ Categories
→ Templates
→ Slideshows
→ Preview
→ Use Template

**Calendar**
→ Calendar
→ Trips
→ Holidays
→ Reminders
→ Memory activity

**Camera**
→ Photo
→ Video
→ Filters
→ Effects
→ Save/Share
