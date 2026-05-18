1. Visão Geral do Projeto (Revisada)

O Superdott é um ecossistema SaaS de inteligência pedagógica para identificação e acompanhamento de alunos com Altas Habilidades ou Superdotação (AH/SD). A plataforma utiliza RAG (Retrieval-Augmented Generation) fundamentado em documentos do MEC para apoiar Professores, Diretores e Pais, garantindo que o suporte pedagógico seja tecnicamente preciso, legalmente embasado e livre de alucinações.
2. Escopo do Projeto (Tasks 014 - 035)
Em Escopo (In-Scope)

    Segurança e Privacidade (LGPD): * Autenticação JWT com RBAC (Pai, Professor, Diretor, SuperAdmin).

        Anonimização Dinâmica: Mascaramento de nomes de alunos antes do envio de dados para a API do Gemini.

        Trilha de auditoria imutável para acesso a dados sensíveis.

    Motor de Inteligência (RAG Contextual):

        Respostas adaptadas por perfil (técnica para professores, empática para pais, estratégica para diretores).

        Ingestão administrativa de documentos técnicos (PDF/MEC) via pgvector.

    Operação B2B e Escala:

        Importação em massa de alunos via CSV com disparo automático de convites para responsáveis.

        Gestão de desvinculação segura (Instituição-Aluno) com preservação de histórico para o Pai.

    Interface e UX:

        Funil de triagem lógico (Teoria dos Três Anéis) na Landing Page.

        Dashboards segmentados e Sidebar dinâmica baseada em Roles.

        Suporte completo à acessibilidade (A11y).

    Infraestrutura e Negócio:

        Pipeline CI/CD automatizado (GitHub Actions + Render).

        Storage de documentos no Cloudflare R2 e e-mails via Resend.

        Sistema de Wallet e Tokens para controle de consumo de IA.

Fora de Escopo (Out-of-Scope)

    Diagnóstico Clínico: A ferramenta permanece como triagem e suporte pedagógico; o laudo clínico final é externo.

    Aplicativo Mobile Nativo: Foco exclusivo em Web App responsivo (PWA).

    Processamento de Vídeo: O RAG processará apenas textos e documentos PDF.

3. Arquitetura Técnica Final
Camada | Tecnologia -- | -- Backend | Python (FastAPI) + SQLModel Banco de Dados | PostgreSQL (Neon.tech) + pgvector Frontend | React (Vite) + Tailwind CSS + Zustand IA / LLM | Google Gemini API (Pro 1.5) Storage | Cloudflare R2 (S3 Compatible) E-mail | Resend API Telemetria | PostHog Infra/Deploy | Render (Serverless PaaS) + GitHub Actions
4. Novo Roadmap de Entregas
Sprint 3: Core & Privacy

    Foco: Segurança, Onboarding e Inteligência.

    Tasks: 014 a 024.

    Entrega: Sistema com login RBAC, anonimização funcional, Landing Page com triagem e chat contextual por perfil.

Sprint 4: B2B & Infra

    Foco: Escala institucional e robustez de nuvem.

    Tasks: 025 a 029.

    Entrega: Importação de alunos via CSV, Dashboard de SuperAdmin para ingestão de PDFs, Deploy em produção (Render/Neon) com CI/CD e Storage R2.

Sprint 5: Business & UX Final (Projeto Final - Junho)

    Foco: Monetização, Retenção e Refinamento.

    Tasks: 030 a 035.

    Entrega: Sistema de Wallet (Créditos), telemetria com PostHog, central de notificações, interface 100% acessível e protótipo de integração com WhatsApp.

5. Critérios de Sucesso do MVP

    Integridade de Dados: Um pai não pode visualizar dados de alunos que não sejam seus filhos.

    Precisão Pedagógica: A IA deve citar ou se basear nos documentos ingeridos pelo Admin em pelo menos 80% das interações técnicas.

    Fricção Mínima: Uma escola deve ser capaz de importar uma turma de 30 alunos em menos de 1 minuto.

    Conformidade: Nenhum nome real de menor deve ser registrado nos logs da API do Gemini.