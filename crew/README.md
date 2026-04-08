# QuickTrade CrewAI Feature Builder

A CrewAI-powered automation layer that lets two AI agents collaborate to
research and implement new features directly inside the QuickTrade
(worker-connect) Next.js app.

## Agents

| Agent | Role |
|---|---|
| **Researcher** | Explores the codebase, understands existing patterns, and produces a detailed feature specification |
| **Developer** | Reads the spec and writes the actual TypeScript/React/Firestore code into the correct project files |

## Prerequisites

- Python 3.11+
- An OpenAI API key (GPT-4o recommended)

## Setup

```bash
# 1. Navigate to the crew directory
cd crew

# 2. Create and activate a virtual environment
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Set your API key
cp .env.example .env
# Edit .env and replace "your_openai_api_key_here" with your real key
```

## Running

```bash
# Pass the feature request as a command-line argument
python main.py "Add a real-time notifications panel to the dashboard"

# Or use an environment variable
FEATURE_REQUEST="Add a dark-mode toggle to the nav bar" python main.py
```

The crew will:
1. **Researcher** – reads `types/index.ts`, `lib/firebase.ts`, and key
   service files, then produces a Markdown feature specification.
2. **Developer** – implements every file listed in the spec, writing them
   directly into the project tree.

## Project layout

```
crew/
├── config/
│   ├── agents.yaml      # Agent roles, goals, and backstories
│   └── tasks.yaml       # Task descriptions and expected outputs
├── tools/
│   └── codebase_tools.py  # ReadFile, WriteFile, ListProjectFiles, SearchCodebase
├── crew.py              # QuickTradeCrew class
├── main.py              # CLI entry point
├── requirements.txt
├── .env.example
└── README.md
```

## Customising agents

Edit `config/agents.yaml` to change agent roles, goals, or backstories.
Edit `config/tasks.yaml` to change what the researcher investigates or
what rules the developer follows.

## Adding more agents

1. Add a new entry to `config/agents.yaml`.
2. Add corresponding tasks to `config/tasks.yaml`.
3. Define a new `@agent` method and `@task` method in `crew.py`.
4. Include the new agent/task in the `Crew` instantiation inside the
   `@crew` method.
