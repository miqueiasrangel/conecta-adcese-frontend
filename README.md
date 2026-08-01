# 📱 Conecta ADCESE — Frontend Web App

Interface Web ultramoderna e responsiva desenvolvida para a gestão eclesiástica da **Igreja Evangélica Assembleia de Deus CADEESO em Santo Estevão (ADCESE)**. Construída com React 18, Vite e Vanilla CSS profissional.

---

## 🚀 Tecnologias Utilizadas

- **Framework**: React 18
- **Build Tool / Bundler**: Vite
- **Roteamento**: React Router DOM (v6)
- **Requisições HTTP**: Axios com interceptor de autenticação JWT
- **Ícones**: React Icons (FontAwesome)
- **Estilização**: Vanilla CSS com variáveis de Design System, layout expansivo, glassmorphism e responsividade nativa para dispositivos móveis (smartphones e tablets) e desktops.

---

## 🎨 Módulos da Aplicação Web

### 1. 👥 Secretaria e Membros (`/secretaria`)
- Cadastro completo de Membros e Congregados com Upload de Foto Avatar em formato circular.
- Filtros avançados por Nome, Chapa, Congregação, Cargos e Status.
- Emissão em PDF / Impressão de:
  - 📜 **Carta de Mudança**
  - 📜 **Certificado de Batismo em Águas**
  - 📜 **Certificado de Apresentação de Criança**
  - 🪪 **Credencial / Carteirinha de Membro em Crachá com QR Code**
  - 🍷 **Lista de Chamada para Santa Ceia**
  - 📋 **Rol Geral Completo** (com filtro por congregação)
  - 🎂 **Aniversariantes do Mês** (com seletor de mês e congregação)

### 2. 💰 Gestão Financeira (`/financeiro`)
- Entradas de Dízimos, Ofertas e Saídas/Despesas.
- **Saldos Separados**: **💵 Em Mão (Dinheiro)** vs **💳 Na Conta (PIX/Banco)**.
- **Aba de Dízimos**: Destaque com o nome do membro dizimista.
- **Visualização**: Alternador entre **📋 Detalhado** e **📊 Visão Geral Agrupada por Categoria**.
- Relatório financeiro formatado para impressão.

### 3. 🏢 Gestão de Congregações (`/congregacoes`)
- Cadastro das congregações do campo ADCESE (Sede, Betel, etc.) e contatos dos dirigentes.

### 4. ⛪ Cultos e Escalas (`/cultos`)
- Cadastro de cultos e liturgia (Preletor, Tema da Mensagem, Hinos da Harpa Cristã).
- Escala de equipes por departamento (*Louvor*, *Recepção*, *Diaconato*, *Mídia/Som*, *Infantil*).
- **🔒 Validação Anti-Conflito de Escala**: Impede a alocação duplicada do mesmo membro no mesmo culto.
- **📅 Calendário Visual Mensal** em formato de grade com botão para imprimir/PDF.
- **📄 Exportação de Escala Mensal** para envio nos grupos de WhatsApp.

### 5. 🤝 Projetos Sociais e Missões (`/projetos`)
- Cadastro de campanhas e projetos sociais (*Cestas Básicas*, *Agasalhos*, *Reformas*, *Missões*).
- Controle de doações de Itens Físicos (Kg de alimentos, unidades de cestas) e Recursos Financeiros (R$) com barra de progresso.
- Ficha de atendimento de assistência social a famílias beneficiadas.
- **📊 Apresentação para Telão (Culto de Missões)** em slide/PDF de prestação de contas.

### 6. 📖 Gabinete Pastoral (`/gabinete`)
- **📅 Agenda Pastoral**: Agendamento de compromissos, casamentos e reuniões.
- **🔒 Prontuário Espiritual (Ficha Confidencial)**: Ficha restrita para anotações de aconselhamento individual.
- **🛡️ Disciplina e Restauração**: Acompanhamento e reintegração à comunhão.
- **🕊️ Visitação e Capelania**: Fila de pedidos de visita (*Enfermos*, *Afastados*, *Luto*), encaminhamento a obreiros e relatório pós-visita.
- **🦅 Visão de Águia (Dashboard Estratégico & Alerta de Evasão)**: Termômetro demográfico e botão direto para solicitar visita pastoral.

### 7. 🔑 Controle de Acesso (`/controle-acesso`) & Alterar Senha (`/alterar-senha`)
- Gestão de usuários, alteração de permissões e troca de senha.

---

## ⚙️ Como Executar o Frontend Localmente

### Pré-requisitos
- **Node.js** v18+ e **npm** instalados (`node -v`).

### Passos para Execução:

1. Clone o repositório do Frontend:
   ```bash
   git clone https://github.com/seu-usuario/conecta-adcese-frontend.git
   cd conecta-adcese-frontend
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Inicie o servidor de desenvolvimento Vite:
   ```bash
   npm run dev
   ```

4. Acesse no navegador: `http://localhost:5173`

---

## 📱 Responsividade

A aplicação foi desenvolvida pensando no uso tanto em **computadores de mesa** nas secretarias quanto em **smartphones/tablets** por pastores e obreiros em campo:
- Grids adaptativos.
- Tabelas com rolagem touch inteligente.
- Modais em tamanho responsivo de até 95% da tela.

---

## 📜 Licença e Direitos Reservados

Desenvolvido para uso exclusivo da **Igreja Evangélica Assembleia de Deus CADEESO em Santo Estevão (ADCESE)**. Todos os direitos reservados.
