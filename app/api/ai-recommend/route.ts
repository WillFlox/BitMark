import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY no configurada en el servidor." }, { status: 500 });
    }

    const { image } = await req.json();
    if (!image) {
      return NextResponse.json({ error: "Se requiere una imagen." }, { status: 400 });
    }

    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    const mimeMatch = image.match(/^data:(image\/\w+);base64,/);
    const mimeType = (mimeMatch ? mimeMatch[1] : "image/jpeg") as string;

    const products = await prisma.product.findMany({
      where: { active: true },
      include: { category: true },
      orderBy: { createdAt: "desc" },
    });

    const productList = products
      .map(
        (p) =>
          `- ID: ${p.id} | Nombre: "${p.name}" | Categoría: ${p.category.name} | Precio: $${p.price} | Descripción: ${p.description || "Sin descripción"} | Slug: ${p.slug}`
      )
      .join("\n");

    const prompt = `Eres un asistente de ventas experto en un marketplace de tecnología y productos variados llamado BitMarket.

El usuario te envía una fotografía y quiere que le recomiendes productos de nuestro catálogo que sean relevantes para lo que aparece en la imagen.

CATÁLOGO DISPONIBLE:
${productList}

INSTRUCCIONES:
1. Analiza qué hay en la imagen (objetos, actividad, contexto, colores, etc.)
2. Selecciona los 3 productos más relevantes y relacionados con lo que ves
3. Devuelve SOLO un JSON válido con este formato exacto (sin markdown, sin explicaciones extras, solo el objeto JSON):

{
  "analysis": "descripción breve de lo que ves en la imagen en español (máximo 2 oraciones)",
  "recommendations": [
    {
      "id": "id_del_producto",
      "slug": "slug_del_producto",
      "name": "nombre del producto",
      "reason": "explicación corta de por qué recomiendas este producto (1 oración)"
    }
  ]
}

Si no encuentras ningún producto relacionado, devuelve el JSON con "recommendations" como array vacío y explica en "analysis" por qué.`;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            { inlineData: { mimeType, data: base64Data } },
          ],
        },
      ],
    });

    const text = result.response.text().trim();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Respuesta de Gemini no contiene JSON válido");
    }

    const parsed = JSON.parse(jsonMatch[0]);

    const enriched = (parsed.recommendations || []).map(
      (rec: { id: string; slug: string; name: string; reason: string }) => {
        const recId = Number(rec.id);
        const product = products.find(
          (p) =>
            p.slug === rec.slug ||
            (!Number.isNaN(recId) && p.id === recId)
        );
        return { ...rec, product: product ?? null };
      }
    );

    return NextResponse.json({
      analysis: parsed.analysis,
      recommendations: enriched,
    });
  } catch (error: unknown) {
    console.error("[ai-recommend]", error);

    let message = "Error al procesar la recomendación. Intenta de nuevo.";

    if (error && typeof error === "object") {
      const err = error as Record<string, unknown>;
      const status = err.status as number | undefined;
      if (status === 429) {
        message = "Límite de uso de la API alcanzado. Verifica tu cuota en aistudio.google.com o intenta más tarde.";
      } else if (status === 403) {
        message = "API key inválida o sin permisos. Verifica tu GEMINI_API_KEY.";
      } else if (status === 404) {
        message = "Modelo de IA no disponible. Actualiza el modelo en la configuración.";
      }
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
