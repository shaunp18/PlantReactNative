# Auth0 Setup Guide

This guide will help you set up Auth0 authentication for your CauldronCare React Native app.

## Prerequisites

- An Auth0 account (you mentioned you already created one)
- Your React Native app running with Expo

## Step 1: Create an Auth0 Application

1. Log in to your [Auth0 Dashboard](https://manage.auth0.com/)

2. Navigate to **Applications** → **Applications** in the left sidebar

3. Click **Create Application**

4. Configure your application:
   - **Name**: Give it a name (e.g., "CauldronCare Mobile")
   - **Application Type**: Select **Native**
   - Click **Create**

## Step 2: Configure Application Settings

After creating the application, you'll need to configure the following settings:

### Allowed Callback URLs

Add the following callback URL (this matches your app's scheme):
```
cauldroncare://auth
```

For development/testing, you might also want to add:
```
exp://127.0.0.1:8081/--/auth
exp://localhost:8081/--/auth
```

### Allowed Logout URLs

Add:
```
cauldroncare://auth
```

### Allowed Web Origins

Add:
```
exp://127.0.0.1:8081
exp://localhost:8081
```

### Advanced Settings

1. Click on **Settings** tab
2. Scroll down to **Advanced Settings**
3. Go to **Grant Types** tab
4. Ensure the following are enabled:
   - ✅ Authorization Code
   - ✅ Refresh Token
5. Click **Save Changes**

## Step 3: Get Your Auth0 Credentials

In your Auth0 Application settings page, you'll find:

1. **Domain**: Look for "Domain" field (e.g., `your-tenant.auth0.com`)
2. **Client ID**: Look for "Client ID" field (a long alphanumeric string)

Copy these values - you'll need them in the next step.

## Step 4: Configure Environment Variables

1. Create a `.env` file in the `plantApp` directory (if it doesn't exist)

2. Add your Auth0 credentials to the `.env` file:
```env
EXPO_PUBLIC_AUTH0_DOMAIN=your-tenant.auth0.com
EXPO_PUBLIC_AUTH0_CLIENT_ID=your-client-id-here
```

**Important**: 
- Replace `your-tenant.auth0.com` with your actual Auth0 domain
- Replace `your-client-id-here` with your actual Client ID
- Do NOT include `https://` in the domain
- The `.env` file is gitignored, so your credentials won't be committed

## Step 5: Install Dependencies

The required packages are already installed:
- `expo-auth-session` - For OAuth authentication
- `expo-web-browser` - For opening the authentication browser

If you need to reinstall:
```bash
cd plantApp
npm install
```

## Step 6: Restart Your Development Server

After adding environment variables, you must restart your Expo development server:

1. Stop the current server (Ctrl+C)
2. Start it again:
```bash
npm start
```

Or:
```bash
npx expo start
```

## Step 7: Test the Integration

1. Run your app on a device or simulator
2. You should see the Auth screen
3. Click **"Continue with Auth0"**
4. You should be redirected to Auth0's login page
5. Sign up or log in with your Auth0 account
6. After successful authentication, you should be redirected back to the app
7. The app should now show you as logged in

## Troubleshooting

### "Auth0 Not Configured" Warning

- Make sure you created the `.env` file in the `plantApp` directory
- Verify the environment variable names are exactly: `EXPO_PUBLIC_AUTH0_DOMAIN` and `EXPO_PUBLIC_AUTH0_CLIENT_ID`
- Restart your Expo development server after creating/updating the `.env` file
- Check that the values don't have extra spaces or quotes

### "Invalid Redirect URI" Error

- Verify that `cauldroncare://auth` is added to your Auth0 Application's **Allowed Callback URLs**
- Make sure there are no typos in the callback URL
- For Expo Go, you might need to add the exp:// URLs mentioned in Step 2

### Authentication Fails

- Check that your Auth0 Application type is set to **Native**
- Verify that **Authorization Code** grant type is enabled
- Check the browser console or Expo logs for detailed error messages
- Make sure your Auth0 domain and client ID are correct

### Token Exchange Fails

- Verify that PKCE is enabled (it should be by default in the code)
- Check that your Auth0 Application allows the Authorization Code flow
- Ensure the redirect URI matches exactly in both the app and Auth0 dashboard

## How It Works

The app uses the **Authorization Code flow with PKCE** (Proof Key for Code Exchange), which is the recommended and most secure authentication method for mobile applications:

1. User clicks "Continue with Auth0"
2. App opens a browser with Auth0's login page
3. User authenticates with Auth0
4. Auth0 redirects back to the app with an authorization code
5. App exchanges the code for an access token (using PKCE)
6. App fetches user information using the access token
7. User is logged into the app

## Security Notes

- Never commit your `.env` file to version control (it's already in `.gitignore`)
- The Client ID is safe to expose in client-side code (it's public)
- Never expose your Auth0 Client Secret (Native applications don't use it)
- Access tokens are stored in memory only (not persisted)
- The app uses PKCE for enhanced security

## Additional Resources

- [Auth0 Documentation](https://auth0.com/docs)
- [Expo AuthSession Documentation](https://docs.expo.dev/guides/authentication/#authsession)
- [Auth0 React Native Quickstart](https://auth0.com/docs/quickstart/native/react-native)

## Need Help?

If you encounter issues:
1. Check the troubleshooting section above
2. Review the Auth0 Dashboard logs for authentication attempts
3. Check the Expo/React Native console for error messages
4. Verify all configuration steps were completed correctly

