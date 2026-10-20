# NightOwl AI — Privacy-First Group Chat Intelligence

NightOwl AI turns noisy, late-night group conversations into concise morning briefs, explicit action items, decisions, unanswered questions, and plan changes—with 100% client-side privacy, transparent evidence linking, and zero cloud uploads.

### User Review & Critical Decisions

> [!IMPORTANT]
> The architectural and privacy foundations have been verified based on your preferences:

- **Confirmed First Launch Flow**: The application launches into an interactive 4-step onboarding experience explaining the zero-cloud privacy architecture before offering sample chat exploration or custom file import.
- **Confirmed Parsing Presets**: Built-in test presets and drag-and-drop support for standard WhatsApp plaintext exports (`[MM/DD/YY, HH:MM:SS AM/PM] Sender: text` and `DD/MM/YYYY, HH:MM - Sender: text`) alongside structured JSON exports (`chat.json`).
- **Confirmed Engine Architecture**: Hybrid client-side intelligence engine that executes real deterministic parsing, pattern extraction, question detection, decision tracking, and contradiction detection directly in the browser with source message references, wrapped behind a modular `AIEngineService` interface ready for local LiteRT-LM / WebLLM integration.
- **Strict Privacy Isolation**: No remote chat storage, no external LLM API telemetry, no backend database sync. Everything resides in memory and browser IndexedDB/localStorage with one-tap instant purge controls.

---

### 1. Overview & Core Concept

- **What It Does**: NightOwl AI decodes hundreds of missed group chat messages into an actionable two-line morning briefing, 3 key updates, extracted tasks with real deadlines and assignees, logged decisions with chronological superseding links, and an interactive "Ask Your Chats" inspector.
- **Target Audience / Persona**: Students handling group project threads, hackathon teams, community organizers, friends planning group trips, and busy professionals inundated with late-night messaging noise.
- **Key Value**: "Sleep through the noise. Wake up knowing what matters." Users catch up in 30 seconds with instant provenance—every single insight has an interactive button revealing the exact source messages that substantiate it.

---

### 2. User Experience & Visual Design

- **Key User Flows**:
  1. *Onboarding*: 4 focused swipeable cards covering product promise, zero-cloud privacy guarantee, file formats, and choice between "Explore Hackathon Demo" or "Import My Chat".
  2. *Morning Brief Dashboard*: Top header with time window and chat selector, prominent two-line morning summary, 3 priority highlights, decisions strip, pending tasks carousel, unresolved questions, and a "What changed?" plan-revision box.
  3. *My Tasks*: Grouped into explicit commitments, suggested follow-ups, and inferred tasks. Each task supports status toggles (Open, In Progress, Completed, Dismissed), priority flags, inline editing, manual task creation, and source message popups.
  4. *Ask Your Chats*: Question input with fast suggested prompts (e.g., "What time did we decide to meet?", "Who is doing the slides?", "Did plans change?"), displaying verified quotes, timestamps, sender badges, and an honest "Insufficient evidence in this chat" boundary.
  5. *Intelligence View*: Deep analytical tabs: Decisions Timeline (with superseding links), Unresolved Questions (with outside-history caveats), Plan Changes (before & after comparison), Follow-up Opportunities, Topic Clusters, and Repeated Inquiries.
  6. *Import & Privacy Controls*: Local parser with file drag-and-drop, line-by-line parsing diagnostics (parsed count vs unparsed warnings), sample presets, chat switcher, and an irreversible Data Purge vault.

- **Visual Identity & Theme**:
  - *Aesthetic Direction*: Futuristic Midnight Navy & Celestial Violet. Dark mode native, calm, restrained, high-legibility interface designed for waking up in low morning light.
  - *Color Palette & Mood*:
    - Background: Deep midnight obsidian (`#090D16` / `bg-slate-950`)
    - Surface / Cards: Muted dark indigo slate (`#111827`, `#161F36`) with hairline borders (`border-slate-800/80`)
    - Accents: Electric violet (`#8B5CF6`) and luminous cyan (`#06B6D4`) for focal accents
    - Neutrals & Prose: Crisp high-contrast zinc (`#F8FAFC`), muted metadata (`#94A3B8`)
  - *Typography & Hierarchy*:
    - Display / Headers: Modern geometric sans (`Outfit` / system sans) with balanced headline wrapping
    - Body: Clean, high-legibility sans (`Plus Jakarta Sans` / modern system stack) with generous line heights
    - Evidence & Timestamps: Tabular monospace figures (`font-mono tabular-nums`)
  - *Component Styling & Layout*:
    - Mobile-first layout with smooth desktop responsiveness: centered thumb-friendly card stack on mobile, fluid multi-column Bento grid on desktop (`lg:max-w-6xl`)
    - Bottom navigation bar on mobile (h-16, safe-area padded), adaptive top bar with chat switcher and status indicators
    - Zero-pill metadata discipline: clean inline text with subtle typographic dot separators (`·`)

- **Interactive Feedback & Motion**:
  - Micro-interactions on task completion and filter changes (<150ms)
  - Animated evidence drawer sliding up smoothly to show highlighted source messages in full context
  - Non-blocking parser progress bar with line count telemetry during file imports

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Client-Side Parsing vs Server Uploads**
  - *Chosen Approach*: 100% browser-based regex and structured stream parsing in TypeScript using native FileReader APIs.
  - *Why*: Strict adherence to the product promise. Group chats contain sensitive personal relationships, passwords, phone numbers, and private details. Zero bytes leave the client.
  - *Alternatives Considered*: Server-side python parsing or cloud function ingestion (rejected for privacy violation).

