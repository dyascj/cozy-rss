# CozyRSS

A modern, full-featured RSS reader built with Next.js 16 and Supabase, featuring OAuth authentication and a beautiful three-column interface.

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
- [Getting Started](#getting-started)
- [Development](#development)

---

## Features

- **OAuth Authentication**: Sign in with GitHub (Google & Microsoft ready to enable)
- **Feed Management**: Add, organize, and delete RSS/Atom/JSON feeds
- **Folder Organization**: Nested folders for feed organization
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
| **Framework** | Next.js 16 (App Router) | Full-stack React framework |
| **Language** | TypeScript | Type safety |
| **Database** | Supabase (PostgreSQL) | Managed database with RLS |
| **Auth** | Supabase Auth (OAuth) | GitHub, Google, Microsoft |
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
└────────────┼────────────────┼─────────────────────────────────────────────┘
             │                │
┌────────────▼────────────────▼─────────────────────────────────────────────┐
│                         SUPABASE                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │                    PostgreSQL Database                                │ │
│  │  • Row Level Security (RLS) enabled                                  │ │
│  │  • Users can only access their own data                              │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │                    Supabase Auth                                      │ │
│  │  • OAuth providers (GitHub, Google, Microsoft)                       │ │
│  │  • Session management via cookies                                    │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────────────────┘
```

### Request Flow

```
User Action → Component → Zustand Store → fetch() → API Route → Repository → Supabase
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
│   │   │   └── signout/route.ts  # POST sign out
│   │   ├── articles/             # Article endpoints
│   │   │   ├── route.ts          # GET articles list, PATCH batch update
│   │   │   └── [id]/
│   │   │       ├── state/route.ts    # PUT read/star/readLater
│   │   │       └── tags/route.ts     # PUT article tags
│   │   ├── feeds/                # Feed CRUD
│   │   │   ├── route.ts          # GET list, POST create
│   │   │   └── [id]/route.ts     # GET, PUT, DELETE
│   │   ├── folders/              # Folder CRUD
│   │   ├── tags/                 # Tag CRUD
│   │   ├── settings/route.ts     # User settings
│   │   ├── fetch-feed/route.ts   # Proxy for fetching RSS
│   │   ├── extract-article/      # Reader mode extraction
│   │   ├── discover/             # Feed discovery
│   │   ├── migrate/route.ts      # localStorage migration
│   │   └── export/route.ts       # Data export
│   ├── auth/
│   │   └── callback/route.ts     # OAuth callback handler
│   ├── landing/page.tsx          # Public landing page
│   ├── signin/page.tsx           # OAuth sign in
│   ├── signup/page.tsx           # OAuth sign up
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
│   ├── auth/                     # Auth-related components
│   │   └── OAuthButton.tsx       # OAuth provider buttons
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
│   ├── supabase/                 # Supabase client configuration
│   │   ├── client.ts             # Browser client
│   │   ├── server.ts             # Server client (with cookies)
│   │   └── middleware.ts         # Middleware session helper
│   ├── db/
│   │   └── repositories/         # Data access layer
│   │       ├── articleRepository.ts
│   │       ├── feedRepository.ts
│   │       ├── folderRepository.ts
│   │       ├── tagRepository.ts
│   │       └── settingsRepository.ts
│   ├── auth/
│   │   └── getUser.ts            # Get current user helper
│   ├── feed-parser/              # RSS/Atom/JSON feed parsing
│   ├── discover/                 # Feed discovery data
│   └── opml/                     # OPML import/export
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
└── middleware.ts                 # Auth middleware (Supabase)

supabase/
└── migrations/                   # Database migrations
    ├── 20241227000001_schema.sql     # Table definitions
    └── 20241227000002_rls_policies.sql # Row Level Security
```

---

## Database Schema

The database uses Supabase PostgreSQL with Row Level Security (RLS):

```
┌───────────────┐                               ┌───────────────┐
│  auth.users   │                               │ user_settings │
│  (Supabase)   │                               ├───────────────┤
├───────────────┤                               │ user_id (PK,FK)│
│ id (PK)       │◄──────────────────────────────│ theme         │
│ email         │                               │ font_size     │
│ raw_user_meta │                               │ ...settings   │
│ ...           │                               └───────────────┘
└───────┬───────┘
        │
        │ Trigger: handle_new_user()
        ▼
┌───────────────┐       ┌───────────────┐       ┌───────────────┐
│   profiles    │       │   folders     │       │    feeds      │
├───────────────┤       ├───────────────┤       ├───────────────┤
│ id (PK,FK)    │◄──────│ user_id (FK)  │       │ id (PK)       │
│ username      │       │ id (PK)       │◄──────│ folder_id(FK) │
│ display_name  │       │ name          │       │ user_id (FK)  │
│ avatar_url    │       │ parent_folder │       │ url           │
│ is_admin      │       │ order_index   │       │ title         │
└───────────────┘       └───────────────┘       │ last_fetched  │
        │                                       └───────┬───────┘
        │                                               │
        │                                               │
        │                                       ┌───────▼───────┐
        │                                       │   articles    │
        │                                       ├───────────────┤
        │                                       │ id (PK)       │
        │                                       │ feed_id (FK)  │
        │                                       │ guid (unique) │
        │                                       │ title         │
        │                                       │ content       │
        │                                       │ published_at  │
        │                                       └───────┬───────┘
        │                                               │
        │       ┌───────────────┐       ┌───────────────▼───────┐
        │       │     tags      │       │   article_states      │
        │       ├───────────────┤       ├───────────────────────┤
        └──────►│ user_id (FK)  │       │ id (PK)               │
                │ id (PK)       │◄──────│ user_id (FK)          │
                │ name          │       │ article_id (FK)       │
                │ color         │       │ is_read               │
                └───────┬───────┘       │ is_starred            │
                        │               │ is_read_later         │
                        ▼               └───────────────────────┘
                ┌───────────────┐
                │ article_tags  │
                ├───────────────┤
                │ tag_id (FK)   │
                │ article_state │
                │ _id (FK)      │
                └───────────────┘
```

### Key Tables

| Table | Purpose |
|-------|---------|
| `profiles` | User profiles (linked to Supabase auth.users) |
| `folders` | Feed folders with nesting support |
| `feeds` | RSS feed subscriptions |
| `articles` | Fetched article content |
| `article_states` | Per-user article state (read/starred/etc.) |
| `tags` | User-defined tags |
| `article_tags` | Junction table for article-tag relationships |
| `user_settings` | User preferences |

### Row Level Security (RLS)

All tables have RLS enabled. Users can only access their own data:

```sql
-- Example policy
CREATE POLICY "Users can view own feeds"
  ON public.feeds FOR SELECT
  USING (auth.uid() = user_id);
```

---

## Authentication System

### OAuth Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     OAUTH AUTHENTICATION FLOW                     │
└─────────────────────────────────────────────────────────────────┘

1. User clicks "Continue with GitHub"
        │
        ▼
2. Supabase redirects to GitHub OAuth
   └── User authorizes the app
        │
        ▼
3. GitHub redirects to callback URL
   └── /auth/callback?code=xxx
        │
        ▼
4. Callback route exchanges code for session
   └── supabase.auth.exchangeCodeForSession(code)
        │
        ▼
5. Supabase creates session cookies
   └── Session stored in httpOnly cookies
        │
        ▼
6. User redirected to app
   └── Trigger creates profile if new user

SESSION VALIDATION (Every API Request):
┌──────────┐                               ┌───────────────────────┐
│  Client  │     Cookies (automatic)       │ Supabase Server Client│
│  Request │ ─────────────────────────────►│ supabase.auth.getUser()│
└──────────┘                               │ Returns user or null   │
                                           └───────────────────────┘
```

### Key Files

- `src/lib/supabase/client.ts` - Browser Supabase client
- `src/lib/supabase/server.ts` - Server Supabase client (handles cookies)
- `src/lib/supabase/middleware.ts` - Session validation for middleware
- `src/lib/auth/getUser.ts` - Helper to get current user
- `src/app/auth/callback/route.ts` - OAuth callback handler
- `src/middleware.ts` - Route protection

### OAuth Providers

| Provider | Status |
|----------|--------|
| GitHub | Enabled |
| Google | Ready (uncomment in signin/signup) |
| Microsoft | Ready (uncomment in signin/signup) |

---

## State Management

The app uses **Zustand** for client-side state. Each store follows a pattern:

```typescript
interface StoreState {
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
| `authStore` | User session state | Supabase Auth |
| `feedStore` | Feeds and folders | API-backed |
| `articleStore` | Articles and states | API-backed |
| `tagStore` | User tags | API-backed |
| `settingsStore` | User preferences | API-backed |
| `uiStore` | UI state (panel widths, selection) | Local only |
| `searchStore` | Search query/results | Local only |
| `discoverStore` | Feed discovery state | Local only |

### Optimistic Updates Pattern

```typescript
markAsRead: async (articleId: string) => {
  // 1. Optimistic update - UI updates immediately
  set((state) => ({
    articles: { ...state.articles, [articleId]: { ...article, isRead: true } },
  }));

  try {
    // 2. API call
    await fetch(`/api/articles/${articleId}/state`, {
      method: "PUT",
      body: JSON.stringify({ isRead: true, article }),
    });
  } catch {
    // 3. Rollback on failure
    set((state) => ({
      articles: { ...state.articles, [articleId]: { ...article, isRead: false } },
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
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/signout` | Logout |

### Feeds

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/feeds` | List all feeds with folders |
| POST | `/api/feeds` | Subscribe to new feed |
| GET | `/api/feeds/[id]` | Get single feed |
| PUT | `/api/feeds/[id]` | Update feed |
| DELETE | `/api/feeds/[id]` | Unsubscribe from feed |

### Articles

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/articles` | List articles (with filters) |
| PATCH | `/api/articles` | Batch update article states |
| PUT | `/api/articles/[id]/state` | Update read/star/readLater |
| PUT | `/api/articles/[id]/tags` | Update article tags |

### Other

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/fetch-feed?url=` | Proxy for fetching RSS feeds |
| POST | `/api/extract-article` | Extract article content (reader mode) |
| GET/PUT | `/api/settings` | User settings |
| GET | `/api/export` | Export all user data |

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
│   └── ArticleCard | ArticleMagazineItem | ArticleTitleItem
└── ArticleContent (article reader)
    ├── Article header
    ├── Article body (sanitized HTML)
    └── TagSelector
```

### Responsive Behavior

- **Mobile** (< 768px): Single panel with bottom tab bar
- **Tablet** (768-1024px): 2 columns with slide-out sidebar
- **Desktop** (> 1024px): 3 columns with resizable dividers

---

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project ([create one here](https://supabase.com))

### 1. Clone and Install

```bash
git clone https://github.com/dyascj/cozy-rss.git
cd cozy-rss
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)

2. Run the database migrations in the SQL Editor:
   - `supabase/migrations/20241227000001_schema.sql`
   - `supabase/migrations/20241227000002_rls_policies.sql`

3. Configure OAuth provider (GitHub):
   - Go to Authentication → Providers → GitHub
   - Create OAuth app at [github.com/settings/developers](https://github.com/settings/developers)
   - Set callback URL: `https://<your-project>.supabase.co/auth/v1/callback`

4. Set Site URL:
   - Go to Authentication → URL Configuration
   - Set Site URL to `http://localhost:3000` (or your domain)

### 3. Configure Environment

Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 4. Run the App

```bash
npm run dev
# Opens http://localhost:3000
```

---

## Development

### Running the Dev Server

```bash
npm run dev
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

### Adding OAuth Providers

To enable Google or Microsoft OAuth:

1. Configure the provider in Supabase Dashboard
2. Uncomment the provider buttons in:
   - `src/app/signin/page.tsx`
   - `src/app/signup/page.tsx`

---

## License

Private repository. All rights reserved.
