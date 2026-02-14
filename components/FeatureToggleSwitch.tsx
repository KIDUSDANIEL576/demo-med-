
import React, { useState } from 'react';
import { FeatureFlag, SubscriptionPlan } from '../types';

interface FeatureToggleSwitchProps {
    feature: FeatureFlag;
}

// Fix: Type '{ Basic: string; Standard: string; Platinum: string; }' is missing the following properties from type 'Record<SubscriptionPlan, string>': "Patient Free", "Patient Paid"
const planColors: Record<SubscriptionPlan, string> = {
    [SubscriptionPlan.BASIC]: 'bg-amber-200 text-amber-800',
    [SubscriptionPlan.STANDARD]: 'bg-green-200 text-green-800',
    [SubscriptionPlan.PLATINUM]: 'bg-sky-200 text-sky-800',
    [SubscriptionPlan.PATIENT_FREE]: 'bg-slate-200 text-slate-800',
    [SubscriptionPlan.PATIENT_PAID]: 'bg-indigo-200 text-indigo-800',
};

const FeatureToggleSwitch: React.FC<FeatureToggleSwitchProps> = ({ feature }) => {
    const [isEnabled, setIsEnabled] = useState(feature.default_enabled);

    const getAvailablePlans = () => {
        return Object.entries(feature.plan_access)
            .filter(([, hasAccess]) => hasAccess)
            .map(([plan]) => plan as SubscriptionPlan);
    }

    return (
        <div className="flex items-center justify-between border border-base-200/80 p-4 rounded-lg hover:bg-base-200/50 transition-colors">
            <div>
                <div className="font-medium text-slate-800">{feature.feature_key.replace(/_/g, ' ')}</div>
                <div className="text-sm text-slate-500">{feature.description}</div>
                <div className="flex items-center gap-2 mt-2">
                    {getAvailablePlans().map(plan => (
                        <span key={plan} className={`px-2 py-0.5 text-xs font-semibold rounded-full ${planColors[plan]}`}>
                            {plan}
                        </span>
                    ))}
                </div>
            </div>
            <div>
                 <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={isEnabled} onChange={() => setIsEnabled(!isEnabled)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-primary/50 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
            </div>
        </div>
    );
};

export default FeatureToggleSwitch;
