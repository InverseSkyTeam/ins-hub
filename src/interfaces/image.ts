export interface Image {
    id: string;
    name: string;
    pathname: string;
    url: string;
    size?: number;
    contentType?: string;
    uploadedAt?: string;
}

export interface ImageCardProps {
    image: Image;
    onClick: () => void;
}

export interface ImageModalProps {
    image: Image | null;
    onClose: () => void;
}
