import { describe, it, expect } from 'vitest';
import { calculateTriageResult } from './triageCalculator';

describe('Calculadora de Triagem (PLG Motor)', () => {

    it('deve classificar corretamente o Perfil de Suporte e Organização (Score <= 11)', () => {
        const mockAnswers = { q1: 2, q2: 2, q3: 2, q4: 2, q5: 2, q6: 0, q7: 0 };

        const result = calculateTriageResult(mockAnswers, 'João');

        expect(result.totalScore).toBe(10);
        expect(result.profile.title).toBe("Perfil de Suporte e Organização");
        expect(result.profile.ctaText).toBe("Criar Conta Superdott"); // <-- Alterado aqui
    });

    it('deve classificar corretamente o Potencial Latente Identificado (11 < Score <= 22)', () => {
        const mockAnswers = { q1: 3, q2: 3, q3: 3, q4: 3, q5: 3, q6: 3, q7: 0 };

        const result = calculateTriageResult(mockAnswers, 'Maria');

        expect(result.totalScore).toBe(18);
        expect(result.profile.title).toBe("Potencial Latente Identificado");
        expect(result.profile.ctaText).toBe("Desbloquear Potencial");
    });

    it('deve classificar corretamente o Forte Indício de Altas Habilidades (Score > 22)', () => {
        const mockAnswers = { q1: 3, q2: 3, q3: 3, q4: 3, q5: 3, q6: 3, q7: 3, q8: 3, q9: 3, q10: 3 };

        const result = calculateTriageResult(mockAnswers, 'Enzo');

        expect(result.totalScore).toBe(30);
        expect(result.profile.title).toBe("Forte Indício de Altas Habilidades");
        expect(result.profile.ctaText).toBe("Acessar Superdott"); // <-- Alterado aqui
        expect(result.profile.description).toContain('Enzo');
    });


    it('deve lidar corretamente com o limite exato de limiares (Boundary Testing)', () => {
        const result11 = calculateTriageResult({ q1: 11 }, 'Teste');
        expect(result11.profile.title).toBe("Perfil de Suporte e Organização");
        const result22 = calculateTriageResult({ q1: 22 }, 'Teste');
        expect(result22.profile.title).toBe("Potencial Latente Identificado");
    });
});