import { prisma } from "@/lib/prisma";
import { fmt, getImageUrl } from "@/types";
import { sendMail } from "@/lib/email/mailer";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getAppBaseUrl(): string {
  return process.env.NEXTAUTH_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
}

function getAbsoluteImageUrl(image: string | null, name: string): string {
  const url = getImageUrl(image, name);
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  return `${getAppBaseUrl()}${url.startsWith("/") ? url : `/${url}`}`;
}

export async function sendOrderConfirmationEmail(orderId: number): Promise<void> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: { include: { product: true } },
      shippingMethod: true,
      user: true,
      coupon: true,
    },
  });

  if (!order) {
    return;
  }

  const orderUrl = `${getAppBaseUrl()}/mis-pedidos/${order.id}`;
  const subject = `Confirmación de pedido #${order.id} — BitMarket`;

  const itemLines = order.items.map((item) => {
    const line = `${item.product.name} × ${item.quantity} — $${fmt(item.subtotal)}`;
    return `- ${line}`;
  });

  const textLines = [
    `Hola ${order.user.name},`,
    "",
    `Recibimos tu pedido #${order.id}.`,
    "",
    "Productos:",
    ...itemLines,
    "",
    `Subtotal: $${fmt(order.subtotal)}`,
    order.discountAmount > 0
      ? `Descuento${order.coupon ? ` (${order.coupon.code})` : ""}: -$${fmt(order.discountAmount)}`
      : null,
    `Envío (${order.shippingMethod.name}): ${
      order.shippingCost > 0 ? `$${fmt(order.shippingCost)}` : "Gratis"
    }`,
    `Total: $${fmt(order.total)}`,
    "",
    "Dirección de envío:",
    order.shippingAddress,
    order.shippingCity,
    order.shippingPhone,
    "",
    `Ver pedido: ${orderUrl}`,
  ].filter((line): line is string => line !== null);

  const itemRows = order.items
    .map((item) => {
      const imageUrl = getAbsoluteImageUrl(item.product.image, item.product.name);

      return `
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #e2e8f0;width:72px;vertical-align:top;">
            <img
              src="${escapeHtml(imageUrl)}"
              alt="${escapeHtml(item.product.name)}"
              width="56"
              height="56"
              style="display:block;width:56px;height:56px;border-radius:8px;object-fit:cover;"
            />
          </td>
          <td style="padding:8px 0 8px 12px;border-bottom:1px solid #e2e8f0;vertical-align:top;">
            <strong>${escapeHtml(item.product.name)}</strong><br />
            <span style="color:#64748b;font-size:14px;">× ${item.quantity} — $${fmt(item.unitPrice)} c/u</span>
          </td>
          <td style="padding:8px 0;border-bottom:1px solid #e2e8f0;text-align:right;white-space:nowrap;vertical-align:top;">
            $${fmt(item.subtotal)}
          </td>
        </tr>`;
    })
    .join("");

  const discountRow =
    order.discountAmount > 0
      ? `
        <tr>
          <td style="padding:4px 0;color:#64748b;">Descuento${
            order.coupon ? ` (${escapeHtml(order.coupon.code)})` : ""
          }</td>
          <td style="padding:4px 0;text-align:right;color:#16a34a;">-$${fmt(order.discountAmount)}</td>
        </tr>`
      : "";

  const shippingLabel = `Envío (${escapeHtml(order.shippingMethod.name)})`;
  const shippingValue =
    order.shippingCost > 0 ? `$${fmt(order.shippingCost)}` : "Gratis";

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.5;color:#0f172a;max-width:640px;margin:0 auto;">
      <h1 style="font-size:24px;margin:0 0 8px;">Pedido confirmado</h1>
      <p style="margin:0 0 16px;color:#475569;">
        Hola ${escapeHtml(order.user.name)}, recibimos tu pedido <strong>#${order.id}</strong>.
      </p>
      <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
        <tbody>
          ${itemRows}
        </tbody>
      </table>
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
        <tbody>
          <tr>
            <td style="padding:4px 0;color:#64748b;">Subtotal</td>
            <td style="padding:4px 0;text-align:right;">$${fmt(order.subtotal)}</td>
          </tr>
          ${discountRow}
          <tr>
            <td style="padding:4px 0;color:#64748b;">${shippingLabel}</td>
            <td style="padding:4px 0;text-align:right;">${shippingValue}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;font-weight:700;font-size:18px;">Total</td>
            <td style="padding:8px 0;text-align:right;font-weight:700;font-size:18px;">$${fmt(order.total)}</td>
          </tr>
        </tbody>
      </table>
      <div style="background:#f8fafc;border-radius:8px;padding:16px;margin-bottom:24px;">
        <p style="margin:0 0 8px;font-weight:700;">Dirección de envío</p>
        <p style="margin:0;">${escapeHtml(order.shippingAddress)}</p>
        <p style="margin:4px 0 0;color:#64748b;">${escapeHtml(order.shippingCity)}</p>
        <p style="margin:4px 0 0;color:#64748b;">${escapeHtml(order.shippingPhone)}</p>
      </div>
      <p style="margin:0;">
        <a href="${orderUrl}" style="display:inline-block;background:#4f46e5;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:8px;font-weight:600;">
          Ver mi pedido
        </a>
      </p>
    </div>
  `;

  await sendMail({
    to: order.user.email,
    subject,
    html,
    text: textLines.join("\n"),
  });
}
