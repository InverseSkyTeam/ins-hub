import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import { resolve } from 'path';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    plugins: [preact(), tailwindcss()],
    resolve: {
        alias: {
            react: 'preact/compat',
            'react-dom': 'preact/compat',
            '@': resolve(__dirname, './src'),
        },
    },
});
