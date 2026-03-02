import { GOOGLE_OAUTH_CONFIG } from './authConfig';

export const generateGoogleOAuthUrl = (): string => {
  const params = new URLSearchParams({
    client_id: GOOGLE_OAUTH_CONFIG.clientId || '',
    redirect_uri: GOOGLE_OAUTH_CONFIG.redirectUri || '',
    response_type: 'code',
    scope: GOOGLE_OAUTH_CONFIG.scope || '',
    access_type: 'offline',
    prompt: 'consent'
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
};

export const handleGoogleOAuthCallback = async (code: string) => {
  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: GOOGLE_OAUTH_CONFIG.clientId || '',
        client_secret: GOOGLE_OAUTH_CONFIG.clientSecret || '',
        code,
        grant_type: 'authorization_code',
        redirect_uri: GOOGLE_OAUTH_CONFIG.redirectUri || '',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to exchange code for tokens');
    }

    const tokens = await response.json();
    return tokens;
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    throw error;
  }
};
