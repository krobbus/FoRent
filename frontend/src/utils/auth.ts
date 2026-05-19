import type { Role } from './props';

interface TokenPayload {
    id: number;
    role: Role;
}

export const getUserFromToken = async (): Promise<{ userId: number; userRole: Role } | null> => {
    try {
        const res = await fetch('http://localhost:5000/api/me', {
            credentials: 'include'
        });

        if (!res.ok) return null;
        const data: TokenPayload = await res.json();
        return { userId: data.id, userRole: data.role };
    } catch {
        return null;
    }
};