Write-Host "🚀 Creating production-level React Native (Expo) structure..."

# Create root folder

New-Item -ItemType Directory -Path "mobile-app" -Force | Out-Null
Set-Location "mobile-app"

# Initialize Expo app (TypeScript)

npx create-expo-app@latest . --template

# Core directories

$folders = @(
"app",
"app/(auth)",
"app/(tabs)",
"components/ui",
"components/common",
"screens/auth",
"screens/home",
"screens/profile",
"screens/settings",
"services/api",
"services/auth",
"store/slices",
"store/middleware",
"hooks",
"utils",
"constants",
"assets/images",
"assets/icons",
"assets/fonts",
"config",
"types"
)

foreach ($folder in $folders) {
New-Item -ItemType Directory -Path $folder -Force | Out-Null
}

# Create files

$files = @(
"app/_layout.tsx",
"app/index.tsx",
"app/(auth)/login.tsx",
"app/(auth)/register.tsx",
"app/(tabs)/_layout.tsx",
"app/(tabs)/home.tsx",
"app/(tabs)/profile.tsx",
"app/(tabs)/settings.tsx",
"components/ui/Button.tsx",
"components/ui/Input.tsx",
"components/common/Loader.tsx",
"components/common/ScreenWrapper.tsx",
"screens/auth/LoginScreen.tsx",
"screens/auth/RegisterScreen.tsx",
"screens/home/HomeScreen.tsx",
"services/api/client.ts",
"services/api/endpoints.ts",
"services/auth/authService.ts",
"store/index.ts",
"store/store.ts",
"store/slices/authSlice.ts",
"hooks/useAuth.ts",
"hooks/useApi.ts",
"utils/helpers.ts",
"utils/validators.ts",
"constants/colors.ts",
"constants/config.ts",
"config/env.ts",
"types/index.ts"
)

foreach ($file in $files) {
New-Item -ItemType File -Path $file -Force | Out-Null
}

Write-Host "✅ Folder structure created successfully!"
