/**
 * Administration Users Domain Mappers
 * Converts canonical Demo Data cast members (Person) into UserSummaryDto and VendorUserDto.
 */

import {
  UserSummaryDto,
  UserDetailDto,
  VendorUserDto,
  UserType,
  UserStatus,
} from "@/lib/types/authorization.types";
import { Person } from "@/src/lib/demo-data/entities";
import { listPersons, getPerson } from "@/src/lib/demo-data";

/**
 * Maps a canonical Person from the demo-data cast into UserSummaryDto
 */
export function mapPersonToUserSummary(person: Person): UserSummaryDto {
  const parts = person.name.trim().split(" ");
  const firstName = parts[0] || "";
  const lastName = parts.slice(1).join(" ") || firstName;
  const username = person.id.replace("usr-", "");

  return {
    userId: person.id,
    employeeId: `EMP-${username.toUpperCase().slice(0, 5)}`,
    username,
    email: person.email,
    userType: person.userType === "VENDOR" ? UserType.VENDOR : UserType.INTERNAL,
    isActive: true,
    isDeleted: false,
    failedLoginCount: 0,
    lockedUntil: null,
    status: UserStatus.ACTIVE,
    roles: [person.role],
    profile: {
      userProfileId: `prof-${person.id}`,
      userId: person.id,
      firstName,
      lastName,
      displayName: person.name,
      jobTitle: person.title || person.role,
      departmentId: person.departmentId,
      departmentName: person.departmentName,
      createdAt: "2026-01-01T08:00:00Z",
      updatedAt: "2026-08-01T10:00:00Z",
    },
    createdAt: "2026-01-01T08:00:00Z",
    updatedAt: "2026-08-01T10:00:00Z",
  };
}

/**
 * Maps a canonical Person into UserDetailDto
 */
export function mapPersonToUserDetail(person: Person): UserDetailDto {
  const summary = mapPersonToUserSummary(person);
  return {
    ...summary,
    rolesList: [
      {
        userRoleId: `assign-${person.id}-01`,
        userId: person.id,
        roleId: `role-${person.role.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
        roleCode: person.role.toUpperCase().replace(/[^A-Z0-9]/g, "_"),
        roleName: person.role,
        effectiveFrom: "2026-01-01T08:00:00Z",
        effectiveTo: null,
        isActive: true,
        assignedBy: "System Setup",
        assignedAt: "2026-01-01T08:00:00Z",
      },
    ],
    scopesList: [
      {
        userOrganizationScopeId: `scope-${person.departmentId || "org"}`,
        userId: person.id,
        scopeDefinitionId: `scope-def-${person.departmentId || "org"}`,
        scopeCode: "DEPARTMENT",
        scopeName: person.departmentName || "Department Scope",
        departmentId: person.departmentId || null,
        orgUnitName: person.departmentName || null,
        orgUnitId: person.departmentId || null,
        isActive: true,
      },
    ],
    overridesList: [],
  };
}

/**
 * Maps a VENDOR-typed Person into VendorUserDto
 */
export function mapPersonToVendorUser(person: Person): VendorUserDto {
  const summary = mapPersonToUserSummary(person);
  return {
    ...summary,
    vendorId: "ven-falcon",
    vendorName: "Falcon Tech Resourcing",
  };
}

/**
 * Lists all users from the cast, filtered by userType and search query
 */
export function getCastUsersResponse(query?: {
  search?: string;
  departmentId?: string;
  userType?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}) {
  const all = listPersons();

  let filtered = all.filter((p) => {
    // User type filter: internal vs vendor
    if (query?.userType) {
      if (query.userType === "INTERNAL" && p.userType !== "INTERNAL") return false;
      if (query.userType === "VENDOR" && p.userType !== "VENDOR") return false;
    }

    // Department filter
    if (query?.departmentId && p.departmentId !== query.departmentId) {
      return false;
    }

    // Search query
    if (query?.search?.trim()) {
      const q = query.search.toLowerCase();
      const matchesName = p.name.toLowerCase().includes(q);
      const matchesEmail = p.email.toLowerCase().includes(q);
      const matchesRole = p.role.toLowerCase().includes(q);
      const matchesId = p.id.toLowerCase().includes(q);
      if (!matchesName && !matchesEmail && !matchesRole && !matchesId) return false;
    }

    return true;
  });

  const page = query?.page || 1;
  const pageSize = query?.pageSize || 20;
  const startIndex = (page - 1) * pageSize;
  const items = filtered.slice(startIndex, startIndex + pageSize).map(mapPersonToUserSummary);

  return {
    data: items,
    meta: {
      total: filtered.length,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(filtered.length / pageSize)),
    },
  };
}

/**
 * Lists all vendor users from the cast
 */
export function getCastVendorUsers(): VendorUserDto[] {
  return listPersons()
    .filter((p) => p.userType === "VENDOR")
    .map(mapPersonToVendorUser);
}
