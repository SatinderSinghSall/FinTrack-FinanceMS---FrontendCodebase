# 📱 FinTrack Mobile App (Frontend)

## 📊 FinTrack – Full-Stack Budget & Expense Management App

FinTrack is a **production-ready full-stack finance management application** that helps users **track budgets, manage expenses, and view financial analytics** across **Mobile (Android & iOS)** and **Web**.

Built using a modern, scalable stack with **clean architecture**, **secure authentication**, and **responsive UI**.

---

> **FinTrack** is a finance management mobile application that helps users track budgets, expenses, and financial insights in real time.
> This repository contains the **mobile frontend** built with **React Native, Expo, TypeScript, and NativeWind**, consuming a secure Node.js backend API.

---

## ✨ Features

- 🔐 User authentication (Login & Register)
- 📊 Dashboard with financial overview
- 💰 Budget creation & management
- 🧾 Expense tracking
- 📈 Analytics & insights
- 👤 Profile management
- ⚡ Fast navigation using Expo Router
- 🎨 Responsive UI with NativeWind (Tailwind CSS)

---

## 🛠️ Tech Stack

| Technology       | Purpose                       |
| ---------------- | ----------------------------- |
| **React Native** | Mobile UI                     |
| **Expo**         | App runtime & tooling         |
| **TypeScript**   | Type safety                   |
| **Expo Router**  | File-based navigation         |
| **NativeWind**   | Tailwind CSS for React Native |
| **Axios**        | API communication             |
| **Zustand**      | Global state management       |

---

## 📁 Project Structure

```text
mobile-app/
├── app/                     # Expo Router screens
│   ├── (tabs)/              # Bottom tab navigation
│   ├── add-budget.tsx
│   ├── add-expense.tsx
│   ├── edit-budget/[id].tsx
│   ├── edit-expense/[id].tsx
│   ├── login.tsx
│   ├── register.tsx
│   └── index.tsx
│
├── src/
│   ├── assets/              # App assets
│   ├── components/          # Reusable UI components
│   ├── screens/             # Screen-level components
│   ├── services/            # API layer (Axios)
│   ├── store/               # Zustand state stores
│   ├── theme/               # Tailwind / theme config
│   └── utils/               # Utility helpers
│
├── assets/                  # Expo assets (icons, splash)
├── app.json                 # Expo configuration
├── global.css               # NativeWind styles
├── tailwind.config.js       # Tailwind configuration
├── metro.config.js          # Metro bundler config
├── tsconfig.json            # TypeScript config
└── README.md
```

---

## ⚙️ Environment Setup

Create a `.env` file in the **mobile-app root**:

```env
EXPO_PUBLIC_API_URL=http://localhost:5000/api
```

> ⚠️ For physical devices, use your **local IP address** instead of `localhost`.

Example:

```env
EXPO_PUBLIC_API_URL=http://192.168.1.5:5000/api
```

---

## 🚀 Getting Started

### 1️⃣ Install dependencies

```bash
npm install
```

### 2️⃣ Start the Expo dev server

```bash
npx expo start
```

### 3️⃣ Run on device

- 📱 Scan QR code using **Expo Go**
- 🤖 Android emulator
- 🍎 iOS simulator (macOS only)

---

## 🔗 API Integration

All API calls are centralized in:

```text
src/services/api.ts
```

Example usage:

```ts
import api from "@/src/services/api";

const response = await api.get("/budgets");
```

Authentication tokens are stored securely using:

```text
src/utils/tokenStorage.ts
```

---

## 🔐 Authentication Flow

1. User logs in or registers
2. JWT token received from backend
3. Token stored securely on device
4. Token attached automatically to API requests
5. Protected routes accessible after auth

---

## 🎨 Styling (NativeWind)

- Utility-first styling using Tailwind syntax
- Configured via `tailwind.config.js`
- Global styles in `global.css`

Example:

```tsx
<View className="flex-1 bg-white p-4">
  <Text className="text-lg font-semibold">Dashboard</Text>
</View>
```

---

## 🧪 Linting & Code Quality

```bash
npm run lint
```

ESLint configuration is defined in:

```text
eslint.config.js
```

---

## 📦 Build (Production)

```bash
npx expo prebuild
npx expo run:android
npx expo run:ios
```

Or using EAS:

```bash
npx expo prebuild
npx expo run
```

---

## 🚀 Future Enhancements

- Push notifications
- Offline support
- Dark mode
- Biometric authentication
- Charts & advanced analytics

---

## 👨‍💻 Author

**Satinder Singh**
Full-Stack Developer (Web & Mobile)
📱 React Native | 🌐 Node.js | 🍃 MongoDB

---

## 📄 License

This project is licensed under the **MIT License**.

---
