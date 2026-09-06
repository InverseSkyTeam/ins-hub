import { useState } from 'react';
import { toast } from 'sonner';
import {
    ArrowDown,
    ArrowDownToLine,
    ArrowLeft,
    ArrowUp,
    ArrowUpToLine,
    LoaderCircle,
    LogOut,
    Pencil,
    ShieldCheck,
    Trash2,
} from 'lucide-react';

import { Button } from '@/components/ui/button.tsx';
import { Card } from '@/components/ui/card.tsx';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog.tsx';
import { Input } from '@/components/ui/input.tsx';
import { useAdmin } from '@/hooks/useAdmin';
import type { Image } from '@/interfaces/image';
import { displayName } from '@/lib/utils';

interface AdminPanelProps {
    images: Image[];
    refetch: () => Promise<Image[]>;
    onBack: () => void;
}

type ReorderDirection = 'up' | 'down' | 'top' | 'bottom';

export default function AdminPanel({ images, refetch, onBack }: AdminPanelProps) {
    const { valid, logout, run } = useAdmin();

    const [busy, setBusy] = useState<string | null>(null);
    const [renaming, setRenaming] = useState<Image | null>(null);
    const [renameValue, setRenameValue] = useState('');
    const [deleting, setDeleting] = useState<Image | null>(null);

    async function act(pathname: string, action: string, body: Record<string, unknown> = {}) {
        setBusy(pathname);
        try {
            await run(action, { pathname, ...body });
            toast.success('操作成功!', { position: 'top-center' });
            await refetch();
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : '操作失败，请稍后再试';
            toast.error('操作失败!', {
                description: message,
                position: 'top-center',
            });
        } finally {
            setBusy(null);
        }
    }

    function move(img: Image, direction: ReorderDirection) {
        return act(img.pathname, 'reorder', { direction });
    }

    function openRename(img: Image) {
        setRenameValue(displayName(img.name));
        setRenaming(img);
    }

    async function submitRename() {
        if (!renaming) return;
        const name = renameValue.trim();
        if (!name) return;
        await act(renaming.pathname, 'rename', { name });
        setRenaming(null);
    }

    async function confirmDelete() {
        if (!deleting) return;
        await act(deleting.pathname, 'delete');
        setDeleting(null);
    }

    if (!valid) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <ShieldCheck className="h-10 w-10 text-gray-400" />
                <h3 className="mt-4 text-xl font-medium text-gray-900 dark:text-white">
                    会话已失效
                </h3>
                <p className="mt-2 text-gray-600 dark:text-gray-400">请点击右上角图标重新登录。</p>
                <Button onClick={onBack} className="mt-4">
                    返回图库
                </Button>
            </div>
        );
    }

    const isBusy = (pathname: string) => busy !== null && busy === pathname;
    const first = (pathname: string) => busy !== null || pathname === images[0]?.pathname;
    const last = (pathname: string) =>
        busy !== null || pathname === images[images.length - 1]?.pathname;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={onBack} aria-label="返回图库">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="text-xl font-bold">管理员面板</h1>
                </div>
                <div className="flex items-center gap-2">
                    <span className="hidden text-sm text-muted-foreground sm:inline">
                        共 {images.length} 张
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            logout();
                            onBack();
                        }}
                    >
                        <LogOut className="h-4 w-4" />
                        退出登录
                    </Button>
                </div>
            </div>

            <div className="space-y-2">
                {images.length === 0 && (
                    <div className="text-center py-16 text-gray-600 dark:text-gray-400">
                        还没有图片。
                    </div>
                )}

                {images.map((img) => (
                    <Card key={img.id} size="sm" className="flex items-center gap-3 p-3">
                        <img
                            src={img.url}
                            alt={displayName(img.name)}
                            loading="lazy"
                            className="h-14 w-14 shrink-0 rounded-lg object-cover"
                        />

                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">{displayName(img.name)}</p>
                            <p className="truncate text-xs text-muted-foreground">{img.name}</p>
                        </div>

                        <div className="flex shrink-0 items-center gap-1">
                            <Button
                                variant="ghost"
                                size="icon-sm"
                                disabled={first(img.id) || isBusy(img.id)}
                                onClick={() => move(img, 'up')}
                                aria-label="上移"
                                title="上移"
                            >
                                <ArrowUp />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon-sm"
                                disabled={last(img.id) || isBusy(img.id)}
                                onClick={() => move(img, 'down')}
                                aria-label="下移"
                                title="下移"
                            >
                                <ArrowDown />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon-sm"
                                disabled={first(img.id) || isBusy(img.id)}
                                onClick={() => move(img, 'top')}
                                aria-label="置顶"
                                title="置顶"
                            >
                                <ArrowUpToLine />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon-sm"
                                disabled={last(img.id) || isBusy(img.id)}
                                onClick={() => move(img, 'bottom')}
                                aria-label="置底"
                                title="置底"
                            >
                                <ArrowDownToLine />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon-sm"
                                disabled={busy !== null}
                                onClick={() => openRename(img)}
                                aria-label="重命名"
                                title="重命名"
                            >
                                {isBusy(img.id) ? (
                                    <LoaderCircle className="animate-spin" />
                                ) : (
                                    <Pencil />
                                )}
                            </Button>
                            <Button
                                variant="destructive"
                                size="icon-sm"
                                disabled={busy !== null}
                                onClick={() => setDeleting(img)}
                                aria-label="删除"
                                title="删除"
                            >
                                <Trash2 />
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>

            <Dialog
                open={renaming !== null}
                onOpenChange={(open) => {
                    if (!open) setRenaming(null);
                }}
            >
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>重命名</DialogTitle>
                        <DialogDescription>输入新的名称，扩展名会自动保留。</DialogDescription>
                    </DialogHeader>

                    <Input
                        type="text"
                        value={renameValue}
                        autoFocus
                        onChange={(e) => setRenameValue(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') submitRename();
                        }}
                    />

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRenaming(null)}>
                            取消
                        </Button>
                        <Button disabled={!renameValue.trim()} onClick={submitRename}>
                            保存
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog
                open={deleting !== null}
                onOpenChange={(open) => {
                    if (!open) setDeleting(null);
                }}
            >
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>删除图片</DialogTitle>
                        <DialogDescription>
                            确定要删除「{deleting ? displayName(deleting.name) : ''}」吗？此操作无法撤销。
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleting(null)}>
                            取消
                        </Button>
                        <Button variant="destructive" onClick={confirmDelete}>
                            删除
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}