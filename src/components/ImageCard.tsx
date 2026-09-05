import { memo } from 'react';

import { Card, CardContent } from '@/components/ui/card.tsx';
import type { ImageCardProps } from '@/interfaces/image';
import { displayName } from '@/lib/utils';

function ImageCard({ image, onClick }: ImageCardProps) {
    const label = displayName(image.name);
    return (
        <Card
            className="mb-4 break-inside-avoid shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            onClick={onClick}
        >
            <img src={image.url} alt={label} className="w-full h-auto" loading="lazy" />
            <CardContent className="flex items-center justify-center py-3">
                <p className="text-center text-sm font-medium truncate">{label}</p>
            </CardContent>
        </Card>
    );
}

export default memo(ImageCard);
