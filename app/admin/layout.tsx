import type { Metadata } from 'next';
import AdminShell from '@/components/admin/AdminShell';

export const metadata: Metadata = {
  title: 'Admin | Travel Unbounded',
  description: 'Administrative portal for Travel Unbounded destination management and enquiries.',
  robots: 'noindex, nofollow',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminShell>{children}</AdminShell>;
}
