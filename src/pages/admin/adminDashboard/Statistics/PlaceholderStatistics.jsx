import React from 'react';
import { Construction } from 'lucide-react';

export default function PlaceholderStatistics({ title }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-500 fade-in slide-up">
            <div className="bg-white p-10 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center">
                <Construction size={64} className="mb-6 text-slate-300" strokeWidth={1.5} />
                <h2 className="text-2xl font-semibold mb-3 text-slate-700">Thống kê {title}</h2>
                <p className="text-slate-500 text-center max-w-sm">
                    Tính năng báo cáo và thống kê cho phân hệ {title} đang trong quá trình phát triển và sẽ sớm ra mắt.
                </p>
            </div>
        </div>
    );
}
