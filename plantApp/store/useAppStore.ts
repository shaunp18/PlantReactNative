import { create } from 'zustand';

export interface Plant {
  id: string;
  name: string;
  species: string;
  brew: number;
  soilMoisture: number;
  airQuality: string;
  lastWatered: string;
  photoUri: string | null;
  location?: string;
  drynessStartTime?: number; // Timestamp when soil became dry (ms)
  healthAtDrynessStart?: number; // Plant health when dryness started (for calculating cumulative impact)
  isConnectedToSensor?: boolean; // Whether this plant is connected to ESP32 sensor
  spraysPerDay?: number; // Number of sprays per day needed (calculated from water needs)
  dailyWaterML?: number; // Daily water requirement in milliliters
  idealSoilMoisture?: number; // Ideal soil moisture percentage
}

export interface User {
  id: string;
  name: string;
  avatarUri: string | null;
}

export interface Activity {
  id: string;
  text: string;
  ts: number;
}

export interface Friend {
  id: string;
  name: string;
  avatarUri: string | null;
  score: number;
  plants: Plant[];
}

export interface FriendRequest {
  id: string;
  username: string;
}

export interface GuildMember {
  id: string;
  name: string;
  score: number;
  avatarUri?: string | null;
}

export interface Guild {
  id: string;
  name: string;
  emblem: string;
  memberCount?: number;
  totalScore?: number;
  members?: GuildMember[];
}

export interface Robot {
  connected: boolean;
  lastVector: { x: number; y: number };
}

interface AppState {
  isAuthenticated: boolean;
  hasOnboarded: boolean;
  user: User | null;
  score: number;
  moneySavedUsd: number;
  plants: Plant[];
  activity: Activity[];
  friends: Friend[];
  friendRequestsIncoming: FriendRequest[];
  friendRequestsOutgoing: FriendRequest[];
  myGuild: Guild | null;
  discoverGuilds: Guild[];
  robot: Robot;

  setAuthenticated: (isAuth: boolean) => void;
  setUser: (user: User) => void;
  logout: () => void;
  completeOnboarding: () => void;
  addPlant: (plant: Plant) => void;
  updatePlantHealth: (plantId: string, newHealth: number) => void;
  updatePlantDryness: (plantId: string, isDry: boolean) => void;
  addActivity: (activity: Activity) => void;
  incrementScore: (points: number) => void;
  addMoneySaved: (amount: number) => void;
  addFriend: (friend: Friend) => void;
  sendFriendRequest: (username: string) => void;
  acceptFriendRequest: (requestId: string) => void;
  declineFriendRequest: (requestId: string) => void;
  createGuild: (name: string, emblem: string) => void;
  joinGuild: (guild: Guild) => void;
  updateRobotVector: (x: number, y: number) => void;
  toggleRobotConnection: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  isAuthenticated: false,
  hasOnboarded: false,
  user: null,
  score: 1730,
  moneySavedUsd: 1.42,

  plants: [
    {
      id: '1',
      name: 'Ficus Nova',
      species: 'Ficus elastica',
      brew: 82,
      soilMoisture: 41,
      airQuality: 'Good (AQI 32)',
      lastWatered: '2d ago',
      photoUri: null,
      location: 'Living Room',
    },
    {
      id: '2',
      name: 'Snake Prime',
      species: 'Sansevieria',
      brew: 91,
      soilMoisture: 36,
      airQuality: 'Good (AQI 28)',
      lastWatered: '1d ago',
      photoUri: null,
      location: 'Bedroom',
    },
  ],

  activity: [
    { id: '1', text: 'Snake Prime brewed +8 vitality', ts: 1731022010 },
    { id: '2', text: 'Casting spray (stub)...', ts: 1731022050 },
    { id: '3', text: 'Efficient watering saved $0.09', ts: 1731022150 },
  ],

  friends: [
    {
      id: 'f1',
      name: 'Aanya',
      avatarUri: null,
      score: 2210,
      plants: [
        {
          id: 'af1',
          name: 'Mystic Monstera',
          species: 'Monstera deliciosa',
          brew: 95,
          soilMoisture: 45,
          airQuality: 'Good (AQI 25)',
          lastWatered: '1d ago',
          photoUri: null,
        },
      ],
    },
    {
      id: 'f2',
      name: 'Ravi',
      avatarUri: null,
      score: 1670,
      plants: [
        {
          id: 'rf1',
          name: 'Jade Guardian',
          species: 'Crassula ovata',
          brew: 78,
          soilMoisture: 32,
          airQuality: 'Good (AQI 30)',
          lastWatered: '3d ago',
          photoUri: null,
        },
      ],
    },
  ],

