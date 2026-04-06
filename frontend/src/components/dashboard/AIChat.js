const { useState, useEffect, useRef } = React;
const initialMessages = [
    {
        id: 1,
        role: 'ai',
        text: 'Olá, Professor. Analisando o Mapa de Talentos da Ana, percebo que ela se destaca na área Criativa. Como posso ajudar a integrá-la melhor nas aulas de Matemática esta semana?',
        time: '09:12 AM'
    },
    {
        id: 2,
        role: 'user',
        text: 'Gostaria de sugestões de atividades que utilizem o desenho para explicar geometria espacial. Ela parece ter dificuldade com abstração pura.',
        time: '09:15 AM'
    },
    {
        id: 3,
        role: 'ai',
        text: 'Excelente abordagem. Com base nas diretrizes pedagógicas, recomendo o uso de perspectiva isométrica. Sugiro que ela crie uma "Cidade Geométrica" no papel, onde cada prédio represente um cálculo de volume específico.',
        time: '09:16 AM',
        sources: [
            { title: 'Manual BNCC - Matemática', icon: 'description' },
            { title: 'Artigo: Visualização Espacial', icon: 'article' }
        ]
    }
];

const AIChat = () => {
    const [messages, setMessages] = useState(initialMessages);
    const [inputValue, setInputValue] = useState('');
    const [isStreaming, setIsStreaming] = useState(false);
    const chatContainerRef = useRef(null);
    const scrollToBottom = () => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    };

    useEffect(() => { scrollToBottom(); }, [messages]);
    const handleSend = (e) => {
        e.preventDefault();
        if (!inputValue.trim() || isStreaming) return;
        // Adiciona a mensagem do Usuário
        const newUserMsg = {
            id: Date.now(),
            role: 'user',
            text: inputValue,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, newUserMsg]);
        setInputValue('');
        setIsStreaming(true);

        // Prepara a bolha vazia da IA para receber o Streaming
        const aiMsgId = Date.now() + 1;
        setMessages(prev => [...prev, {
            id: aiMsgId,
            role: 'ai',
            text: '',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);

        // PONTO DE INTEGRAÇÃO COM A TASK 3
        // Substituir esse bloco pela chamada fetch() usando ReadableStream
        // da API do matheus.

        const fakeResponseText = "Com certeza! Podemos alinhar essa atividade com a metodologia ativa. Quer que eu gere um roteiro passo a passo dessa dinâmica?";
        let currentIndex = 0;

        const streamInterval = setInterval(() => {
            if (currentIndex < fakeResponseText.length) {
                // Atualiza APENAS a última mensagem da IA, adicionando a nova letra
                setMessages(prev => prev.map(msg => {
                    if (msg.id === aiMsgId) {
                        return { ...msg, text: fakeResponseText.slice(0, currentIndex + 1) };
                    }
                    return msg;
                }));
                currentIndex++;
            } else {
                clearInterval(streamInterval);
                setIsStreaming(false); // Libera o input novamente
            }
        }, 30); // Velocidade de digitação (30ms por letra)
    };

    return (
        <section className="col-span-12 md:col-span-5 h-[650px] flex flex-col bg-surface-container-low rounded-xl overflow-hidden shadow-sm border border-outline-variant/10">
            {/* Header */}
            <header className="px-6 py-4 bg-white/80 backdrop-blur-md flex justify-between items-center border-b border-outline-variant/10">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary-navy to-teal-custom flex items-center justify-center text-white">
                        <span className="material-symbols-outlined text-xl">auto_awesome</span>
                    </div>
                    <div>
                        <h3 className="text-sm font-bold font-headline text-primary-navy">Assistente Pedagógico IA</h3>
                        <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-teal-custom block"></span>
                            <p className="text-[10px] text-on-surface-variant font-medium italic">Assistindo <span className="text-primary-navy font-bold">Ana Beatriz Silva</span></p>
                        </div>
                    </div>
                </div>
                <button className="text-slate-400 hover:text-primary-navy transition-colors">
                    <span className="material-symbols-outlined">more_vert</span>
                </button>
            </header>

            {/* Área de Mensagens */}
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex flex-col gap-2 max-w-[85%] ${msg.role === 'user' ? 'items-end ml-auto' : 'items-start'}`}>
                        <div className={`p-4 rounded-2xl shadow-sm text-sm leading-relaxed ${msg.role === 'user'
                            ? 'bg-primary-navy text-white rounded-tr-none'
                            : 'bg-white rounded-tl-none border border-outline-variant/10'
                            }`}>

                            {/* O texto sendo renderizado (ou streamado) */}
                            {msg.role === 'ai' && msg.text === '' ? (
                                <span className="animate-pulse text-outline">Analisando...</span>
                            ) : (
                                <div dangerouslySetInnerHTML={{ __html: msg.text.replace(/<strong>/g, '<strong class="text-primary-navy">') }} />
                            )}

                            {/* Renderização condicional de Fontes/Arquivos (se existirem) */}
                            {msg.sources && !isStreaming && (
                                <div className="mt-4 pt-4 border-t border-slate-100">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary-navy mb-2">Fontes Citadas</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        {msg.sources.map((source, idx) => (
                                            <div key={idx} className="bg-mint-light p-2 rounded-lg flex items-center gap-2 hover:bg-mint-accent transition-colors cursor-pointer border border-outline-variant/5">
                                                <span className="material-symbols-outlined text-xs text-primary-navy">{source.icon}</span>
                                                <span className="text-[9px] font-bold text-primary-navy truncate">{source.title}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="text-[10px] text-on-surface-variant font-medium px-1">{msg.time}</div>
                    </div>
                ))}
            </div>

            {/* Input Footer */}
            <footer className="p-4 bg-white border-t border-outline-variant/10">
                <form onSubmit={handleSend} className="relative flex items-center">
                    <input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        disabled={isStreaming}
                        className="w-full bg-surface-container-low border-none rounded-full py-3 px-6 text-sm focus:ring-2 focus:ring-primary-navy/20 placeholder:text-on-surface-variant/50 disabled:opacity-50"
                        placeholder={isStreaming ? "IA respondendo..." : "Pergunte algo sobre o plano de aula..."}
                        type="text"
                    />
                    <button
                        type="submit"
                        disabled={!inputValue.trim() || isStreaming}
                        className="absolute right-2 w-10 h-10 flex items-center justify-center bg-primary-navy text-white rounded-full shadow-lg hover:bg-teal-custom active:scale-90 transition-all disabled:opacity-50 disabled:active:scale-100"
                    >
                        <span className="material-symbols-outlined">send</span>
                    </button>
                </form>
            </footer>
        </section>
    );
};

window.AIChat = AIChat;