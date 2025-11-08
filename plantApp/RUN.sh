#!/bin/bash
# CauldronCare - Quick Run Script

echo "🧪 Starting CauldronCare..."
echo ""
echo "📱 Choose your platform:"
echo "  1) Start development server (default)"
echo "  2) iOS Simulator"
echo "  3) Android Emulator"
echo "  4) Web Browser"
echo ""

if [ "$1" == "ios" ]; then
  npx expo start --ios
elif [ "$1" == "android" ]; then
  npx expo start --android
elif [ "$1" == "web" ]; then
  npx expo start --web
else
  echo "Starting Expo development server..."
  echo "After it starts:"
  echo "  Press 'i' for iOS"
  echo "  Press 'a' for Android"
  echo "  Press 'w' for Web"
  echo ""
  npx expo start
fi
