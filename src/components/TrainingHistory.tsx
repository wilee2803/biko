import { useTranslation } from 'react-i18next';
import { useTrainings } from '../hooks/useTraining';
import TrainingDetail from './TrainingDetail';
import { useState } from 'react';
import { Training } from '../types';

export default function TrainingHistory() {
  const { t, i18n } = useTranslation();
  const { trainings, loading, error, deleteTraining } = useTrainings();
  const [selected, setSelected] = useState<Training | null>(null);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-biko-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-800">{t('history.title')}</h2>
        <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
          <p className="text-red-500 text-sm">{t('history.error')}</p>
          <p className="text-slate-400 text-xs mt-2">{error}</p>
        </div>
      </div>
    );
  }

  if (selected) {
    return (
      <TrainingDetail
        training={selected}
        onBack={() => setSelected(null)}
        onDelete={async () => {
          await deleteTraining(selected.id);
          setSelected(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-slate-800">{t('history.title')}</h2>

      {trainings.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
          <p className="text-slate-500">{t('history.noTrainings')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {trainings.map((training) => {
            const mins = Math.floor(training.duration / 60);
            const secs = training.duration % 60;
            const date = training.startTime.toLocaleDateString(
              i18n.language === 'de' ? 'de-DE' : 'en-US',
              { day: '2-digit', month: '2-digit', year: 'numeric' }
            );
            const time = training.startTime.toLocaleTimeString(
              i18n.language === 'de' ? 'de-DE' : 'en-US',
              { hour: '2-digit', minute: '2-digit' }
            );

            return (
              <button
                key={training.id}
                onClick={() => setSelected(training)}
                className="w-full bg-white rounded-2xl shadow-sm p-4 text-left hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-slate-500">{date} &middot; {time}</p>
                    <p className="font-semibold text-slate-800 mt-0.5">
                      {mins} {t('history.minutes')} {secs} {t('history.seconds')}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-2 py-0.5 bg-biko-100 text-biko-700 text-xs font-medium rounded-full">
                      {t('history.band')} {training.bandStrength}
                    </span>
                    <p className="text-sm text-slate-600 mt-1">
                      {Math.round(training.distance)} {t('history.meters')}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
