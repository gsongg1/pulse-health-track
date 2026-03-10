import type { Role } from "@/lib/types";

export function isAdminLike(role: Role) {
  return role === "ADMIN" || role === "MANAGER";
}

export function canAccessEmployeeApp(role: Role) {
  return role === "EMPLOYEE" || role === "ADMIN" || role === "MANAGER";
}

export function canAccessAdminApp(role: Role) {
  return isAdminLike(role);
}
