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

    const enableTransitions = () =>
        'startViewTransition' in document &&
        window.matchMedia('(prefers-reduced-motion: no-preference)').matches;

    async function toggleDark({ clientX: x, clientY: y }: MouseEvent) {
        const isDark = document.documentElement.classList.contains('dark');

        if (!enableTransitions()) {
            setIsDark(!isDark);
            return;
        }

        const endRadius = Math.hypot(
            Math.max(x, window.innerWidth - x),
            Math.max(y, window.innerHeight - y)
        );

        const clipPath = [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`,
        ];

        await document.startViewTransition(() => {
            setIsDark(!isDark);
        }).ready;

        document.documentElement.animate(
            {
                clipPath: isDark ? clipPath : [...clipPath].reverse(),
            },
            {
                duration: 700,
                easing: 'ease-in',
                pseudoElement: isDark
                    ? '::view-transition-new(root)'
                    : '::view-transition-old(root)',
            }
        );
    }

    return (
        <button onClick={toggleDark} aria-label={isDark ? '切换到亮色模式' : '切换到暗色模式'}>
            <Icon className={iconColor} size={35} />
        </button>
    );
}
