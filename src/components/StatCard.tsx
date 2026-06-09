import { StatCardProps } from "@/types";

const trendColors = {
  up: "text-green-600",
  down: "text-red-600",
  neutral: "text-gray-600",
};

const trendIcons = {
  up: "↑",
  down: "↓",
  neutral: "→",
};

const StatCard = ({ title, value, icon, color = "bg-white", trend, trendValue }: StatCardProps) => {
  return (
    <div className={`border-4 border-black ${color} p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all duration-150`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-wider text-black/70 dark:text-white/70">{title}</p>
          <p className="text-4xl font-black mt-2 text-black dark:text-white">{value}</p>
          {trend && trendValue && (
            <p className={`text-sm font-bold mt-2 ${trendColors[trend]}`}>
              {trendIcons[trend]} {trendValue}
            </p>
          )}
        </div>
        {icon && (
          <div className="border-4 border-black p-3 bg-nb-yellow shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
