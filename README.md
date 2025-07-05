# 🎵 Spotify Proxy

A personal Spotify API proxy that you can deploy to your own Cloudflare Workers account. This allows you to poll your Spotify listening data and expose simple endpoints like `/now-playing` without having to worry about CORS issues or managing your own server.

## 🚀 One-Click Deploy

Deploy your own Spotify proxy in under 2 minutes:

### 🔥 Method 1: GitHub Template (Recommended)

[![Use this template](https://img.shields.io/badge/Use%20this%20template-2ea44f?style=for-the-badge&logo=github)](https://github.com/abersager/spotify-proxy/generate)

1. **Click "Use this template"** to create your own repository
2. **Go to Actions tab** in your new repository
3. **Run "Manual Deploy"** workflow with your Cloudflare credentials
4. **Visit your worker URL** to complete setup!

### ⚡ Method 2: Direct Fork & Deploy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/abersager/spotify-proxy)

### 🔧 Method 3: Manual Setup

If you prefer manual control:

<details>
<summary>Click to expand manual setup instructions</summary>

## ✨ Features

- **One-click deploy** via Cloudflare Workers
- **No ongoing cost** (free tier is sufficient)
- **Web-based setup** - no CLI required
- **Secure OAuth flow** for Spotify authentication
- **KV storage** for credentials and tokens
- **Simple API endpoints** for current track, recent tracks, and more
- **Beautiful setup UI** for easy configuration

## 📦 Manual Setup

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

</details>

## 🎯 Setup Process (All Methods)

After deployment, regardless of method used:

### 1. **Create Spotify App**
- Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
- Create a new app
- Note your **Client ID** and **Client Secret**
- Add callback URL: `https://your-worker-name.your-subdomain.workers.dev/callback`

### 2. **Complete Web Setup**
- Visit your deployed worker URL
- Enter your Spotify credentials in the web form
- Click "Connect Spotify Account" to authorize
- Test your endpoints!

### 3. **Start Using Your Proxy**
- `/now-playing` - Current track
- `/recent` - Recently played tracks
- `/health` - Status check

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

## 🔑 Getting Cloudflare Credentials

For deployment, you'll need:

### 1. **Cloudflare Account ID**
- Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
- Copy your Account ID from the right sidebar

### 2. **API Token**
- Go to [API Tokens](https://dash.cloudflare.com/profile/api-tokens)
- Click "Create Token"
- Use "Edit Cloudflare Workers" template
- Select your account and zone permissions
- Copy the generated token

## 🛟 Troubleshooting

### Deployment Issues

1. **"Invalid API token"** - Regenerate your Cloudflare API token with proper Worker permissions
2. **"Account ID not found"** - Double-check your Account ID from Cloudflare dashboard
3. **"Worker name conflict"** - Choose a different worker name during deployment

### Setup Issues

1. **"No valid tokens found"** - Complete the credential setup at `/credentials` first
2. **"Invalid Client ID format"** - Ensure you're using the correct Spotify Client ID (32+ characters)
3. **"Callback URL mismatch"** - Ensure your Spotify app's redirect URI matches your worker's `/callback` endpoint
4. **"OAuth failed"** - Check your Spotify credentials and callback URL configuration

### Getting Help

- Check the `/health` endpoint for configuration status
- Look at the browser console for any error messages
- Verify your Spotify app settings match your worker URL
- Ensure your worker has the latest code deployed

---

Made with ❤️ for the Spotify community
