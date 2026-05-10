export const authFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
    const token = localStorage.getItem('token');

    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.headers,
      }
    });

    if (res.status === 401 || res.status === 403) {
    const data = await res.clone().json();
    if (['NO_TOKEN', 'TOKEN_EXPIRED', 'INVALID_TOKEN'].includes(data.code)) {
      window.dispatchEvent(new Event('unauthorized'));
    }
  }

  return res;
};