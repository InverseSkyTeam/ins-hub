import { memo } from 'react';

interface Image {
    id: string;
    name: string;
    path: string;
    download_url: string;
}

interface ImageCardProps {
    image: Image;
    onClick: () => void;
}

function ImageCard({ image, onClick }: ImageCardProps) {
    return (
        <div
            className="card card-compact mb-4 break-inside-avoid bg-base-100/80 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1"
            onClick={onClick}
        >
            <figure>
                <img
                    src={`http://ins-hub.lrsgzs.top/images/${image.name}`}
                    alt={image.name.replace(/\.[^/.]+$/, '')}
                    className="w-full h-auto"
                    loading="lazy"
                />
            </figure>
            <div className="card-body">
                <p className="card-title justify-center text-sm font-medium truncate">
                    {image.name.replace(/\.[^/.]+$/, '')}
                </p>
            </div>
        </div>
    );
}

export default memo(ImageCard);