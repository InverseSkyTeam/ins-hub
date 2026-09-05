import { memo } from 'react';

import { Card, CardContent } from '@/components/ui/card.tsx';
import type { ImageCardProps } from '@/interfaces/image';

function ImageCard({ image, onClick }: ImageCardProps) {
    return (
        <Card
            className="mb-4 break-inside-avoid shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            onClick={onClick}
        >
            <img
                src={image.url}
                alt={image.name.replace(/\.[^/.]+$/, '')}
                className="w-full h-auto"
                loading="lazy"
            />
            <CardContent className="flex items-center justify-center py-3">
                <p className="text-center text-sm font-medium truncate">
                    {image.name.replace(/\.[^/.]+$/, '')}
                </p>
            </CardContent>
        </Card>
    );
}

export default memo(ImageCard);