- **Decision 2: Hybrid Local Extraction Engine with Clear Evidence Tracing**
  - *Chosen Approach*: Rule-based semantic extractors that parse dates, assignees, imperative commitments ("I will take care of...", "Let's do..."), question marks, and contradiction markers, cleanly decoupled via an `AIEngineService` interface. Every extracted item references source `MessageId`s.
  - *Why*: Provides instant, deterministic results on imported text files without waiting for multi-gigabyte browser WebLLM downloads or requiring an internet connection, while maintaining strict evidence traceability.
  - *Alternatives Considered*: Bundling a 2GB quantized LLM by default (rejected as it crashes mobile browsers and causes severe latency).

- **Decision 3: Local Storage Persistence with Full Vault Destruction**
  - *Chosen Approach*: Browser IndexedDB + localStorage with an explicit Privacy Center providing single-chat deletion and complete nuclear wipe options.
  - *Why*: Allows users to close the browser and retain their morning brief without data ever reaching an external server.

---

### 4. Technical Architecture & Data Strategy *(Technical Reference)*

- **Architecture & Component Diagram**:

```
┌────────────────────────────────────────────────────────────────────────┐
│                          NightOwl AI Web App                           │
│                                                                        │
│  ┌─────────────────────────┐            ┌───────────────────────────┐  │
│  │   Navigation / Header   │            │   Onboarding Controller   │  │
│  │ (Chat Switcher, Privacy)│            │   (4-Step Zero-Cloud Flow)│  │
│  └───────────┬─────────────┘            └─────────────┬─────────────┘  │
│              │                                        │                │
│  ┌───────────▼────────────────────────────────────────▼─────────────┐  │
│  │                     App State & Local Store                      │  │
│  │  - Active Chat & Messages       - Extracted Tasks & Decisions    │  │
│  │  - Morning Brief Summary        - Filter & Search State          │  │
│  └───────────┬────────────────────────────────────────┬─────────────┘  │
│              │                                        │                │
│  ┌───────────▼───────────────┐          ┌─────────────▼─────────────┐  │
│  │    Local File Parser      │          │     AI Engine Service     │  │
│  │ - WhatsApp Text Stream    │          │ - Summarizer & Updates    │  │
│  │ - JSON Standard Schema    │          │ - Task & Deadline Parser  │  │
│  │ - Diagnostic Line Auditor │          │ - Decision & Plan Tracker │  │
│  └───────────┬───────────────┘          │ - Evidence Linking Engine │  │
│              │                          └─────────────┬─────────────┘  │
│  ┌───────────▼────────────────────────────────────────▼─────────────┐  │
│  │                         5 Core Views                             │  │
│  │ 1. Morning Brief Dashboard (2-Line Summary, Updates, Questions)  │  │
│  │ 2. My Tasks Manager (Commitments, Follow-ups, Status & Edit)     │  │
│  │ 3. Ask Your Chats (Evidence-backed conversational Q&A)          │  │
│  │ 4. Intelligence Hub (Decisions Timeline, Plan Contradictions)    │  │
│  │ 5. Privacy Center & Settings (Auditing, Storage, Nuclear Wipe)   │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

- **Data Models**:
  - `Chat`: `id`, `displayName`, `importedAt`, `sourceFormat`, `messageCount`, `dateRange`, `processingMode`
  - `Message`: `id`, `chatId`, `timestamp`, `sender`, `text`, `messageType`, `sourceLineReference`
  - `Task`: `id`, `chatId`, `title`, `owner`, `deadline`, `status` (`'open' | 'in_progress' | 'completed' | 'dismissed'`), `priority` (`'low' | 'medium' | 'high'`), `evidenceMessageIds`, `confidence`, `classification` (`'explicit_commitment' | 'suggested_followup' | 'inferred'`)
  - `Decision`: `id`, `chatId`, `title`, `status` (`'confirmed' | 'proposed' | 'superseded'`), `timestamp`, `evidenceMessageIds`, `supersedesDecisionId`
  - `OpenQuestion`: `id`, `chatId`, `question`, `askedBy`, `timestamp`, `evidenceMessageIds`, `status` (`'unanswered' | 'resolved'`), `confidence`
  - `PlanChange`: `id`, `chatId`, `topic`, `earlierStatement`, `earlierSender`, `earlierTimestamp`, `laterStatement`, `laterSender`, `laterTimestamp`, `evidenceMessageIds`
  - `Summary`: `id`, `chatId`, `dateRange`, `twoLineSummary`, `keyUpdates`, `generatedAt`, `evidenceMessageIds`

- **Interactive Component & State Mapping**:
  - `EvidenceModal`: Triggered from any task, decision, question, or summary item; highlights the source messages in chronological context with sender avatars and timestamps.
  - `TaskEditorModal`: Allows manual task addition or editing of existing assignees, deadlines, and priorities.
  - `ChatImportModal`: Live feedback with file parsing diagnostics, valid message tally, and discard button.
  - `DataVaultControls`: Confirmation modals prior to clearing demo data or wiping all locally saved chats.
