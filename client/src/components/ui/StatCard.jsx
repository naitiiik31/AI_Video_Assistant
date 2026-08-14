export default function StatCard({ icon: Icon, title, label, value, color = 'purple' }) {
  const displayLabel = title || label || '';

  const colorMap = {
    purple: 'text-[#8B5CF6] bg-[#6C35E8]/15 border border-[#6C35E8]/20',
    cyan: 'text-[#22D3EE] bg-[#22D3EE]/15 border border-[#22D3EE]/20',
    green: 'text-[#20D6A0] bg-[#20D6A0]/15 border border-[#20D6A0]/20',
    amber: 'text-amber-400 bg-amber-400/15 border border-amber-400/20',
  };

  return (
    <div className="bg-[rgba(12,15,35,0.75)] border border-white/12 rounded-[14px] p-6 min-h-[114px] flex items-center justify-between shadow-lg">
      <div className="min-w-0 flex-1 pr-2">
        <p className="text-[15px] font-medium text-[#8C8FA5] leading-[1.4] mb-1.5 truncate">
          {displayLabel}
        </p>
        <p className="text-[28px] font-bold text-[#F5F5FA] leading-[1.2] tracking-tight">
          {value !== undefined && value !== null ? value : 0}
        </p>
      </div>

      {Icon && (
        <div className={`w-[52px] h-[52px] rounded-[12px] flex items-center justify-center shrink-0 ${colorMap[color] || colorMap.purple}`}>
          <Icon className="w-6 h-6 shrink-0" />
        </div>
      )}
    </div>
  );
}
