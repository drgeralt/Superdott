// frontend/src/Login.js

const FloatingHelpButton = () => (
    <button className="fixed bottom-6 right-6 w-14 h-14 bg-white text-primary-navy rounded-full shadow-xl flex items-center justify-center hover:bg-primary-navy hover:text-white transition-all group z-50">
        <span className="material-symbols-outlined text-2xl group-hover:scale-110 duration-200">help</span>
    </button>
);

const App = () => {
    // Usamos um estado para garantir que o Login.js aguarde o Ballpit carregar
    const [BallpitComp, setBallpitComp] = React.useState(() => window.Ballpit);

    React.useEffect(() => {
        // Se o Ballpit ainda não estiver no window, checamos a cada 100ms
        if (!BallpitComp) {
            const interval = setInterval(() => {
                if (window.Ballpit) {
                    setBallpitComp(() => window.Ballpit);
                    clearInterval(interval);
                }
            }, 100);
            return () => clearInterval(interval);
        }
    }, [BallpitComp]);

    return (
        < div className="relative min-h-screen bg-gradient-to-br from-primary-navy to-teal-custom flex items-center justify-end p-4 lg:pr-24 overflow-hidden" >

            {/* Camada 0: O Ballpit */}
            < div className="absolute inset-0 z-0 pointer-events-auto" >
                {BallpitComp && (
                    <BallpitComp
                        count={80}
                        gravity={0.015}
                        friction={0.995}
                        wallBounce={0.90}
                        followCursor={false}
                        colors={[0xFFFFFF, 0x0C2C47, 0x00BFFF, 0x4A9D95]}
                        ambientIntensity={4.0}
                        lightIntensity={10}
                        className="w-full h-full"
                    />
                )
                }
            </div >

            {/* Camada 10: O Card de Login */}
            < div className="relative z-10 w-full max-w-[1100px] pointer-events-auto" >
                <LoginView />
            </div >

            <FloatingHelpButton />
        </div >
    );
};