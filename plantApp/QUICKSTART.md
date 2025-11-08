# CauldronCare - Quick Start Guide

## Getting Started

1. **Install Dependencies**
   ```bash
   cd plantApp
   npm install
   ```

2. **Start the App**
   ```bash
   npx expo start
   ```

3. **Access the App**
   - Press `i` for iOS Simulator
   - Press `a` for Android Emulator
   - Press `w` for Web
   - Scan QR code with Expo Go app on your phone

## First Time Flow

### 1. Authentication
- On first launch, you'll see the Auth screen
- Click **"Use Dev Demo Account"** to bypass Auth0 and test the app immediately
- (Auth0 integration is stubbed and ready for real credentials)

### 2. Onboarding (One-time only)
After logging in, you'll go through a 4-step onboarding:

**Step 1: Welcome**
- Introduction to CauldronCare and the Brew Warden concept

**Step 2: Profile**
- Enter your display name
- Optionally add a profile photo

**Step 3: Add First Plant**
- Name your first plant (cauldron)
- Select species from dropdown
- Add optional photo and location

**Step 4: Tutorial**
- Learn about Brew Score, watering, robot control, and money saved
- Click "Get Started" to enter the main app

### 3. Main App (Bottom Tabs)

After onboarding, you have 3 tabs:

#### **Home Tab** 🏠
- View your Brew Score in the glowing badge
- Tap the big purple **"Cast Watering Spell"** button (currently a UI stub)
- See how much money you've saved from efficient watering
- Browse your cauldrons (plants) - tap any plant to see detailed sensor data
- Check recent activity feed at the bottom

#### **JoyCon Tab** 🎮
- View the robot camera feed stub (16:9 video placeholder)
- Use the virtual joystick to control the robot
  - Drag the purple thumb to steer
  - Watch the X/Y vector display update in real-time
- Toggle the connection badge to simulate robot connection status
- Use Start/Stop, Center, Light, and Horn buttons (all UI stubs)

#### **Friends Tab** 👥
- **Friends View**:
  - Search and add friends by username
  - Accept/decline incoming friend requests
  - View your friends leaderboard sorted by Brew Score
  - Tap any friend to see their profile and garden
- **Guild View** (toggle via tab):
  - Create a new guild with custom name and emblem color
  - Join an existing guild from the discover list
  - View guild leaderboard sorted by member scores
- Tap the floating purple button (bottom-right) to invite friends (stub)

## Mock Data Included

The app comes pre-populated with:
- Your account with 1,730 Brew Score and $1.42 saved
- 2 starter plants: "Ficus Nova" and "Snake Prime"
- 2 friends: Aanya (2,210 score) and Ravi (1,670 score)
- 1 guild: "Verdant Vials" with 3 members
- 2 discoverable guilds to join
- 1 incoming friend request from "LeafMage"
- 1 outgoing request to "RootKnight"
- Recent activity showing watering events

## Key Interactions

### Watering Your Plants
1. Go to Home tab
2. Tap the big purple **"Cast Watering Spell"** button
3. See a confirmation alert and new activity entry

### Viewing Plant Details
1. Tap any plant card on the Home screen
2. Modal shows: soil moisture %, air quality (AQI), brew health %, and suggestions
3. Tap "Close" to dismiss

### Controlling the Robot
1. Go to JoyCon tab
2. Drag the joystick thumb to see X/Y vector change
3. Toggle buttons to simulate robot features (all visual-only for now)

### Managing Friends
1. Go to Friends tab
2. Type a username in the search bar and tap send icon
3. Accept incoming requests with the green "Accept" button
4. Tap any friend in the leaderboard to view their profile and plants

### Guild Features
1. Go to Friends tab → tap "Guild" tab
2. If no guild: tap "Create Guild" or tap a discovered guild to join
3. If in a guild: view the guild leaderboard and member rankings

## Customization

### Adding More Plants
Currently, plants are hardcoded in `store/useAppStore.ts`. To add plants through the UI in the future, you'll implement an "Add Plant" feature that calls `addPlant()`.

### Changing Brew Score or Money Saved
Use these store actions:
```typescript
const { incrementScore, addMoneySaved } = useAppStore();
incrementScore(10); // Add 10 to Brew Score
addMoneySaved(0.15); // Add $0.15 to money saved
```

### Testing Different States
Edit `store/useAppStore.ts` to modify:
- Initial plants, friends, guilds
- Starting Brew Score or money saved
- Robot connection status
- Pre-populate activity feed

## Troubleshooting

### "Cannot find module" errors
```bash
npm install
npx expo start --clear
```

### App stuck on white screen
- Make sure you clicked "Use Dev Demo Account" on the Auth screen
- Reload the app (shake device or press `r` in terminal)

### TypeScript errors
```bash
npx tsc --noEmit
```

### Need to reset onboarding?
Edit `store/useAppStore.ts` and set:
```typescript
hasOnboarded: false,
```

## Next Steps

Ready to integrate real features?

1. **Connect Auth0**: Replace dev bypass in `AuthScreen.tsx`
2. **Wire Robot**: Integrate ESP32/robot API calls in `JoyConScreen.tsx` and `HomeScreen.tsx`
3. **Add Backend**: Create API endpoints for friends, guilds, and leaderboards
4. **Connect Sensors**: Pull real-time data from moisture and AQI sensors
5. **Implement CV**: Add computer vision for pot detection in robot control

All screens are structured with clear separation between UI and data logic, making integration straightforward.

## Support

For questions or issues:
- Check `CAULDRONCARE.md` for detailed architecture info
- Review code comments in `store/useAppStore.ts` for state management
- See individual screen files for component-specific logic
