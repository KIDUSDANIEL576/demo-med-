
import React from 'react';

// --- Line Chart Component ---
interface LineChartProps {
    data: { label: string; value: number; value2?: number }[];
    color1?: string;
    color2?: string;
    height?: number;
}

export const LineChart: React.FC<LineChartProps> = ({ data = [], color1 = '#007E85', color2 = '#34D399', height = 200 }) => {
    const safeData = data || [];
    if (safeData.length === 0) {
        return <div className="flex items-center justify-center h-full text-slate-400 italic">No trend data</div>;
    }

    const maxValue = Math.max(...safeData.map(d => Math.max(d.value, d.value2 || 0)), 1);
    const padding = 20;
    const width = 600; // viewBox width
    const chartHeight = height;
    
    // Scale functions
    const getX = (index: number) => padding + (index / (safeData.length > 1 ? safeData.length - 1 : 1)) * (width - 2 * padding);
    const getY = (val: number) => chartHeight - padding - (val / maxValue) * (chartHeight - 2 * padding);

    const points1 = safeData.map((d, i) => `${getX(i)},${getY(d.value)}`).join(' ');
    const points2 = safeData[0]?.value2 !== undefined ? safeData.map((d, i) => `${getX(i)},${getY(d.value2!)}`).join(' ') : '';

    return (
        <svg viewBox={`0 0 ${width} ${chartHeight}`} className="w-full h-full overflow-visible">
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((tick) => (
                <line 
                    key={tick} 
                    x1={padding} 
                    y1={getY(tick * maxValue)} 
                    x2={width - padding} 
                    y2={getY(tick * maxValue)} 
                    stroke="#e5e7eb" 
                    strokeWidth="1" 
                />
            ))}
            
            {/* Series 1 Line */}
            <polyline fill="none" stroke={color1} strokeWidth="3" points={points1} strokeLinecap="round" strokeLinejoin="round" />
            
            {/* Series 2 Line (Optional) */}
            {points2 && <polyline fill="none" stroke={color2} strokeWidth="3" points={points2} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="5,5" />}

            {/* Labels */}
            {safeData.map((d, i) => (
                <g key={i}>
                    {(i % Math.ceil(safeData.length / 6) === 0) && (
                         <text x={getX(i)} y={chartHeight} textAnchor="middle" fontSize="10" fill="#6b7280">{d.label}</text>
                    )}
                </g>
            ))}
        </svg>
    );
};

// --- Donut Chart Component ---
interface DonutChartProps {
    data: { name: string; value: number; color: string }[];
    size?: number;
}

export const DonutChart: React.FC<DonutChartProps> = ({ data = [], size = 200 }) => {
    const safeData = data || [];
    if (safeData.length === 0) {
        return <div className="flex items-center justify-center h-full text-slate-400 italic">No distribution data</div>;
    }

    const total = safeData.reduce((acc, cur) => acc + cur.value, 0);
    if (total === 0) return <div className="flex items-center justify-center h-full text-slate-400 italic">Empty set</div>;

    let cumulativeAngle = 0;
    
    const center = size / 2;
    const radius = size / 2 - 20;

    return (
        <div className="flex flex-col items-center">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                {safeData.map((slice, i) => {
                    const startAngle = cumulativeAngle;
                    const sliceAngle = slice.value / total;
                    cumulativeAngle += sliceAngle;
                    
                    const circumference = 2 * Math.PI * (radius - 15); // Adjust for stroke width
                    const strokeVal = sliceAngle * circumference;
                    const dashOffset = -startAngle * circumference;
                    
                    return (
                        <circle
                            key={i}
                            r={radius - 15}
                            cx={center}
                            cy={center}
                            fill="transparent"
                            stroke={slice.color}
                            strokeWidth={30}
                            strokeDasharray={`${strokeVal} ${circumference}`}
                            strokeDashoffset={dashOffset}
                            transform={`rotate(-90 ${center} ${center})`}
                        />
                    );
                })}
                <text x="50%" y="50%" textAnchor="middle" dy=".3em" fontSize="24" fontWeight="bold" fill="#374151">
                    {total}
                </text>
            </svg>
            <div className="flex flex-wrap gap-4 justify-center mt-4">
                {safeData.map((slice, i) => (
                    <div key={i} className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: slice.color }}></div>
                        <span className="text-xs text-slate-600">{slice.name} ({Math.round(slice.value / total * 100)}%)</span>
                    </div>
                ))}
            </div>
        </div>
    );
};
