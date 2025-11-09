# Auth0 Quick Setup - Your Application

## ✅ Credentials Already Configured

Your Auth0 credentials are now configured in the app:
- **Domain**: `genai-417362476507225.ca.auth0.com`
- **Client ID**: `nnMNlW96qd2OINssQ5FOVc9cs8PtmPd8`
- **App Name**: plantReact

## 🔧 Required Auth0 Dashboard Configuration

You **MUST** configure the following in your Auth0 Dashboard for authentication to work:

### Step 1: Open Your Auth0 Application

1. Go to [Auth0 Dashboard](https://manage.auth0.com/)
2. Navigate to **Applications** → **Applications**
3. Find and click on your application named **"plantReact"**

### Step 2: Configure Application Settings

#### Allowed Callback URLs

In the **Allowed Callback URLs** field, add:
```
cauldroncare://auth
```

**Important**: Add this exactly as shown (no trailing slash, no spaces)

For development with Expo Go, you may also want to add:
```
exp://127.0.0.1:8081/--/auth
exp://localhost:8081/--/auth
```

#### Allowed Logout URLs

In the **Allowed Logout URLs** field, add:
```
cauldroncare://auth
```

#### Allowed Web Origins (Optional for development)

If testing on web, add:
```
exp://127.0.0.1:8081
exp://localhost:8081
```

### Step 3: Enable Grant Types

1. Scroll down and click **Show Advanced Settings**
2. Go to the **Grant Types** tab
3. Ensure the following are **checked**:
   - ✅ **Authorization Code**
   - ✅ **Refresh Token** (optional but recommended)
4. Click **Save Changes**

### Step 4: Verify Application Type

Make sure your application type is set to **Native** (this should already be set if you created it as a Native app).

## 🚀 Testing the Integration

1. **Restart your Expo development server**:
   ```bash
   cd plantApp
   npm start
   ```

2. **Run the app** on your device/simulator

3. **Click "Continue with Auth0"** on the login screen

4. You should be redirected to Auth0's login page

5. **Sign up or log in** with your Auth0 account

6. After successful authentication, you should be redirected back to the app and logged in

## 🐛 Troubleshooting

### "Invalid Redirect URI" Error

- **Solution**: Make sure `cauldroncare://auth` is exactly added to **Allowed Callback URLs** in Auth0 Dashboard
- Check for typos or extra spaces
- Make sure you clicked **Save Changes** after adding the URL

### "Token Exchange Failed" Error

- **Solution**: Verify that **Authorization Code** grant type is enabled in Advanced Settings → Grant Types
- Check the Expo console for detailed error messages
- Verify your Client ID is correct: `nnMNlW96qd2OINssQ5FOVc9cs8PtmPd8`

### Authentication Opens But Doesn't Redirect Back

- **Solution**: This usually means the callback URL isn't configured correctly
- Double-check that `cauldroncare://auth` is in Allowed Callback URLs
- For Expo Go, you might need to use the exp:// URLs instead

### "Auth0 Not Configured" Warning

- **Solution**: The credentials are hardcoded in `config/auth0.ts`, so this shouldn't appear
- If it does, check that the config file has the correct domain and client ID

## 📝 Notes

- **Client Secret**: You don't need to use the Client Secret in the mobile app (Native apps don't use it)
- **PKCE**: The app automatically uses PKCE for secure authentication
- **Environment Variables**: For production, consider moving credentials to a `.env` file (see AUTH0_SETUP.md)

## ✅ Checklist

Before testing, make sure you've completed:

- [ ] Added `cauldroncare://auth` to Allowed Callback URLs in Auth0 Dashboard
- [ ] Added `cauldroncare://auth` to Allowed Logout URLs in Auth0 Dashboard
- [ ] Enabled Authorization Code grant type
- [ ] Saved all changes in Auth0 Dashboard
- [ ] Restarted your Expo development server
- [ ] Tested the login flow

## 🎉 You're All Set!

Once you've configured the Auth0 Dashboard settings above, authentication should work seamlessly. The app will:
1. Open Auth0's login page when you click "Continue with Auth0"
2. Handle the OAuth flow with PKCE
3. Exchange the authorization code for an access token
4. Fetch your user information
5. Log you into the app

If you encounter any issues, check the troubleshooting section above or review the error messages in the Expo console.

