# Google AI Studio Prototype

This is a prototype of the Google AI Studio interface built with Next.js and Tailwind CSS.

## Features

- Responsive UI matching the Google AI Studio design
- Left navigation sidebar with collapsible sections
- Main chat interface with card-based landing page
- Right settings panel for model configuration
- Dark theme design
- Integration with Google Gemini AI models

## Agent capability overview

This repository is a prototype of an AI Studio-style agent playground. Agents are
first-class chat participants: a user can choose a managed agent, send a prompt,
watch its streamed reasoning and tool activity, continue an interaction, and edit
the agent configuration when the surface supports it.

### What exists today

- **Managed Gemini agents:** the app provisions and invokes managed agents through
  the Gemini API. The base Antigravity Preview agent is available alongside five
  reusable templates: AI Talk Radio, Customer Support, Data Analyst, Document
  Processor, and Repo Maintainer.
- **Streaming execution:** `POST /api/agent` streams newline-delimited Gemini
  interaction events to the client. The event adapter turns thoughts, tool calls,
  search, URL context, function calls, MCP calls, and model output into a visible
  agent timeline.
- **Provisioning and discovery:** `GET /api/agents` reports which templates are
  ready in the configured Gemini project. `POST /api/agents` creates any missing
  managed agents and their remote skills, making provisioning idempotent.
- **Agent configuration model:** agents have instructions, a model reference,
  tools, MCP connections, triggers, skills, workflow steps, status, and persisted
  interaction/environment identifiers for continuing a run.
- **Builder and editor concepts:** the prototype includes a guided builder,
  reusable templates, clarifying questions, configuration suggestions, a workflow
  DAG view, and an edit drawer for reviewing tools and instructions.

### Capabilities and extension points

The local agent catalog currently describes these tool categories:

| Area | Current extension point |
| --- | --- |
| Information | Web Search, File Reader, Database Query |
| Execution | Code Execution, API Connector, Custom Function |
| Actions | Email Sender, Calendar Access, Slack Messaging |
| Connections | Slack, Gmail, GitHub, Google Drive MCP providers |
| Automation | Manual, scheduled, email, Slack mention, and webhook triggers |
| Orchestration | Agent and sub-agent workflow steps with conditions and outputs |

The managed templates currently attach Gemini Code Execution, Google Search, and
URL Context tools to a remote environment, and install a focused skill file for
each template. New managed agents should be added in
`src/lib/managed-agent-templates.ts`; the UI catalog and builder metadata live in
`src/lib/agent-config.ts`.

### Runtime flow

1. The playground selects a model or agent and builds a chat request.
2. The server validates the template ID and lazily ensures the corresponding
   managed agent exists in Gemini.
3. Gemini Interactions API events stream back as NDJSON.
4. `src/lib/managed-agent-events.ts` normalizes those events into message content
   and collapsible execution blocks.
5. The client stores the interaction and environment IDs so a follow-up prompt can
   continue the same agent session.

### Where this can grow

The architecture is intentionally open for real integrations and production
controls. The next natural expansion points are authenticated MCP/OAuth
connections, durable agent and interaction storage, background schedules and
webhooks, approval gates for side effects, richer tool configuration, multi-agent
handoffs, evaluation traces, usage/cost telemetry, and deployment/versioning for
agents. The current connection and trigger types are catalog contracts and UI
scaffolding; they should not be treated as fully wired external integrations until
their provider credentials, persistence, and execution adapters are implemented.

### Agent-related source map

- `src/types/agent.ts` — canonical agent, tool, trigger, workflow, and event types
- `src/lib/agent-config.ts` — templates, tools, connections, triggers, and fallback
  workflow generation
- `src/lib/managed-agent-templates.ts` — Gemini managed-agent IDs, instructions,
  and remote skill payloads
- `src/lib/managed-agents-server.ts` — Gemini client, provisioning, and idempotency
- `src/app/api/agent/route.ts` — streaming agent interactions
- `src/app/api/agents/route.ts` — managed-agent discovery and provisioning
- `src/lib/managed-agent-events.ts` — streamed event normalization
- `src/components/agent-builder-drawer.tsx` — guided builder and template flow
- `src/components/agent-edit-drawer.tsx` — configuration review/edit surface
- `src/components/agent-dag-view.tsx` — workflow visualization

