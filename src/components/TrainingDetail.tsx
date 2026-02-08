import { useTranslation } from 'react-i18next';
import { Training } from '../types';
import { useState } from 'react';

interface Props {
  training: Training;
  dogName?: string;
  onBack: () => void;
  onDelete: () => Promise<void>;
}

export default function TrainingDetail({ training, dogName, onBack, onDelete }: Props) {
  const { t, i18n } = useTranslation();
  const [confirming, setConfirming] = useState(false);

  const mins = Math.floor(training.duration / 60);
  const secs = training.duration % 60;
  const locale = i18n.language === 'de' ? 'de-DE' : 'en-US';
  const date = training.startTime.toLocaleDateString(locale, {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  const startTime = training.startTime.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
  });
  const endTime = training.endTime.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="space-y-4">
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-biko-600 text-sm font-medium"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        {t('history.title')}
      </button>

      <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
        {dogName && (
          <p className="text-sm font-medium text-biko-600">{dogName}</p>
        )}
        <p className="text-sm text-slate-500">{date}</p>
        <p className="text-sm text-slate-500">{startTime} – {endTime}</p>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="bg-slate-50 rounded-xl p-4 text-center">
            <p className="text-xs text-slate-500 mb-1">{t('training.duration')}</p>
            <p className="text-2xl font-bold text-slate-800">
              {mins}<span className="text-sm text-slate-400">m</span>{' '}
              {secs}<span className="text-sm text-slate-400">s</span>
            </p>
          </div>
          <div className="bg-slate-50 rounded-xl p-4 text-center">
            <p className="text-xs text-slate-500 mb-1">{t('training.distance')}</p>
            <p className="text-2xl font-bold text-biko-600">
              {Math.round(training.distance)}<span className="text-sm text-slate-400">m</span>
            </p>
          </div>
        </div>

        <div className="flex justify-center">
          <span className="inline-block px-3 py-1 bg-biko-100 text-biko-700 text-sm font-medium rounded-full">
            {t('training.bandStrength')}: {training.bandStrength}
          </span>
        </div>

        {training.route.length > 0 && (
          <div className="pt-2 border-t border-slate-100">
            <p className="text-sm text-slate-500">
              {t('history.routePoints')}: {training.route.length}
            </p>
          </div>
        )}
      </div>

      <div className="pt-2">
        {!confirming ? (
          <button
            onClick={() => setConfirming(true)}
            className="w-full py-2.5 border border-red-300 text-red-500 rounded-xl text-sm font-medium hover:bg-red-50 transition-colors"
          >
            {t('history.delete')}
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={() => setConfirming(false)}
              className="flex-1 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-medium"
            >
              {t('history.title')}
            </button>
            <button
              onClick={onDelete}
              className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-medium"
            >
              {t('history.confirmDelete')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
