# Auth0 Username/Password & Google Login Setup

## Overview

The app now supports:
1. **Username/Password Login** - Direct login form (no browser redirect)
2. **Google Login** - OAuth login with Google (opens Google's login page)
3. **Dev Demo Account** - For testing without Auth0

## Auth0 Dashboard Configuration

### 1. Enable Resource Owner Password Grant (ROPC)

**Important**: ROPC is required for username/password login to work.

1. Go to [Auth0 Dashboard](https://manage.auth0.com/)
2. Navigate to **Applications** → **Applications** → **plantReact**
3. Click **Settings** tab
4. Scroll down and click **Show Advanced Settings**
5. Go to the **Grant Types** tab
6. Enable **Password** grant type:
   - ✅ Check the **Password** checkbox
   - ⚠️ **Note**: ROPC is not recommended for production by Auth0, but it enables direct username/password login without browser redirect
7. Click **Save Changes**

### 2. Configure Google Social Connection

1. Go to **Authentication** → **Social** in the Auth0 Dashboard
2. Click on **Google**
3. Enable the Google connection:
   - Toggle **Google** to **Enabled**
   - Configure your Google OAuth credentials (Client ID and Client Secret from Google Cloud Console)
   - Or use Auth0's development keys for testing
4. Click **Save**

### 3. Create a User for Testing

1. Go to **User Management** → **Users** in the Auth0 Dashboard
2. Click **Create User**
3. Fill in:
   - **Email**: your-email@example.com
   - **Password**: (choose a secure password)
   - **Connection**: Username-Password-Authentication
4. Click **Create**

### 4. Verify Database Connection

1. Go to **Authentication** → **Database** in the Auth0 Dashboard
2. Ensure **Username-Password-Authentication** is enabled
3. This is the default database connection used by the app

## How It Works

### Username/Password Login
- Uses Auth0's Resource Owner Password Credentials (ROPC) grant
- Sends credentials directly to Auth0 (no browser redirect)
- Requires ROPC to be enabled in Auth0 Dashboard

### Google Login
- Uses Auth0's Social Connection with Google
- Opens Google's OAuth login page in a browser
- After Google authentication, redirects back to the app
- No need to enable ROPC for Google login

## Testing

1. **Test Username/Password**:
   - Enter email and password in the form
   - Click "Login"
   - Should authenticate without opening a browser

2. **Test Google Login**:
   - Click "Login with Google"
   - Browser will open with Google's login page
   - After authenticating with Google, you'll be redirected back to the app

3. **Test Dev Demo**:
   - Click "Use Dev Demo Account"
   - Should immediately log in (no Auth0 required)

## Troubleshooting

### "Invalid Grant" Error (Username/Password)
- **Solution**: Make sure ROPC (Password grant type) is enabled in Auth0 Dashboard
- Check that the user exists in the Username-Password-Authentication connection
- Verify email and password are correct

### "Invalid Connection" Error (Google)
- **Solution**: Ensure Google social connection is enabled in Auth0 Dashboard
- Check that Google OAuth credentials are properly configured
- Verify the connection name is `google-oauth2` (default)

### "Access Denied" Error
- **Solution**: Check that the user has the correct permissions
- Verify the Auth0 application has the correct scopes enabled
- Check that the connection is enabled for your Auth0 application

## Security Notes

⚠️ **Important**: Resource Owner Password Grant (ROPC) is less secure than the Authorization Code flow because:
- Credentials are sent directly from the client
- No PKCE protection
- Less secure for public clients

**Recommendations**:
- For production, consider using the Authorization Code flow with PKCE
- If using ROPC, ensure strong password policies
- Enable MFA for additional security
- Monitor for suspicious login attempts

## Additional Resources

- [Auth0 ROPC Documentation](https://auth0.com/docs/get-started/authentication-and-authorization-flow/resource-owner-password-flow)
- [Auth0 Social Connections](https://auth0.com/docs/authenticate/identity-providers/social-identity-providers)
- [Google OAuth Setup](https://auth0.com/docs/authenticate/identity-providers/social-identity-providers/google)

