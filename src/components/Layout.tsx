import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import LanguageSwitcher from './LanguageSwitcher';

interface Props {
  activeTab: 'training' | 'history' | 'profile' | 'admin';
  onTabChange: (tab: 'training' | 'history' | 'profile') => void;
  children: ReactNode;
  isAdmin?: boolean;
}

export default function Layout({ activeTab, onTabChange, children, isAdmin }: Props) {
  const { t } = useTranslation();
  const { logout } = useAuth();

  const tabs = [
    {
      id: 'training' as const,
      label: t('nav.training'),
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      id: 'history' as const,
      label: t('nav.history'),
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      id: 'profile' as const,
      label: t('nav.profile'),
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <img src="/biko-logo.png" alt="biko" className="h-8" />
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <button
            onClick={logout}
            className="text-xs text-slate-500 hover:text-slate-700"
          >
            {t('auth.logout')}
          </button>
        </div>
      </header>

      {/* Content */}
      <main className={`flex-1 px-4 py-6 max-w-lg mx-auto w-full ${isAdmin ? '' : 'pb-24'}`}>
        {children}
      </main>

      {/* Bottom Navigation - hidden for admin */}
      {!isAdmin && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 safe-area-bottom">
          <div className="flex max-w-lg mx-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex-1 flex flex-col items-center py-2 pt-3 text-xs font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-biko-600'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {tab.icon}
                <span className="mt-0.5">{tab.label}</span>
              </button>
            ))}
          </div>
        </nav>
      )}
    </div>
  );
}
