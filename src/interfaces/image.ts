export interface Image {
    id: string;
    name: string;
    path: string;
    download_url: string;
}

export interface ImageCardProps {
    image: Image;
    onClick: () => void;
}

export interface ImageModalProps {
    image: Image | null;
    onClose: () => void;
}