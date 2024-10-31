import React from 'react';
import { NavHeader } from '../navigation/nav-header';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen relative">
      <NavHeader />
      <main>
        {children}
      </main>
    </div>
  );
}
