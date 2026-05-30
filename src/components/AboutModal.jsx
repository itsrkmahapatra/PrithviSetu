export default function AboutModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-slide-up">
        
        {/* Header */}
        <div className="flex justify-between items-center px-8 py-6 border-b border-gray-100">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">PrithviSetu <span className="text-blue-600">🌉</span></h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Har Sthaan Ka Setu</p>
          </div>
          <button onClick={onClose} className="p-3 bg-slate-100 text-slate-500 rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all active:scale-95">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-8 py-6 overflow-y-auto custom-scrollbar text-slate-600 space-y-8">
          
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
                <h3 className="text-xs font-black uppercase text-blue-600 tracking-widest flex items-center gap-2">
                    <div className="w-6 h-0.5 bg-blue-600 rounded-full"></div>
                    Core Engine
                </h3>
                <ul className="space-y-3">
                    <li className="flex gap-3">
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-1.5 flex-shrink-0"></div>
                        <span className="text-sm font-medium"><strong className="text-slate-900">3D-to-2D Morph</strong>: Seamless zoom-based transition from globe to map.</span>
                    </li>
                    <li className="flex gap-3">
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-1.5 flex-shrink-0"></div>
                        <span className="text-sm font-medium"><strong className="text-slate-900">Universal Search</strong>: Real-time global autocomplete indexing.</span>
                    </li>
                </ul>
            </div>
            <div className="space-y-4">
                <h3 className="text-xs font-black uppercase text-emerald-600 tracking-widest flex items-center gap-2">
                    <div className="w-6 h-0.5 bg-emerald-600 rounded-full"></div>
                    Data Pipeline
                </h3>
                <ul className="space-y-3">
                    <li className="flex gap-3">
                        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-1.5 flex-shrink-0"></div>
                        <span className="text-sm font-medium"><strong className="text-slate-900">Live Insights</strong>: Dynamic Wikipedia and Infrastructure integration.</span>
                    </li>
                    <li className="flex gap-3">
                        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-1.5 flex-shrink-0"></div>
                        <span className="text-sm font-medium"><strong className="text-slate-900">Atmosphere</strong>: Precise hyperlocal weather monitoring.</span>
                    </li>
                </ul>
            </div>
          </section>

          <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 italic text-sm text-center font-medium">
             "Bridging every village, city, and landscape on Earth through high-fidelity visualization and open-source intelligence."
          </div>

          <section className="space-y-4 pt-4 border-t border-gray-100 text-center">
            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em]">Developer Architecture</h4>
            <div className="flex flex-wrap justify-center gap-4 text-xs font-bold text-slate-500">
                <span className="px-3 py-1 bg-slate-100 rounded-lg">React 18</span>
                <span className="px-3 py-1 bg-slate-100 rounded-lg">Three.js</span>
                <span className="px-3 py-1 bg-slate-100 rounded-lg">Leaflet</span>
                <span className="px-3 py-1 bg-slate-100 rounded-lg">Tailwind 3.4</span>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 bg-slate-900 text-white flex justify-between items-center">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">Project Lead</span>
            <span className="text-sm font-bold text-blue-100">Raj Kishor Mahapatra</span>
          </div>
          <div className="px-4 py-2 bg-white/10 rounded-xl border border-white/10 text-xs font-bold">
             MIT LICENSE 2026
          </div>
        </div>

      </div>
    </div>
  );
}
