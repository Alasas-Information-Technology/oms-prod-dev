import { AuthService }
    from "./AuthService";

import { AuthorizationService }
    from "./AuthorizationService";

import { PermissionService }
    from "./PermissionService";

import { ScopeService }
    from "./ScopeService";

import { SessionService }
    from "./SessionService";

import { WorkflowPermissionService }
    from "./WorkflowPermissionService";

export const authService =
    new AuthService();

export const authorizationService =
    new AuthorizationService();

export const permissionService =
    new PermissionService();

export const scopeService =
    new ScopeService();

export const sessionService =
    new SessionService();

export const workflowPermissionService =
    new WorkflowPermissionService();