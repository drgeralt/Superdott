const TopNavBar = () => (
    <nav className="fixed top-0 w-full z-50 bg-emerald-50/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm dark:shadow-none flex justify-between items-center px-8 h-16">
        <div className="flex items-center gap-8">
            <span className="text-2xl font-bold tracking-tighter text-[#0C2C47] dark:text-white font-headline">Superdott</span>
            <div className="hidden md:flex gap-6 items-center">
                <a className="font-['Montserrat'] font-semibold text-sm tracking-tight text-[#006a63] dark:text-emerald-400 relative after:content-[''] after:absolute after:-bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-[#006a63] after:rounded-full" href="#">Dashboard</a>
            </div>
        </div>
        <div className="flex items-center gap-4">
            <button className="p-2 text-slate-500 hover:bg-emerald-100/50 dark:hover:bg-slate-800 rounded-xl transition-colors duration-300 active:scale-95">
                <span className="material-symbols-outlined">notifications</span>
            </button>
            <button className="p-2 text-slate-500 hover:bg-emerald-100/50 dark:hover:bg-slate-800 rounded-xl transition-colors duration-300 active:scale-95">
                <span className="material-symbols-outlined">settings</span>
            </button>
            <img alt="User profile avatar" className="w-8 h-8 rounded-full border border-outline-variant/20" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCfeF5ngZcEaYnypc5Aews04KDfWeVr2SHRnGWt7uRkDwFDFEsODQau8XUssF8kwMCGvYaivOY06ky1rD97AfrrqI3LYFTLosvuiWxzTQY09g1rs2GQ9p4lJY_FlQnAbwX-ME435fenzNXCoIwDro6LDcI1SDTg-BoCTv9eZyPNn4PbMLq4sHBPqi8q-LLjO7YaObp-xOrOYr7t7iDOXzevAEzM9b_G0LI0MKN11Envzyzd3dSwLy5kLlvCvgGe5QzpTmCJRbI-C3s" />
        </div>
    </nav>

);