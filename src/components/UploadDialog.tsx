import { useCallback, useRef, useState } from 'react';
import { toast } from 'sonner';
import { upload } from '@vercel/blob/client';
import { ImagePlus, LoaderCircle } from 'lucide-react';

import { Button } from '@/components/ui/button.tsx';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog.tsx';

interface UploadDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onUploaded: (pathname: string) => void;
}

function formatBytes(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function UploadDialog({ open, onOpenChange, onUploaded }: UploadDialogProps) {
    const fileRef = useRef<HTMLInputElement>(null);
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

    const reset = useCallback(() => {
        setFile(null);
        setPreview(null);
        if (fileRef.current) fileRef.current.value = '';
    }, []);

    function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
        const next = event.target.files?.[0] ?? null;
        setFile(next);
        if (preview) URL.revokeObjectURL(preview);
        setPreview(next ? URL.createObjectURL(next) : null);
    }

    async function handleSubmit() {
        if (!file) return;
        if (file.size > 10 * 1024 * 1024) {
            toast.error('文件过大!', {
                description: '图片不能超过 10MB',
                position: 'top-center',
            });
            return;
        }
        setUploading(true);
        try {
            const result = await upload(`images/${file.name}`, file, {
                access: 'public',
                clientPayload: JSON.stringify({ size: file.size, originalName: file.name }),
                handleUploadUrl: '/api/upload',
            });
            toast.success('上传成功!', { position: 'top-center' });
            onOpenChange(false);
            onUploaded(result.pathname);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : '上传失败，请稍后再试';
            toast.error('上传失败!', {
                description: message,
                position: 'top-center',
                duration: 4000,
            });
        } finally {
            setUploading(false);
        }
    }

    return (
        <Dialog
            open={open}
            onOpenChange={(next) => {
                onOpenChange(next);
                if (!next) reset();
            }}
        >
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>上传新发言</DialogTitle>
                    <DialogDescription>
                        选择一张图片上传到图库，上传成功后自动刷新。
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/30 p-8 text-muted-foreground transition-colors hover:border-muted-foreground/60 hover:bg-muted/60">
                        <ImagePlus className="h-8 w-8" />
                        <span className="text-sm font-medium">点击选择图片</span>
                        <span className="text-xs">支持 png / jpg / webp / gif，最大 10MB</span>
                        <input
                            ref={fileRef}
                            type="file"
                            accept="image/png,image/jpeg,image/webp,image/gif"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                    </label>

                    {preview && (
                        <div className="flex justify-center overflow-hidden rounded-lg">
                            <img
                                src={preview}
                                alt="预览"
                                className="max-h-56 rounded-lg object-contain"
                            />
                        </div>
                    )}

                    {file && (
                        <p className="text-sm text-muted-foreground">
                            {file.name}（{formatBytes(file.size)}）
                        </p>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        type="button"
                        disabled={uploading}
                        onClick={() => onOpenChange(false)}
                    >
                        取消
                    </Button>
                    <Button type="button" disabled={!file || uploading} onClick={handleSubmit}>
                        {uploading && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        {uploading ? '上传中...' : '上传'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