  friendRequestsIncoming: [{ id: 'req1', username: 'LeafMage' }],
  friendRequestsOutgoing: [{ id: 'req2', username: 'RootKnight' }],

  myGuild: {
    id: 'g0',
    name: 'Verdant Vials',
    emblem: '#6F5BD4',
    members: [
      { id: 'me', name: 'You', score: 1730 },
      { id: 'f1', name: 'Aanya', score: 2210 },
      { id: 'f2', name: 'Ravi', score: 1670 },
    ],
  },

  discoverGuilds: [
    { id: 'g1', name: 'Emerald Alembics', emblem: '#0E3B2E', memberCount: 14, totalScore: 18230 },
    { id: 'g2', name: 'Mint Menders', emblem: '#B7FFD8', memberCount: 9, totalScore: 12110 },
  ],

  robot: {
    connected: true,
    lastVector: { x: 0, y: 0 },
  },

  setAuthenticated: (isAuth) => set({ isAuthenticated: isAuth }),

  setUser: (user) => set({ user }),

  logout: () => set({ 
    isAuthenticated: false, 
    user: null,
    // Optionally reset onboarding if you want users to go through it again
    // hasOnboarded: false,
  }),

  completeOnboarding: () => set({ hasOnboarded: true }),

  addPlant: (plant) => set((state) => ({
    plants: [...state.plants, plant],
    activity: [
      { id: Date.now().toString(), text: `${plant.name} added to your cauldrons`, ts: Date.now() },
      ...state.activity,
    ],
  })),

  updatePlantHealth: (plantId, newHealth) => set((state) => {
    const updatedPlants = state.plants.map((plant) =>
      plant.id === plantId ? { ...plant, brew: Math.max(0, Math.min(100, newHealth)) } : plant
    );
    return { plants: updatedPlants };
  }),

  updatePlantDryness: (plantId, isDry) => set((state) => {
    const now = Date.now();
    const updatedPlants = state.plants.map((plant) => {
      if (plant.id !== plantId) return plant;
      
      if (isDry && !plant.drynessStartTime) {
        // Soil just became dry - record the start time and current health
        return { 
          ...plant, 
          drynessStartTime: now,
          healthAtDrynessStart: plant.brew 
        };
      } else if (!isDry && plant.drynessStartTime) {
        // Soil is no longer dry - clear the start time
        return { 
          ...plant, 
          drynessStartTime: undefined,
          healthAtDrynessStart: undefined
        };
      }
      return plant;
    });
    return { plants: updatedPlants };
  }),

  addActivity: (activity) => set((state) => ({
    activity: [activity, ...state.activity.slice(0, 19)],
  })),

  incrementScore: (points) => set((state) => ({
    score: state.score + points,
  })),

  addMoneySaved: (amount) => set((state) => ({
    moneySavedUsd: state.moneySavedUsd + amount,
  })),

  addFriend: (friend) => set((state) => ({
    friends: [...state.friends, friend],
  })),

  sendFriendRequest: (username) => set((state) => ({
    friendRequestsOutgoing: [
      ...state.friendRequestsOutgoing,
      { id: Date.now().toString(), username },
    ],
  })),

  acceptFriendRequest: (requestId) => set((state) => {
    const request = state.friendRequestsIncoming.find(r => r.id === requestId);
    if (!request) return state;

    const newFriend: Friend = {
      id: Date.now().toString(),
      name: request.username,
      avatarUri: null,
      score: Math.floor(Math.random() * 2000) + 500,
      plants: [],
    };

    return {
      friendRequestsIncoming: state.friendRequestsIncoming.filter(r => r.id !== requestId),
      friends: [...state.friends, newFriend],
    };
  }),

  declineFriendRequest: (requestId) => set((state) => ({
    friendRequestsIncoming: state.friendRequestsIncoming.filter(r => r.id !== requestId),
  })),

  createGuild: (name, emblem) => set({
    myGuild: {
      id: Date.now().toString(),
      name,
      emblem,
      members: [{ id: 'me', name: 'You', score: 1730 }],
    },
  }),

  joinGuild: (guild) => set({
    myGuild: {
      ...guild,
      members: [
        { id: 'me', name: 'You', score: 1730 },
        ...(guild.members || []),
      ],
    },
  }),

  updateRobotVector: (x, y) => set((state) => ({
    robot: { ...state.robot, lastVector: { x, y } },
  })),

  toggleRobotConnection: () => set((state) => ({
    robot: { ...state.robot, connected: !state.robot.connected },
  })),
}));
