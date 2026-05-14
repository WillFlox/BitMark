export interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string | null;
  quantity: number;
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    awaiting_payment: "Pago pendiente",
    pending: "Pendiente",
    processing: "Procesando",
    shipped: "Enviado",
    delivered: "Entregado",
    cancelled: "Cancelado",
  };
  return labels[status] ?? status;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    awaiting_payment: "secondary",
    pending: "warning",
    processing: "info",
    shipped: "primary",
    delivered: "success",
    cancelled: "danger",
  };
  return colors[status] ?? "secondary";
}

export function getImageUrl(image: string | null, name: string): string {
  if (!image) {
    return `https://placehold.co/400x300/1e293b/818cf8?text=${encodeURIComponent(name)}`;
  }
  if (image.startsWith("http") || image.startsWith("/")) return image;
  return `/storage/${image}`;
}

export function fmt(price: number): string {
  return price.toFixed(2);
}
