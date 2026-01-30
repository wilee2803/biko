import { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import Layout from './components/Layout';
import TrainingSession from './components/TrainingSession';
import TrainingHistory from './components/TrainingHistory';
import DogProfile from './components/DogProfile';

export default function App() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<'training' | 'history' | 'profile'>('training');

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

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'training' && <TrainingSession />}
      {activeTab === 'history' && <TrainingHistory />}
      {activeTab === 'profile' && <DogProfile />}
    </Layout>
  );
}
