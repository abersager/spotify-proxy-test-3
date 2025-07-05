# 🎵 Spotify Proxy

A personal Spotify API proxy that you can deploy to your own Cloudflare Workers account. This allows you to poll your Spotify listening data and expose simple endpoints like `/now-playing` without having to worry about CORS issues or managing your own server.

## 🚀 Features

- **One-click deploy** via Cloudflare Workers
- **No ongoing cost** (free tier is sufficient)
- **Secure OAuth flow** for Spotify authentication
- **Token storage** in Cloudflare KV
- **Simple API endpoints** for current track, recent tracks, and more
- **Beautiful setup UI** for easy configuration

## 📦 Quick Start

### 1. Prerequisites

- A Cloudflare account (free tier works fine)
- A Spotify Developer account
- Node.js installed locally

### 2. Set up Spotify App

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new app
3. Note down your `Client ID` and `Client Secret`
4. Add redirect URI: `https://your-worker-name.your-subdomain.workers.dev/callback`

### 3. Deploy to Cloudflare Workers

```bash
# Clone this repository
git clone <this-repo>
cd spotify-proxy

# Install dependencies
npm install

# Login to Cloudflare (if not already logged in)
npx wrangler login

# Set your Spotify credentials as secrets
npx wrangler secret put SPOTIFY_CLIENT_ID
npx wrangler secret put SPOTIFY_CLIENT_SECRET

# Deploy to Cloudflare Workers
npm run deploy
```

### 4. Configure OAuth

1. Visit your deployed worker URL
2. Click "Setup OAuth"
3. Follow the authorization flow
4. Test the endpoints!

## 🔧 Development

To run the development server locally:

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The worker will be available at `http://localhost:8787`

## 🛠 API Endpoints

| Endpoint | Description |
|----------|-------------|
| `/` | Home page with links to setup and endpoints |
| `/setup` | OAuth setup GUI |
| `/callback` | OAuth callback (don't call directly) |
| `/now-playing` | Current track and playback state |
| `/recent` | Recently played tracks (last 10) |
| `/health` | Health check and configuration status |

### Example Responses

#### `/now-playing`
```json
{
  "is_playing": true,
  "item": {
    "name": "Song Name",
    "artists": [{"name": "Artist Name"}],
    "album": {
      "name": "Album Name",
      "images": [{"url": "https://..."}]
    },
    "external_urls": {
      "spotify": "https://open.spotify.com/track/..."
    }
  },
  "progress_ms": 45000,
  "device": {
    "name": "Device Name",
    "type": "Computer"
  }
}
```

#### `/recent`
```json
{
  "items": [
    {
      "track": {
        "name": "Song Name",
        "artists": [{"name": "Artist Name"}],
        "album": {"name": "Album Name"}
      },
      "played_at": "2024-01-01T12:00:00Z"
    }
  ]
}
```

## 🔐 Security

- OAuth tokens are stored securely in Cloudflare KV
- Client credentials are stored as Cloudflare Workers secrets
- All API calls are server-side to prevent credential exposure
- CORS headers are properly configured for web applications

## 📖 Configuration

The worker uses the following environment variables:

- `SPOTIFY_CLIENT_ID` - Your Spotify app's client ID (secret)
- `SPOTIFY_CLIENT_SECRET` - Your Spotify app's client secret (secret)
- `ENVIRONMENT` - Environment name (set in wrangler.toml)

## 🤝 Contributing

Feel free to submit issues and pull requests!

## 📝 License

MIT License - see LICENSE file for details

## 🛟 Troubleshooting

### Common Issues

1. **"No valid tokens found"** - Complete the OAuth setup first via `/setup`
2. **"Client credentials not configured"** - Make sure you've set the secrets using `wrangler secret put`
3. **Callback URL mismatch** - Ensure your Spotify app's redirect URI matches your worker's `/callback` endpoint
4. **CORS issues** - The worker includes proper CORS headers, but make sure you're calling the right endpoints

### Getting Help

- Check the `/health` endpoint for configuration status
- Look at the browser console for any error messages
- Verify your Spotify app settings match your worker configuration

---

Made with ❤️ for the Spotify community
