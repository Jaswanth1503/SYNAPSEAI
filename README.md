# SYNAPSEAI — Smart Learning & AI Media OS

## Team Roles & Responsibilities

| Role | Team Member | Primary Responsibilities |
| :--- | :--- | :--- |
| **Backend & Infra Lead** | **You (Repo Owner)** | Node.js API (`apps/api`), Database (MongoDB), Auth, Server Routes & Endpoints |
| **Frontend Lead** | **Person 1** | React/Vite UI (`apps/web`), Video Player, Components, Design System |
| **AI/ML Lead** | **Person 2** | LLM Router (`apps/api/src/services/ai`), Summarizer, RAG Doubt Assistant, Quiz Gen |

---

## Project Structure (Monorepo)

```text
SYNAPSEAI/
├── apps/
│   ├── api/             # Backend API (Express + TypeScript)
│   └── web/             # Frontend UI (React + Vite + TypeScript)
├── packages/
│   └── shared-types/    # Shared TypeScript types between Frontend & Backend
└── README.md
```

---

## Git Workflow for Team Collaboration

### Branch Naming Convention
- Backend work: `feat/backend` or `feat/<feature-name>`
- Frontend work: `feat/frontend` or `feat/ui-<feature-name>`
- AI/ML work: `feat/ai-ml` or `feat/ml-<feature-name>`

### Step-by-Step for Team Members:
1. **Clone the repo:**
   ```bash
   git clone https://github.com/Jaswanth1503/SYNAPSEAI.git
   cd SYNAPSEAI
   ```
2. **Create your feature branch before starting work:**
   ```bash
   git checkout -b feat/your-role-name
   ```
3. **Commit & Push your branch:**
   ```bash
   git add .
   git commit -m "Describe your changes"
   git push -u origin feat/your-role-name
   ```
4. **Merge to Main:**
   Open a Pull Request on GitHub to merge into `main`.

5. **Sync latest code:**
   ```bash
   git checkout main
   git pull origin main
   ```
