
import React from 'react';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: React.ReactElement;
  colorClass: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, icon, colorClass }) => {
  return (
    <div className="bg-base-300 rounded-lg shadow-lg p-6 flex items-center justify-between transition-transform transform hover:-translate-y-1 animate-slide-in-up">
      <div>
        <p className="text-sm font-medium text-slate-500 uppercase">{title}</p>
        <p className="text-3xl font-bold text-slate-800">{value}</p>
      </div>
      <div className={`p-4 rounded-full ${colorClass}`}>
        {/* FIX: Cast the icon prop to allow adding a className prop. This is safe because all icons used are SVG components that accept props. */}
        {React.cloneElement(icon as React.ReactElement<any>, { className: "h-8 w-8 text-white" })}
      </div>
    </div>
  );
};

export default DashboardCard;