## Playground and chat product map

The agent experience sits inside a broader playground rather than being a
separate product. The main application is composed of a left navigation shell, a
central prompt/chat workspace, and a right-side configuration panel.

### Chat and prompt flow

- Create an untitled prompt, edit its title, and submit multi-turn messages.
- Use the prompt composer for text input, rotating starter suggestions, option/enter
  append behavior, speech-to-text, file/image insertion, tools, and Run.
- Render markdown, code blocks, images, model responses, agent reasoning, and
  collapsible tool execution blocks in the conversation timeline.
- Switch between ordinary model chat and managed-agent chat without leaving the
  playground. Agent sessions retain interaction/environment IDs for continuation.
- Reset the conversation or start a new prompt from the playground header.

### Model picker and catalog

The model selector is implemented in `src/components/model-config-panel.tsx` and
the catalog is defined in `src/lib/chat-config.ts`. It supports:

- Searchable, copyable model IDs with documentation links and starred models.
- Category filters for Starred, All, Featured, Gemini, Live, Images, Video, Audio,
  Music, Agents, and Gemma.
- Text/chat models, image-content and image-endpoint models, audio/live models,
  video models, and latest-model aliases.
- Model metadata including description, badges, release date, knowledge cutoff,
  pricing, supported mode, and documentation URL.
- Model-aware behavior: supported run models, image-generation settings, model
  mode changes, and agent selection are all resolved through the shared model types.

The current catalog includes Gemini text and reasoning variants, Nano Banana image
models, Imagen endpoints, Gemini Live Translate, Gemini Omni Flash, and latest
aliases. Add or update entries in `chat-config.ts` rather than duplicating model
metadata in components.

### Run settings and tools

The configuration panel exposes model-specific settings and playground controls:

- System instructions with reusable templates such as Creative Writing, Data
  Analysis, Technical Documentation, Educational Tutor, and Business Consultant.
- Temperature, top-P, maximum output tokens, and model-specific thinking level.
- Structured outputs, Code Execution, Function Calling, Grounding with Google
  Search, Grounding with Google Maps, URL context, and filesystem/tool controls.
- Image-generation settings for number of images, aspect ratio, and person
  generation where the selected model supports image output.
- Agent-specific grounding behavior and an edit-agent path for reviewing the
  selected agent's instructions and connections.

### Other application surfaces

- **Build:** `/build` is a separate app-building prototype with assistant, code,
  preview, and settings panels. “New app” routes here; it does not open the agent
  builder.
- **Navigation shell:** the sidebar models the AI Studio product areas—Playground,
  History, New app, My apps, Gallery, Dashboard, and Documentation. Several of
  these are currently visual/product scaffolding and should be wired to persistence
  or external destinations as the prototype grows.
- **API routes:** `/api/gemini` handles regular Gemini requests, `/api/agent` handles
  streaming managed-agent interactions, and `/api/agents` handles managed-agent
  discovery/provisioning.

### Practical integration boundaries

When extending the repository, keep these boundaries intact:

1. Put shared model and run behavior in `src/types/chat.ts` and
   `src/lib/chat-config.ts`.
2. Keep provider calls server-side in `src/app/api/*`; never move the Gemini key
   into client components.
3. Normalize provider-specific streaming events in the event adapter before they
   reach the UI.
4. Keep catalog metadata, UI rendering, and provider execution separate so new
   models or tools do not require a full chat-surface rewrite.
5. Treat UI-only catalogs for MCPs, triggers, and tools as extension contracts until
   their authentication, persistence, and provider adapters are implemented.

## Getting Started

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:
   - Create a `.env.local` file in the root directory
   - Add your Gemini API configuration:
   
```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL_FLASH=gemini-3-flash-preview
GEMINI_MODEL_PRO=gemini-3.1-pro-preview
```

   - Get your API key from: [Google AI Studio](https://aistudio.google.com/app/apikey)

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Your Google AI Studio API key, used server-side | Yes |
| `GEMINI_MODEL_FLASH` | Default Gemini Flash model for lightweight server tasks | No |
| `GEMINI_MODEL_PRO` | Default Gemini Pro model reference for current previews | No |

## Technologies Used

- Next.js
- TypeScript
- Tailwind CSS
- Lucide React Icons
- Google Gemini AI API 
