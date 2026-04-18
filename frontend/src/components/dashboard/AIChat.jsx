import { useState, useEffect, useRef } from 'react';
import useStudentStore from '../../store/useStudentStore';

const AIChat = () => {
    const student = useStudentStore(state => state.selectedStudent);
    const [messages, setMessages] = useState([
        {
            id: 'welcome',
            role: 'ai',
            text: 'Olá, sou seu Assistente Pedagógico. Selecione um aluno na lista ao lado para iniciarmos uma análise baseada no banco de dados e nas diretrizes do MEC.',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isStreaming, setIsStreaming] = useState(false);
    const chatContainerRef = useRef(null);

    const scrollToBottom = () => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    };

    useEffect(() => { scrollToBottom(); }, [messages]);

    useEffect(() => {
        if (student) {
            const systemMsg = {
                id: Date.now(),
                role: 'ai',
                text: `Analisando perfil de <strong>${student.full_name}</strong>. Como posso ajudar com o plano de aula hoje?`,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setTimeout(() => setMessages(prev => [...prev, systemMsg]), 0);
        }
    }, [student]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!inputValue.trim() || isStreaming || !student?.id) return;

        const userMsg = {
            id: Date.now(),
            role: 'user',
            text: inputValue,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsStreaming(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: inputValue,
                    student_id: student?.id,
                    student_context: student
                })
            });

            if (!response.ok) throw new Error('Falha na comunicação com o servidor');

            const data = await response.json();
            const aiMsg = {
                id: Date.now() + 1,
                role: 'ai',
                text: data.text,
                sources: data.sources,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, aiMsg]);

        } catch {
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                role: 'ai',
                text: 'Desculpe, tive um erro ao acessar a base de conhecimento. Verifique sua conexão e tente novamente mais tarde.',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
        } finally {
            setIsStreaming(false);
        }
    };

    return (
        <section className="col-span-12 md:col-span-5 flex flex-col bg-surface-container-low rounded-xl overflow-hidden shadow-sm border border-outline-variant/10 h-auto md:h-[calc(100vh-200px)] min-h-[500px]">
            <header className="px-6 py-4 bg-white/80 backdrop-blur-md flex justify-between items-center border-b border-outline-variant/10 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary-navy to-teal-custom flex items-center justify-center text-white">
                        <span className="material-symbols-outlined text-xl">auto_awesome</span>
                    </div>
                    <div>
                        <h3 className="text-sm font-bold font-headline text-primary-navy">Assistente Pedagógico IA</h3>
                        <div className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full block ${student ? 'bg-teal-custom' : 'bg-slate-300'}`}></span>
                            <p className="text-[10px] text-on-surface-variant font-medium italic">
                                {student ? (
                                    <>Assistindo <span className="text-primary-navy font-bold">{student.full_name}</span></>
                                ) : "Aguardando seleção de aluno..."}
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            <div ref={chatContainerRef} className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6 scroll-smooth">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex flex-col gap-2 max-w-[85%] ${msg.role === 'user' ? 'items-end ml-auto' : 'items-start'}`}>
                        <div className={`p-4 rounded-2xl shadow-sm text-sm leading-relaxed ${msg.role === 'user'
                            ? 'bg-primary-navy text-white rounded-tr-none'
                            : 'bg-white rounded-tl-none border border-outline-variant/10'
                        }`}>
                            <div dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br/>') }} />
                            {msg.sources && msg.sources.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-slate-100">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-teal-custom mb-2">Referências Técnicas</p>
                                    <div className="flex flex-wrap gap-2">
                                        {msg.sources.map((source, idx) => (
                                            <div key={idx} className="bg-mint-light px-2 py-1 rounded flex items-center gap-1 border border-teal-custom/10">
                                                <span className="material-symbols-outlined text-[12px] text-primary-navy">description</span>
                                                <span className="text-[9px] font-bold text-primary-navy">{source}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="text-[10px] text-on-surface-variant font-medium px-1">{msg.time}</div>
                    </div>
                ))}
                {isStreaming && (
                    <div className="flex items-center gap-2 text-primary-navy/50 text-xs animate-pulse">
                        <span className="material-symbols-outlined text-sm">psychology</span>
                        Consultando base de conhecimento...
                    </div>
                )}
            </div>

            <footer className="p-4 bg-white border-t border-outline-variant/10 shrink-0">
                <form onSubmit={handleSend} className="relative flex items-center">
                    <input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        disabled={isStreaming}
                        className="w-full bg-surface-container-low border-none rounded-full py-3 px-6 text-sm focus:ring-2 focus:ring-primary-navy/20 placeholder:text-on-surface-variant/50 disabled:opacity-50 outline-none"
                        placeholder={isStreaming ? "Aguarde a resposta..." : "Pergunte sobre metodologias ou triagem..."}
                        type="text"
                    />
                    <button
                        type="submit"
                        disabled={!inputValue.trim() || isStreaming}
                        className="absolute right-2 w-10 h-10 flex items-center justify-center bg-primary-navy text-white rounded-full shadow-lg hover:bg-teal-custom active:scale-90 transition-all disabled:opacity-50"
                    >
                        <span className="material-symbols-outlined">send</span>
                    </button>
                </form>
            </footer>
        </section>
    );
};

export default AIChat;