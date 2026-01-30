import { useTranslation } from 'react-i18next';

const EXPANDER_SIZES = ['1', '2', '3', '4', '5', '6', '7'];
const CUFF_SIZES = ['1', '2', '3', '4'];

interface Props {
  expanderSize: string;
  cuffSize: string;
  onChange: (field: 'expanderSize' | 'cuffSize', value: string) => void;
}

export default function EquipmentSettings({ expanderSize, cuffSize, onChange }: Props) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4 pt-2 border-t border-slate-100">
      <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
        {t('equipment.title')}
      </h3>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          {t('equipment.expanderSize')}
        </label>
        <div className="flex gap-2">
          {EXPANDER_SIZES.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => onChange('expanderSize', size)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                expanderSize === size
                  ? 'bg-biko-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          {t('equipment.cuffSize')}
        </label>
        <div className="flex gap-2">
          {CUFF_SIZES.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => onChange('cuffSize', size)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                cuffSize === size
                  ? 'bg-biko-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
