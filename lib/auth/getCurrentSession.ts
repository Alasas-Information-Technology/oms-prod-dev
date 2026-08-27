import { jwtVerify } from "jose";
import { cookies } from "next/headers";

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || '6000576da50db77526e8258b4b29353405b3d0936678de321cf5c781b29a6b5eca007840ea28c5caddd1ec155174303d0251ab2000d7b4e9f904d419d569e94a'
);
const JWT_ISSUER = process.env.JWT_ISSUER || 'OMS';
const JWT_AUDIENCE = process.env.JWT_AUDIENCE || 'OMS_USERS';

export interface UserSessionData {
    userId: string;
    username: string;
    email: string;
    userType: string;
    roles: string[];
    permissions: string[];
    scopes: string[];
    loginSessionId: string;
}

export async function getCurrentSession(): Promise<UserSessionData> {
    const cookieStore = await cookies();
    const token = cookieStore.get("oms_access_token")?.value;

    if (!token) {
        throw new Error("Unauthorized");
    }

    const { payload } = await jwtVerify(token, JWT_SECRET, {
        issuer: JWT_ISSUER,
        audience: JWT_AUDIENCE,
    });

    const userId = (payload.userId || payload.sub) as string;
    if (!userId) {
        throw new Error("Unauthorized");
    }

    return {
        userId,
        username: (payload.username as string) || '',
        email: (payload.email as string) || '',
        userType: (payload.userType as string) || 'INTERNAL',
        roles: Array.isArray(payload.roles) ? payload.roles : [],
        permissions: Array.isArray(payload.permissions) ? payload.permissions : [],
        scopes: Array.isArray(payload.scopes) ? payload.scopes : [],
        loginSessionId: (payload.loginSessionId as string) || '',
    };
}