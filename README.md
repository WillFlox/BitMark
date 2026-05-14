# BitMarket

Tienda en línea construida con Next.js. Incluye catálogo de productos, carrito, checkout con Stripe, panel de administración, cupones, lista de favoritos y recomendaciones por imagen con Google Gemini.

## Características

- Catálogo público con categorías, detalle de producto y búsqueda por cámara
- Carrito, checkout y pedidos para usuarios autenticados
- Pagos con Stripe y confirmación por correo (SMTP)
- Panel de administración para productos, pedidos y cupones
- Cupones de descuento y métodos de envío configurables
- Lista de favoritos por usuario
- Recomendaciones de productos a partir de una imagen (`/api/ai-recommend`)

## Stack

- [Next.js 15](https://nextjs.org/) (App Router) y React 19
- [Prisma](https://www.prisma.io/) con SQLite
- [NextAuth.js](https://authjs.dev/) para autenticación
- [Stripe](https://stripe.com/) para pagos
- [Google Generative AI](https://ai.google.dev/) (Gemini) para recomendaciones visuales

## Requisitos

- Node.js 18 o superior
- npm
- Cuenta de Stripe (modo prueba para desarrollo)
- Opcional: clave de Gemini para la búsqueda por imagen; SMTP para correos de pedido

## Instalación local

```bash
git clone <url-del-repositorio>
cd BitMarket
npm install
```

Copia las variables de entorno y ajústalas:

```bash
cp .env.example .env.local
```

Crea la base de datos y carga datos de ejemplo:

```bash
npm run db:push
npm run db:seed
```

Inicia el servidor de desarrollo:

```bash
npm run dev
```

La aplicación queda disponible en [http://localhost:3000](http://localhost:3000). La ruta raíz redirige a `/productos`.

## Variables de entorno

| Variable | Descripción |
| --- | --- |
| `DATABASE_URL` | URL de Prisma (por defecto SQLite local: `file:./dev.db`) |
| `AUTH_SECRET` | Secreto para firmar sesiones de NextAuth |
| `NEXTAUTH_URL` / `AUTH_URL` | URL pública de la app |
| `AUTH_TRUST_HOST` | `true` detrás de proxy o túnel (ngrok, Railway, etc.) |
| `STRIPE_SECRET_KEY` | Clave secreta de Stripe |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Clave publicable de Stripe |
| `STRIPE_WEBHOOK_SECRET` | Secreto del webhook de Stripe |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `MAIL_FROM` | Envío de correos |
| `GEMINI_API_KEY` | Opcional; habilita recomendaciones por imagen |

## Scripts

| Comando | Uso |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Compilación de producción |
| `npm run start` | Servidor en producción |
| `npm run db:push` | Sincroniza el esquema Prisma con la base de datos |
| `npm run db:seed` | Carga usuarios, categorías y productos de ejemplo |
| `npm run db:studio` | Abre Prisma Studio |

## Cuentas de demostración

Tras ejecutar el seed:

| Rol | Correo | Contraseña |
| --- | --- | --- |
| Administrador | `admin@marketplace.com` | `password` |
| Cliente | `cliente@marketplace.com` | `password` |

Las rutas bajo `/admin` exigen rol `admin`. `/checkout`, `/mis-pedidos` y `/perfil` requieren sesión iniciada.

## Despliegue

El proyecto incluye configuración para [Railway](https://railway.app/) en `railway.json`: genera el cliente Prisma, compila la app y aplica el esquema con `prisma db push` al arrancar. Configura en el entorno de despliegue las mismas variables que en `.env.local` y la URL pública coherente con `AUTH_URL` / `NEXTAUTH_URL`.

## Documentación adicional

- Recomendación por imagen: [docs/ai-recomendacion-por-imagen.md](docs/ai-recomendacion-por-imagen.md)
