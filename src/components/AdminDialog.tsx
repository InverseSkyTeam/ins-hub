import { useState } from 'react';
import { toast } from 'sonner';
import { KeyRound, LoaderCircle, LogOut } from 'lucide-react';

import { Button } from '@/components/ui/button.tsx';
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

interface AdminDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onEnter: () => void;
}

export default function AdminDialog({ open, onOpenChange, onEnter }: AdminDialogProps) {
    const { valid, loading, login, logout } = useAdmin();
    const [value, setValue] = useState('');
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit() {
        if (!value.trim() || submitting) return;
        setSubmitting(true);
        const ok = await login(value.trim());
        setSubmitting(false);
        if (ok) {
            toast.success('登录成功!', { position: 'top-center' });
            setValue('');
            onEnter();
            onOpenChange(false);
        } else {
            toast.error('登录失败!', {
                description: '令牌不正确',
                position: 'top-center',
            });
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle>管理员登录</DialogTitle>
                    <DialogDescription>
                        输入管理员令牌以进入管理面板。
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    <Input
                        type="password"
                        placeholder="管理员令牌"
                        value={value}
                        autoFocus
                        disabled={loading}
                        onChange={(e) => setValue(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSubmit();
                        }}
                    />

                    {valid && (
                        <p className="text-sm text-muted-foreground">当前已登录管理员。</p>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        type="button"
                        disabled={submitting}
                        onClick={() => onOpenChange(false)}
                    >
                        取消
                    </Button>

                    {valid ? (
                        <Button
                            variant="outline"
                            type="button"
                            disabled={submitting}
                            onClick={() => {
                                logout();
                                onOpenChange(false);
                            }}
                        >
                            <LogOut className="h-4 w-4" />
                            退出登录
                        </Button>
                    ) : (
                        <Button
                            type="button"
                            disabled={!value.trim() || submitting}
                            onClick={handleSubmit}
                        >
                            {submitting ? (
                                <LoaderCircle className="h-4 w-4 animate-spin" />
                            ) : (
                                <KeyRound className="h-4 w-4" />
                            )}
                            {submitting ? '登录中...' : '登录'}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}