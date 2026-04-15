/**
 * Permission Utilities for RBAC
 */

/**
 * Returns true if the role is authorized for global data visibility (cross-departmental).
 * 
 * @param {string} roleName - currentUser.roles.role_name
 * @returns {boolean}
 */
export function hasGlobalView(roleName) {
  const globalRoles = [
    'SYSTEM_ADMIN',
    'HR_ADMIN',
    'FINANCE_OFFICER',
    'PROCUREMENT_OFFICER'
  ];
  return globalRoles.includes(roleName);
}
