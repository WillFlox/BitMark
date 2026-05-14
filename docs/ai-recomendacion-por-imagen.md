# Recomendación de Productos con IA por Imagen

## Descripción general

Se implementó una funcionalidad de inteligencia artificial que permite a los usuarios tomar una foto en tiempo real desde su dispositivo y recibir recomendaciones de productos del catálogo de BitMarket basadas en el contenido visual de la imagen.

La IA analiza la fotografía, identifica los objetos o el contexto visible, y los compara contra todos los productos activos en la base de datos para devolver las 3 recomendaciones más relevantes con una explicación de por qué cada producto es adecuado.

---

## Stack tecnológico utilizado

| Componente | Tecnología |
|---|---|
| Modelo de IA | Google Gemini 2.5 Flash (multimodal) |
| SDK de IA | `@google/generative-ai` v0.24.1 |
| Captura de imagen | Web API `navigator.mediaDevices.getUserMedia` |
| API interna | Next.js App Router — Route Handler |
| Base de datos | Prisma + SQLite (productos activos) |

---

## Archivos creados / modificados

### 1. `app/api/ai-recommend/route.ts` — Ruta API (nuevo)

Endpoint `POST` que orquesta todo el proceso:

1. Valida que `GEMINI_API_KEY` esté configurada
2. Recibe la imagen en formato base64 desde el frontend
3. Consulta todos los productos activos en la BD con Prisma
4. Construye un prompt con el catálogo completo y lo envía a Gemini junto a la imagen
5. Parsea la respuesta JSON de Gemini
6. Enriquece las recomendaciones con los datos completos de cada producto
7. Devuelve el análisis y las recomendaciones al frontend

**Flujo de datos:**
```
POST /api/ai-recommend
  Body: { image: "data:image/jpeg;base64,..." }

  Response: {
    analysis: "Descripción de lo que la IA vio en la imagen",
    recommendations: [
      {
        id, slug, name, reason,
        product: { ...datos completos del producto }
      }
    ]
  }
```

---

### 2. `src/components/CameraSearch.tsx` — Componente cliente (nuevo)

Componente React (`"use client"`) que maneja toda la experiencia de usuario:

**Estados del flujo:**

| Estado | Descripción |
|---|---|
| `idle` | Iniciando cámara |
| `camera` | Cámara activa, esperando captura |
| `preview` | Foto tomada, esperando confirmación |
| `loading` | Analizando con Gemini |
| `results` | Recomendaciones mostradas |

**Características:**
- Abre un modal con acceso a la cámara trasera del dispositivo (`facingMode: "environment"`)
- Muestra un marco de enfoque animado sobre el video en vivo
- Captura la foto dibujando el frame del video en un `<canvas>` oculto y exportando como JPEG al 85% de calidad
- Libera el stream de la cámara inmediatamente tras la captura
- Muestra el análisis de la IA en una tarjeta con las razones de cada recomendación
- Cada recomendación enlaza directamente a la página de detalle del producto (`/productos/[slug]`)
- Cierra con `Escape` o clic fuera del modal

---

### 3. `app/productos/page.tsx` — Página de productos (modificado)

Se agregó el import del componente `CameraSearch` y se integró el botón **"Buscar por foto"** junto al encabezado de la sección de productos, alineado al contador de resultados.

```tsx
import { CameraSearch } from "@/components/CameraSearch";

// En el JSX:
<div className="d-flex align-items-center gap-3">
  {total > 0 && <span>{total} productos</span>}
  <CameraSearch />
</div>
```

---

### 4. `.env.local` y `.env.example` — Variables de entorno (modificado)

Se agregó la variable:

```env
GEMINI_API_KEY=tu-api-key-de-google-ai-studio
```

La clave se obtiene en [aistudio.google.com/apikey](https://aistudio.google.com/apikey) creando una nueva API key con la opción **"Create API key in new project"**.

---

### 5. `package.json` — Dependencia instalada

```bash
npm install @google/generative-ai
```

---

## Cómo usar la funcionalidad

1. Ir a `/productos` en la aplicación
2. Hacer clic en el botón morado **"Buscar por foto"** (esquina superior derecha del catálogo)
3. Permitir el acceso a la cámara cuando el navegador lo solicite
4. Apuntar la cámara al objeto que se desea buscar
5. Pulsar el botón circular para capturar la foto
6. Hacer clic en **"Analizar con IA"**
7. Gemini analiza la imagen y devuelve las 3 mejores recomendaciones del catálogo
8. Hacer clic en cualquier producto recomendado para ir a su página de detalle

---

## Prompt utilizado con Gemini

El prompt le indica al modelo que actúe como asistente de ventas de BitMarket, le pasa el catálogo completo en texto plano y le exige responder **únicamente en JSON válido** con el siguiente esquema:

```json
{
  "analysis": "descripción de lo que ve en la imagen",
  "recommendations": [
    {
      "id": "id del producto en la BD",
      "slug": "slug del producto",
      "name": "nombre del producto",
      "reason": "por qué se recomienda"
    }
  ]
}
```

El frontend extrae el bloque JSON con una expresión regular (`/\{[\s\S]*\}/`) para tolerar cualquier texto adicional que el modelo pudiera agregar.

---

## Requisitos

- Navegador con soporte para `getUserMedia` (Chrome, Firefox, Safari en HTTPS o localhost)
- API key de Google AI Studio con acceso al modelo `gemini-2.5-flash`
- Variable `GEMINI_API_KEY` configurada en `.env.local`
