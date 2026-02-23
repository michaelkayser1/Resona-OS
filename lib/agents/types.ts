/**
 * Agent System Types
 * Defines the multi-agent architecture types and mock data.
 */

export type AgentType = "builder" | "tester" | "refactorer" | "clinician" | "guardian"

export type AgentStatus = "idle" | "spawning" | "running" | "committed" | "failed" | "merged"

export interface AgentRun {
  id: string
  agentType: AgentType
  branch: string
  status: AgentStatus
  guardianScore: number | null
  filesChanged: number
  linesAdded: number
  linesDeleted: number
  startedAt: string
  completedAt: string | null
  commitHash: string | null
  summary: string
}

export interface AgentConfig {
  type: AgentType
  label: string
  description: string
  color: string
  icon: string
}

export const AGENT_CONFIGS: Record<AgentType, AgentConfig> = {
  builder: {
    type: "builder",
    label: "Builder",
    description: "Implements features and writes production code",
    color: "text-primary",
    icon: "Hammer",
  },
  tester: {
    type: "tester",
    label: "Tester",
    description: "Writes tests, assertions, and CI validation",
    color: "text-success",
    icon: "FlaskConical",
  },
  refactorer: {
    type: "refactorer",
    label: "Refactorer",
    description: "Improves architecture and code quality",
    color: "text-chart-4",
    icon: "RefreshCw",
  },
  clinician: {
    type: "clinician",
    label: "Clinician",
    description: "Generates documentation and clinical workflows",
    color: "text-warning",
    icon: "FileText",
  },
  guardian: {
    type: "guardian",
    label: "Guardian",
    description: "Merge gate enforcement and PR quality scoring",
    color: "text-chart-5",
    icon: "Shield",
  },
}

export const MOCK_AGENT_RUNS: AgentRun[] = [
  {
    id: "run_001",
    agentType: "builder",
    branch: "agent/builder",
    status: "merged",
    guardianScore: 0.89,
    filesChanged: 7,
    linesAdded: 342,
    linesDeleted: 28,
    startedAt: "2026-02-20T08:00:00Z",
    completedAt: "2026-02-20T08:12:00Z",
    commitHash: "a3f7c2d",
    summary: "Implemented user authentication flow with session management",
  },
  {
    id: "run_002",
    agentType: "tester",
    branch: "agent/tester",
    status: "merged",
    guardianScore: 0.94,
    filesChanged: 4,
    linesAdded: 189,
    linesDeleted: 12,
    startedAt: "2026-02-20T08:15:00Z",
    completedAt: "2026-02-20T08:22:00Z",
    commitHash: "b8e1f4a",
    summary: "Added comprehensive test suite for auth flow with 96% coverage",
  },
  {
    id: "run_003",
    agentType: "refactorer",
    branch: "agent/refactorer",
    status: "running",
    guardianScore: null,
    filesChanged: 12,
    linesAdded: 156,
    linesDeleted: 203,
    startedAt: "2026-02-20T08:30:00Z",
    completedAt: null,
    commitHash: null,
    summary: "Refactoring API layer to use repository pattern",
  },
  {
    id: "run_004",
    agentType: "clinician",
    branch: "agent/clinician",
    status: "committed",
    guardianScore: 0.82,
    filesChanged: 3,
    linesAdded: 478,
    linesDeleted: 0,
    startedAt: "2026-02-20T08:35:00Z",
    completedAt: "2026-02-20T08:41:00Z",
    commitHash: "c9d3e5b",
    summary: "Generated clinical workflow documentation for patient intake",
  },
  {
    id: "run_005",
    agentType: "builder",
    branch: "agent/builder-2",
    status: "running",
    guardianScore: null,
    filesChanged: 5,
    linesAdded: 267,
    linesDeleted: 45,
    startedAt: "2026-02-20T09:00:00Z",
    completedAt: null,
    commitHash: null,
    summary: "Building dashboard API endpoints for agent metrics",
  },
  {
    id: "run_006",
    agentType: "guardian",
    branch: "agent/guardian",
    status: "merged",
    guardianScore: 0.97,
    filesChanged: 2,
    linesAdded: 88,
    linesDeleted: 15,
    startedAt: "2026-02-20T09:10:00Z",
    completedAt: "2026-02-20T09:14:00Z",
    commitHash: "d1a8b7c",
    summary: "Updated merge gate scoring algorithm with dependency risk",
  },
]

export const MOCK_DEPLOY_STATUS = {
  environment: "production",
  status: "ready" as const,
  url: "https://resona-v0.vercel.app",
  lastDeployed: "2026-02-20T09:20:00Z",
  commitHash: "d1a8b7c",
  branch: "main",
}
