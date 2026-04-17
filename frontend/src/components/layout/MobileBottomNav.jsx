const MobileBottomNav = () => (
    <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-6 pt-3 bg-white/90 backdrop-blur-xl shadow-[0_-4px_20px_rgba(0,0,0,0.05)] rounded-t-3xl border-t border-slate-100">
        <button className="flex flex-col items-center justify-center bg-mint-light text-primary-navy rounded-2xl px-5 py-2 active:scale-90 transition-transform">
            <span className="material-symbols-outlined">home</span>
            <span className="font-headline text-[10px] font-bold uppercase tracking-widest mt-1">Home</span>
        </button>
        <button className="flex flex-col items-center justify-center text-slate-400 hover:text-primary-navy active:scale-90 transition-transform">
            <span className="material-symbols-outlined">assignment_turned_in</span>
            <span className="font-headline text-[10px] font-bold uppercase tracking-widest mt-1">Triagem</span>
        </button>
        <button className="flex flex-col items-center justify-center text-slate-400 hover:text-primary-navy active:scale-90 transition-transform">
            <span className="material-symbols-outlined">forum</span>
            <span className="font-headline text-[10px] font-bold uppercase tracking-widest mt-1">Chat</span>
        </button>
        <button className="flex flex-col items-center justify-center text-slate-400 hover:text-primary-navy active:scale-90 transition-transform">
            <span className="material-symbols-outlined">person</span>
            <span className="font-headline text-[10px] font-bold uppercase tracking-widest mt-1">Perfil</span>
        </button>
    </nav>
);

export default MobileBottomNav;