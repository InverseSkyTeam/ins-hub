import { hydrate, prerender as preactPrerender } from 'preact-iso';

import { StrictMode } from 'react';
import App from '@/App';
import { Toaster } from 'sonner';
import '@/styles/index.css';

const Root = () => (
    <StrictMode>
        <App />
        <Toaster richColors position="top-center" />
    </StrictMode>
);

if (typeof window !== 'undefined') {
    hydrate(<Root />, document.getElementById('root'));
}

export async function ssrPrerender(data: any) {
    return await preactPrerender(<Root {...data} />);
}
