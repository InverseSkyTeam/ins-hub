import * as React from 'react';
import { createRoot } from 'react-dom/client';
import '@/styles/index.css';
import App from '@/App.tsx';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/components/theme-provider.tsx';

createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
            <App />
            <Toaster richColors position="top-center" />
        </ThemeProvider>
    </React.StrictMode>
);
