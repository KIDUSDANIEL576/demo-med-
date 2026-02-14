
import React, { useState, useEffect } from 'react';
import { getHolidayThemes, createHolidayTheme, toggleHolidayTheme } from '../../services/mockApi';
import { HolidayTheme } from '../../types';

const HolidayThemes: React.FC = () => {
    const [themes, setThemes] = useState<HolidayTheme[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newTheme, setNewTheme] = useState<{
        name: string;
        message: string;
        color: string;
        bgUrl: string;
        mode: 'light' | 'dark' | 'holiday';
    }>({ name: '', message: '', color: '#C82A3A', bgUrl: '', mode: 'holiday' });
    const [bgPreview, setBgPreview] = useState<string | null>(null);

    useEffect(() => {
        fetchThemes();
    }, []);

    const fetchThemes = () => getHolidayThemes().then(setThemes);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        await createHolidayTheme({
            name: newTheme.name,
            message: newTheme.message,
            themePayload: { 
                primaryColor: newTheme.color, 
                backgroundImage: newTheme.bgUrl,
                themeMode: newTheme.mode
            },
        });
        setNewTheme({ name: '', message: '', color: '#C82A3A', bgUrl: '', mode: 'holiday' });
        setBgPreview(null);
        setIsModalOpen(false);
        fetchThemes();
    };

    const handleToggle = async (theme: HolidayTheme) => {
        const shouldBroadcast = !theme.isActive && window.confirm("Do you want to broadcast the holiday message to all tenants now?");
        await toggleHolidayTheme(theme.id, !theme.isActive, shouldBroadcast);
        fetchThemes();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { 
                alert("File is too large. Please select an image under 5MB.");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setNewTheme({ ...newTheme, bgUrl: base64String });
                setBgPreview(base64String);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="space-y-6">
             <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-800">Holiday Theme Engine</h1>
                <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 font-bold flex items-center gap-2">
                    <span className="text-xl">+</span> Create New Theme
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {themes.map(theme => (
                    <div key={theme.id} className={`relative bg-base-300 rounded-lg shadow-lg overflow-hidden border-t-4 transition-transform hover:-translate-y-1 ${theme.isActive ? 'border-green-500 ring-2 ring-green-200' : 'border-gray-300'}`}>
                        {theme.themePayload.backgroundImage && (
                            <div 
                                className="absolute inset-0 opacity-10 z-0 bg-cover bg-center pointer-events-none"
                                style={{ backgroundImage: `url(${theme.themePayload.backgroundImage})` }}
                            />
                        )}
                        <div className="p-6 relative z-10">
                            <div className="flex justify-between items-start">
                                <h3 className="text-xl font-bold text-slate-800">{theme.name}</h3>
                                {theme.isActive && <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded font-bold animate-pulse">ACTIVE</span>}
                            </div>
                            <div className="bg-white/80 p-3 rounded my-4 border border-gray-100 italic text-slate-600 backdrop-blur-sm">
                                 "{theme.message}"
                            </div>
                            <div className="flex items-center gap-2 mb-4 text-sm bg-base-100/50 p-2 rounded">
                                <div className="w-6 h-6 rounded-full border shadow-sm" style={{backgroundColor: theme.themePayload.primaryColor}}></div>
                                <span className="text-slate-500 font-medium">Theme Color</span>
                            </div>
                            <button 
                                onClick={() => handleToggle(theme)} 
                                className={`w-full py-2 rounded font-bold transition-colors shadow-sm ${theme.isActive ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-green-600 text-white hover:bg-green-700'}`}
                            >
                                {theme.isActive ? 'Deactivate Theme' : 'Activate Theme'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 animate-fade-in backdrop-blur-sm">
                    <div className="bg-base-300 p-8 rounded-xl shadow-2xl w-full max-w-lg border border-base-200">
                         <h2 className="text-2xl font-bold mb-6 text-slate-800 border-b pb-2">Create Holiday Theme</h2>
                         <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Theme Name</label>
                                <input placeholder="e.g., Christmas Special" value={newTheme.name} onChange={e => setNewTheme({...newTheme, name: e.target.value})} required className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-primary outline-none" />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Global Broadcast Message</label>
                                <textarea placeholder="Message displayed to all users (e.g., Happy Holidays!)..." value={newTheme.message} onChange={e => setNewTheme({...newTheme, message: e.target.value})} required className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-primary outline-none" rows={3} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Theme Color</label>
                                    <div className="flex items-center gap-2">
                                        <input type="color" value={newTheme.color} onChange={e => setNewTheme({...newTheme, color: e.target.value})} className="h-10 w-10 p-0 border-0 rounded cursor-pointer shadow-sm" />
                                        <span className="text-xs text-slate-500">{newTheme.color}</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Mode</label>
                                    <select value={newTheme.mode} onChange={e => setNewTheme({...newTheme, mode: e.target.value as any})} className="w-full p-2 border border-slate-300 rounded h-10 bg-white">
                                        <option value="holiday">Holiday</option>
                                        <option value="light">Light</option>
                                        <option value="dark">Dark</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Watermark Image (Optional)</label>
                                <input type="file" onChange={handleFileChange} accept="image/*" className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"/>
                                {bgPreview && (
                                    <div className="mt-2 h-24 w-full rounded-md border border-slate-300 bg-cover bg-center" style={{ backgroundImage: `url(${bgPreview})` }}></div>
                                )}
                            </div>
                            
                            <div className="flex justify-end gap-3 mt-8 pt-4 border-t">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 bg-gray-200 rounded text-slate-700 font-bold hover:bg-gray-300 transition-colors">Cancel</button>
                                <button type="submit" className="px-5 py-2 bg-primary text-white rounded font-bold hover:bg-primary/90 transition-colors shadow-md">Create Theme</button>
                            </div>
                         </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HolidayThemes;
