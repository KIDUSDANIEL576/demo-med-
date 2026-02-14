
import React from 'react';

interface ChartData {
    name: string;
    value: number;
}

interface BarChartProps {
    data: ChartData[];
}

const BarChart: React.FC<BarChartProps> = ({ data }) => {
    if (!data || !Array.isArray(data) || data.length === 0) {
        return (
            <div className="w-full h-64 bg-base-100 p-4 rounded-lg flex items-center justify-center text-slate-400 italic">
                No chart data available
            </div>
        );
    }

    const maxValue = Math.max(...data.map(d => d.value), 0);

    return (
        <div className="w-full h-64 bg-base-100 p-4 rounded-lg flex items-end justify-around space-x-4">
            {data.map((item, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                    <div
                        className="w-full bg-primary rounded-t-md transition-all duration-500"
                        style={{ height: `${(item.value / (maxValue || 1)) * 100}%` }}
                        title={`${item.name}: ${item.value}`}
                    ></div>
                    <div className="text-xs font-medium text-slate-500 mt-2 text-center">{item.name}</div>
                </div>
            ))}
        </div>
    );
};

export default BarChart;
