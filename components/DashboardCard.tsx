
import React from 'react';
import { motion } from 'motion/react';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: React.ReactElement;
  colorClass: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, icon, colorClass }) => {
  return (
    <motion.div 
      whileHover={{ y: -5, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.08)" }}
      className="bg-white rounded-[2.5rem] p-8 flex items-center justify-between border border-slate-100 shadow-sm transition-all relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 group-hover:bg-primary/5 transition-colors" />
      
      <div className="relative z-10 space-y-2">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{title}</p>
        <p className="text-4xl font-black text-slate-900 tracking-tighter">{value}</p>
      </div>
      
      <div className={`relative z-10 p-5 rounded-2xl shadow-xl transition-transform group-hover:scale-110 group-hover:rotate-3 ${colorClass}`}>
        {React.cloneElement(icon as React.ReactElement<any>, { className: "h-7 w-7 text-white" })}
      </div>
    </motion.div>
  );
};

export default DashboardCard;

