import { MoonStar, SunIcon } from 'lucide-react';

import { useTheme } from '@/components/theme-provider.tsx';
import { Button } from '@/components/ui/button.tsx';

function resolveTheme(theme: 'dark' | 'light' | 'system'): 'dark' | 'light' {
    if (theme === 'system') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return theme;
}

export default function ThemeModeButton() {
    const { theme, setTheme } = useTheme();
    const resolvedTheme = resolveTheme(theme);

    const Icon = resolvedTheme === 'dark' ? SunIcon : MoonStar;
    const iconColor = resolvedTheme === 'dark' ? 'text-yellow-500' : 'text-blue-500';

    const enableTransitions = () =>
        'startViewTransition' in document &&
        window.matchMedia('(prefers-reduced-motion: no-preference)').matches;

    async function toggleDark({ clientX: x, clientY: y }: MouseEvent) {
        const nextTheme = resolveTheme(theme) === 'dark' ? 'light' : 'dark';

        if (!enableTransitions()) {
            setTheme(nextTheme);
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
            setTheme(nextTheme);
        }).ready;

        document.documentElement.animate(
            {
                clipPath: nextTheme === 'light' ? clipPath : [...clipPath].reverse(),
            },
            {
                duration: 700,
                easing: 'ease-in',
                pseudoElement:
                    nextTheme === 'light'
                        ? '::view-transition-new(root)'
                        : '::view-transition-old(root)',
            }
        );
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={(e) => toggleDark(e as unknown as MouseEvent)}
            className="h-10 w-10 transition-transform duration-300 hover:scale-110"
            aria-label={resolvedTheme === 'dark' ? '切换到亮色模式' : '切换到暗色模式'}
        >
            <Icon className={`size-7 ${iconColor}`} />
        </Button>
    );
}
