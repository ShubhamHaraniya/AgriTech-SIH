# 🌾 AgriTech AI — Comprehensive System Documentation & Technical Blueprint

> **Smart Agricultural & Livestock Management Command Platform with Deep Learning Diagnostics, Multi-Tenant Data Isolation, Hyperlocal Agro-Meteorological Intelligence, and Automated Cloud CI/CD APK Builds.**

---

## 📌 Table of Contents

1. [Executive Summary & Problem Statement](#1-executive-summary--problem-statement)
2. [Proposed Solution & Innovation Highlights](#2-proposed-solution--innovation-highlights)
3. [End-to-End System Architecture](#3-end-to-end-system-architecture)
4. [Technology Stack](#4-technology-stack)
5. [Multi-Tenant Data Isolation & Production Test Environments](#5-multi-tenant-data-isolation--production-test-environments)
6. [Core Modules & Application Workflows](#6-core-modules--application-workflows)
   - [6.1 Farmer Authentication & Multi-Tenant Onboarding](#61-farmer-authentication--multi-tenant-onboarding)
   - [6.2 Farm Command Dashboard](#62-farm-command-dashboard)
   - [6.3 Crop & Field Lifecycle Management](#63-crop--field-lifecycle-management)
   - [6.4 Dynamic Days-After-Sowing (DAS) Activity Calendar](#64-dynamic-days-after-sowing-das-activity-calendar)
   - [6.5 AI Vision Plant Disease Scanner (CNN)](#65-ai-vision-plant-disease-scanner-cnn)
   - [6.6 Livestock & Digital Herd Registry](#66-livestock--digital-herd-registry)
   - [6.7 Clinical Veterinary MLP Health Diagnostic System](#67-clinical-veterinary-mlp-health-diagnostic-system)
   - [6.8 Live Agro-Meteorological Weather Station & Field Alerts](#68-live-agro-meteorological-weather-station--field-alerts)
   - [6.9 Farm Financials, Expense Ledger & Analytics](#69-farm-financials-expense-ledger--analytics)
   - [6.10 History Timeline & Priority Notification Engine](#610-history-timeline--priority-notification-engine)
7. [Deep Learning & Machine Learning Pipelines](#7-deep-learning--machine-learning-pipelines)
8. [Backend API Reference & Schema](#8-backend-api-reference--schema)
9. [Database Entity Relationship (ER) Model](#9-database-entity-relationship-er-model)
10. [Mobile Native (Capacitor) & Cloud Deployment Architecture](#10-mobile-native-capacitor--cloud-deployment-architecture)
11. [CI/CD Automated Build Pipeline (GitHub Actions)](#11-cicd-automated-build-pipeline-github-actions)
12. [Testing, Quality Assurance & Verification](#12-testing-quality-assurance--verification)
13. [Installation, Configuration & Execution Guide](#13-installation-configuration--execution-guide)

---

## 1. Executive Summary & Problem Statement

### 🚨 The Problem
Indian and global smallholder agriculture faces severe operational hurdles:
1. **Fragmented Farm Management**: Farmers use disjointed methods (notebooks, memory, separate weather apps) to manage crops, livestock, and finances.
2. **Delayed Plant Pathology Detection**: Crop diseases cause up to **20–40% annual yield loss** because visual identification by agricultural extension officers is slow and inaccessible.
3. **Veterinary Care Gaps**: Livestock disease outbreaks (FMD, Anthrax, Blackleg) spread rapidly due to lack of early diagnostic triage and unmonitored vaccination schedules.
4. **Climate Vulnerability**: Extreme microclimate variations cause ill-timed pesticide spraying, wasted irrigation, and fertilizer wash-off.

---

## 2. Proposed Solution & Innovation Highlights

### 🎯 Proposed Solution
AgriTech AI is an integrated, mobile-first agricultural operating system that fuses **Computer Vision**, **Clinical Tabular Neural Networks**, and **Hyperlocal Meteorological Telemetry** into a unified farmer-centric command platform.

### 💡 Key Innovations & Uniqueness
1. **Dual-Domain AI Core**: Combines deep Convolutional Neural Networks (CNN) for botanical leaf pathology with a 24-symptom Multi-Layer Perceptron (MLP) for clinical veterinary diagnostics.
2. **Weather-Synchronized DAS Engine**: Calculates exact Days-After-Sowing (DAS) growth milestones and dynamically adjusts daily foliar spraying, fertilization, and irrigation alerts based on live Open-Meteo precipitation and wind forecasts.
3. **Zero-Setup Multi-Tenant Isolation**: Instant tenant partitioning via `X-User-Id` request scoping with zero-friction farmer authentication and seed environments across diverse agricultural agro-climatic zones.
4. **Cloud-Native + Edge-Ready PWA/APK**: Seamlessly operates as a responsive web app or native Android APK with automated GitHub Actions CI/CD compilation and high-availability cloud backend deployment on Render.

---

## 3. End-to-End System Architecture

```mermaid
graph TB
    subgraph Client Layer
        A1["Android Native APK (Capacitor)"]
        A2["Web PWA Client (React + Vite)"]
    end

    subgraph Gateway & Networking
        B1["Cloud Backend (Render HTTPS Endpoint)"]
        B2["CORS & Multi-Tenant Scoping Middleware (X-User-Id)"]
    end

    subgraph Application Server (FastAPI)
        C1["Farm & Field Engine"]
        C2["Livestock & Herd Registry"]
        C3["Finance & Expense Ledger"]
        C4["Notification & History Audit"]
    end

    subgraph AI & Analytics Engine
        D1["Plant Pathology CNN (EfficientNet/MobileNet)"]
        D2["Veterinary Clinical MLP (24 Symptoms Softmax)"]
        D3["Crop Recommendation Random Forest (NPK + Climate)"]
        D4["Agro-Meteorological Engine (Open-Meteo REST)"]
    end

    subgraph Persistent Storage
        E1[("SQLite / PostgreSQL Database")]
    end

    Client Layer -->|HTTPS REST API Calls| Gateway & Networking
    Gateway & Networking --> Application Server
    Application Server --> AI & Analytics Engine
    Application Server --> Persistent Storage
```

---

## 4. Technology Stack

### Frontend & Mobile Native
- **Framework**: React 18+ powered by Vite 8.2 fast-bundling engine
- **Mobile Runtime**: Capacitor 8 for Android Native APK compilation
- **Navigation & Routing**: React Router v6
- **Styling Architecture**: Modern Vanilla CSS, CSS Custom Properties Design Tokens, Glassmorphism, Safe-Area insets (`env(safe-area-inset-top/bottom)`)
- **Icons & Typography**: Standardized Unicode Agro-Glyphs, System Inter Typography

### Backend & Cloud Infrastructure
- **Framework**: FastAPI (Asynchronous Python 3.11+)
- **ASGI Server**: Uvicorn
- **ORM & Database**: SQLAlchemy 2.0 with SQLite (zero-config local) and PostgreSQL compatibility
- **Cloud Hosting**: Render (`https://agritech-sih.onrender.com`)
- **CI/CD Pipeline**: GitHub Actions for automated Android debug APK generation (`.github/workflows/android.yml`)

### Machine Learning & Data Science
- **Deep Learning**: PyTorch (Livestock MLP) & TensorFlow/Keras (Plant Pathology CNN)
- **Classical ML**: Scikit-Learn (Random Forest Crop Recommender)
- **External Telemetry**: Open-Meteo API for real-time weather and 5-day forecasts

---

## 5. Multi-Tenant Data Isolation & Production Test Environments

The platform enforces **strict data isolation** at both the API header layer (`X-User-Id`) and database ORM layer. Every field, animal, expense, activity, and notification belongs exclusively to the authenticated farm partition.

### 4 Production Test Environments

| # | Farmer Name | Location | Farm Type | Acreage | Fields | Livestock | Annual Revenue |
|---|---|---|---|---|---|---|---|
| 🌾 **1** | **Arun Singh Dhaliwal** (`arun.dhaliwal@agritech.in` / `1234`) | Ludhiana, Punjab | Large Commercial Farm | 52.0 Ac | **18 Plots** | **32 Animals** | ₹4,800,000 |
| 🌿 **2** | **Priya Venkataraman** (`priya.v@agritech.in` / `1234`) | Mysuru, Karnataka | Medium Mixed Farm | 23.5 Ac | **12 Plots** | **24 Animals** | ₹2,100,000 |
| 🐄 **3** | **Ibrahim Ali Sheikh** (`ibrahim.sheikh@agritech.in` / `1234`) | Guwahati, Assam | Livestock-Focused Farm | 12.5 Ac | **5 Plots** | **45 Animals** | ₹1,800,000 |
| 🌱 **4** | **Kavita Patel** (`kavita.patel@agritech.in` / `1234`) | Indore, Madhya Pradesh | Crop-Diverse Farm | 48.0 Ac | **20 Plots** | **18 Animals** | ₹2,600,000 |

---

## 6. Core Modules & Application Workflows

### 6.1 Farmer Authentication & Multi-Tenant Onboarding
- **Instant Profile Switcher**: One-click login into any of the 4 regional master production accounts.
- **Direct Auth**: Email/Password and Mobile OTP authentication.
- **Dynamic Provisioning**: Any new custom account automatically initializes isolated farm tables and seed records.

### 6.2 Farm Command Dashboard
- High-level KPIs: Total acreage, active crop plot count, herd population count, and gross revenue summary.
- Quick Action Bar: Instant access to AI Disease Scanner, Field Registry, Herd Health Assessment, and Weather Radar.
- Real-time weather card with live temperature, precipitation status, and humidity.

### 6.3 Crop & Field Lifecycle Management
- Visual cards displaying soil type, area, sowing date, and crop growth stage.
- Automatic stage determination across 8 agronomic phases (Germination, CRI, Tillering, Vegetative, Flowering, Grain Filling, Maturity, Harvesting).
- Stage-specific fertilizer dosage (NPK kg/acre) and irrigation requirements.

### 6.4 Dynamic Days-After-Sowing (DAS) Activity Calendar
- Continuous timeline calculation anchored to the actual sowing date.
- Interactive calendar grid indicating scheduled agronomic tasks, foliar spray windows, and fertilizer top-dressing.
- Custom dropdown to filter schedules by specific field plots.

### 6.5 AI Vision Plant Disease Scanner (CNN)
- Dual capture options: Device camera or gallery upload.
- Classifies 38+ plant-disease pairs with confidence percentages.
- Returns comprehensive pathology reports including:
  - Scientific disease nomenclature and severity grade (Low / Moderate / Severe).
  - Organic/biological controls and exact chemical fungicide/pesticide dosages.
  - Preventive agronomic practices.

### 6.6 Livestock & Digital Herd Registry
- Broad species coverage: Cows (`🐄`), Buffalos (`🐃`), Sheep (`🐑`), Goats (`🐐`), Pigs (`🐷`), Ducks (`🦆`), Poultry (`🐔`), and Oxen (`🐂`).
- Individual profiles tracking ear tag IDs, breed, age, weight, yield, and medical history.
- Digital vaccination scheduler with one-click **"Mark as Executed / Done"** updates.

### 6.7 Clinical Veterinary MLP Health Diagnostic System
- **24 Systematic Clinical Symptoms** categorized into:
  1. *Mouth & Hoof Lesions*: Blisters on mouth, tongue, gums, hooves; sores on mouth, tongue, gums, hooves.
  2. *Locomotion & Mobility*: Difficulty walking, lameness, limb swelling, extremity swelling.
  3. *Systemic & General*: Loss of appetite, fatigue, depression, sweats, chills, painless lumps.
  4. *Respiratory*: Shortness of breath, chest discomfort, crackling sounds.
  5. *Inflammation*: Abdominal swelling, muscle swelling, neck swelling.
- Neural diagnostic engine computing softmax probability distributions across differential diagnoses (FMD, Anthrax, Blackleg, Lumpy Skin Disease, Pneumonia, Mastitis).
- Full diagnostic report with severity rings, confirmed symptom checklists, and emergency veterinary advisories.

### 6.8 Live Agro-Meteorological Weather Station & Field Alerts
- Real-time telemetry: Temperature, condition icon, humidity, wind velocity, rain probability, and UV index.
- 5-Day forecast outlook with precipitation probability bars.
- Dynamic operational safety directives:
  - **Spraying Windows**: Wind speed safety checks.
  - **Irrigation Windows**: Rain probability safety checks.
- Per-plot weather advisory engine tailoring recommendations to each active crop field.

### 6.9 Farm Financials, Expense Ledger & Analytics
- Multi-category cost tracking: Seeds, Fertilizers, Pesticides, Labour, Irrigation, Veterinary, Machinery, Infrastructure, Feed.
- Real-time operational expenditure vs. estimated revenue comparisons.
- Interactive transaction logging with date, amount, and receipt notes.

### 6.10 History Timeline & Priority Notification Engine
- Unified farm activity audit ledger tracking crop operations, livestock milestones, disease scans, and vaccination events.
- Priority-ranked notification system categorized by Urgent Alerts, Action Items, and Information Updates.

---

## 7. Deep Learning & Machine Learning Pipelines

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              AGRI-AI PIPELINES                              │
├─────────────────────────┬─────────────────────────┬─────────────────────────┤
│    1. PLANT VISION      │   2. VET CLINICAL MLP   │   3. CROP RECOMMENDER   │
├─────────────────────────┼─────────────────────────┼─────────────────────────┤
│ • Model: CNN            │ • Model: PyTorch MLP    │ • Model: Random Forest  │
│ • Input: 224x224 RGB    │ • Input: 26-dim Vector  │ • Input: N, P, K, pH,   │
│ • Classes: 38 Diseases  │ • Output: 6 Diagnoses   │   Rainfall, Temp, Humid │
│ • Features: Lesions,    │ • Features: 24 Symptoms │ • Output: Ranked Crop   │
│   Rust, Blight, Spots   │   + Age + Temperature   │   Suitability Scores    │
└─────────────────────────┴─────────────────────────┴─────────────────────────┘
```

---

## 8. Backend API Reference & Schema

| Method | Endpoint | Description | Scoping |
|---|---|---|---|
| `GET` | `/api/health` | System health check & ML model status | Global |
| `GET` | `/api/farm/profile` | Returns farmer bio & farm land details | `X-User-Id` |
| `PUT` | `/api/farm/profile` | Updates farm soil, acreage, and location | `X-User-Id` |
| `GET` | `/api/farm/fields` | Lists all fields for authenticated farm | `X-User-Id` |
| `POST` | `/api/farm/fields` | Adds a new crop plot | `X-User-Id` |
| `GET` | `/api/livestock` | Returns all herd animals & species counts | `X-User-Id` |
| `POST` | `/api/livestock` | Registers animal + auto-schedules vaccines | `X-User-Id` |
| `GET` | `/api/livestock/{id}` | Returns animal profile, vaccines & tests | `X-User-Id` |
| `POST` | `/api/livestock/assess` | Runs 24-symptom MLP health diagnostic | `X-User-Id` |
| `GET` | `/api/livestock/vaccinations/all` | Lists all vaccination schedules | `X-User-Id` |
| `PUT` | `/api/livestock/vaccinations/{id}/done` | Marks vaccination as executed | `X-User-Id` |
| `POST` | `/api/crops/disease/predict` | Vision CNN inference on leaf photo | Global / Field |
| `POST` | `/api/crops/recommend` | Recommends crops from soil/climate features | Global / Farm |
| `GET` | `/api/weather` | Returns live weather data for farm location | Global / City |
| `GET` | `/api/weather/advisory` | Returns live weather & field impact directives | `X-User-Id` |
| `GET` | `/api/expenses` | Returns all farm financial expense records | `X-User-Id` |
| `POST` | `/api/expenses` | Logs a new expense item | `X-User-Id` |
| `GET` | `/api/notifications` | Returns active notifications for farm | `X-User-Id` |
| `GET` | `/api/history` | Returns chronological farm activity audit trail | `X-User-Id` |

---

## 9. Database Entity Relationship (ER) Model

```
 ┌───────────────┐       1:1       ┌───────────────┐
 │    Farmer     │─────────────────│     Farm      │
 └───────────────┘                 └───────────────┘
                                           │
         ┌───────────────────┬─────────────┴─────────────┬──────────────────┐
         │ 1:N               │ 1:N                       │ 1:N              │ 1:N
 ┌───────────────┐   ┌───────────────┐           ┌───────────────┐  ┌───────────────┐
 │     Field     │   │    Animal     │           │    Expense    │  │ Notification  │
 └───────────────┘   └───────────────┘           └───────────────┘  └───────────────┘
         │ 1:N               │ 1:N
 ┌───────────────┐   ┌───────────────┐
 │ CropActivity  │   │  Vaccination  │
 └───────────────┘   └───────────────┘
                             │ 1:N
                     ┌───────────────────┐
                     │ HealthAssessment  │
                     └───────────────────┘
```

---

## 10. Mobile Native (Capacitor) & Cloud Deployment Architecture

- **Android Scheme**: Configured with `https` scheme for modern Android WebView security.
- **Dynamic API Target**: Automatically routes to the live Render cloud backend (`https://agritech-sih.onrender.com/api`) when deployed as an APK.
- **CORS Permissive Policy**: Supports mobile webview origin headers and cross-origin file uploads.
- **Safe Area Insets**: Implements full notch and gesture navigation bar padding across all Android screen form factors.

---

## 11. CI/CD Automated Build Pipeline (GitHub Actions)

Located at `.github/workflows/android.yml`:
1. **Trigger**: Automatically executes on pushes to the `main` branch or manual `workflow_dispatch`.
2. **Environment**: `ubuntu-latest` with Node.js 18 and Java JDK 17 (Temurin).
3. **Build Steps**:
   - `npm install` & `npm run build` in `/frontend`.
   - `npx cap sync android` to push compiled assets into the Android native wrapper.
   - Gradle build (`./gradlew assembleDebug`) in `/frontend/android`.
4. **Artifact Delivery**: Uploads `agritech-debug-apk` directly to GitHub Actions artifacts for instant download.

---

## 12. Testing, Quality Assurance & Verification

- Comprehensive test suite in `test_services.py` executed via `pytest`.
- **16/16 Unit & Integration Tests Passing**:
  - Multi-tenant data partition validation.
  - Crop recommendation engine NPK prediction integrity.
  - CNN plant disease inference and advisory mapping.
  - Livestock 24-symptom clinical MLP diagnosis and vaccination lifecycle updates.
  - Live weather Open-Meteo endpoint integration and fallback handling.

---

## 13. Installation, Configuration & Execution Guide

### Prerequisites
- Python 3.10+
- Node.js 18+ & npm

### Local Backend Setup
```bash
# Navigate to project root
cd SIH

# Install Python dependencies
pip install -r requirements.txt

# Start FastAPI backend
python -m uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

### Local Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev -- --host
```

### Building Android APK Locally
```bash
cd frontend
npm run build
npx cap sync android
cd android
./gradlew assembleDebug
```
*Compiled APK output will be located at `frontend/android/app/build/outputs/apk/debug/app-debug.apk`.*

---
*AgriTech AI System Documentation · Authored for National Smart India Hackathon (SIH) & Enterprise Agricultural Deployment.*
