# CauldronCare

A gamified plant care app with a whimsical potion factory theme. Keep your cauldrons (plants) healthy to raise your Brew Score!

## Features

### Authentication & Onboarding
- Auth0 integration with dev demo bypass
- One-time onboarding flow:
  - Welcome screen
  - Profile setup with avatar picker
  - Add first plant (cauldron)
  - Interactive tutorial

### Home Screen
- Brew Score badge (global vitality metric)
- Cast Watering Spell button (UI stub for robot spray)
- Money Saved tracker (shows USD saved from efficient watering)
- Your Cauldrons list with:
  - Brew meter (health percentage)
  - Soil moisture sensor reading
  - Air quality (AQI)
  - Last watered timestamp
- Plant detail modal with sensor readouts and suggestions
- Recent activity feed

### JoyCon (Robot Control)
- Live video feed stub (16:9 aspect ratio)
- Virtual joystick for robot steering
- Real-time vector display (x, y coordinates)
- Control buttons:
  - Start/Stop
  - Center/Reset
  - Light toggle
  - Horn toggle
- Connection status badge (toggleable demo)

### Friends & Guilds
- Friend management:
  - Search and add friends by username
  - Accept/decline incoming requests
  - View outgoing requests
- Friends Leaderboard:
  - Sorted by Brew Score
  - View friend profiles and their gardens
- Guild system:
  - Create guild with custom name and emblem color
  - Join existing guilds
  - Guild leaderboard sorted by member scores
  - Discover guilds feature
- Invite friends FAB (share sheet stub)

## Tech Stack

- **Framework**: Expo + React Native
- **Language**: TypeScript
- **Navigation**: Expo Router (file-based) + React Navigation
- **State Management**: Zustand
- **Icons**: @expo/vector-icons (Ionicons)
- **Haptics**: expo-haptics
- **Image Picker**: expo-image-picker
- **Video**: expo-av (stub)
- **Auth**: react-native-auth0 (stub with dev bypass)

## Theme & Branding

- **App Name**: CauldronCare
- **Concept**: Potion factory greenhouse where plants are cauldrons brewing vitality
- **Colors** (dark-first):
  - Background: #0B0F10
  - Card: #12171A
  - Emerald: #0E3B2E
  - Amethyst: #6F5BD4
  - Mint: #B7FFD8
- **Design**: Rounded cards, soft glows, bubbly progress bars, subtle animations

## Running the App

```bash
# Install dependencies
npm install

# Start Expo development server
npx expo start

# Run on specific platforms
npx expo start --ios
npx expo start --android
npx expo start --web
```

## Project Structure

```
plantApp/
├── app/
│   ├── _layout.tsx              # Root layout with auth/onboarding flow
│   └── (tabs)/
│       ├── _layout.tsx          # Bottom tab navigator
│       ├── index.tsx            # Home tab
│       ├── joycon.tsx          # Robot control tab
│       └── friends.tsx         # Friends & Guilds tab
├── screens/
│   ├── AuthScreen.tsx          # Auth0 login with dev bypass
│   ├── OnboardingScreen.tsx    # One-time onboarding flow
│   ├── HomeScreen.tsx          # Dashboard with plants & activity
│   ├── JoyConScreen.tsx        # Robot control interface
│   └── FriendsScreen.tsx       # Friends, guilds, leaderboards
├── components/
│   ├── ScoreBadge.tsx          # Glowing Brew Score pill
│   ├── SprayButton.tsx         # Large circular CTA with haptic
│   ├── PlantCard.tsx           # Plant/cauldron card with brew meter
│   ├── LeaderboardRow.tsx      # Leaderboard entry with rank & score
│   ├── Joystick.tsx            # Virtual joystick with PanResponder
│   ├── VideoFeedStub.tsx       # 16:9 video placeholder
│   ├── GuildCard.tsx           # Guild display with emblem
│   ├── FriendSearchBar.tsx     # Search & send friend requests
│   └── RequestItem.tsx         # Friend request item with actions
├── store/
│   └── useAppStore.ts          # Zustand global state
└── constants/
    └── theme.ts                # Colors & brand constants
```

## State Management

All app data is managed with Zustand in `store/useAppStore.ts`:

- User profile & authentication status
- Onboarding completion flag
- Brew Score & Money Saved
- Plants (cauldrons) with sensor data
- Activity feed
- Friends & friend requests
- Guild membership & discovery
- Robot connection & vector state

All data is currently hardcoded/mocked but structured for easy integration with real APIs and robot hardware.

## Mock Data

The app includes realistic mock data for:
- 2 initial plants (Ficus Nova, Snake Prime)
- 2 friends (Aanya, Ravi) with their own plants
- 1 guild (Verdant Vials) with 3 members
- 2 discoverable guilds
- Activity feed with watering events
- Sensor readings (soil moisture, AQI)
- Money saved from efficient watering

## Future Integration Points

Ready for real implementation:
1. **Auth0**: Replace dev bypass with actual Auth0 flow
2. **Robot API**: Wire up spray button, joystick vectors, and camera feed
3. **Sensor Data**: Connect to ESP32/Arduino for real-time readings
4. **Backend**: Add API calls for friends, guilds, leaderboards
5. **Computer Vision**: Integrate pot detection for autonomous watering
6. **Ultrasonic Sensors**: Add obstacle avoidance to robot control

## Notes

- All robot features are UI stubs (spray, joystick, camera) ready for hardware integration
- Money Saved only shows USD (no mL display as requested)
- Efficient watering logic contributes only to money saved metric
- Dark mode is the primary theme
- Haptic feedback on key interactions
- Safe area and edge-to-edge support
