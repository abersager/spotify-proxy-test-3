# 🎵 Spotify Proxy

A personal Spotify API proxy that you can deploy to your own Cloudflare Workers account. This allows you to poll your Spotify listening data and expose simple endpoints like `/now-playing` without having to worry about CORS issues or managing your own server.

## 🚀 Deploy Your Spotify Proxy

**🎉 No GitHub Account Required!** Choose your preferred deployment method:

### 🌐 Method 1: Smart Web Deploy (Easiest)

**Perfect for non-technical users with intelligent validation - no GitHub account needed!**

[![Open Web Deploy](https://img.shields.io/badge/Open%20Web%20Deploy-1db954?style=for-the-badge&logo=cloudflare)](https://abersager.github.io/spotify-proxy/)

Visit the [**Smart Web Deploy Tool**](https://abersager.github.io/spotify-proxy/) for an enhanced experience:

**✨ Smart Features:**
- 🔍 **Real-time token validation** - Instant feedback as you type
- 🤖 **Auto-detects Account ID** - No manual copying required
- ✅ **Permission verification** - Confirms access before deployment
- 💡 **Interactive help** - Shows exact setup instructions
- 🚀 **One-click deployment** - Deploy button activates when ready

Choose from multiple deployment methods:
- **🚀 Smart Cloudflare Deploy** - Validated one-click deployment
- **💻 Download Scripts** - Both smart and basic versions
- **⚙️ Manual Setup** - Step-by-step instructions

### 💻 Method 2: Smart Deployment Script

**Enhanced automation with validation and guidance:**

```bash
# Download the smart deployment script
curl -O https://raw.githubusercontent.com/abersager/spotify-proxy/main/deploy-smart.js

# Run the script (requires Node.js)
node deploy-smart.js
```

**✨ Smart Features:**
- ✅ **Automatic token validation** - Verifies your API token instantly
- 🔍 **Auto-detects Account ID** - No need to copy/paste from dashboard
- 🔐 **Permission checking** - Confirms Workers and KV access
- 💡 **Interactive troubleshooting** - Guides you through any issues
- 📋 **Pre-configured setup** - Shows exact token creation steps

**Alternative (Basic Script):**
```bash
# Download basic script (manual credential input)
curl -O https://raw.githubusercontent.com/abersager/spotify-proxy/main/deploy-standalone.js
node deploy-standalone.js
```

### ⚡ Method 3: Direct Cloudflare Deploy

**One-click deployment via Cloudflare's platform:**

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/abersager/spotify-proxy)

### 🔧 Method 4: GitHub Template (For Developers)

**If you want to customize or contribute:**

[![Use this template](https://img.shields.io/badge/Use%20this%20template-2ea44f?style=for-the-badge&logo=github)](https://github.com/abersager/spotify-proxy/generate)

<details>
<summary>📋 Click here for GitHub template deployment instructions</summary>

**Step 1: Get this template**
Click the "Use this template" button above to create your own repository.

**Step 2: Get your Cloudflare credentials** (takes 2 minutes)

#### 🔑 Getting Your Cloudflare API Token

1. **Go to Cloudflare Dashboard**: Visit [https://dash.cloudflare.com/profile/api-tokens](https://dash.cloudflare.com/profile/api-tokens)
2. **Create Token**: Click "Create Token" button
3. **Use Custom Token**: Click "Get started" next to "Custom token"
4. **Configure Token**:
   - **Token name**: `Spotify Proxy Deploy`
   - **Permissions**: Add these permissions:
     - `Account` → `Cloudflare Workers:Edit`
     - `Zone` → `Zone:Read` (if you have any domains)
   - **Account Resources**: Select "Include All accounts"
   - **Zone Resources**: Select "Include All zones" (or skip if no domains)
5. **Create & Copy**: Click "Continue to summary" → "Create Token" → **Copy the token**

#### 🆔 Getting Your Cloudflare Account ID

1. **Go to Cloudflare Dashboard**: Visit [https://dash.cloudflare.com](https://dash.cloudflare.com)
2. **Copy Account ID**: Look at the right sidebar → copy the "Account ID"

**Step 3: Deploy with one click**

After creating your repository from the template above, click this link to deploy:

🚀 **[Deploy Now - Run Manual Deploy Workflow](https://github.com/YOUR-USERNAME/YOUR-REPO-NAME/actions/workflows/manual-deploy.yml)**

> **Important**: Replace `YOUR-USERNAME/YOUR-REPO-NAME` in the URL above with your actual GitHub username and repository name

> **🔧 Quick Helper**: Use the [**Web Deploy Tool**](https://abersager.github.io/spotify-proxy/) to automatically generate your deploy link

Or manually:
1. Go to your repository on GitHub
2. Click the **Actions** tab
3. Click **Manual Deploy** in the left sidebar
4. Click **Run workflow** button
5. Fill in your Cloudflare credentials:
   - **Cloudflare API Token**: (from Step 2 above)
   - **Cloudflare Account ID**: (from Step 2 above)
   - **Worker Name**: Leave default or customize
6. Click **Run workflow**

**Step 4: Complete setup**
- Wait for deployment to finish (1-2 minutes)
- Visit your worker URL (shown in the workflow output)
- Follow the web setup to connect your Spotify account

</details>

## ✨ Features

- **Multiple deployment options** - no GitHub account required
- **No ongoing cost** (free tier is sufficient)
- **Web-based setup** - no CLI required
- **Secure OAuth flow** for Spotify authentication
- **KV storage** for credentials and tokens
- **Simple API endpoints** for current track, recent tracks, and more
- **Beautiful setup UI** for easy configuration

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

## 🔑 Need Help?

If you encounter issues:

1. **Deployment fails**: Check that your Cloudflare credentials are correct
2. **Worker not accessible**: Wait a few minutes for DNS propagation
3. **OAuth errors**: Make sure your Spotify app callback URL matches your worker URL
4. **Still stuck**: Open an issue in this repository

## 🆔 Repository URLs

When using the manual deploy link, replace the repository URL with your own:
- Template: `https://github.com/YOUR-USERNAME/YOUR-REPO-NAME/actions/workflows/manual-deploy.yml`
- Example: `https://github.com/abersager/spotify-proxy-test/actions/workflows/manual-deploy.yml`

**🔧 Easy Link Generator**: Use the [**Web Deploy Tool**](https://abersager.github.io/spotify-proxy/) to automatically create your deploy link!

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
