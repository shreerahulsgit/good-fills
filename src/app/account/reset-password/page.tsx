import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { ResetPasswordView } from '@/components/account/reset-view';

export const metadata: Metadata = {
    title: 'Reset Your Password',
    description: 'Set a new password to regain access to your Good Fills account and manage your orders and delivery details.',
};

export default function ResetPasswordPage() {
    return (
        <Suspense
        fallback={
            <div style={{ textAlign: 'center', padding: '120px 20px', color: 'var(--text-secondary)' }}>
            Loading password reset...
            </div>
        }
        >
        <ResetPasswordView />
        </Suspense>
    );
}