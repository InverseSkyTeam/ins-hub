import * as React from 'react';

const STORAGE_KEY = 'inshub_admin_token';

interface AdminStatus {
    enabled: boolean;
    valid: boolean;
}

type AdminResult = Record<string, unknown>;

export function useAdmin() {
    const [enabled, setEnabled] = React.useState(false);
    const [valid, setValid] = React.useState(false);
    const [loading, setLoading] = React.useState(true);
    const [token, setToken] = React.useState<string | null>(() => {
        if (typeof window === 'undefined') return null;
        return window.localStorage.getItem(STORAGE_KEY);
    });

    const fetchStatus = React.useCallback(async (nextToken: string | null) => {
        try {
            const headers: Record<string, string> = {};
            if (nextToken) headers.Authorization = `Bearer ${nextToken}`;
            const res = await fetch('/api/admin', { headers });
            if (!res.ok) throw new Error('无法获取管理状态');
            const data = (await res.json()) as AdminStatus;
            setEnabled(data.enabled);
            setValid(data.enabled && data.valid);
            return data;
        } catch {
            setEnabled(false);
            setValid(false);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        fetchStatus(token);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const login = React.useCallback(
        async (nextToken: string) => {
            setLoading(true);
            try {
                const data = await fetchStatus(nextToken);
                if (data?.enabled && data.valid) {
                    window.localStorage.setItem(STORAGE_KEY, nextToken);
                    setToken(nextToken);
                    return true;
                }
                return false;
            } finally {
                setLoading(false);
            }
        },
        [fetchStatus]
    );

    const logout = React.useCallback(() => {
        window.localStorage.removeItem(STORAGE_KEY);
        setToken(null);
        setValid(false);
    }, []);

    const run = React.useCallback(
        async (action: string, body: Record<string, unknown> = {}): Promise<AdminResult> => {
            if (!token) throw new Error('尚未登录管理员。');
            const res = await fetch('/api/admin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ action, ...body }),
            });
            const data = (await res.json().catch(() => ({}))) as {
                ok?: boolean;
                error?: string;
            };
            if (!res.ok) {
                if (res.status === 401) {
                    window.localStorage.removeItem(STORAGE_KEY);
                    setToken(null);
                    setValid(false);
                }
                throw new Error(data.error || '操作失败，请稍后再试');
            }
            return data;
        },
        [token]
    );

    return { enabled, valid, loading, login, logout, run };
}