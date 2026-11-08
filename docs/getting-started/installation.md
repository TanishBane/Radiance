# Installation & Local Setup Guide

This guide walks you through setting up and running **RADIANCE** on your local machine.

---

## 1. System Prerequisites

Ensure you have the following installed on your development machine:

- **Node.js**: v20 LTS or v22 LTS ([Download Node.js](https://nodejs.org/))
- **pnpm**: v9 or v10 (`corepack enable` or `npm install -g pnpm`)
- **Git**: v2.30 or higher

---

## 2. Step-by-Step Installation

### Step 1: Clone the Repository
```bash
git clone https://github.com/TanishBane/Tanixai.git
cd Tanixai
```

### Step 2: Install Node Dependencies
Use `pnpm install` with `--frozen-lockfile` to ensure exact dependency tree reproduction:
```bash
pnpm install --frozen-lockfile
```

### Step 3: Configure Environment Variables
Copy the template configuration file:
```bash
cp .env.example .env.local
```
Open `.env.local` in your editor and configure your AI model keys (e.g. `GROQ_API_KEY` or `GEMINI_API_KEY`). For full environment variable descriptions, see [Environment Configuration](environment.md).

### Step 4: Run the Development Server
```bash
pnpm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 3. Verifying the Installation

To verify that your installation compiles cleanly and passes all test suites:

```bash
# Verify TypeScript compilation
pnpm run typecheck

# Execute unit and integration tests
pnpm run test

# Perform a production test build
pnpm run build
```
