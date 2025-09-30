"use client";

import { usePathname } from 'next/navigation';
import { Navbar } from './index';

export const ConditionalNavbar = () => {
  const pathname = usePathname();

  // Don't show navbar for problem pages and admin routes
  const shouldHideNavbar = pathname?.startsWith('/problems/') || pathname?.startsWith('/admin');

  if (shouldHideNavbar) {
    return null;
  }

  return <Navbar />;
}; 