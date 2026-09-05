import { X } from 'lucide-react';

import { Button } from '@/components/ui/button.tsx';
import { Dialog, DialogClose, DialogContent, DialogTitle } from '@/components/ui/dialog.tsx';
import type { ImageModalProps } from '@/interfaces/image';
import { displayName } from '@/lib/utils';

export default function ImageModal({ image, onClose }: ImageModalProps) {
    return (
        <Dialog
            open={image !== null}
            onOpenChange={(open) => {
                if (!open) onClose();
            }}
        >
            <DialogContent
                className="max-w-4xl max-h-[90vh] overflow-y-auto bg-background"
                showCloseButton={false}
            >
                <DialogTitle className="sr-only">
                    {image ? displayName(image.name) : ''}
                </DialogTitle>

                {image && (
                    <>
                        <img
                            src={image.url}
                            alt={displayName(image.name)}
                            className="w-full rounded-lg shadow-lg"
                        />

                        <div className="mt-1">
                            <h2 className="text-xl font-bold">{displayName(image.name)}</h2>
                        </div>
                    </>
                )}

                <DialogClose asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-4 right-4 z-10 h-9 w-9 rounded-full bg-black/50 text-white hover:bg-black/70 hover:text-white"
                        aria-label="关闭"
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </DialogClose>
            </DialogContent>
        </Dialog>
    );
}
