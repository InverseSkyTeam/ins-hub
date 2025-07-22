import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface Image {
    id: string;
    name: string;
    path: string;
    download_url: string;
}

export function useImages() {
    const [images, setImages] = useState<Image[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchImages = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch(
                'https://api.github.com/repos/InverseSkyTeam/ins-hub/contents/images'
            );
            const data = await res.json();

            if (!res.ok) throw new Error(data.message || '无法获取图像，请稍后再试');

            const imgData = data
                .filter((item: Image) => item.name !== 'ins.webp')
                .map((item: Image) => ({
                    id: item.name,
                    name: item.name,
                    path: item.path,
                    download_url: item.download_url,
                }));

            setImages(imgData);
            setError(null);
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
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchImages();
    }, [fetchImages]);

    return { images, loading, error, refetch: fetchImages };
}
