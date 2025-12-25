import React from 'react';
import { Plus } from 'lucide-react';

export function SourceArtifactModal({ activeSource, setActiveSource }) {
    if (!activeSource) return null;

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[250] p-10" onClick={() => setActiveSource(null)}>
            <div className="max-w-2xl w-full bg-[#f4f1ea] p-12 relative border-l-8 border-[#ff4d00] shadow-2xl" onClick={e => e.stopPropagation()}>
                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#ff4d00] mb-8">Behind the Script</h4>
                <div className="space-y-6">
                    <div>
                        <label className="text-[9px] font-black uppercase opacity-40">Dialog Line</label>
                        <p className="text-xl font-bold italic">"{activeSource.text}"</p>
                    </div>
                    <div className="pt-6 border-t border-black/10">
                        <label className="text-[9px] font-black uppercase opacity-40">Source Attribution</label>
                        <p className="font-['Courier_Prime'] text-sm leading-relaxed mt-2 text-black/70">
                            {activeSource.source}
                        </p>
                    </div>
                </div>
                <button onClick={() => setActiveSource(null)} className="absolute top-8 right-8 text-black/20 hover:text-[#ff4d00] transition-colors">
                    <Plus className="rotate-45 w-6 h-6" />
                </button>
            </div>
        </div>
    );
}
