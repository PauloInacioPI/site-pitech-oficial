<p align="center">
  <img src="public/logo-jotta.png" alt="JA Excursoes" width="180" />
</p>

<h1 align="center">JA Excursoes</h1>

<p align="center">
  <strong>Plataforma completa de reservas de excursoes</strong><br/>
  Sistema fullstack com vitrine publica, fluxo de reserva com selecao de assentos, pagamento via PIX e Stripe, e painel administrativo.
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

- **Vitrine de excursoes** com carrossel de banners dinamico
- **Selecao interativa de assentos** no mapa do onibus (11 fileiras x 4 colunas)
- **Fluxo de reserva completo** em etapas: detalhes > assentos > dados > pagamento > confirmacao
- **Pagamento via PIX** com geracao de QR Code automatica
- **Pagamento via cartao** com redirecionamento para Stripe Checkout
- **Consulta de reserva** pelo codigo de reserva
- **Design responsivo** com animacoes e transicoes suaves

### Painel Administrativo

- **Dashboard** com cards de estatisticas, receita por viagem, barras de progresso e reservas recentes
- **Gestao de viagens** - CRUD completo com upload de imagem, categorias, assentos e precos
- **Modal de detalhes** com ocupacao, faturamento, projecao e ultimas reservas
- **Gestao de reservas** - visualizar, confirmar, cancelar e atualizar status de pagamento
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
git clone https://github.com/PauloInacioPI/jotta.git
cd jotta
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
DB_NAME=jotta_excursoes

STRIPE_SECRET_KEY=sk_test_sua_chave
STRIPE_WEBHOOK_SECRET=whsec_sua_chave
```

### 4. Configure o banco de dados

Crie o banco `jotta_excursoes` no MySQL e execute o schema.

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
ja-excursoes-react/
├── public/                    # Assets estaticos
├── src/
│   ├── components/            # Componentes do site publico
│   │   ├── Header.jsx
│   │   ├── Hero.jsx           # Carrossel de banners
│   │   ├── BookingFlow.jsx    # Fluxo de reserva completo
│   │   ├── Destinations.jsx
│   │   ├── Packages.jsx
│   │   └── ...
│   ├── styles/                # CSS dos componentes publicos
│   ├── hooks/                 # Custom hooks (useInView)
│   └── admin/
│       ├── components/        # Dashboard, Trips, Bookings, Settings
│       └── styles/            # CSS do painel admin
├── server/
│   ├── index.js               # Entry point + Stripe webhook
│   ├── db.js                  # Pool MySQL
│   ├── middleware/auth.js     # JWT middleware
│   └── routes/
│       ├── auth.js            # Login
│       ├── dashboard.js       # Estatisticas
│       ├── trips.js           # CRUD viagens
│       ├── bookings.js        # Gestao reservas
│       ├── settings.js        # Configuracoes
│       ├── upload.js          # Upload de imagens
│       └── public.js          # API publica + Stripe
├── .env.example               # Template de variaveis
├── package.json
└── vite.config.js
```

---

## API Endpoints

### Publicos

| Metodo | Rota | Descricao |
|--------|------|-----------|
| GET | `/api/public/banners` | Slides do carrossel |
| GET | `/api/public/trips` | Viagens ativas |
| GET | `/api/public/trips/:id` | Detalhes da viagem |
| GET | `/api/public/trips/:id/seats` | Assentos disponiveis |
| POST | `/api/public/bookings` | Criar reserva |
| GET | `/api/public/bookings/:code` | Consultar reserva |
| POST | `/api/public/bookings/:id/pix` | Gerar PIX |
| POST | `/api/public/bookings/:id/checkout` | Stripe Checkout |

### Admin (requer JWT)

| Metodo | Rota | Descricao |
|--------|------|-----------|
| POST | `/api/auth/login` | Login admin |
| GET | `/api/dashboard/stats` | Estatisticas gerais |
| GET | `/api/dashboard/revenue-by-trip` | Receita por viagem |
| GET/POST/PUT/DELETE | `/api/trips` | CRUD viagens |
| GET | `/api/trips/:id/stats` | Detalhes da viagem |
| GET | `/api/bookings` | Listar reservas |
| PUT | `/api/bookings/:id/status` | Atualizar status |
| PUT | `/api/bookings/:id/payment` | Atualizar pagamento |

---

## Stripe

Para testar pagamentos com cartao, use o cartao de teste:

```
Numero: 4242 4242 4242 4242
Validade: qualquer data futura
CVC: qualquer 3 digitos
```

Para receber webhooks em desenvolvimento:

```bash
stripe listen --forward-to localhost:3002/api/public/stripe/webhook
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

Projeto privado - Todos os direitos reservados.
