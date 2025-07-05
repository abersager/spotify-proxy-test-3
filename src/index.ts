/**
 * Spotify Proxy - Cloudflare Worker
 *
 * A personal Spotify API proxy that handles OAuth authentication
 * and provides simple endpoints for accessing Spotify data.
 */

export interface Env {
  SPOTIFY_DATA: KVNamespace;
  SPOTIFY_CLIENT_ID: string;
  SPOTIFY_CLIENT_SECRET: string;
  ENVIRONMENT: string;
}

// CORS headers for all responses
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // Handle preflight requests
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // Route handling
      switch (pathname) {
        case "/":
          return handleRoot(request, env);
        case "/setup":
          return handleSetup(request, env);
        case "/callback":
          return handleCallback(request, env);
        case "/now-playing":
          return handleNowPlaying(request, env);
        case "/recent":
          return handleRecent(request, env);
        case "/health":
          return handleHealth(request, env);
        default:
          return new Response("Not Found", {
            status: 404,
            headers: corsHeaders,
          });
      }
    } catch (error) {
      console.error("Error handling request:", error);
      return new Response("Internal Server Error", {
        status: 500,
        headers: corsHeaders,
      });
    }
  },
};

/**
 * Handle root endpoint - redirect to setup
 */
async function handleRoot(request: Request, env: Env): Promise<Response> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Spotify Proxy</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
        .container { text-align: center; }
        .button { display: inline-block; padding: 10px 20px; background: #1db954; color: white; text-decoration: none; border-radius: 5px; margin: 10px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🎵 Spotify Proxy</h1>
        <p>Your personal Spotify API proxy is running!</p>
        <a href="/setup" class="button">Setup OAuth</a>
        <a href="/health" class="button">Health Check</a>
            </div>
    </body>
    </html>
  `;

  return new Response(html, {
    headers: {
      "Content-Type": "text/html",
      ...corsHeaders,
    },
  });
}

/**
 * Handle setup endpoint - OAuth configuration
 */
async function handleSetup(request: Request, env: Env): Promise<Response> {
  // Check if we have client credentials
  if (!env.SPOTIFY_CLIENT_ID || !env.SPOTIFY_CLIENT_SECRET) {
    return new Response(
      "Spotify client credentials not configured. Please set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET secrets.",
      {
        status: 500,
        headers: { "Content-Type": "text/plain" },
      }
    );
  }

  // If POST request, handle OAuth initiation
  if (request.method === "POST") {
    const redirectUri = `${new URL(request.url).origin}/callback`;
    const scope =
      "user-read-currently-playing user-read-recently-played user-read-playback-state";
    const state = generateRandomString(16);

    // Store state in KV for verification
    await env.SPOTIFY_DATA.put(`oauth_state_${state}`, "pending", {
      expirationTtl: 600,
    });

    const authUrl =
      `https://accounts.spotify.com/authorize?` +
      `response_type=code&` +
      `client_id=${env.SPOTIFY_CLIENT_ID}&` +
      `scope=${encodeURIComponent(scope)}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `state=${state}`;

    return Response.redirect(authUrl, 302);
  }

  // Return setup HTML
  const html = await getSetupHTML();
  return new Response(html, {
    headers: {
      "Content-Type": "text/html",
      ...corsHeaders,
    },
  });
}

/**
 * Handle OAuth callback
 */
async function handleCallback(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  if (error) {
    return new Response(`OAuth Error: ${error}`, { status: 400 });
  }

  if (!code || !state) {
    return new Response("Missing authorization code or state", { status: 400 });
  }

  // Verify state
  const storedState = await env.SPOTIFY_DATA.get(`oauth_state_${state}`);
  if (!storedState) {
    return new Response("Invalid or expired state parameter", { status: 400 });
  }

  // Exchange code for tokens
  const tokenResponse = await exchangeCodeForTokens(code, request.url, env);
  if (!tokenResponse.success) {
    return new Response(`Token exchange failed: ${tokenResponse.error}`, {
      status: 400,
    });
  }

  // Store tokens in KV
  await env.SPOTIFY_DATA.put(
    "spotify_tokens",
    JSON.stringify(tokenResponse.data),
    { expirationTtl: 3600 }
  );

  // Clean up state
  await env.SPOTIFY_DATA.delete(`oauth_state_${state}`);

  return new Response(
    `
    <html>
      <head><title>OAuth Success</title></head>
      <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
        <h1>✅ OAuth Setup Complete!</h1>
        <p>Your Spotify account has been successfully connected.</p>
        <p>You can now use the API endpoints:</p>
        <ul style="display: inline-block; text-align: left;">
          <li><a href="/now-playing">/now-playing</a></li>
          <li><a href="/recent">/recent</a></li>
          <li><a href="/health">/health</a></li>
        </ul>
        <p><a href="/">&larr; Back to Home</a></p>
      </body>
    </html>
  `,
    {
      headers: {
        "Content-Type": "text/html",
        ...corsHeaders,
      },
    }
  );
}

/**
 * Handle now-playing endpoint
 */
async function handleNowPlaying(request: Request, env: Env): Promise<Response> {
  const tokens = await getStoredTokens(env);
  if (!tokens) {
    return new Response(
      JSON.stringify({
        error: "No valid tokens found. Please complete OAuth setup first.",
      }),
      {
        status: 401,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  }

  const spotifyResponse = await callSpotifyAPI(
    "/v1/me/player/currently-playing",
    tokens.access_token
  );

  if (spotifyResponse.status === 204) {
    return new Response(
      JSON.stringify({ playing: false, message: "No track currently playing" }),
      {
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  }

  if (!spotifyResponse.ok) {
    return new Response(
      JSON.stringify({ error: "Failed to fetch current track" }),
      {
        status: spotifyResponse.status,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  }

  const data = await spotifyResponse.json();
  return new Response(JSON.stringify(data), {
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders,
    },
  });
}

/**
 * Handle recent tracks endpoint
 */
async function handleRecent(request: Request, env: Env): Promise<Response> {
  const tokens = await getStoredTokens(env);
  if (!tokens) {
    return new Response(
      JSON.stringify({
        error: "No valid tokens found. Please complete OAuth setup first.",
      }),
      {
        status: 401,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  }

  const spotifyResponse = await callSpotifyAPI(
    "/v1/me/player/recently-played?limit=10",
    tokens.access_token
  );

  if (!spotifyResponse.ok) {
    return new Response(
      JSON.stringify({ error: "Failed to fetch recent tracks" }),
      {
        status: spotifyResponse.status,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  }

  const data = await spotifyResponse.json();
  return new Response(JSON.stringify(data), {
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders,
    },
  });
}

/**
 * Handle health check endpoint
 */
async function handleHealth(request: Request, env: Env): Promise<Response> {
  const tokens = await getStoredTokens(env);
  const hasValidTokens = tokens !== null;

  const health = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    environment: env.ENVIRONMENT || "unknown",
    oauth_configured: hasValidTokens,
    endpoints: {
      setup: "/setup",
      callback: "/callback",
      now_playing: "/now-playing",
      recent: "/recent",
      health: "/health",
    },
  };

  return new Response(JSON.stringify(health, null, 2), {
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders,
    },
  });
}

/**
 * Utility Functions
 */

function generateRandomString(length: number): string {
  const charset =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return result;
}

async function exchangeCodeForTokens(
  code: string,
  callbackUrl: string,
  env: Env
) {
  const redirectUri = new URL(callbackUrl).origin + "/callback";

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${btoa(
        `${env.SPOTIFY_CLIENT_ID}:${env.SPOTIFY_CLIENT_SECRET}`
      )}`,
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code: code,
      redirect_uri: redirectUri,
    }),
  });

  if (!response.ok) {
    return {
      success: false,
      error: `Token exchange failed: ${response.statusText}`,
    };
  }

  const data = await response.json();
  return { success: true, data };
}

