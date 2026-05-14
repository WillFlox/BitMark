import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getImageUrl, fmt } from "@/types";
import { addToCart } from "@/lib/actions/cart";
import { WishlistButton } from "@/components/WishlistButton";

export const dynamic = "force-dynamic";

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

  const isExternalGame = product.productType === "external_game";
  const gameTags = isExternalGame && product.tags ? product.tags.split(",").map((t) => t.trim()) : [];

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
        .game-tag { display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 999px; background: rgba(99,102,241,.12); border: 1px solid rgba(99,102,241,.25); color: #818cf8; font-size: .75rem; font-weight: 500; }
        .btn-play-game { background: linear-gradient(45deg,#7c3aed,#2563eb); border: none; color: #fff; font-weight: 700; letter-spacing: .03em; box-shadow: 0 8px 24px rgba(124,58,237,.4); transition: transform .25s, box-shadow .25s; }
        .btn-play-game:hover { transform: translateY(-3px); box-shadow: 0 14px 32px rgba(124,58,237,.6); color: #fff; }
        .game-provider-badge { display: inline-flex; align-items: center; gap: 6px; padding: 5px 14px; border-radius: 999px; background: rgba(124,58,237,.12); border: 1px solid rgba(124,58,237,.3); font-size: .8rem; font-weight: 600; color: #a78bfa; }
        .game-network-info { background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.08); border-radius: 14px; padding: 14px 18px; }
      `}</style>

      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><a href="/productos">Productos</a></li>
          {isExternalGame && <li className="breadcrumb-item"><a href="/productos?category=videojuegos">Videojuegos</a></li>}
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
          {isExternalGame && (
            <div className="mt-3 game-network-info" style={{ animation: "fadeInUp .5s .3s ease both" }}>
              <p className="mb-1 small fw-semibold" style={{ color: "var(--text-muted)", letterSpacing: ".05em", textTransform: "uppercase", fontSize: ".7rem" }}>Red blockchain</p>
              <div className="d-flex align-items-center gap-2">
                <i className="bi bi-heptagon-fill" style={{ color: "#a78bfa" }}></i>
                <span className="fw-bold" style={{ color: "#e2e8f0" }}>SKALE Network · Zero Gas</span>
              </div>
            </div>
          )}
        </div>
        <div className="col-md-7 product-detail-col">
          <div className="d-flex align-items-center gap-2 flex-wrap mb-2">
            <span className="badge bg-secondary">{product.category.name}</span>
            {isExternalGame && (
              <span className="game-provider-badge">
                <i className="bi bi-controller"></i>{product.provider ?? "Web3 Game"}
              </span>
            )}
          </div>

          <h1 className="fw-bold mt-1">{product.name}</h1>

          {isExternalGame ? (
            <p className="fw-bold mb-3" style={{ color: "#4ade80", fontSize: "1.3rem", animation: "popIn .5s .3s ease both" }}>
              <i className="bi bi-gift-fill me-2"></i>Free to Play
            </p>
          ) : (
            <p className="fs-2 fw-bold product-price">${fmt(product.price)}</p>
          )}

          {!isExternalGame && (
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
          )}

          {product.description && (
            <p className="text-muted" style={{ animation: "fadeInUp .4s .4s ease both" }}>
              {product.description}
            </p>
          )}

          {isExternalGame && gameTags.length > 0 && (
            <div className="d-flex flex-wrap gap-2 mb-4" style={{ animation: "fadeInUp .4s .45s ease both" }}>
              {gameTags.map((tag) => (
                <span key={tag} className="game-tag">{tag}</span>
              ))}
            </div>
          )}

          {isExternalGame ? (
            <div style={{ animation: "fadeInUp .5s .5s ease both" }}>
              <div className="d-flex align-items-center gap-3 flex-wrap">
                <a
                  href={product.externalUrl ?? "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-lg btn-play-game d-inline-flex align-items-center gap-2"
                >
                  <i className="bi bi-play-circle-fill"></i> Jugar en Blink Galaxy
                </a>
                <WishlistButton productId={product.id} size="lg" />
              </div>
              <p className="text-muted small mt-2">
                <i className="bi bi-box-arrow-up-right me-1"></i>
                Se abrirá en el sitio oficial de Blink Galaxy
              </p>
            </div>
          ) : product.stock > 0 ? (
            <div className="d-flex align-items-center gap-3 flex-wrap mt-4" style={{ animation: "fadeInUp .5s .5s ease both" }}>
              <form
                action={addToCart}
                className="d-flex align-items-center gap-3"
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
              <WishlistButton productId={product.id} size="lg" />
            </div>
          ) : (
            <div className="d-flex align-items-center gap-3 mt-4" style={{ animation: "fadeInUp .5s .5s ease both" }}>
              <button className="btn btn-secondary btn-lg" disabled>Sin stock</button>
              <WishlistButton productId={product.id} size="lg" />
            </div>
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
