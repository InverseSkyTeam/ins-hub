import { Search } from 'lucide-react';

interface SearchInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export default function SearchInput({ value, onChange, placeholder = "搜索逆天发言...", className = "" }: SearchInputProps) {
    return (
        <div className={`form-control ${className}`}>
            <label className="input input-bordered flex items-center gap-2 bg-white/70 dark:bg-base-200/70 border-base-300 dark:border-base-600">
                <Search className="h-4 w-4 opacity-70" />
                <input
                    type="text"
                    className="grow"
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                />
            </label>
        </div>
    );
}