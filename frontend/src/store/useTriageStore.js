import { create } from 'zustand';

const useTriageStore = create((set) => ({
    triageData: null,

    setTriageData: (data) => {
        // Define a expiração dos dados de triagem para 24 horas (em milissegundos)
        const expiration = Date.now() + 24 * 60 * 60 * 1000;
        const payload = { ...data, expiration };
        
        localStorage.setItem('superdott_triage_data', JSON.stringify(payload));
        set({ triageData: payload });
    },

    loadTriageData: () => {
        const stored = localStorage.getItem('superdott_triage_data');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                // Verifica se os dados ainda são válidos
                if (parsed.expiration && parsed.expiration > Date.now()) {
                    set({ triageData: parsed });
                    return parsed;
                } else {
                    // Remove dados expirados
                    localStorage.removeItem('superdott_triage_data');
                }
            } catch (e) {
                console.error("Falha ao analisar dados de triagem local:", e);
                localStorage.removeItem('superdott_triage_data');
            }
        }
        set({ triageData: null });
        return null;
    },

    clearTriageData: () => {
        localStorage.removeItem('superdott_triage_data');
        set({ triageData: null });
    }
}));

export default useTriageStore;
