import * as React from 'react';
import { toast } from 'sonner';

import type { Image } from '@/interfaces/image';

export function useImages() {
    const [images, setImages] = React.useState<Image[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    const fetchImages = React.useCallback(async (): Promise<Image[]> => {
        try {
            setLoading(true);
            const res = await fetch('/api/images');
            if (!res.ok) {
                const data: { error?: string } = await res.json().catch(() => ({}));
                throw new Error(data.error || '无法获取图像，请稍后再试');
            }
            const data = await res.json();
            if (!Array.isArray(data)) throw new Error('无法获取图像，请稍后再试');

            setImages(data);
            setError(null);
            return data;
        } catch (err: unknown) {
            let message: string = '无法获取图像，请稍后再试';
            if (err instanceof Error) {
                message = err.message || '无法获取图像，请稍后再试';
            }
            toast.error('发生了错误!', {
                description: message,
                position: 'top-center',
                duration: 3000,
            });
            setError(message);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        fetchImages();
    }, [fetchImages]);

    return { images, loading, error, refetch: fetchImages };
}
