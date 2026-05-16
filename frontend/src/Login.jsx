import { Suspense, lazy } from 'react';
import LoginView from './components/auth/LoginView';

const FloatingHelpButton = () => (
    <button className="fixed bottom-6 right-6 w-14 h-14 bg-white text-primary-navy rounded-full shadow-xl flex items-center justify-center hover:bg-primary-navy hover:text-white transition-all group z-50">
        <span className="material-symbols-outlined text-2xl group-hover:scale-110 duration-200">help</span>
    </button>
);

const BallPit = lazy(() => import('./components/auth/BallPit'));

const Login = () => {
    return (
        <div className="relative min-h-screen bg-gradient-to-br from-primary-navy to-teal-custom flex items-center justify-end p-4 lg:pr-24 overflow-hidden">

            {/* camada 0: ballpit */}
            <div className="absolute inset-0 z-0 pointer-events-auto">
                <Suspense fallback={<div className="w-full h-full bg-primary-navy" />}>
                    <BallPit
                        count={70}
                        gravity={0.015}
                        friction={0.995}
                        wallBounce={0.90}
                        followCursor={false}
                        colors={[0xFFFFFF, 0x0C2C47, 0x00BFFF, 0x4A9D95]}
                        ambientIntensity={4.0}
                        lightIntensity={10}
                        className="w-full h-full"
                    />
                </Suspense>
            </div>

            {/* camada 10: card de login */}
            <div className="relative z-10 w-full max-w-[1100px] pointer-events-auto">
                <LoginView />
            </div>

            <FloatingHelpButton />
        </div>
    );
};

export default Login;