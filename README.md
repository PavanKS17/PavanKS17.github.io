# ⚡ Interactive AI Terminal Portfolio

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FPavanKS17%2Fpersonal-portfolio)
[![Live Demo](https://img.shields.io/badge/Live_Demo-Online-00f0ff?style=for-the-badge)](https://pavanks17.github.io)

A cinematic, Hub-and-Spoke developer portfolio featuring an autonomous AI agent integrated directly into the DOM. Built to demonstrate full-stack engineering, stateless-to-stateful API routing, and AI orchestration.

## 🧠 System Architecture

Instead of a static resume, this portfolio utilizes a serverless microservice architecture to power a conversational AI clone.

* **Frontend Engine:** Vanilla HTML/CSS/JS deployed via GitHub Pages, featuring interactive 3D UI elements (`vanilla-tilt`) and antigravity particle networks (`tsparticles`).
* **Serverless Backend:** Vercel Edge Functions (`/api/chat.js`) handle cross-origin requests, rate-limiting, and secure credential management.
* **AI Orchestration:** Google Cloud Platform (GCP) Service Accounts securely route payloads to **Vertex AI (Gemini 2.5 Flash)**.
* **Stateful Memory:** Engineered cross-origin context management allows the agent to maintain conversation history for the duration of the user's session without a database.

## ✨ Core Features

* **Terminal Uplink (Cmd + K):** An integrated command center where recruiters can interrogate my AI clone about my technical experience, architecture decisions, and off-screen habits.
* **Hub-and-Spoke Routing:** A highly optimized `index.html` hub that branches off into detailed architectural deep-dives (`projects.html`, `whoami.html`).
* **Live Developer Telemetry:** Dynamic API polling that fetches real-time GitHub repository updates, contribution streaks, and algorithmic performance data (LeetCode).
* **Enterprise Security:** System instructions and GCP API credentials are strictly isolated in Vercel Environment Variables to prevent prompt leaking and token hijacking.

## 🛠️ Technical Stack

* **Frontend:** HTML5, CSS3 (Custom Properties/Grid), Vanilla JavaScript
* **Backend:** Node.js, Vercel Serverless API
* **AI / Cloud:** Google Cloud Platform, Vertex AI, Gemini 2.5 Flash API
* **Integrations:** GitHub REST API, Medium RSS-to-JSON, LeetCode Telemetry

## 🚀 Deployment & Setup

This repository is designed to be forked and deployed using a split frontend/backend or Vercel unified deployment.

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/PavanKS17/personal-portfolio.git](https://github.com/PavanKS17/personal-portfolio.git)
   cd personal-portfolio

