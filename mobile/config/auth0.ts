// Auth0 Configuration for Expo
// Environment variables are set via:
// - EAS Secrets for production builds
// - .env.local for local development (gitignored)

export const auth0Config = {
  // Auth0 domain - hardcoded for now, can be env var in production
  domain: 'dev-rlqpb3p7hzb1ldkr.us.auth0.com',
  
  // Auth0 Client ID (Native App) - Currently points to "Templation" app
  // Either: 1) Rename "Templation" to "Havn" in Auth0, OR
  //         2) Create new "Havn" app and replace this Client ID
  clientId: 'JzWqmPMtNkl1tuIQ4iP6cdy9KbaCrORE',
  
  // Redirect URI scheme
  redirectUri: `exp://localhost:8081`,
  
  // Scopes to request
  scope: 'openid profile email offline_access read:spots write:occupancy read:friends write:friends read:spot-saves write:spot-saves',
  
  // API Audience for backend authorization
  audience: 'https://havn-api',
};

// URL scheme for your app
export const AUTH0_URL_SCHEME = 'havnapp';


