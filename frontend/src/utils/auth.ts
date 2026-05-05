import { jwtDecode } from 'jwt-decode';
import type { Role } from '../pages/props';

interface TokenPayload {
    id: number;
    role: Role;
}

export const getUserFromToken = (): { userId: number; userRole: Role } | null => {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
        const decoded = jwtDecode<TokenPayload>(token);

        const userId = decoded.id ?? null;
        const userRole = decoded.role ?? null;

        if (!userId || !userRole) return null;
        return { userId, userRole };
    } catch {
        return null;
    }
};