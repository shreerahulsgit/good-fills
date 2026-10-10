import type { Metadata } from 'next';

export const metadata: Metadata = {
    manifest: '/console/manifest.json',
};

export default function ConsoleLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}