import SplitText from './components/layout/SplitText';
import PillNav from './components/layout/PillNav';
import MobileBottomNav from './components/layout/MobileBottomNav';
import TriageView from './components/triage/TriageView';

import logoImg from './assets/img/logo.png';
import noUserPfp from './assets/img/no-user-pfp.jpg';

const navItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Triagem', href: '/triagem' },
    { label: 'Relatórios', href: '/relatorios' }
];

const Triage = () => {
    return (
        <div className="bg-background min-h-screen">
            <header className="absolute left-0 w-full px-6 z-50 grid grid-cols-[1fr_auto_1fr] items-center pointer-events-none">

                {/* Esquerda: Saudação */}
                <div className="pt-6 pointer-events-auto flex justify-start items-center">
                    <SplitText
                        text="Painel de Triagem"
                        className="md:text-2xl lg:text-5xl font-extrabold text-primary-navy font-headline tracking-tight m-0 leading-none"
                        delay={50}
                        duration={1}
                    />
                </div>

                {/* Centro: PillNav */}
                <div className="pointer-events-auto flex justify-center items-center">
                    <PillNav
                        logo={logoImg}
                        items={navItems}
                        activeHref="/triagem"
                        hoveredPillTextColor="#ffffff"
                        initialLoadAnimation={true}
                    />
                </div>

                {/* Direita */}
                <div className="pointer-events-auto flex justify-end items-center gap-4">
                    {/* Botão de Engrenagem (Configurações) */}
                    <button className="p-2 text-primary-navy/70 hover:text-primary-navy hover:bg-mint-light rounded-full transition-all active:scale-95 flex items-center justify-center">
                        <span className="material-symbols-outlined">settings</span>
                    </button>

                    {/* Avatar do Usuário */}
                    <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-white shadow-sm cursor-pointer hover:shadow-md transition-all hover:scale-105">
                        <img
                            alt="Perfil do usuário"
                            className="w-full h-full object-cover"
                            src={noUserPfp}
                        />
                    </div>
                </div>

            </header>

            <main className="pt-24 pb-24 lg:pb-8 px-6 min-h-screen flex flex-col">
                <TriageView />
            </main>

            <MobileBottomNav />
        </div>
    );
};

export default Triage;