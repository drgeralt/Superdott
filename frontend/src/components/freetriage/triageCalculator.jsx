// src/utils/triageCalculator.jsx

export const calculateTriageResult = (answers, childName = "a criança") => {
    const totalScore = Object.values(answers).reduce((acc, curr) => acc + curr, 0);
    let profile = {};

    if (totalScore <= 11) {
        profile = {
            title: "Perfil de Suporte e Organização",
            description: "Os resultados indicam um desenvolvimento típico ou possíveis desafios neurodivergentes de outra natureza. Reforçamos que a triagem gratuita que você acabou de realizar não é um diagnóstico, mas o Superdott pode te ajudar a entender isso melhor.",
            ctaText: "Criar Conta Superdott"
        };
    } else if (totalScore <= 22) {
        profile = {
            title: "Potencial Latente Identificado",
            description: "Notamos picos de inteligência em áreas específicas. É fundamental estimular esse talento para que ele não se perca. Reforçamos que a triagem gratuita que você acabou de realizar não é um diagnóstico, mas o Superdott pode te ajudar a entender isso melhor.",
            ctaText: "Desbloquear Potencial"
        };
    } else {
        profile = {
            title: "Forte Indício de Altas Habilidades",
            description: `As respostas para ${childName} sugerem um quadro clássico de Altas Habilidades/Superdotação. Reforçamos que a triagem gratuita que você acabou de realizar não é um diagnóstico, mas o Superdott pode te ajudar a entender isso melhor.`,
            ctaText: "Acessar Superdott"
        };
    }

    return { totalScore, profile };
};