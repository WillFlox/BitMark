import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getImageUrl, fmt, SessionUser } from "@/types";
import { removeFromWishlist, toggleWishlist } from "@/lib/actions/wishlist";
import { addToCart } from "@/lib/actions/cart";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Mis favoritos — BitMark",
  description: "Tu lista de productos favoritos.",
};

export default async function FavoritosPage({
  searchParams,
}: {
  searchParams: Promise<{ removed?: string }>;
}) {
  const session = await auth();
  const user = session?.user as SessionUser | undefined;

  if (!user?.id) {
    redirect("/login?redirect=/favoritos");
  }

  const sp = await searchParams;
  const userId = parseInt(user.id);

  const wishlistItems = await prisma.wishlistItem.findMany({
    where: { userId },
    include: {
      product: {
        include: { category: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <style>{`
        .wishlist-title { background: linear-gradient(45deg, #818cf8, #c084fc); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .wishlist-card .img-wrap { overflow: hidden; height: 200px; position: relative; border-radius: 13px 13px 0 0; }
        .wishlist-card .img-wrap img { width: 100%; height: 100%; object-fit: cover; transition: transform .45s ease; }
        .wishlist-card:hover .img-wrap img { transform: scale(1.07); }
        .price-tag { background: linear-gradient(45deg, #818cf8, #c084fc); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-size: 1.2rem !important; }
        .desc-clamp { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.5; min-height: 3em; }
        .btn-remove-wish { background: transparent; border: 1px solid rgba(248,113,113,.3); color: var(--danger); border-radius: 10px; padding: 5px 10px; font-size: .8rem; transition: background .25s, border-color .25s, transform .25s; }
        .btn-remove-wish:hover { background: rgba(248,113,113,.15); border-color: var(--danger); transform: scale(1.05); }
        .empty-heart { color: #818cf8 !important; animation: float 3s ease-in-out infinite; }
        @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        .alert-wish { animation: slideAlert .4s ease both; }
        @keyframes slideAlert { from { opacity:0; transform: translateY(-10px); } to { opacity:1; transform: translateY(0); } }
        .wish-count-badge { background: linear-gradient(45deg, var(--btn-from), var(--btn-to)); color: #fff; font-size: .75rem; padding: 3px 10px; border-radius: 999px; font-weight: 600; }
        @keyframes wiggle { 0%, 100% { transform: rotate(0); } 25% { transform: rotate(-14deg); } 75% { transform: rotate(14deg); } }
        .btn-cart:hover i { animation: wiggle .35s ease; }
      `}</style>

      <div className="d-flex align-items-center gap-3 mb-4" style={{ animation: "fadeInDown .4s ease both" }}>
        <h1 className="fw-bold mb-0 wishlist-title">
          <i className="bi bi-heart-fill me-2"></i>Mis Favoritos
        </h1>
        {wishlistItems.length > 0 && (
          <span className="wish-count-badge">{wishlistItems.length}</span>
        )}
      </div>

      {sp.removed && (
        <div className="alert alert-success alert-dismissible alert-wish mb-4" role="alert">
          <i className="bi bi-check-circle-fill me-2"></i> Producto eliminado de favoritos.
          <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Cerrar"></button>
        </div>
      )}

      {wishlistItems.length === 0 ? (
        <div className="text-center py-5" style={{ animation: "fadeInUp .5s ease both" }}>
          <i className="bi bi-heart display-1 empty-heart"></i>
          <h4 className="mt-4 fw-bold" style={{ color: "var(--text)" }}>Tu lista de favoritos está vacía</h4>
          <p className="text-muted mb-4">Guarda los productos que te interesen para encontrarlos fácilmente.</p>
          <a href="/productos" className="btn btn-primary">
            <i className="bi bi-grid me-2"></i>Explorar productos
          </a>
        </div>
      ) : (
        <>
          <div className="row row-cols-2 row-cols-md-3 row-cols-lg-4 g-3 g-md-4" data-stagger="0.07" data-stagger-offset="0.05">
            {wishlistItems.map(({ product }, index) => (
              <div key={product.id} className="col aos-item" style={{ animationDelay: `${index * 0.07}s` }}>
                <div className="card wishlist-card h-100 border-0 shadow-sm">
                  <div className="img-wrap">
                    <img src={getImageUrl(product.image, product.name)} alt={product.name} loading="lazy" />
                  </div>
                  <div className="card-body d-flex flex-column gap-1">
                    <div className="d-flex align-items-center gap-1 flex-wrap mb-1">
                      <span className="badge bg-secondary align-self-start">{product.category.name}</span>
                      {product.productType === "external_game" && (
                        <span className="badge align-self-start" style={{ background: "linear-gradient(45deg,#7c3aed,#2563eb)", fontSize: ".65rem", letterSpacing: ".04em" }}>
                          <i className="bi bi-controller me-1"></i>Free to Play
                        </span>
                      )}
                    </div>
                    <h6 className="card-title fw-bold mb-1">{product.name}</h6>
                    {product.description && (
                      <p className="card-text small text-muted desc-clamp mb-1">{product.description}</p>
                    )}
                    {product.productType === "external_game" ? (
                      <>
                        {product.provider && (
                          <p className="card-text small mb-1 mt-auto" style={{ color: "var(--accent)" }}>
                            <i className="bi bi-broadcast me-1"></i>{product.provider} · SKALE
                          </p>
                        )}
                      </>
                    ) : (
                      <>
                        <p className="card-text price-tag fw-bold fs-5 mb-1 mt-auto">${fmt(product.price)}</p>
                        <p className="card-text small text-muted mb-0">
                          {product.stock > 0 ? (
                            <><i className="bi bi-check-circle-fill text-success"></i> {product.stock} en stock</>
                          ) : (
                            <><i className="bi bi-x-circle-fill text-danger"></i> Sin stock</>
                          )}
                        </p>
                      </>
                    )}
                  </div>
                  <div className="card-footer bg-transparent border-0 d-flex flex-column gap-2">
                    <div className="d-flex gap-2">
                      <a href={`/productos/${product.slug}`} className="btn btn-outline-primary btn-sm flex-fill">Ver detalle</a>
                      {product.productType === "external_game" ? (
                        <a href={product.externalUrl ?? "#"} target="_blank" rel="noopener noreferrer" className="btn btn-sm" style={{ background: "linear-gradient(45deg,#7c3aed,#2563eb)", color: "#fff" }} title="Jugar">
                          <i className="bi bi-play-fill"></i>
                        </a>
                      ) : product.stock > 0 ? (
                        <form action={addToCart}>
                          <input type="hidden" name="product_id" value={product.id} />
                          <input type="hidden" name="quantity" value="1" />
                          <button className="btn btn-primary btn-sm btn-cart" title="Agregar al carrito">
                            <i className="bi bi-cart-plus"></i>
                          </button>
                        </form>
                      ) : (
                        <button className="btn btn-secondary btn-sm" disabled>Agotado</button>
                      )}
                    </div>
                    <form action={removeFromWishlist}>
                      <input type="hidden" name="product_id" value={product.id} />
                      <button type="submit" className="btn-remove-wish w-100">
                        <i className="bi bi-heart-fill me-1"></i> Quitar de favoritos
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4" style={{ animation: "fadeInUp .4s .2s ease both" }}>
            <a href="/productos" className="btn btn-outline-primary">
              <i className="bi bi-arrow-left me-2"></i>Seguir explorando
            </a>
          </div>
        </>
      )}
    </>
  );
}
