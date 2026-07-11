# 🚀 GrowEasy AI-Powered CSV Importer

A production-grade, highly scalable web application that intelligently extracts and maps unstructured CSV lead data into a standardized CRM format using Large Language Models (LLMs). 

Built as a submission for the **GrowEasy Software Developer** position.

---

## 📖 Project Overview

The core challenge of this project is not simply parsing CSV files, but handling datasets with unpredictable column names, varying layouts, and messy data. 

Instead of relying on rigid, hardcoded column mapping, this system leverages a **Domain-Driven Design (DDD)** backend and an **AI Strategy Pattern** (powered by Gemini) to intelligently interpret and standardize incoming records into the GrowEasy CRM schema.

### ✨ Key Features
* **Intelligent AI Mapping:** Uses Gemini (or OpenAI via a swappable interface) to map arbitrary CSV columns to strict CRM fields.
* **Strict Domain Validation:** Enforces business rules (e.g., records must have an email or phone number to be valid, strictly typed CRM statuses).
* **Batch Processing:** Safely chunks large CSVs into manageable batches before sending them to the LLM to prevent rate limiting and context-window overflow.
* **Premium UI/UX:** Built with Next.js and Tailwind CSS, featuring a responsive, glassmorphism design system, drag-and-drop uploads, and interactive data preview tables.
* **Provider-Agnostic AI:** The AI extraction layer uses the Strategy Pattern, allowing zero-friction swapping between Gemini, OpenAI, and Claude.

---

## 🏗️ Architecture & Constraints

This project was built with strict adherence to **Domain-Driven Design (DDD)** and clean architecture principles.

1. **Separation of Concerns:** The Backend is divided into Domain, Application, Infrastructure, and Interface layers. Core business logic has zero dependencies on external HTTP frameworks or AI SDKs.
2. **Micro-Componentization:** **No single file in this repository exceeds 200 lines of code.** Every component, service, and layout is highly modular, reusable, and replaceable.

### 🛠️ Tech Stack
* **Frontend:** Next.js (React), Tailwind CSS, Framer Motion, react-dropzone, PapaParse.
* **Backend:** Node.js, Express, TypeScript, Multer, PapaParse[cite: 1].
* **Database:** Supabase (PostgreSQL)[cite: 1].
* **AI Provider:** Google Gemini (via `@google/generative-ai`), fallback ready for OpenAI[cite: 1].

---

## 🚀 Setup & Installation

### Prerequisites
* Node.js (v18+)
* npm or yarn
* A Supabase Account
* A Google Gemini API Key

### 1. Database Setup (Supabase)
Run the following SQL in your Supabase SQL Editor to create the required schema:

```sql
CREATE TABLE leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ,
  name TEXT,
  email TEXT,
  country_code TEXT,
  mobile_without_country_code TEXT,
  company TEXT,
  city TEXT,
  state TEXT,
  country TEXT,
  lead_owner TEXT,
  crm_status TEXT CHECK (crm_status IN ('GOOD_LEAD_FOLLOW_UP', 'DID_NOT_CONNECT', 'BAD_LEAD', 'SALE_DONE', NULL)),
  crm_note TEXT,
  data_source TEXT CHECK (data_source IN ('leads_on_demand', 'meridian_tower', 'eden_park', 'varah_swamy', 'sarjapur_plots', NULL)),
  possession_time TEXT,
  description TEXT,
  imported_at TIMESTAMPTZ DEFAULT NOW()
);