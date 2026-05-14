import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getImageUrl, fmt } from "@/types";
import { addToCart } from "@/lib/actions/cart";

export default async function ProductShowPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: { category: true },
  });

  if (!product || !product.active) notFound();

  return (
    <>
      <style>{`
        .product-img-col { animation: fadeInLeft .55s ease both; }
        .product-img-col img { border: 1px solid rgba(255,255,255,.1); transition: transform .4s ease, box-shadow .4s ease; }
        .product-img-col img:hover { transform: scale(1.03) rotate(-.5deg); box-shadow: 0 20px 50px rgba(99,102,241,.35) !important; }
        .product-detail-col { animation: fadeInRight .55s .1s ease both; }
        .product-price { animation: popIn .5s .3s ease both; background: linear-gradient(45deg, #818cf8, #c084fc); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-size: 2.2rem !important; }
        @keyframes heartbeat { 0%, 100% { transform: scale(1); } 25% { transform: scale(1.07); } 50% { transform: scale(.97); } 75% { transform: scale(1.04); } }
        .btn-add-cart:hover { animation: heartbeat .5s ease !important; box-shadow: 0 15px 30px rgba(99,102,241,.55) !important; }
        .breadcrumb { animation: fadeInDown .4s ease both; }
      `}</style>

      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><a href="/productos">Productos</a></li>
          <li className="breadcrumb-item active">{product.name}</li>
        </ol>
      </nav>

      <div className="row g-4">
        <div className="col-md-5 product-img-col">
          <img
            src={getImageUrl(product.image, product.name)}
            className="img-fluid rounded shadow-sm"
            alt={product.name}
          />
        </div>
        <div className="col-md-7 product-detail-col">
          <span className="badge bg-secondary">{product.category.name}</span>
          <h1 className="fw-bold mt-2">{product.name}</h1>
          <p className="fs-2 fw-bold product-price">${fmt(product.price)}</p>

          <div style={{ animation: "fadeInUp .4s .35s ease both" }}>
            {product.stock > 0 ? (
              <p className="text-success">
                <i className="bi bi-check-circle-fill"></i> En stock ({product.stock} disponibles)
              </p>
            ) : (
              <p className="text-danger">
                <i className="bi bi-x-circle-fill"></i> Sin stock
              </p>
            )}
          </div>

          {product.description && (
            <p className="text-muted" style={{ animation: "fadeInUp .4s .4s ease both" }}>
              {product.description}
            </p>
          )}

          {product.stock > 0 && (
            <form
              action={addToCart}
              className="d-flex align-items-center gap-3 mt-4"
              style={{ animation: "fadeInUp .5s .5s ease both" }}
            >
              <input type="hidden" name="product_id" value={product.id} />
              <input
                type="number"
                name="quantity"
                defaultValue="1"
                min="1"
                max={product.stock}
                className="form-control w-auto"
              />
              <button className="btn btn-primary btn-lg btn-add-cart">
                <i className="bi bi-cart-plus"></i> Agregar al carrito
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug } });
  return {
    title: product ? `${product.name} — BitMark` : "Producto — BitMark",
    description: product?.description ?? undefined,
  };
}
