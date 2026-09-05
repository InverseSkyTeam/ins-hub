export { cn } from 'cn';

export function displayName(name: string) {
    return name.replace(/\.[^/.]+$/, '').replace(/-[A-Za-z0-9]{8,}$/, '');
}
