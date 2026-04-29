import { useAuth } from './lib/useAuth';
import { AuthPage } from './pages/AuthPage';
import { TimelinePage } from './pages/TimelinePage';

export default function App() {
  const { session, loading } = useAuth();

  if (loading) {
    return <div className="x-loading">読み込み中…</div>;
  }

  if (!session) {
    return <AuthPage />;
  }

  return <TimelinePage session={session} />;
}
