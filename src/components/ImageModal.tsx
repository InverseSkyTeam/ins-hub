import { X } from 'lucide-react';

interface Image {
    id: string;
    name: string;
    path: string;
    download_url: string;
}

interface ImageModalProps {
    image: Image | null;
    onClose: () => void;
}

export default function ImageModal({ image, onClose }: ImageModalProps) {
    if (!image) return null;

    return (
        <div
            className="fixed inset-0 bg-black/80 backdrop-blur-lg z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                className="relative bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-all"
                >
                    <X className="text-white w-5 h-5" />
                </button>

                <div className="p-4">
                    <img
                        src={`http://ins-hub.lrsgzs.top/images/${image.name}`}
                        alt={image.name}
                        className="w-full rounded-lg shadow-lg"
                    />

                    <div className="mt-4">
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                            {image.name.replace(/\.[^/.]+$/, '')}
                        </h2>
                    </div>
                </div>
            </div>
        </div>
    );
}
