# Coding Tracker

A competitive programming dashboard that tracks your LeetCode, Codeforces, and GitHub activity in one place. Create rooms, compete with friends on leaderboards, and watch your stats grow over time.

Built with Next.js, Prisma, and PostgreSQL (Supabase).

---

## Features

### Competitive Programming
- **LeetCode & Codeforces sync** — automatically pulls your solved problems, ratings, and submission history
- **Scored leaderboard** — weighted scoring system across platforms (easy/medium/hard breakdowns, CF rating bonuses)
- **Activity heatmap** — GitHub-style contribution grid for your coding submissions
- **Progress charts** — track your growth over time with line charts
- **Language distribution** — pie charts showing what languages you code in (brand-colored, supports 25+ languages)
- **Topic radar** — visualise which problem categories you tackle most

### Rooms
- **Create & join rooms** — invite friends with a join code to compete on shared leaderboards
- **Period modes** — weekly, monthly, or all-time competition windows
- **Room sync** — pull fresh data for all members with one button
- **Team heatmap** — combined activity view across all room members
- **Per-member stats** — expandable cards with individual charts and submission logs

### Friends System
- **Send & accept friend requests** — search users by name or email
- **View friends' problems** — browse their solved problems with clickable links
- **Filtered problems page** — the Problems page shows only your own and your friends' submissions

### Problem Links
- **Clickable problem names** — every problem in submission tables links directly to LeetCode or Codeforces

### GitHub Integration
- **Contribution heatmap** — your GitHub activity calendar rendered in-app
- **Language pie chart** — breakdown of languages across your public repos
- **Profile stats** — total contributions, public repos, followers/following

### Other
- **Session-based auth** — secure login/registration with hashed passwords
- **Auto-sync** — background sync every hour to keep data fresh
- **Profile setup** — configure your LeetCode, Codeforces, and GitHub handles
- **Player profiles** — click any user on the leaderboard to view their stats

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Database | PostgreSQL (Supabase) |
| ORM | Prisma 6 |
| Styling | Tailwind CSS 4 |
| Charts | Recharts, react-activity-calendar |
| Icons | react-icons (Remix Icon set) |
| Auth | Custom session-based (cookies + bcrypt) |
| Deployment | Vercel |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A PostgreSQL database (Supabase recommended)

### 1. Clone and install

```bash
git clone https://github.com/Izpiz06/coding-tracker.git
cd coding-tracker
npm install
```

### 2. Set up environment variables

Create a `.env` file in the project root:

```env
# Database (required)
DATABASE_URL="postgresql://user:password@host:5432/dbname?pgbouncer=true"
DIRECT_URL="postgresql://user:password@host:5432/dbname"

# GitHub API (optional, increases rate limit)
GITHUB_TOKEN="ghp_your_personal_access_token"

# Cron sync protection (optional)
CRON_SECRET="your_cron_secret"
ADMIN_PASSCODE="your_admin_passcode"
```

### 3. Set up the database

```bash
npx prisma db push
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start tracking.

---

## Project Structure

```
app/
  page.tsx              # Home — global leaderboard + rooms overview
  auth/                 # Login / registration
  dashboard/            # Personal stats dashboard
  friends/              # Friends list + friend's problems view
  problems/             # Solved problems table (self + friends)
  profile/              # Profile setup (handles configuration)
  players/              # Public player profile pages
  rooms/                # Room hub, room dashboard, join flow
  api/
    auth/               # Login, registration, session
    friends/            # Friend requests, search, submissions
    github/             # GitHub stats proxy
    rooms/              # Room CRUD, sync
    sync/               # Global cron sync
    profile-sync/       # Per-user sync

components/
  ActivityHeatmap.tsx         # Coding submission heatmap
  GitHubActivityHeatmap.tsx   # GitHub contribution calendar
  GitHubDevelopmentPanel.tsx  # GitHub stats card
  GitHubLanguagePieChart.tsx  # GitHub repo languages
  LanguagePieChart.tsx        # Coding language distribution
  ProgressChart.tsx           # Growth-over-time line chart
  ProblemsTable.tsx           # Sortable problems table with links
  TopicRadarChart.tsx         # Problem category radar
  SyncButton.tsx              # Manual sync trigger
  AutoSyncProvider.tsx        # Background auto-sync (1hr interval)

lib/
  leetcode.ts           # LeetCode GraphQL API client
  codeforces.ts         # Codeforces API client
  github.ts             # GitHub API client
  scoring.ts            # Leaderboard scoring algorithm
  userSync.ts           # Full user data sync logic
  auth.ts               # Session management + password hashing
  prisma.ts             # Prisma client singleton

prisma/
  schema.prisma         # Database schema
```

---

## License

MIT
