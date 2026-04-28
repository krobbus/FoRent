export const authFetch = async (
    url: string,
    options: RequestInit = {},
    onAuthError?: () => void
): Promise<Response> => {
    const token = localStorage.getItem('token');
    const response = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            ...options.headers,
        }
    });

    if ((response.status === 401 || response.status === 403) && onAuthError) {
        localStorage.removeItem('token');
        onAuthError();
    }

    return response;
};