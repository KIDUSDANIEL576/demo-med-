import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getPrescriptionById, mockUsers } from '../services/mockApi';
import { Prescription, User } from '../types';

const PrescriptionPrint: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [prescription, setPrescription] = useState<Prescription | null>(null);
    const [doctor, setDoctor] = useState<User | null>(null);
    const [logo, setLogo] = useState<string | null>(null);
    const [signature, setSignature] = useState<string | null>(null);

    useEffect(() => {
        const fetchPrescription = async () => {
            if (id) {
                const p = await getPrescriptionById(parseInt(id));
                if (p) {
                    setPrescription(p);
                    const d = mockUsers.find(u => u.id === p.doctorId);
                    if (d) {
                        setDoctor(d);
                        setLogo(localStorage.getItem(`logo_${d.id}`));
                        setSignature(localStorage.getItem(`sig_${d.id}`));
                    }
                }
            }
        };
        fetchPrescription();
    }, [id]);

    if (!prescription || !doctor) {
        return <div className="flex justify-center items-center h-screen">Loading prescription...</div>;
    }

    return (
        <div className="bg-gray-200 p-8 print:bg-white print:p-0">
             <style>{`
                @media print {
                    .no-print { display: none; }
                    body { -webkit-print-color-adjust: exact; }
                }
            `}</style>
             <div className="max-w-4xl mx-auto no-print mb-4 flex justify-end">
                <button onClick={() => window.print()} className="px-4 py-2 bg-primary text-white rounded-md">Print Prescription</button>
            </div>
            <div className="max-w-4xl mx-auto bg-white p-12 shadow-lg print:shadow-none border">
                <header className="flex justify-between items-start pb-6 border-b">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">{doctor.clinicName}</h1>
                        <p className="text-gray-500">{doctor.clinicAddress}</p>
                        <p className="text-gray-500">{doctor.phone}</p>
                        <p className="text-gray-500">{doctor.email}</p>
                    </div>
                    {logo && <img src={logo} alt="Clinic Logo" className="h-20 w-auto" />}
                </header>
                
                <main className="mt-8">
                    <h2 className="text-2xl font-semibold text-center mb-8">Medical Prescription</h2>
                    
                    <div className="flex justify-between mb-8 text-sm">
                        <div>
                            <p><strong className="font-semibold text-gray-700">Patient Name:</strong> {prescription.patientName}</p>
                        </div>
                        <div>
                            <p><strong className="font-semibold text-gray-700">Date Issued:</strong> {prescription.createdAt}</p>
                            <p><strong className="font-semibold text-gray-700">Prescription Code:</strong> <span className="font-mono">{prescription.prescriptionCode}</span></p>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-6 rounded-lg border min-h-[200px]">
                         <p className="text-lg font-semibold text-gray-800 mb-2">Rx:</p>
                        <p className="text-gray-700 whitespace-pre-wrap">{prescription.details}</p>
                    </div>

                    <footer className="mt-16 flex justify-end">
                        <div className="text-center">
                             {signature && <img src={signature} alt="Doctor's Signature" className="h-16 w-auto mx-auto"/>}
                            <div className="border-t mt-2 pt-2">
                                <p className="font-bold text-gray-800">{doctor.name}</p>
                                <p className="text-sm text-gray-500">{doctor.role}</p>
                            </div>
                        </div>
                    </footer>
                </main>
            </div>
        </div>
    );
};

export default PrescriptionPrint;
