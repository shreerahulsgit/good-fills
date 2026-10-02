import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { ResetPasswordView } from '@/components/account/ResetPasswordView';

export const metadata: Metadata = {
  title: 'Reset Password • Good Fills Bengaluru Atelier',
  description: 'Create a new secure password for your Good Fills customer account.',
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
