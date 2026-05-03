import { jwtDecode } from 'jwt-decode';
import type { Role } from '../pages/props';

interface TokenPayload {
    userId: number;
    role: Role;
}

export const getUserFromToken = (): { userId: number; userRole: Role } | null => {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
        const decoded = jwtDecode<TokenPayload>(token);
        return { userId: decoded.userId, userRole: decoded.role };
    } catch {
        return null;
    }
};