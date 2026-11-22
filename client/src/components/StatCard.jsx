import Icon from './Icon';

const tones = {
  green: 'bg-brand-soft text-brand',
  gold: 'bg-[#f6e7d2] text-[#a8691f]',
  blue: 'bg-[#e0ecf7] text-[#2c5d8a]',
};

// A small box with an icon, a label and a big number
export default function StatCard({ icon, label, value, tone = 'green' }) {
  return (
    <div className="card p-4 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${tones[tone]}`}>
        <Icon name={icon} size={22} />
      </div>
      <div className="min-w-0">
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-display font-semibold text-brand truncate">{value}</p>
      </div>
    </div>
  );
}