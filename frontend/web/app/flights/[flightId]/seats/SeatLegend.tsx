import { Circle } from "lucide-react";

export default function SeatLegend() {
  const legends = [
    {
      label: "Available",
      colorClass: "bg-white/20 border-white/60 border border-white/40 shadow-[inset_0_4px_10px_rgba(255,255,255,0.7),inset_0_-2px_10px_rgba(0,0,0,0.05),0_8px_20px_rgba(0,0,0,0.05)] backdrop-blur-xl",
      isOutline: false // changed to false so it uses rounded-[10px] instead of rounded-full
    },
    {
      label: "Selected",
      colorClass: "bg-blue-500 border-blue-400 shadow-[0_2px_8px_rgba(59,130,246,0.25)]",
    },
    {
      label: "Occupied",
      colorClass: "bg-slate-300 border-slate-400 opacity-60",
    },
    {
      label: "Hold",
      colorClass: "bg-yellow-100/80 border-yellow-300/80",
    }
  ];

  return (
    <div className="flex flex-col items-start gap-4 py-2 w-full">
      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-slate-200/50 pb-2 w-full">Seat Status</span>
      <div className="flex flex-col gap-4 mt-1">
        {legends.map((legend) => (
          <div key={legend.label} className="flex items-center gap-3">
            <div
              className={`relative flex shrink-0 items-center justify-center w-5 h-5 border-[1.5px] ${legend.colorClass} transition-all ${legend.isOutline ? 'rounded-md' : 'rounded-md before:absolute before:inset-x-[2px] before:-top-[1px] before:h-[1px] before:rounded-t-sm before:bg-white/20'}`}
            >
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{legend.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}