import { Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';

export default function NotFound() {
  return (
    <MainLayout>
      <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-5 text-center">
        <p className="h-display text-7xl text-campus-blue-500">404</p>
        <h1 className="h-display mt-4 text-2xl text-campus-ink">This page wandered off campus</h1>
        <p className="mt-2 text-sm text-campus-ink/50">The page you're looking for doesn't exist or has been moved.</p>
        <Link to="/" className="btn-primary mt-6">Back to marketplace</Link>
      </div>
    </MainLayout>
  );
}
