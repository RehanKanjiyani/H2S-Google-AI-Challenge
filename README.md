# 🌱 EcoTrack AI – Carbon Footprint Awareness Platform

## Challenge

**PromptWars Virtual – Challenge 3**

Design a solution that helps individuals understand, track, and reduce their carbon footprint through simple actions and personalized insights.

---

# 🚀 Project Overview

EcoTrack AI is an AI-powered sustainability platform that helps users:

* Calculate their daily carbon footprint
* Track environmental impact over time
* Receive personalized AI-powered reduction suggestions
* Complete eco-friendly challenges
* Earn achievements and XP through gamification
* Visualize sustainability progress through dashboards and analytics

The platform transforms complex carbon emission data into simple, actionable insights that encourage long-term sustainable behavior.

---

# 🎯 Chosen Vertical

**Climate Technology / Sustainability**

The project focuses on increasing environmental awareness and helping individuals make better sustainability decisions through education, tracking, and gamification.

---

# ✨ Key Features

## Carbon Footprint Calculator

Users can log activities across:

* Transportation
* Household Energy
* Food Habits
* Waste Generation
* Shopping & Goods

The system calculates estimated CO₂ emissions using realistic emission coefficients.

## AI Sustainability Coach

Powered by Google Gemini.

Features:

* Personalized sustainability recommendations
* Carbon reduction strategies
* Daily eco challenges
* Behavioral analysis
* Fallback recommendations when AI is unavailable

## Sustainability Dashboard

Provides:

* Daily footprint tracking
* Weekly trends
* Historical analytics
* Carbon composition breakdown
* Personal impact metrics

## Gamification System

Includes:

* XP points
* Achievement badges
* Daily challenges
* Streak tracking
* Sustainability levels

Achievements include:

* First Steps
* Carbon Cutter
* Transit Crusader
* Loyal Pioneer
* Vampire Slayer

## Community Impact

A leaderboard encourages engagement and friendly competition through sustainability achievements.

---

# 🧠 Approach & Logic

### Step 1 — Data Collection

Users record daily sustainability activities.

### Step 2 — Carbon Analysis

The calculation engine converts activities into estimated CO₂ emissions using predefined emission factors.

### Step 3 — AI Interpretation

Gemini analyzes user behavior and generates personalized recommendations.

### Step 4 — Behavior Improvement

Gamification, challenges, and insights motivate long-term sustainable habits.

---

# ⚙️ Technology Stack

## Frontend

* React
* TypeScript
* Tailwind CSS
* Vite

## Backend

* Node.js
* Express

## AI

* Google Gemini 3.5 Flash

## Storage

* Browser Local Storage

## Development Tools

* Google AI Studio
* GitHub
* Vercel

---

# 🔄 How the Solution Works

1. User logs activities.
2. Carbon engine calculates emissions.
3. Data is stored locally.
4. Dashboard visualizes progress.
5. AI Coach generates recommendations.
6. Users complete sustainability challenges.
7. XP and achievements are awarded.
8. Progress appears in community rankings.

---

# 🔒 Security

* API keys remain server-side
* No sensitive personal information stored
* Structured AI responses
* Safe local storage implementation
* No client-side secret exposure

---

# ♿ Accessibility

The application includes:

* Responsive layouts
* Mobile-friendly navigation
* Semantic HTML landmarks
* Proper labels for forms
* Keyboard-accessible controls
* ARIA support for interactive components
* Screen-reader-friendly status updates
* Clear visual hierarchy

---

# 🧪 Automated Testing

EcoTrack AI includes a complete automated testing suite built with **Vitest** and **Happy DOM**.

## Run Tests

```bash
npm test
```

## Current Test Results

```text
Test Files: 3 Passed
Tests: 29 Passed
Failures: 0
```

### Carbon Calculator Tests

* Transportation calculations
* Fuel-type emission comparisons
* Shopping emissions
* Renewable energy offsets
* Recycling multipliers
* Sustainability scoring

### Gamification Tests

* Streak calculations
* Achievement unlocking
* XP progression
* Leaderboard ranking

### Persistence Tests

* LocalStorage save/load
* Corrupted JSON recovery
* Fallback state generation
* User profile persistence

---

# 📈 Assumptions

* Emission coefficients are representative estimates.
* Users provide accurate activity information.
* Local storage is sufficient for challenge requirements.
* AI recommendations are educational and advisory.
* Community leaderboard uses demonstration data.

---

# 🚀 Running Locally

## Prerequisites

* Node.js

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

Application runs at:

```text
http://127.0.0.1:3000
```

---

# 🌐 Live Demo

**Vercel Deployment**

https://h2-s-google-ai-challenge.vercel.app/

**Google AI Studio Project**

https://ai.studio/apps/0fd51902-1f44-433d-9d93-a30f41a45d5c

---

# 👨‍💻 Author

**Rehan Kanjiyani**

PromptWars Virtual 2026 Submission

Challenge 3 – Carbon Footprint Awareness Platform
