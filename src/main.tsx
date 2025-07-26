import * as React from 'react';
import { createRoot } from 'react-dom/client';
import '@/styles/index.css';
import App from '@/App.tsx';
import { Toaster } from 'sonner';

createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
        <Toaster richColors position="top-center" />
    </React.StrictMode>
);
