// components/layout/AppLayout.js (Authenticated Layout)
import { useRouter } from 'next/router';
import { useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';

export default function AppLayout({ children }) {
  const router = useRouter();
  const { user, isLoading } = useContext(AuthContext);

  // Redirect to login if not authenticated
  if (!isLoading && !user) {
    router.push('/auth/login');
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-slate-900">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}