async function getStoredTokens(env: Env) {
  const tokensJson = await env.SPOTIFY_DATA.get("spotify_tokens");
  return tokensJson ? JSON.parse(tokensJson) : null;
}

async function callSpotifyAPI(endpoint: string, accessToken: string) {
  return fetch(`https://api.spotify.com${endpoint}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });
}

async function getSetupHTML(): Promise<string> {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Spotify Proxy Setup</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          max-width: 600px;
          margin: 50px auto;
          padding: 20px;
          background-color: #f5f5f5;
        }
        .container {
          background: white;
          padding: 30px;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .button {
          display: inline-block;
          padding: 12px 24px;
          background: #1db954;
          color: white;
          text-decoration: none;
          border-radius: 25px;
          margin: 10px 0;
          border: none;
          cursor: pointer;
          font-size: 16px;
        }
        .button:hover { background: #1ed760; }
        .info {
          background: #e8f5e8;
          padding: 15px;
          border-radius: 5px;
          margin: 20px 0;
        }
        .step {
          margin: 15px 0;
          padding: 10px;
          background: #f9f9f9;
          border-left: 4px solid #1db954;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🎵 Spotify Proxy Setup</h1>

        <div class="info">
          <h3>Before you begin:</h3>
          <ol>
            <li>Create a Spotify app at <a href="https://developer.spotify.com/dashboard" target="_blank">developer.spotify.com</a></li>
            <li>Add this callback URL to your app: <code>${self.location.origin}/callback</code></li>
            <li>Make sure your Cloudflare Worker has SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET secrets set</li>
          </ol>
        </div>

        <div class="step">
          <h3>Step 1: Authorize with Spotify</h3>
          <p>Click the button below to connect your Spotify account:</p>
          <form method="POST">
            <button type="submit" class="button">🔗 Connect Spotify Account</button>
          </form>
        </div>

        <div class="step">
          <h3>Step 2: Test Your Setup</h3>
          <p>After authorization, test these endpoints:</p>
          <ul>
            <li><a href="/now-playing">/now-playing</a> - Current track</li>
            <li><a href="/recent">/recent</a> - Recent tracks</li>
            <li><a href="/health">/health</a> - Health check</li>
          </ul>
        </div>

        <p><a href="/">&larr; Back to Home</a></p>
      </div>
    </body>
    </html>
  `;
}
