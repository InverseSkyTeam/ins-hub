import { Search } from 'lucide-react';

interface SearchInputProps {
    value: string;
    onChange: (value: string) => void;
}

export default function SearchInput({ value, onChange }: SearchInputProps) {
    return (
        <div className="hidden md:flex relative w-full max-w-md h-12">
            <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-500 dark:text-gray-400" />

            <input
                type="text"
                placeholder="搜索逆天发言..."
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className=" dark:text-gray-400 w-full bg-white/70 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700 rounded-full py-2 px-10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
        </div>
    );
}
