// components/layout/LandingLayout.js
import PublicHeader from './PublicHeader';
import PublicFooter from './PublicFooter';

export default function LandingLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}