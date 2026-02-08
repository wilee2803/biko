import { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import Layout from './components/Layout';
import TrainingSession from './components/TrainingSession';
import TrainingHistory from './components/TrainingHistory';
import ProfilePage from './components/ProfilePage';
import AdminPage from './components/AdminPage';

function ConfigMissing() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md text-center">
        <h1 className="text-3xl font-bold text-biko-800 mb-4">biko</h1>
        <div className="bg-white rounded-2xl shadow-sm p-6 text-left space-y-4">
          <h2 className="text-lg font-semibold text-red-600">Firebase nicht konfiguriert</h2>
          <p className="text-sm text-slate-600">
            Erstelle eine <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs font-mono">.env</code> Datei
            im Projektverzeichnis mit deinen Firebase-Zugangsdaten:
          </p>
          <pre className="bg-slate-900 text-green-400 text-xs p-4 rounded-lg overflow-x-auto">
{`VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...`}
          </pre>
          <p className="text-xs text-slate-500">
            Starte danach den Dev-Server neu mit <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono">npm run dev</code>.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const { user, loading, configMissing, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'training' | 'history' | 'profile' | 'admin'>('training');

  if (configMissing) {
    return <ConfigMissing />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-biko-600" />
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  if (isAdmin) {
    return (
      <Layout activeTab="admin" onTabChange={() => {}} isAdmin>
        <AdminPage />
      </Layout>
    );
  }

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'training' && <TrainingSession />}
      {activeTab === 'history' && <TrainingHistory />}
      {activeTab === 'profile' && <ProfilePage />}
    </Layout>
  );
}
