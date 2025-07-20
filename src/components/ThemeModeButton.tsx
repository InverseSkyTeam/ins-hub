import { useEffect, useState } from 'react';
import { MoonStar, SunIcon } from 'lucide-react';

export default function ThemeModeButton() {
    const [isDark, setIsDark] = useState(() => {
        const saved = localStorage.getItem('dark');
        if (saved !== null) {
            return saved === 'true';
        }
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    });

    useEffect(() => {
        localStorage.setItem('dark', isDark.toString());

        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDark]);

    const Icon = isDark ? SunIcon : MoonStar;
    const iconColor = isDark ? 'text-yellow-500' : 'text-blue-500';

    return (
        <button onClick={() => setIsDark(!isDark)} aria-label={isDark ? '切换到亮色模式' : '切换到暗色模式'}>
            <Icon className={iconColor} size={35} />
        </button>
    );
}
