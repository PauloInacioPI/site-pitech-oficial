<p align="center">
  <img src="public/logo-jotta.png" alt="PiTech Sistemas" width="180" />
</p>

<h1 align="center">PiTech Sistemas</h1>

<p align="center">
  <strong>Plataforma completa de gestao de servicos e contratos</strong><br/>
  Sistema fullstack com vitrine publica, fluxo de contratacao, pagamento via PIX e Stripe, e painel administrativo.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React 19" />
  <img src="https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite 7" />
  <img src="https://img.shields.io/badge/Express-5-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express 5" />
  <img src="https://img.shields.io/badge/MySQL-8-4479A1?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL 8" />
  <img src="https://img.shields.io/badge/Stripe-Checkout-635BFF?style=for-the-badge&logo=stripe&logoColor=white" alt="Stripe" />
</p>

---

## Funcionalidades

### Site Publico

- **Vitrine de servicos** com carrossel de banners dinamico
- **Fluxo de contratacao completo** em etapas: detalhes > dados > pagamento > confirmacao
- **Pagamento via PIX** com geracao de QR Code automatica
- **Pagamento via cartao** com redirecionamento para Stripe Checkout
- **Consulta de pedido** pelo codigo de reserva
- **Design responsivo** com animacoes e transicoes suaves

### Painel Administrativo

- **Dashboard** com cards de estatisticas, receita por projeto, barras de progresso e pedidos recentes
- **Gestao de servicos** - CRUD completo com upload de imagem, categorias e precos
- **Modal de detalhes** com ocupacao, faturamento, projecao e ultimos pedidos
- **Gestao de pedidos** - visualizar, confirmar, cancelar e atualizar status de pagamento
- **Configuracoes** do site (banners, informacoes de contato)
- **Autenticacao JWT** com sessao persistente

---

## Tech Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 19, React Router 7, Vite 7 |
| Backend | Node.js, Express 5 |
| Banco de Dados | MySQL 8 (mysql2) |
| Autenticacao | JWT (jsonwebtoken), bcryptjs |
| Pagamentos | Stripe Checkout, PIX (QR Code) |
| Upload | Multer |
| Estilizacao | CSS puro com variaveis customizadas |

---

## Instalacao

### Pre-requisitos

- Node.js 18+
- MySQL 8

### 1. Clone o repositorio

```bash
git clone https://github.com/PauloInacioPI/site-pitech-oficial.git
cd site-pitech-oficial
```

### 2. Instale as dependencias

```bash
npm install
```

### 3. Configure as variaveis de ambiente

```bash
cp .env.example .env
```

Edite o `.env` com suas credenciais:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=pitech_sistemas

STRIPE_SECRET_KEY=sk_test_sua_chave
STRIPE_WEBHOOK_SECRET=whsec_sua_chave
```

### 4. Configure o banco de dados

Crie o banco `pitech_sistemas` no MySQL e execute o schema.

### 5. Inicie o projeto

```bash
# Terminal 1 - Backend (porta 3002)
npm run server

# Terminal 2 - Frontend (porta 5173)
npm run dev
```

Acesse: [http://localhost:5173](http://localhost:5173)

---

## Estrutura do Projeto

```
pitech-sistemas/
├── public/                    # Assets estaticos
├── src/
│   ├── components/            # Componentes do site publico
│   │   ├── Header.jsx
│   │   ├── Hero.jsx           # Carrossel de banners
│   │   ├── BookingFlow.jsx    # Fluxo de contratacao
│   │   ├── Steps.jsx
│   │   ├── Stats.jsx
│   │   ├── Experience.jsx
│   │   └── ...
│   ├── styles/                # CSS dos componentes publicos
│   ├── hooks/                 # Custom hooks (useInView)
│   └── admin/
│       ├── components/        # Dashboard, Servicos, Pedidos, Settings
│       └── styles/            # CSS do painel admin
├── server/
│   ├── index.js               # Entry point + Stripe webhook
│   ├── db.js                  # Pool MySQL
│   ├── middleware/auth.js     # JWT middleware
│   └── routes/
│       ├── auth.js            # Login
│       ├── dashboard.js       # Estatisticas
│       ├── trips.js           # CRUD servicos
│       ├── bookings.js        # Gestao pedidos
│       ├── settings.js        # Configuracoes
│       ├── upload.js          # Upload de imagens
│       └── public.js          # API publica + Stripe
├── .env.example               # Template de variaveis
├── package.json
└── vite.config.js
```

---

## Scripts

```bash
npm run dev       # Inicia o frontend (Vite)
npm run server    # Inicia o backend (Express)
npm run build     # Build de producao
npm run preview   # Preview do build
npm run lint      # Lint do codigo
```

---

## Licenca

Projeto privado - Todos os direitos reservados - PiTech Sistemas.
