/**
 * Role-Based Access Control (RBAC)
 * Defines roles, permissions, and access enforcement.
 */

export const ROLES = {
  ADMIN: "admin",
  DEVELOPER: "developer",
  CLINICIAN: "clinician",
  REVIEWER: "reviewer",
  GUARDIAN: "guardian",
  READ_ONLY: "read_only",
} as const

export type Role = (typeof ROLES)[keyof typeof ROLES]

export const PERMISSIONS = {
  "agents.spawn": ["admin", "developer"],
  "agents.view": ["admin", "developer", "reviewer", "guardian", "read_only"],
  "guardian.override": ["admin", "guardian"],
  "guardian.view": ["admin", "developer", "reviewer", "guardian", "read_only"],
  "audit.view": ["admin", "guardian"],
  "audit.export": ["admin"],
  "deploy.trigger": ["admin"],
  "deploy.view": ["admin", "developer", "reviewer", "guardian", "read_only"],
  "compliance.view": ["admin", "clinician", "guardian"],
  "compliance.configure": ["admin"],
  "dashboard.view": ["admin", "developer", "clinician", "reviewer", "guardian"],
  "settings.manage": ["admin"],
} as const

export type Permission = keyof typeof PERMISSIONS

export function hasPermission(role: Role, permission: Permission): boolean {
  const allowedRoles = PERMISSIONS[permission]
  return (allowedRoles as readonly string[]).includes(role)
}

export function getAllPermissions(role: Role): Permission[] {
  return (Object.keys(PERMISSIONS) as Permission[]).filter(
    (permission) => hasPermission(role, permission)
  )
}

export interface User {
  id: string
  name: string
  email: string
  role: Role
  avatar?: string
}
