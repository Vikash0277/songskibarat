# songskibarat

A community-powered internet radio station built with Next.js. Listen to curated Bollywood playlists, switch themes, and let anyone go live with their own YouTube playlist.

## Features

- **Rotations** — curated 90s & 2000s Bollywood time-slot playlists (Deluxe Saloon, Golden 90s, Truck Driver, etc.)
- **DJ Booth** — paste any YouTube/YT Music playlist link and everyone listening hears it live
- **Playlist Library** — every playlist shared is saved permanently; anyone can browse, search, and replay from the library
- **Theming** — switch between Deluxe, Cyber, Golden 90s, and Midnight themes
- **Live counter** — real-time online listener count
- **Responsive** — works on mobile and desktop

## Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Database:** MongoDB (Mongoose)
- **Auth:** JWT (jose)
- **Player:** YouTube IFrame API
- **Styling:** Tailwind CSS
- **UI:** Custom components (no component library)

## Getting Started

```bash
# install dependencies
npm install

# copy env and fill in values
cp .env.example .env

# run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Secret for JWT token signing |
| `YOUTUBE_DATA_API_KEY` | No | YouTube Data API v3 key |
| `UPSTASH_REDIS_REST_URL` | No | Upstash Redis for rate limiting |
| `UPSTASH_REDIS_REST_TOKEN` | No | Upstash Redis token |

## Project Structure

```
app/
  page.tsx              # Home — hero, DJ Booth, rotations grid
  streaming/page.tsx    # Standalone DJ Booth page
  api/
    streaming/
      active/route.ts   # GET/POST active playlist
      library/route.ts  # GET/POST playlist library
components/
  RadioPlayer.tsx       # YouTube IFrame player with rotation + DJ mode
  DJBar.tsx             # Inline DJ Booth (homepage)
  LibraryDrawer.tsx     # Slide-out library panel
  TopHeader.tsx         # Nav with online count, theme, library, support
models/
  ActivePlaylist.ts     # Currently playing DJ playlist
  LibraryPlaylist.ts    # Saved community playlists
lib/
  data.ts               # Curated rotation playlists
  db.ts                 # MongoDB connection
  auth.ts               # JWT helpers
```

## License

Made with love by [sorabyte.in](https://sorabyte.in)
