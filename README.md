# Cozy RSS Reader

A full-featured, self-hosted RSS reader built with Next.js 15, featuring user accounts, SQLite database, and a beautiful three-column interface.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture Overview](#architecture-overview)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [Authentication System](#authentication-system)
- [State Management](#state-management)
- [API Routes](#api-routes)
- [Component Architecture](#component-architecture)
- [Data Flow](#data-flow)
- [Key Patterns](#key-patterns)
- [Getting Started](#getting-started)
- [Development](#development)

---

## Features

- **User Accounts**: Sign up, sign in, session management
- **Feed Management**: Add, organize, and delete RSS/Atom/JSON feeds
- **Folder Organization**: Nested folders up to 3 levels deep
- **Article Reading**: Clean reader mode with distraction-free viewing
- **Article States**: Mark as read, star, save for later
- **Tagging System**: Organize articles with custom colored tags
- **Feed Discovery**: Curated collections and search for new feeds
- **OPML Import/Export**: Migrate from other readers
- **Responsive Design**: Desktop (3-column), tablet (2-column), mobile (single panel)
- **Keyboard Navigation**: Full keyboard support for power users
- **Theme Support**: Light/dark mode with system preference detection

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Framework** | Next.js 15 (App Router) | Full-stack React framework |
| **Language** | TypeScript | Type safety |
| **Database** | SQLite (better-sqlite3) | Persistent data storage |
| **Auth** | Custom session-based | User authentication |
| **State** | Zustand | Client-side state management |
| **Styling** | Tailwind CSS | Utility-first CSS |
| **Animation** | Framer Motion | UI animations |
| **UI Components** | Radix UI | Accessible primitives |
| **Feed Parsing** | rss-parser | RSS/Atom feed parsing |
| **Reader Mode** | @mozilla/readability | Article extraction |
| **Virtualization** | @tanstack/react-virtual | Performant lists |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              BROWSER                                     │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                     React Components                              │   │
│  │  ┌──────────┐  ┌──────────────┐  ┌────────────────┐             │   │
│  │  │ Sidebar  │  │ ArticleList  │  │ ArticleContent │             │   │
│  │  └────┬─────┘  └──────┬───────┘  └───────┬────────┘             │   │
│  │       │               │                   │                       │   │
│  │       └───────────────┴───────────────────┘                       │   │
│  │                        │                                          │   │
│  │  ┌─────────────────────▼─────────────────────┐                   │   │
│  │  │            Zustand Stores                  │                   │   │
│  │  │  ┌─────────┐ ┌─────────┐ ┌──────────────┐ │                   │   │
│  │  │  │feedStore│ │article  │ │ authStore    │ │                   │   │
│  │  │  │         │ │Store    │ │ uiStore      │ │                   │   │
│  │  │  │         │ │         │ │ settingsStore│ │                   │   │
│  │  │  └─────────┘ └─────────┘ └──────────────┘ │                   │   │
│  │  └─────────────────────┬─────────────────────┘                   │   │
│  └────────────────────────┼──────────────────────────────────────────┘   │
│                           │ fetch()                                      │
└───────────────────────────┼──────────────────────────────────────────────┘
                            │
┌───────────────────────────┼──────────────────────────────────────────────┐
│                     NEXT.JS SERVER                                        │
│                           │                                               │
│  ┌────────────────────────▼────────────────────────┐                     │
│  │               API Routes (/api/*)                │                     │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌───────┐ │                     │
│  │  │ /auth/* │ │ /feeds  │ │/articles│ │/tags  │ │                     │
│  │  └────┬────┘ └────┬────┘ └────┬────┘ └───┬───┘ │                     │
│  │       │           │           │           │     │                     │
│  │       └───────────┴───────────┴───────────┘     │                     │
│  │                        │                         │                     │
│  └────────────────────────┼─────────────────────────┘                     │
│                           │                                               │
│  ┌────────────────────────▼────────────────────────┐                     │
│  │              Repository Layer                    │                     │
│  │  ┌──────────────┐ ┌──────────────┐              │                     │
│  │  │feedRepository│ │articleRepo   │ ...          │                     │
│  │  └──────┬───────┘ └──────┬───────┘              │                     │
│  └─────────┼────────────────┼──────────────────────┘                     │
│            │                │                                             │
│  ┌─────────▼────────────────▼──────────────────────┐                     │
│  │              SQLite Database                     │                     │
│  │  (better-sqlite3 with WAL mode)                 │                     │
│  │  Location: ./data/rss-reader.db                 │                     │
│  └─────────────────────────────────────────────────┘                     │
└───────────────────────────────────────────────────────────────────────────┘
```

### Request Flow

```
User Action → Component → Zustand Store → fetch() → API Route → Repository → SQLite
                              ↓
                     Optimistic Update
                              ↓
                     UI Updates Immediately
                              ↓
                     API Response Confirms/Rolls Back
```

---

## Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes (REST endpoints)
│   │   ├── auth/                 # Authentication endpoints
│   │   │   ├── me/route.ts       # GET current user
│   │   │   ├── signin/route.ts   # POST sign in
│   │   │   ├── signout/route.ts  # POST sign out
│   │   │   └── signup/route.ts   # POST create account
│   │   ├── articles/             # Article endpoints
│   │   │   ├── route.ts          # GET articles list
│   │   │   └── [id]/
│   │   │       ├── state/route.ts    # PUT read/star/readLater
│   │   │       └── tags/route.ts     # PUT article tags
│   │   ├── feeds/                # Feed CRUD
│   │   │   ├── route.ts          # GET list, POST create
│   │   │   └── [id]/route.ts     # PUT update, DELETE
│   │   ├── folders/              # Folder CRUD
│   │   ├── tags/                 # Tag CRUD
│   │   ├── settings/route.ts     # User settings
│   │   ├── fetch-feed/route.ts   # Proxy for fetching RSS
│   │   ├── extract-article/      # Reader mode extraction
│   │   ├── discover/             # Feed discovery
│   │   ├── migrate/route.ts      # localStorage migration
│   │   └── export/route.ts       # Data export
│   ├── landing/page.tsx          # Public landing page
│   ├── signin/page.tsx           # Sign in form
│   ├── signup/page.tsx           # Sign up form
│   ├── onboarding/page.tsx       # Post-signup flow
│   ├── discover/page.tsx         # Feed discovery page
│   ├── page.tsx                  # Main app (authenticated)
│   ├── layout.tsx                # Root layout
│   └── globals.css               # Global styles
│
├── components/
│   ├── layout/                   # Page layout components
│   │   ├── ThreeColumnLayout.tsx # Responsive 3-column layout
│   │   ├── Sidebar.tsx           # Feed/folder navigation
│   │   ├── ArticleList.tsx       # Article list panel
│   │   ├── ArticleContent.tsx    # Article reader panel
│   │   └── MobileBottomTabBar.tsx
│   ├── features/                 # Feature-specific components
│   │   ├── articles/             # Article components
│   │   ├── feeds/                # Feed management
│   │   ├── folders/              # Folder management
│   │   ├── tags/                 # Tag management
│   │   ├── discover/             # Feed discovery
│   │   ├── settings/             # Settings modal
│   │   └── search/               # Search functionality
│   ├── ui/                       # Reusable UI components
│   │   ├── DoodleIcon.tsx        # Custom icon components
│   │   ├── ConfirmDialog.tsx     # Confirmation dialogs
│   │   ├── ContextMenu.tsx       # Right-click menus
│   │   └── ...
│   ├── auth/                     # Auth-related components
│   ├── account/                  # Account management
│   ├── StoreInitializer.tsx      # Initializes stores on mount
│   └── ThemeProvider.tsx         # Theme context
│
├── stores/                       # Zustand state stores
│   ├── authStore.ts              # Authentication state
│   ├── feedStore.ts              # Feeds and folders
│   ├── articleStore.ts           # Articles and their states
│   ├── tagStore.ts               # Tags
│   ├── settingsStore.ts          # User preferences
│   ├── uiStore.ts                # UI state (local only)
│   ├── searchStore.ts            # Search state
│   └── discoverStore.ts          # Feed discovery state
│
├── lib/
│   ├── db/                       # Database layer
│   │   ├── index.ts              # DB connection, migrations
│   │   ├── schema.sql            # Table definitions
│   │   ├── seed.ts               # Seed data (admin user)
│   │   └── repositories/         # Data access layer
│   │       ├── articleRepository.ts
│   │       ├── feedRepository.ts
│   │       ├── folderRepository.ts
│   │       ├── tagRepository.ts
│   │       └── settingsRepository.ts
│   ├── auth/                     # Authentication utilities
│   │   ├── password.ts           # bcrypt hash/verify
│   │   ├── session.ts            # Session management
│   │   └── getUser.ts            # Get current user helper
│   ├── feed-parser/              # RSS/Atom/JSON feed parsing
│   │   └── index.ts
│   ├── discover/                 # Feed discovery data
│   │   ├── categories.ts         # Feed categories
│   │   ├── curatedFeeds.ts       # Curated feed list
│   │   └── popularSites.ts       # Popular site mappings
│   └── opml/                     # OPML import/export
│       ├── parser.ts
│       └── generator.ts
│
├── hooks/                        # Custom React hooks
│   ├── useFeedRefresh.ts         # Auto-refresh feeds
│   ├── useKeyboardNavigation.ts  # Keyboard shortcuts
│   ├── useReaderMode.ts          # Reader mode logic
│   ├── useArticleSearch.ts       # Article search
│   └── useDocumentTitle.ts       # Dynamic page title
│
├── utils/                        # Utility functions
│   ├── cn.ts                     # Tailwind class merging
│   ├── sanitize.ts               # HTML sanitization
│   ├── date.ts                   # Date formatting
│   ├── favicon.ts                # Favicon URL helpers
│   └── video.ts                  # Video embed detection
│
├── types/                        # TypeScript types
│   └── discover.ts               # Discovery types
│
└── middleware.ts                 # Auth middleware
```

---

## Database Schema

The database uses SQLite with the following entity relationships:

```
┌───────────────┐       ┌───────────────┐       ┌───────────────┐
│    users      │       │   sessions    │       │ user_settings │
├───────────────┤       ├───────────────┤       ├───────────────┤
│ id (PK)       │◄──────│ user_id (FK)  │       │ user_id (PK,FK)│
│ username      │       │ id (PK)       │       │ theme         │
│ email         │       │ expires_at    │       │ font_size     │
│ password_hash │       │ ip_address    │       │ ...settings   │
│ created_at    │       │ user_agent    │       └───────────────┘
│ is_admin      │       └───────────────┘
└───────┬───────┘
        │
        │ 1:N
        ▼
┌───────────────┐       ┌───────────────┐       ┌───────────────┐
│   folders     │       │    feeds      │       │   articles    │
├───────────────┤       ├───────────────┤       ├───────────────┤
│ id (PK)       │◄──────│ folder_id(FK) │       │ id (PK)       │
│ user_id (FK)  │       │ id (PK)       │◄──────│ feed_id (FK)  │
│ name          │       │ user_id (FK)  │       │ guid          │
│ parent_folder │       │ url           │       │ title         │
│ order_index   │       │ title         │       │ link          │
│ icon          │       │ description   │       │ content       │
└───────────────┘       │ last_fetched  │       │ published_at  │
        ▲               └───────────────┘       │ reader_content│
        │                                       └───────┬───────┘
        │ Self-referential                              │
        │ (nested folders)                              │
        └───────────────────────────────────────────────┤
                                                        │
┌───────────────┐       ┌───────────────┐       ┌───────▼───────┐
│     tags      │       │ article_tags  │       │article_states │
├───────────────┤       ├───────────────┤       ├───────────────┤
│ id (PK)       │◄──────│ tag_id (FK)   │       │ id (PK)       │
│ user_id (FK)  │       │ article_state │───────│ user_id (FK)  │
│ name          │       │ _id (FK)      │       │ article_id(FK)│
│ color         │       └───────────────┘       │ is_read       │
└───────────────┘                               │ is_starred    │
                                                │ is_read_later │
                                                └───────────────┘
```

### Key Tables

| Table | Purpose |
|-------|---------|
| `users` | User accounts with hashed passwords |
| `sessions` | Active login sessions (30-day expiry) |
| `folders` | Feed folders with nesting support |
| `feeds` | RSS feed subscriptions |
| `articles` | Fetched article content |
| `article_states` | Per-user article state (read/starred/etc.) |
| `tags` | User-defined tags |
| `article_tags` | Junction table for article-tag relationships |
| `user_settings` | User preferences |
| `opml_imports` | OPML import history |

---

## Authentication System

### Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     AUTHENTICATION FLOW                          │
└─────────────────────────────────────────────────────────────────┘

SIGN UP:
┌──────────┐     POST /api/auth/signup     ┌───────────────────────┐
│  User    │ ─────────────────────────────►│ Create user record    │
│  Form    │  {username, password}         │ Hash password (bcrypt)│
└──────────┘                               │ Create session        │
                                           │ Set httpOnly cookie   │
                                           └───────────────────────┘

SIGN IN:
┌──────────┐     POST /api/auth/signin     ┌───────────────────────┐
│  User    │ ─────────────────────────────►│ Find user by username │
│  Form    │  {username, password}         │ Verify password hash  │
└──────────┘                               │ Create new session    │
                                           │ Set httpOnly cookie   │
                                           └───────────────────────┘

SESSION VALIDATION (Every API Request):
┌──────────┐     Cookie: session=xxx       ┌───────────────────────┐
│  Client  │ ─────────────────────────────►│ Extract session ID    │
│  Request │                               │ Check expiry in DB    │
└──────────┘                               │ Return user or 401    │
                                           └───────────────────────┘

MIDDLEWARE (Route Protection):
┌──────────┐                               ┌───────────────────────┐
│ Incoming │ ─────────────────────────────►│ Check cookie exists   │
│ Request  │                               │ (No DB call)          │
└──────────┘                               │                       │
     │                                     │ Has cookie? → Allow   │
     │                                     │ No cookie?  → Redirect│
     ▼                                     │ to /landing           │
┌──────────┐                               └───────────────────────┘
│Protected │ Actual session validation
│API Route │ happens in route handler
└──────────┘
```

### Key Files

- `src/lib/auth/password.ts` - bcrypt hashing (12 rounds)
- `src/lib/auth/session.ts` - Session CRUD, user queries
- `src/lib/auth/getUser.ts` - Helper to get current user from cookie
- `src/middleware.ts` - Route protection (cookie check only)

### Session Cookie

```typescript
// Set on login/signup
cookies().set("session", sessionId, {
  httpOnly: true,      // Not accessible via JavaScript
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 30 * 24 * 60 * 60,  // 30 days
  path: "/",
});
```

---

## State Management

The app uses **Zustand** for client-side state. Each store follows a pattern:

```typescript
interface StoreState {
  // Data
  items: Record<string, Item>;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
}

interface StoreActions {
  initialize: () => Promise<void>;  // Fetch from API
  addItem: (data: NewItem) => Promise<string | null>;
  updateItem: (id: string, updates: Partial<Item>) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  reset: () => void;  // Clear on logout
}
```

### Stores Overview

| Store | Purpose | Persistence |
|-------|---------|-------------|
| `authStore` | User session state | API-backed |
| `feedStore` | Feeds and folders | API-backed |
| `articleStore` | Articles and states | API-backed |
| `tagStore` | User tags | API-backed |
| `settingsStore` | User preferences | API-backed |
| `uiStore` | UI state (panel widths, selection) | Local only |
| `searchStore` | Search query/results | Local only |
| `discoverStore` | Feed discovery state | Local only |

### Store Initialization

Stores are initialized via `StoreInitializer.tsx` which runs on app mount:

```typescript
// src/components/StoreInitializer.tsx
export function StoreInitializer({ children }) {
  const { checkSession } = useAuthStore();
  const { initialize: initFeeds } = useFeedStore();
  const { initialize: initArticles } = useArticleStore();
  // ...

  useEffect(() => {
    async function init() {
      await checkSession();  // Validates session with API
      if (isAuthenticated) {
        await Promise.all([
          initFeeds(),
          initArticles(),
          initTags(),
          initSettings(),
        ]);
      }
    }
    init();
  }, [isAuthenticated]);
}
```

### Optimistic Updates Pattern

```typescript
// Example: Marking article as read
markAsRead: async (articleId: string, article: Article) => {
  // 1. Optimistic update - UI updates immediately
  set((state) => ({
    readStatus: { ...state.readStatus, [articleId]: true },
  }));

  try {
    // 2. API call
    const res = await fetch(`/api/articles/${articleId}/state`, {
      method: "PUT",
      body: JSON.stringify({ isRead: true, article }),
    });

    if (!res.ok) throw new Error("Failed");
  } catch {
    // 3. Rollback on failure
    set((state) => ({
      readStatus: { ...state.readStatus, [articleId]: false },
    }));
  }
};
```

---

## API Routes

All API routes are under `/api/*` and follow REST conventions.

### Authentication

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/auth/signup` | Create new account |
| POST | `/api/auth/signin` | Login, create session |
| POST | `/api/auth/signout` | Logout, delete session |
| GET | `/api/auth/me` | Get current user |

### Feeds

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/feeds` | List all feeds with folders |
| POST | `/api/feeds` | Subscribe to new feed |
| PUT | `/api/feeds/[id]` | Update feed (title, folder) |
| DELETE | `/api/feeds/[id]` | Unsubscribe from feed |

### Folders

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/folders` | List all folders |
| POST | `/api/folders` | Create folder |
| PUT | `/api/folders/[id]` | Rename/move folder |
| DELETE | `/api/folders/[id]` | Delete folder |

### Articles

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/articles` | List articles (with filters) |
| PUT | `/api/articles/[id]/state` | Update read/star/readLater |
| PUT | `/api/articles/[id]/tags` | Update article tags |

### Tags

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/tags` | List all tags |
| POST | `/api/tags` | Create tag |
| PUT | `/api/tags/[id]` | Update tag |
| DELETE | `/api/tags/[id]` | Delete tag |

### Other

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/fetch-feed?url=` | Proxy for fetching RSS feeds |
| POST | `/api/extract-article` | Extract article content (reader mode) |
| GET | `/api/settings` | Get user settings |
| PUT | `/api/settings` | Update user settings |
| GET | `/api/export` | Export all user data |
| POST | `/api/migrate` | Import localStorage data |

### API Route Pattern

```typescript
// src/app/api/feeds/route.ts
import { getCurrentUser } from "@/lib/auth/getUser";
import * as feedRepo from "@/lib/db/repositories/feedRepository";

export async function GET() {
  // 1. Check authentication
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Call repository
  const feeds = feedRepo.getFeedsByUser(user.id);
  const folders = feedRepo.getFoldersByUser(user.id);

  // 3. Return response
  return NextResponse.json({ feeds, folders });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const feed = feedRepo.createFeed(user.id, body);

  return NextResponse.json({ feed }, { status: 201 });
}
```

---

## Component Architecture

### Layout Components

```
ThreeColumnLayout
├── Sidebar (feeds, folders, navigation)
│   ├── ProfileButton
│   ├── FolderTreeItem (recursive)
│   │   └── FeedItem
│   ├── SmartViews (All, Unread, Starred, Read Later)
│   └── AddFeedModal
├── ArticleList (article titles/previews)
│   ├── ViewModeSelector (list/magazine/title)
│   ├── ArticleCard | ArticleMagazineItem | ArticleTitleItem
│   └── QuickActions (swipe actions)
└── ArticleContent (article reader)
    ├── Article header
    ├── Article body (sanitized HTML)
    └── TagSelector
```

### Responsive Behavior

```typescript
// ThreeColumnLayout.tsx
const MOBILE_BREAKPOINT = 768;   // < 768px = mobile
const TABLET_BREAKPOINT = 1024;  // 768-1024px = tablet

// Mobile: Single panel with bottom tab bar
// Tablet: 2 columns with slide-out sidebar
// Desktop: 3 columns with resizable dividers
```

### Component Pattern

```typescript
// Feature component pattern
export function FeedCard({ feed }: { feed: Feed }) {
  // 1. Get stores
  const { removeFeed, updateFeed } = useFeedStore();
  const { setSelectedFeed } = useUIStore();

  // 2. Local state for UI
  const [isEditing, setIsEditing] = useState(false);

  // 3. Event handlers call store actions
  const handleDelete = async () => {
    await removeFeed(feed.id);
  };

  // 4. Render
  return (
    <div onClick={() => setSelectedFeed(feed.id)}>
      {/* ... */}
    </div>
  );
}
```

---

## Data Flow

### Adding a New Feed

```
1. User enters URL in AddFeedModal
        │
        ▼
2. Component calls fetchAndParseFeed(url)
   └── Calls /api/fetch-feed?url=xxx (proxied fetch)
   └── Parses RSS/Atom/JSON feed
   └── Returns { title, description, items }
        │
        ▼
3. User confirms, component calls feedStore.addFeed()
        │
        ▼
4. Store makes POST /api/feeds
   └── API creates feed in database
   └── Returns created feed
        │
        ▼
5. Store updates local state
        │
        ▼
6. UI re-renders with new feed in sidebar
```

### Reading an Article

```
1. User clicks article in ArticleList
        │
        ▼
2. uiStore.setSelectedArticleId(id)
        │
        ▼
3. ArticleContent renders article
        │
        ▼
4. If markAsReadOnSelect setting is true:
   └── articleStore.markAsRead(articleId, articleData)
        │
        ▼
5. Store optimistically updates readStatus
   └── UI shows article as read
        │
        ▼
6. API call PUT /api/articles/[id]/state
   └── Creates article in DB if needed (via ensureArticleExists)
   └── Creates/updates article_state record
        │
        ▼
7. On success: state confirmed
   On failure: rollback readStatus
```

### Fetching Feed Articles

```
1. Feed is selected in sidebar
        │
        ▼
2. useFeedRefresh hook triggers
        │
        ▼
3. fetchAndParseFeed(feed.url) called
   └── /api/fetch-feed proxies the request
   └── Parses XML/JSON response
        │
        ▼
4. Articles stored in articleStore.articlesByFeed
   └── No database storage for articles until state changes!
   └── Articles are fetched fresh each time
        │
        ▼
5. When user stars/reads article:
   └── Article saved to DB via ensureArticleExists()
   └── article_state created
```

---

## Key Patterns

### Repository Pattern

All database access goes through repository functions:

```typescript
// src/lib/db/repositories/feedRepository.ts
export function getFeedsByUser(userId: string): Feed[] {
  const db = getDb();
  const rows = db.prepare(`
    SELECT * FROM feeds WHERE user_id = ?
  `).all(userId);
  return rows.map(rowToFeed);
}
```

### Authentication Guard

Every API route checks authentication:

```typescript
const user = await getCurrentUser();
if (!user) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

### Store Reset on Logout

All stores have a `reset()` method called on logout:

```typescript
// authStore.ts
signOut: async () => {
  await fetch("/api/auth/signout", { method: "POST" });
  useFeedStore.getState().reset();
  useArticleStore.getState().reset();
  useTagStore.getState().reset();
  useSettingsStore.getState().reset();
  set({ user: null, isAuthenticated: false });
};
```

### HTML Sanitization

All article content is sanitized before rendering:

```typescript
// src/utils/sanitize.ts
import DOMPurify from "dompurify";

export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ADD_TAGS: ["iframe"],
    ADD_ATTR: ["target", "allowfullscreen"],
  });
}
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/dyascj/cozy-rss.git
cd cozy-rss

# Install dependencies
npm install

# Create default admin user (optional)
npm run db:seed
# Creates: username "admin", password "admin"

# Start development server
npm run dev
```

### Environment Variables

Create `.env.local` for custom configuration:

```bash
# Optional: Custom database location
DATABASE_PATH=/path/to/rss-reader.db

# Optional: Custom session duration (ms)
SESSION_DURATION_MS=2592000000  # 30 days
```

---

## Development

### Running the Dev Server

```bash
npm run dev
# Opens http://localhost:3000
```

### Database

The SQLite database is created automatically at `./data/rss-reader.db`.

```bash
# Reset database (delete and recreate)
rm -rf data/rss-reader.db
npm run dev  # Migrations run on first connection

# Create seed data
npm run db:seed
```

### Testing

```bash
npm test          # Run tests in watch mode
npm run test:run  # Run tests once
npm run test:coverage  # With coverage
```

### Build for Production

```bash
npm run build
npm start
```

### Type Checking

```bash
npx tsc --noEmit
```

### Linting

```bash
npm run lint
```

---

## License

Private repository. All rights reserved.
