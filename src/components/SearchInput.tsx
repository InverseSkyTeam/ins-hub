import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input.tsx';
import { cn } from '@/lib/utils';

import type { SearchInputProps } from '@/interfaces/search';

export default function SearchInput({ value, onChange, className }: SearchInputProps) {
    return (
        <div className={cn('relative w-full max-w-md', className)}>
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <Input
                type="text"
                placeholder="搜索逆天发言..."
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="rounded-full bg-white/70 py-2 pr-10 pl-10 dark:bg-gray-800/70"
            />
        </div>
    );
}
