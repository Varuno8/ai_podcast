import React from 'react';

export function QuoteCardModal({ quoteImage, setQuoteImage }) {
    if (!quoteImage) return null;

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[200] p-10" onClick={() => setQuoteImage(null)}>
            <div className="max-w-xl w-full bg-white p-4 relative border-4 border-[#ff4d00]" onClick={e => e.stopPropagation()}>
                <button onClick={() => setQuoteImage(null)} className="absolute top-2 right-2 text-black font-black text-xl hover:text-[#ff4d00]">X</button>
                <img src={quoteImage} className="w-full h-auto shadow-2xl mb-4" alt="Quote Card" />
                <a href={quoteImage} download="podmaster_quote.png" className="block w-full text-center bg-[#ff4d00] text-white py-4 font-black uppercase tracking-widest hover:bg-black transition-colors">
                    Download Visual
                </a>
            </div>
        </div>
    );
}
