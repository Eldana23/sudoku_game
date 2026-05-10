# SudokuMind

A real-time multiplayer Sudoku platform built with Next.js 15, Supabase, and the Anthropic Claude API. This is not a basic Sudoku app. It is a full-featured product with co-operative and competitive multiplayer, AI coaching, social features, daily challenges, and a monetization layer.

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Realtime-3ECF8E?logo=supabase)
![Tailwind](https://img.shields.io/badge/Tailwind-3.x-38bdf8?logo=tailwindcss)

---

## What this is

Most Sudoku apps are identical: a grid, a timer, and a "check answer" button. SudokuMind treats Sudoku as a social, educational product. The puzzle engine is the foundation, but the platform is built around three core ideas.

**Play together.** Co-op mode gives multiple players one shared board with real-time sync. Every move appears on everyone's screen in under 100ms. You can see your opponent's cursor moving between cells. Race mode takes the same puzzle and puts everyone on separate boards with a live progress bar, so first to finish wins.

**Learn while you play.** The AI Coach is powered by Claude and has actual context about your board. It knows which cell you've selected, what numbers are already in that row, column, and box, and what candidates are still valid. You can ask it why a move does not work, what strategy to try next, or to explain a technique like X-Wing or hidden pairs. It teaches through questions, not by handing you the answer.

**Compete and connect.** Global leaderboards, city-based rankings (top players in Almaty, London, Seoul), a daily challenge where every player worldwide gets the same puzzle, a friend system with invite links, and player profiles with full statistics.

---

## Feature list

### Gameplay
- 9x9 Sudoku with seeded generator (backtracking + constraint propagation)
- Four difficulty levels: Easy, Medium, Hard, Expert
- Notes mode (pencil marks in cells, auto-cleared when a number is placed)
- Conflict highlighting without blocking input
- Undo system with full move history
- Hints (prioritizes cells with fewest candidates)
- Keyboard navigation: 1-9 to input, N for notes, Backspace to clear, arrow keys to move, Ctrl+Z to undo

### Multiplayer: Co-op
- Create a room with a 6-character invite code
- Up to 4 players on one shared board
- Real-time move sync via Supabase Realtime subscriptions
- Live cursor and active cell indicators for each player (different color per player)
- Shared timer
- In-room chat with quick emoji reactions

### Multiplayer: Race
- Same puzzle, separate boards, first to complete wins
- Live progress bars showing each player's completion percentage
- Final rankings displayed at game end

### Authentication and Social
- Email and password sign-up / sign-in
- Searchable user directory by username
- Friend requests: send, accept, decline, remove
- Invite friends directly to a game from the friends page
- Player profiles with stats, best times, recent games, and streaks

### Daily Challenge
- Same puzzle for every user worldwide (seeded by UTC date)
- Global leaderboard refreshes daily
- Streak tracking: complete the daily to extend your streak

### Leaderboards
- Global all-time (best score per user per difficulty)
- Daily (today's puzzle)
- By city

### AI Coach
- Powered by Claude (streaming SSE)
- Contextual: knows your selected cell's candidates, row values, column values, and box values
- Teaches 9 techniques: Naked Singles, Hidden Singles, Naked Pairs/Triples, Hidden Pairs/Triples, Pointing Pairs, Box-Line Reduction, X-Wing, Swordfish, XY-Wing
- Quick action buttons for common questions
- Graceful fallback if the API key is not configured

### Monetization (Pro tier)
- Upgrade page with monthly, annual, and lifetime pricing
- Pro badge on profiles
- Architecture supports Stripe (price IDs in .env.example)

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, TypeScript) |
| Database | Supabase (PostgreSQL + RLS) |
| Realtime | Supabase Realtime (postgres_changes + broadcast) |
| Auth | Supabase Auth (email + password) |
| AI | Anthropic Claude (streaming via SSE) |
| Styling | Tailwind CSS + custom design tokens |
| Fonts | Syne (display), JetBrains Mono (numbers), Plus Jakarta Sans (body) |
| Icons | Lucide React |
| State | React useReducer (no external state manager needed) |

---

## Getting started

### Prerequisites
- Node.js 18.17+
- npm, yarn, or pnpm

### 1. Clone and install

```bash
git clone https://github.com/yourusername/sudoku-master.git
cd sudoku-master
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

The app works in layers, so you can add credentials progressively:

| Layer | What you get |
|---|---|
| No setup | Full puzzle engine, notes, hints, undo, conflict detection, localStorage persistence |
| + Supabase | Auth, leaderboards, multiplayer, friends, player profiles |
| + Anthropic | AI Coach with streaming explanations |
| + Stripe | Real Pro subscription payments |

### 3. Set up Supabase (for multiplayer and auth)

1. Create a free project at [supabase.com](https://supabase.com)
2. Copy your project URL and anon key into `.env.local`
3. Go to the SQL Editor in your project dashboard
4. Paste the contents of `supabase/schema.sql` and run it

This creates all tables, views, Row Level Security policies, triggers, and enables Realtime on the relevant tables.

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project structure

```
sudoku-master/
├── app/
│   ├── api/
│   │   └── ai-coach/route.ts         # Streaming AI Coach endpoint
│   ├── auth/page.tsx                 # Sign in / Sign up
│   ├── daily/page.tsx                # Daily challenge
│   ├── friends/page.tsx              # Friend system
│   ├── leaderboard/page.tsx          # Global / daily / city rankings
│   ├── lobby/page.tsx                # Multiplayer lobby (create/join room)
│   ├── play/page.tsx                 # Solo game
│   ├── pro/page.tsx                  # Upgrade page
│   ├── profile/[userId]/page.tsx     # Player profile and stats
│   ├── rooms/[roomId]/page.tsx       # Live multiplayer room
│   ├── globals.css                   # Design system and game styles
│   └── layout.tsx                    # Root layout with AuthProvider
│
├── components/
│   ├── game/
│   │   ├── AICoachPanel.tsx          # Collapsible AI chat panel
│   │   ├── CompletionModal.tsx       # Game-over screen with confetti
│   │   ├── NumberPad.tsx             # Input buttons and controls
│   │   └── SudokuBoard.tsx           # 9x9 grid with cell states
│   └── layout/
│       └── Header.tsx                # Nav with auth and user menu
│
├── hooks/
│   ├── useGame.ts                    # Solo game state (useReducer)
│   └── useRoom.ts                    # Multiplayer room state + Realtime
│
├── lib/
│   ├── auth.ts                       # signUp, signIn, signOut
│   ├── authContext.tsx               # React context for auth state
│   ├── friends.ts                    # Friend search, requests, management
│   ├── rooms.ts                      # Room creation, joining, moves
│   ├── sudoku.ts                     # Puzzle engine (generation, solving, hints)
│   ├── supabase.ts                   # Supabase client and leaderboard queries
│   └── utils.ts                      # cn(), formatTime(), detectCity(), etc.
│
├── types/
│   ├── index.ts                      # Solo game types
│   └── multiplayer.ts                # Room, Player, Move, Friendship types
│
├── supabase/
│   └── schema.sql                    # Full DB schema, run once in SQL Editor
│
├── public/
│   └── favicon.svg
│
├── .env.example
├── .gitignore
└── README.md
```

---

## Database schema

### Tables

**profiles** -- One row per user. Created automatically via trigger on auth.users insert. Stores username, display name, city, country, and Pro status.

**player_stats** -- One row per user. Auto-created alongside profile. Tracks games played and completed, total solve time, best times per difficulty, race stats, daily streak, and total score.

**scores** -- Every completed solo game. Stores puzzle seed, difficulty, score, time, mistakes, hints, is_daily flag, city, and country. Used for all leaderboards.

**friendships** -- Directional: requester to addressee. Status is pending, accepted, or blocked. RLS ensures only participants can read their own friendships.

**rooms** -- One row per multiplayer session. Stores the 6-char code, mode (coop/race), difficulty, puzzle seed, current board state for co-op, solution, and status (waiting/playing/finished).

**room_players** -- One row per player per room. Stores assigned color, ready status, race board and progress, finish time, and rank.

**moves** -- Persistent move log for co-op rooms. Used to replay board state if a player joins late.

**room_chat** -- Chat messages and emoji reactions per room.

**daily_challenges** -- One row per day. Tracks player count and top score.

### Views

- **v_global_leaderboard** -- Best score per user per difficulty, ranked
- **v_daily_leaderboard** -- Today's scores ranked
- **v_city_leaderboard** -- Best scores grouped by city
- **v_friends** -- Friendships joined with both users' profile data

### Realtime

These tables have Realtime enabled and are subscribed to in `useRoom.ts`:

- `moves` -- new co-op moves appear instantly on all clients
- `room_players` -- ready status and race progress updates
- `rooms` -- status changes from waiting to playing to finished
- `room_chat` -- new chat messages

Cursor positions use Supabase Broadcast (ephemeral, lower latency, no DB write).

---

## How multiplayer works

### Creating a room

1. Host calls `createRoom()` in `lib/rooms.ts`
2. Server generates a unique 6-char code via PostgreSQL function
3. A puzzle is generated client-side using the seeded RNG
4. Board and solution are stored in the `rooms` table
5. Host is inserted into `room_players` and redirected to `/rooms/[id]`

### Joining a room

1. Player enters a 6-char code in the lobby
2. `findRoomByCode()` looks up the room
3. `joinRoom()` inserts the player into `room_players` with an auto-assigned color
4. Player is redirected to the same room URL

### Real-time sync in co-op

When a player places a number:
1. Local state updates immediately (optimistic update)
2. The move is inserted into the `moves` table
3. The `rooms.board_state` JSON is updated
4. All other clients subscribed to that room receive the `postgres_changes` event and apply the same move to their local board

Cursor positions are broadcast (not persisted) using `channel.send({ type: "broadcast", event: "cursor", payload: {...} })`. This keeps latency very low and avoids unnecessary DB writes.

### Race mode

Each player has their own `race_board` in `room_players`. Moves apply locally and periodically sync to Supabase to update the `progress` count (0-81 cells filled). All players can see each other's progress bars updating in real time.

---

## How the puzzle generator works

**Step 1: Fill a complete grid.** A backtracking solver works through empty cells, trying numbers 1-9 in a seeded-random order. This produces a valid filled grid.

**Step 2: Create the puzzle.** Cells are removed one at a time. After each removal, the solver checks that the puzzle still has exactly one unique solution. If removing a cell would create ambiguity, it is kept. This guarantees every generated puzzle is valid and has a single solution.

The seed determines the order of RNG outputs, so the same seed always produces the same puzzle. The daily challenge uses `year * 10000 + month * 100 + day` as the seed. This is identical for every user worldwide without any database call.

---

## AI Coach architecture

The AI Coach is a Next.js Route Handler at `/api/ai-coach` that:

1. Validates the `ANTHROPIC_API_KEY` env var (returns a helpful message if missing)
2. Receives the chat history plus a context block built from the current board state (via `buildCellContext()` in `lib/sudoku.ts`)
3. Sends a streaming request to Claude with a system prompt defining the coaching persona and technique library
4. Pipes the SSE stream directly back to the client
5. The `AICoachPanel` component reads chunks and updates the message in real time

The context block tells Claude which numbers are already in the selected cell's row, column, and box, and what candidates remain. This makes every response specific to the player's actual board position rather than generic advice.

---

## Scoring

```
score = base[difficulty] - floor(time_seconds / 30) - (mistakes x 50) - (hints x 100)
score = max(score, 0)
```

| Difficulty | Base score |
|---|---|
| Easy | 1,000 |
| Medium | 2,000 |
| Hard | 3,500 |
| Expert | 5,000 |

The time penalty is applied in 30-second intervals so a slightly slow solve does not feel punishing. Mistakes cost 50 points each. Hints cost 100 each. A perfect Expert solve in under 5 minutes can score the full 5,000 points.

---

## Deployment

### Vercel (recommended)

```bash
npm install -g vercel
vercel
```

Add your environment variables in the Vercel dashboard under Project -> Settings -> Environment Variables.

### Docker

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
RUN npm ci --only=production
EXPOSE 3000
CMD ["npm", "start"]
```

---

## What makes this stand out

**Seeded daily puzzle.** All users worldwide solve the same puzzle each day without any DB query. The seed comes from the UTC date, so there is no coordination needed between clients.

**Live cursors in co-op.** Each player has a distinct color. When they select a cell, a colored outline appears on that cell for everyone else. It is a small detail but makes the collaborative feel real.

**Contextual AI.** The coach reads your actual board state before responding. It knows which numbers are in your row, which candidates are still valid, and which techniques apply to your specific position. That level of specificity is what makes it useful rather than just decorative.

**City leaderboards.** Local pride is a surprisingly strong retention driver. Seeing "2nd in Almaty" hits differently than "1,847th globally."

**Race mode psychology.** The live progress bars create real tension even in a turn-based game. You can see your opponent pulling ahead one cell at a time.

**Offline-first architecture.** The full solo game works with zero configuration. Nothing breaks if Supabase or Anthropic are not set up. This makes development and self-hosting straightforward.

---

## Roadmap

- OAuth and Google sign-in via Supabase Auth providers
- Web push notifications for daily challenge reminders
- Spectator mode: watch a live game without participating
- Tournament bracket: organized race events with multiple rounds
- Theme customization as a Pro feature with alternate color schemes
- React Native mobile port using the same engine and Supabase backend

---

## Contributing

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add something'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## License

MIT. Do what you want with it.

---

## Live Demo

https://sudoku-game-zuud.vercel.app

---

Built with [Next.js](https://nextjs.org), [Supabase](https://supabase.com), [Tailwind CSS](https://tailwindcss.com).
