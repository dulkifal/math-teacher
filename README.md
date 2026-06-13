# 📘 Math Teacher — Interactive Math Learning Platform

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-7.8-123a50?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![Clerk](https://img.shields.io/badge/Auth-Clerk-6c47ff?style=for-the-badge&logo=clerk)](https://clerk.com/)
[![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8?style=for-the-badge&logo=pwa)](https://web.dev/progressive-web-apps/)

**Math Teacher** is a full-stack, adaptive math learning platform built for students. It combines real-time interactive visualizations, an adaptive quiz engine, concept mastery tracking, daily streaks, and a personal progress dashboard — all installable as a PWA on any device.

---

## ✨ Features

### 🎓 8 Interactive Lessons
| Lesson | Topic | What you can do |
|---|---|---|
| 📐 Angles | Geometry | Drag rays to form angles; explore transversal properties |
| 🔺 Triangles | Geometry | Drag vertices; see medians, altitudes, Pythagorean theorem update live |
| 🎨 Symmetry | Visual Math | Reflect & rotate shapes; paper-fold hole punch simulator |
| 🧊 Cube Roots | Algebra | 3D volume visualizer + adaptive quiz engine |
| 📉 Linear Grapher | Algebra | Drag slope/intercept sliders; see rise-over-run triangle |
| ➕ Addition | Arithmetic | Number-line visualizer with animated operations |
| 🍕 Fractions | Arithmetic | Pizza slice comparisons and equivalence explorer |
| ➗ Rational Numbers | Number Theory | Grid shading sandbox + interactive number line |

### 🧠 Adaptive Learning Engine
- **QuizEngine component** — adaptive difficulty, hints, live mastery % feedback
- **Concept Mastery API** — tracks per-concept proficiency (0–100%) using a delta algorithm
- **Answer History** — every answer stored in PostgreSQL for analytics

### 📊 Progress & Gamification
- Personal dashboard with lesson completion tracker
- Daily streak counter (🔥) with highest-streak record
- XP points system with badge unlocks (Math Cadet → Newton Prodigy)
- Quiz attempt history with score breakdown

### 📱 PWA Ready
- Installable on iOS and Android from the browser
- Offline fallback with service worker caching
- Home screen shortcuts to Lessons and Progress

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router compatible, Pages Router used) |
| Language | TypeScript 6 |
| Styling | Tailwind CSS v4 |
| Auth | Clerk (OAuth, session management, protected routes) |
| Database ORM | Prisma 7 with PostgreSQL (via Prisma Accelerate) |
| Animations | React Spring + React Use Gesture |
| HTTP Client | Axios |

---

## ⚙️ Local Setup

### 1. Clone
```bash
git clone https://github.com/dulkifal/math-teacher.git
cd math-teacher
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment
```bash
cp .env.example .env
```
Fill in your values:
- **Clerk keys** — from [dashboard.clerk.com](https://dashboard.clerk.com)
- **DATABASE_URL** — PostgreSQL connection string (Prisma Accelerate or direct)

### 4. Push database schema
```bash
npx prisma db push
```

### 5. Run dev server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
src/
├── components/
│   ├── Navbar.tsx          # Responsive nav with mega-menu + mobile bottom bar
│   ├── QuizEngine.tsx      # Reusable adaptive quiz component
│   ├── Angle.tsx           # SVG angle visualizer
│   └── Transversal.tsx     # Parallel lines & transversal diagram
├── pages/
│   ├── index.tsx           # Homepage
│   ├── dashboard.tsx       # Student progress dashboard
│   ├── resources.tsx       # Curated external resources
│   ├── angle.tsx           # Angles lesson
│   ├── triangle.tsx        # Triangles lesson
│   ├── cube.tsx            # Cube roots lesson
│   ├── addition.tsx        # Addition lesson
│   ├── fractions.tsx       # Fractions lesson
│   ├── rational.tsx        # Rational numbers lesson
│   ├── symmetry.tsx        # Symmetry lesson
│   ├── grapher.tsx         # Linear grapher lesson
│   └── api/
│       ├── score.ts        # XP & streak management
│       ├── progress.ts     # Lesson completion & quiz attempts
│       └── concept-mastery.ts  # Per-concept mastery tracking
└── styles/
    └── globals.css

prisma/
└── schema.prisma           # DB models: UserScore, LessonProgress, QuizAttempt, ConceptMastery, AnswerHistory

public/
├── manifest.json           # PWA manifest
├── sw.js                   # Service worker
├── icon-192.png            # App icon
└── icon-512.png            # App icon (large)
```

---

## 📫 Contact

**Dulkifal Ibacker**
- 📩 Email: [dulkifilibacker@gmail.com](mailto:dulkifilibacker@gmail.com)
- 🌐 Portfolio: [dulkifal.github.io](https://dulkifal.github.io)
- 💼 LinkedIn: [linkedin.com/in/dulkifal](https://www.linkedin.com/in/dulkifal)
