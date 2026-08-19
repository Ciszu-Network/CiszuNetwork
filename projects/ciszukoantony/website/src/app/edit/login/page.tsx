import AdminLoginForm from './admin-login-form';

export const metadata = {
  title: 'Acceso de administración — Ciszuko Antony',
  robots: { index: false, follow: false },
};

export default function EditLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const from = searchParams.then((s) => s.from ?? '/edit/home');
  return <AdminLoginForm from={from} />;
}