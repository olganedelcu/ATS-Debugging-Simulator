# 🐛 ATS Debugging Simulator

An interactive app that teaches developers how to debug real-world ATS integration bugs - without breaking production.

## Why This Exists

If you've ever integrated with a third-party API, you know the pain.

Everything looks correct.
Types are fine.
The request goes through.

And yet… it fails.

The ATS Debugging Simulator recreates that exact moment - and walks you through fixing it.

Instead of reading about API debugging, you experience it.

## What It Simulates

You're integrating with an Applicant Tracking System (ATS) via the Kombo API.

A job application submission fails.

Why?

Two realistic bugs:

### 1️⃣ Wrong ID Type

Your app sends Kombo's internal `komboId`
But the ATS expects the provider's `remoteId`.

Everything compiles.
Everything looks valid.
But it's the wrong ID for the boundary.

### 2️⃣ Stale Sync Data

Kombo's cached job data is 3 days old.
The job appears "open" in your UI.

But in the ATS?
It's archived.

Classic sync mismatch.

## What You Actually Do

This isn't a passive demo.

You go through a guided 9-step debugging workflow:

1. Select a job
2. Submit the application (it fails)
3. Inspect logs
4. Trace ID usage
5. Compare `komboId` vs `remoteId`
6. Check the ATS job status
7. Discover stale sync
8. Apply the fix
9. Resubmit successfully

By the end, you don't just know the answer - you understand the system.

## What You Learn

- How API boundaries actually work
- Why internal IDs ≠ provider IDs
- How sync layers create subtle bugs
- How to read structured logs
- How to reason about integrations step by step
- How to debug without guessing

It teaches engineering thinking - not just UI clicking.

## Tech Stack

Built intentionally simple:

- React 19
- TypeScript 5.9 (strict mode)
- Vite 7.3
- React Compiler (auto memoization)
- Pure CSS (dark theme)
- No UI libraries
- Only React + ReactDOM as dependencies

Minimal surface area.
Maximum clarity.

## Project Structure

```
src/
├── main.tsx
├── App.tsx
├── App.css / index.css
└── mock/
    ├── data.ts
    └── komboService.ts
```

### `App.tsx`

Contains the entire UI and workflow logic (~435 lines).
This is the brain of the simulator.

### `mock/data.ts`

Strongly typed domain models + mock ATS/Kombo data.

### `mock/komboService.ts`

Simulates API calls with realistic delays and failure states.

## Architectural Approach

### State Machine Workflow

The app progresses linearly.
Each debugging step unlocks the next.

You can't skip ahead - just like real debugging.

### Two-Panel Layout

Left panel → UI + form
Right panel → logs + debug tools

It mirrors how developers actually work:
Feature on one side, logs on the other.

### Mock Service Layer

The service layer mimics real API behavior:

- Delays
- Errors
- Cached data
- Provider responses

It feels real - without requiring a backend.

### Strict TypeScript

- No `any`
- Typed API responses
- Clear domain boundaries
- Safe state transitions

The types reinforce the learning.

## How to Run

```bash
npm install
npm run dev
```

Open: http://localhost:5173

## Who This Is For

- Frontend engineers integrating APIs
- Backend engineers working with HR systems
- Developers new to ATS integrations
- DevRel teams building API education tools
- Anyone who's ever said: "But it works locally?"

## Why It's Interesting

This isn't a todo app.

It's a simulation of real integration pain - in a safe environment.

It teaches how to think through:

- System boundaries
- Data ownership
- ID mapping
- Sync consistency
- Failure analysis

It's not about fixing a button.

It's about understanding why systems fail - and how to reason through them.

## Future Ideas

- Add webhook simulations
- Add retry strategies
- Simulate rate limits
- Expand to multiple ATS providers
- Convert to a formal state machine
- Add automated tests
