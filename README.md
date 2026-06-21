# 🌱 EcoTrack AI – Carbon Footprint Awareness Platform

## Challenge

**PromptWars Virtual – Challenge 3**

Design a solution that helps individuals understand, track, and reduce their carbon footprint through simple actions and personalized insights.

---

# 🚀 Project Overview

EcoTrack AI is an AI-powered sustainability platform that helps users:

- Calculate their daily carbon footprint
- Track environmental impact over time
- Receive personalized AI-powered reduction suggestions
- Complete eco-friendly challenges
- Earn achievements and XP through gamification
- Visualize sustainability progress through dashboards and analytics

The platform transforms complex carbon emission data into simple, actionable insights that encourage long-term sustainable behavior.

---

# 🎯 Chosen Vertical

**Climate Technology / Sustainability**

The project focuses on increasing environmental awareness and helping individuals make better sustainability decisions through education, tracking, and gamification.

---

# ✨ Key Features

## 1. Carbon Footprint Calculator

Users can log activities across multiple categories:

- Transportation
- Household Energy
- Food Habits
- Waste Generation
- Shopping & Goods

The system calculates estimated CO₂ emissions using realistic emission coefficients.

---

## 2. AI Sustainability Coach

Built using Google Gemini.

The AI Coach:

- Analyzes user carbon patterns
- Identifies high-emission behaviors
- Generates personalized recommendations
- Suggests practical reduction strategies
- Creates daily sustainability challenges

Fallback logic ensures useful recommendations remain available even when AI services are unavailable.

---

## 3. Sustainability Dashboard

Interactive dashboard displaying:

- Daily carbon footprint
- Weekly trends
- Historical tracking
- Carbon composition breakdown
- Personal impact metrics
- Environmental progress indicators

---

## 4. Gamification System

Users stay engaged through:

- XP points
- Achievement badges
- Daily challenges
- Streak tracking
- Sustainability levels

Example achievements:

- First Steps
- Carbon Cutter
- Transit Crusader
- Loyal Pioneer
- Vampire Slayer

---

## 5. Community Impact

A leaderboard showcases community participation and sustainability performance while promoting healthy competition.

---

# 🧠 Approach & Logic

The solution follows four main steps:

### Step 1 — Data Collection

Users log sustainability-related activities.

### Step 2 — Carbon Analysis

A carbon calculation engine converts activity inputs into estimated CO₂ emissions using predefined emission factors.

### Step 3 — AI Interpretation

Gemini analyzes footprint data and generates personalized recommendations.

### Step 4 — Behavior Improvement

Gamification and challenges encourage users to continuously reduce emissions and build sustainable habits.

---

# ⚙️ Technology Stack

## Frontend

- React
- TypeScript
- Tailwind CSS
- Vite

## Backend

- Node.js
- Express

## AI

- Google Gemini 3.5 Flash

## Storage

- Browser Local Storage

## Development Tools

- Google AI Studio
- GitHub

---

# 🏗 Project Structure

```text
src/
 ├── components/
 │   ├── Dashboard.tsx
 │   ├── CarbonCalculator.tsx
 │   ├── AICoach.tsx
 │   ├── CommunityImpact.tsx
 │   └── Gamification.tsx
 │
 ├── utils/
 │   └── carbonCalculator.ts
 │
 ├── App.tsx
 │
server/
 └── gemini.ts
```

---

# 🔄 How the Solution Works

1. User logs daily activities.
2. Carbon engine calculates CO₂ emissions.
3. Data is stored locally.
4. Dashboard visualizes trends and impact.
5. AI Coach analyzes behavior patterns.
6. Personalized sustainability suggestions are generated.
7. Users complete challenges and unlock achievements.
8. Progress appears on leaderboards and impact reports.

---

# 🔒 Security Considerations

- Gemini API key remains server-side
- No API keys exposed to the client
- Local-only storage for user activity data
- No sensitive personal information collected
- Safe AI response handling with structured outputs

---

# ♿ Accessibility

The platform includes:

- Responsive layouts
- Mobile-friendly navigation
- Clear visual hierarchy
- Color-coded indicators
- Readable typography
- Consistent interaction patterns

---

# 🧪 Testing

The application was tested for:

### Functional Testing

✅ Carbon calculations

✅ Activity logging

✅ AI recommendations

✅ Achievement unlocking

✅ Leaderboard functionality

---

### Persistence Testing

✅ Data survives page refresh

✅ Historical logs retained

---

### Responsive Testing

✅ Desktop

✅ Tablet

✅ Mobile

---

# 📈 Assumptions

- Emission coefficients are representative estimates.
- Users provide honest activity data.
- Local storage is sufficient for challenge requirements.
- AI recommendations are advisory and educational.
- Community leaderboard uses demonstration data for comparison.

---

# 🚀 Running Locally

## Prerequisites

- Node.js

## Installation

```bash
npm install
```

## Configure Environment

Create a `.env.local` file:

```env
GEMINI_API_KEY=YOUR_API_KEY
```

## Start Development Server

```bash
npm run dev
```

Application will run on:

```text
http://127.0.0.1:3000
```

---

# 📹 Demo

Google AI Studio Project:

https://ai.studio/apps/0fd51902-1f44-433d-9d93-a30f41a45d5c

---

# 👨‍💻 Author

**Rehan Kanjiyani**

PromptWars Virtual 2026 Submission

Challenge 3 – Carbon Footprint Awareness Platform
