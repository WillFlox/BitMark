import { prisma } from "@/lib/prisma";
import { getImageUrl, fmt } from "@/types";
import { addToCart } from "@/lib/actions/cart";
import { WishlistButton } from "@/components/WishlistButton";

const ITEMS_PER_PAGE = 12;

interface SearchParams {
  search?: string;
  category?: string;
  min_price?: string;
  max_price?: string;
  page?: string;
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const search = sp.search || "";
  const category = sp.category || "";
  const minPrice = sp.min_price ? parseFloat(sp.min_price) : undefined;
  const maxPrice = sp.max_price ? parseFloat(sp.max_price) : undefined;
  const page = Math.max(1, parseInt(sp.page || "1") || 1);

  const hasFilters = !!(search || category || minPrice || maxPrice);

  const where = {
    active: true,
    ...(search && { name: { contains: search } }),
    ...(category && { category: { slug: category } }),
    ...(minPrice !== undefined && { price: { gte: minPrice } }),
    ...(maxPrice !== undefined && { price: { lte: maxPrice } }),
    ...(minPrice !== undefined && maxPrice !== undefined && {
      price: { gte: minPrice, lte: maxPrice },
    }),
  };

  const [products, total, categories, priceStats] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE,
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.product.aggregate({
      where: { active: true, productType: { not: "external_game" } },
      _min: { price: true },
      _max: { price: true },
    }),
  ]);

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  function buildUrl(params: Record<string, string | undefined>) {
    const merged = { search, category, min_price: sp.min_price, max_price: sp.max_price, page: "1", ...params };
    const qs = Object.entries(merged)
      .filter(([, v]) => v && v !== "")
      .map(([k, v]) => `${k}=${encodeURIComponent(v!)}`)
      .join("&");
    return `/productos${qs ? "?" + qs : ""}`;
  }

  return (
    <>
      <style>{`
        .hero-carousel { position: relative; border-radius: 20px; overflow: hidden; border: 1px solid var(--border); animation: fadeInUp .5s ease both; }
        .hero-slides-track { display: flex; transition: transform .6s cubic-bezier(.25,.8,.25,1); will-change: transform; }
        .hero-slide { min-width: 100%; position: relative; padding: clamp(28px,5vw,56px) clamp(20px,4vw,40px); overflow: hidden; }
        .hero-slide-bg { position: absolute; inset: 0; background-size: cover; background-position: center; transition: transform 8s linear; }
        .hero-slide::before { content: ''; position: absolute; inset: 0; z-index: 1; background: linear-gradient(135deg, rgba(10,15,35,.88) 0%, rgba(10,15,35,.65) 60%, transparent 100%); }
        .hero-slide::after { content: ''; position: absolute; inset: 0; z-index: 1; background: radial-gradient(ellipse 70% 90% at 80% 50%, rgba(99,102,241,.15), transparent); pointer-events: none; }
        .hero-slide-content { position: relative; z-index: 2; }
        .hero-badge { display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; border-radius: 999px; background: rgba(129,140,248,.18); border: 1px solid rgba(129,140,248,.35); font-size: .75rem; font-weight: 600; letter-spacing: .04em; color: var(--accent); margin-bottom: 16px; }
        .hero-title { font-size: clamp(1.75rem,4vw,2.6rem); font-weight: 800; line-height: 1.15; background: linear-gradient(45deg, #818cf8, #c084fc); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin-bottom: 12px; }
        .hero-subtitle { font-size: 1rem; color: rgba(203,213,225,.9); max-width: 480px; line-height: 1.65; margin-bottom: 0; }
        .hero-decoration { position: absolute; right: 40px; top: 50%; transform: translateY(-50%); z-index: 2; font-size: 7rem; opacity: .07; line-height: 1; pointer-events: none; animation: float 4s ease-in-out infinite; }
        .hero-cta { margin-top: 20px; display: inline-flex; align-items: center; gap: 7px; padding: 10px 22px; border-radius: 12px; font-size: .9rem; font-weight: 600; background: linear-gradient(45deg, var(--btn-from), var(--btn-to)); color: #fff; text-decoration: none; border: none; box-shadow: 0 8px 20px rgba(99,102,241,.35); transition: transform .25s, box-shadow .25s; }
        .hero-cta:hover { transform: translateY(-3px); box-shadow: 0 14px 28px rgba(99,102,241,.5); color: #fff; }
        .hero-arrow { position: absolute; top: 50%; transform: translateY(-50%); z-index: 10; width: 42px; height: 42px; border-radius: 50%; border: 1px solid transparent; background: transparent; color: transparent; font-size: 1rem; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background .25s, border-color .25s, color .25s, backdrop-filter .25s, transform .25s; outline: none; }
        .hero-arrow:hover { background: rgba(99,102,241,.5); border-color: var(--accent); color: #fff; backdrop-filter: blur(8px); transform: translateY(-50%) scale(1.1); }
        .hero-arrow-left { left: 14px; }
        .hero-arrow-right { right: 14px; }
        .hero-dots { position: absolute; bottom: 14px; left: 50%; transform: translateX(-50%); z-index: 10; display: flex; gap: 6px; align-items: center; }
        .hero-dot { width: 6px; height: 6px; border-radius: 999px; background: rgba(255,255,255,.35); cursor: pointer; border: none; padding: 0; transition: width .35s ease, background .35s ease; }
        .hero-dot.active { width: 22px; background: var(--accent); }
        @media (max-width: 575.98px) { .hero-decoration { display: none; } .hero-subtitle { font-size: .875rem; } }
        .products-header h2 { animation: fadeInLeft .5s ease both; background: linear-gradient(45deg, #818cf8, #c084fc); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-size: 1.5rem; }
        .filter-panel { background: rgba(255,255,255,.03); border: 1px solid var(--border); border-radius: 16px; overflow: hidden; animation: fadeInUp .45s .1s ease both; margin-bottom: 1.5rem; }
        .filter-search-row { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; padding: 14px 16px; border-bottom: 1px solid var(--border); }
        .filter-body { display: flex; align-items: flex-start; gap: 0; }
        .filter-section { flex: 1; padding: 14px 18px; }
        .filter-section + .filter-section { border-left: 1px solid var(--border); }
        .filter-label { display: block; font-size: .7rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: var(--text-muted); margin-bottom: 10px; }
        .chip { display: inline-flex; align-items: center; gap: 5px; padding: 5px 14px; border-radius: 999px; font-size: .8125rem; font-weight: 500; border: 1px solid var(--border); background: transparent; color: var(--text-muted); text-decoration: none; cursor: pointer; transition: color .2s, border-color .2s, background .2s, transform .2s; white-space: nowrap; }
        .chip:hover { color: var(--accent); border-color: var(--accent); background: rgba(129,140,248,.1); transform: translateY(-1px); }
        .chip.active { background: linear-gradient(45deg, var(--btn-from), var(--btn-to)); border-color: transparent; color: #fff; box-shadow: 0 4px 14px rgba(99,102,241,.35); }
        .price-inputs { display: flex; align-items: center; gap: 8px; }
        .price-inputs .form-control { width: 110px; min-width: 72px; }
        .price-inputs .price-icon { color: #818cf8; font-size: .9rem; flex-shrink: 0; }
        @media (max-width: 767.98px) { .filter-body { flex-direction: column; } .filter-section + .filter-section { border-left: none; border-top: 1px solid var(--border); } }
        .product-card .img-wrap { overflow: hidden; height: 200px; position: relative; border-radius: 13px 13px 0 0; }
        .product-card .img-wrap img { width: 100%; height: 100%; object-fit: cover; transition: transform .45s ease; }
        .product-card:hover .img-wrap img { transform: scale(1.09); }
        .product-card .img-wrap::after { content: ''; position: absolute; inset: 0; background: linear-gradient(to bottom, transparent 60%, rgba(99,102,241,.35)); opacity: 0; transition: opacity .35s; }
        .product-card:hover .img-wrap::after { opacity: 1; }
        .price-tag { background: linear-gradient(45deg, #818cf8, #c084fc); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-size: 1.2rem !important; }
        .desc-clamp { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.5; min-height: 3em; }
        @keyframes wiggle { 0%, 100% { transform: rotate(0); } 25% { transform: rotate(-14deg); } 75% { transform: rotate(14deg); } }
        .btn-cart:hover i { animation: wiggle .35s ease; }
        .empty-icon { color: #818cf8 !important; animation: float 3s ease-in-out infinite; }
        @media (max-width: 575.98px) { .product-card .img-wrap { height: 150px; } }
        .search-input-group { position: relative; flex: 1; }
        .search-input-group .bi-search { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #64748b; pointer-events: none; }
        .search-input-group .form-control { padding-left: 38px; }
      `}</style>

      {!hasFilters && (
        <div className="hero-carousel mb-5" id="heroCarousel" aria-label="Banner promocional">
          <div className="hero-slides-track" id="heroTrack">
            {[
              { bg: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&h=500&fit=crop&auto=format", badge: "bi-lightning-charge-fill", badgeText: "Marketplace tech", title: "Encuentra lo que necesitas,\nal mejor precio.", subtitle: "Explora nuestra selección de productos tecnológicos con envío rápido y garantía de calidad.", href: "#productos", btnText: "Ver catálogo", btnIcon: "bi-grid", deco: "bi-shop", catSlug: "" },
              { bg: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1200&h=500&fit=crop&auto=format", badge: "bi-cpu-fill", badgeText: "Electrónica", title: "Lo último en\ntecnología.", subtitle: "Auriculares, smartwatches, teclados mecánicos y más.", href: "/productos?category=electronica", btnText: "Ver electrónica", btnIcon: "bi-arrow-right-circle", deco: "bi-cpu", catSlug: "electronica" },
              { bg: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=1200&h=500&fit=crop&auto=format", badge: "bi-lightning-fill", badgeText: "Deportes & Moda", title: "Equípate y\nmarca tendencia.", subtitle: "Zapatillas, ropa premium y mochilas para rendir al máximo.", href: "/productos?category=deportes", btnText: "Ver deportes", btnIcon: "bi-arrow-right-circle", deco: "bi-trophy", catSlug: "deportes" },
              { bg: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&h=500&fit=crop&auto=format", badge: "bi-house-heart-fill", badgeText: "Hogar & Cultura", title: "Tu espacio,\ntu inspiración.", subtitle: "Lámparas, utensilios de cocina y los mejores libros.", href: "/productos?category=hogar", btnText: "Ver hogar", btnIcon: "bi-arrow-right-circle", deco: "bi-book", catSlug: "hogar" },
              { bg: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=1200&h=500&fit=crop&auto=format", badge: "bi-controller", badgeText: "Videojuegos Web3", title: "Juega en la\nblockchain, gratis.", subtitle: "Outer Ring MMO y RacerLoop en SKALE: zero gas, play-to-earn y economía de jugadores.", href: "/productos?category=videojuegos", btnText: "Ver juegos", btnIcon: "bi-play-circle-fill", deco: "bi-joystick", catSlug: "videojuegos" },
            ].map((slide, i) => (
              <div key={i} className="hero-slide" role="group" aria-label={`Slide ${i + 1} de 4`}>
                <div className="hero-slide-bg" style={{ backgroundImage: `url('${slide.bg}')` }}></div>
                <div className="hero-slide-content">
                  <span className="hero-badge"><i className={`bi ${slide.badge}`}></i> {slide.badgeText}</span>
                  <h1 className="hero-title">{slide.title.split("\n").map((t, j) => <span key={j}>{t}{j === 0 && <br />}</span>)}</h1>
                  <p className="hero-subtitle">{slide.subtitle}</p>
                  <a href={slide.href} className="hero-cta"><i className={`bi ${slide.btnIcon}`}></i> {slide.btnText}</a>
                </div>
                <div className="hero-decoration" aria-hidden="true"><i className={`bi ${slide.deco}`}></i></div>
              </div>
            ))}
          </div>
          <button className="hero-arrow hero-arrow-left" id="heroPrev" aria-label="Slide anterior">&#10094;</button>
          <button className="hero-arrow hero-arrow-right" id="heroNext" aria-label="Siguiente slide">&#10095;</button>
          <div className="hero-dots" role="tablist">
            {[0, 1, 2, 3, 4].map((i) => (
              <button key={i} className={`hero-dot${i === 0 ? " active" : ""}`} data-index={i} aria-label={`Ir al slide ${i + 1}`} role="tab"></button>
            ))}
          </div>
        </div>
      )}

      <div className="products-header d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3" id="productos">
        <h2 className="fw-bold mb-0">Nuestros Productos</h2>
        {total > 0 && <span className="text-muted small">{total} {total === 1 ? "producto" : "productos"}</span>}
      </div>

      <form action="/productos" method="GET" className="filter-panel mb-4">
        <div className="filter-search-row">
          <div className="search-input-group flex-grow-1" style={{ minWidth: 200 }}>
            <i className="bi bi-search"></i>
            <input type="text" name="search" className="form-control" placeholder="Buscar producto..." defaultValue={search} />
          </div>
          <button className="btn btn-primary px-3" type="submit">
            <i className="bi bi-search me-1"></i><span className="d-none d-sm-inline">Buscar</span>
          </button>
          {hasFilters && (
            <a href="/productos" className="btn btn-outline-secondary" title="Limpiar filtros">
              <i className="bi bi-x-lg"></i>
            </a>
          )}
        </div>
        <div className="filter-body">
          <div className="filter-section">
            <span className="filter-label"><i className="bi bi-grid me-1"></i>Categoría</span>
            <div className="d-flex flex-wrap gap-2">
              <button type="submit" name="category" value="" className={`chip${!category ? " active" : ""}`}>
                <i className="bi bi-grid-3x3-gap-fill"></i> Todas
              </button>
              {categories.map((cat) => (
                <button key={cat.id} type="submit" name="category" value={cat.slug} className={`chip${category === cat.slug ? " active" : ""}`}>
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
          <div className="filter-section" style={{ flex: "0 0 auto", minWidth: 260 }}>
            <span className="filter-label"><i className="bi bi-tag me-1"></i>Rango de precio</span>
            <div className="price-inputs">
              <i className="bi bi-currency-dollar price-icon"></i>
              <input type="number" name="min_price" className="form-control" placeholder={`Mín ${priceStats._min.price ? fmt(priceStats._min.price) : ""}`} defaultValue={sp.min_price || ""} min="0" step="0.01" />
              <span style={{ color: "var(--text-muted)", fontSize: ".85rem" }}>—</span>
              <input type="number" name="max_price" className="form-control" placeholder={`Máx ${priceStats._max.price ? fmt(priceStats._max.price) : ""}`} defaultValue={sp.max_price || ""} min="0" step="0.01" />
            </div>
          </div>
        </div>
      </form>

      {products.length === 0 ? (
        <div className="text-center py-5">
          <i className="bi bi-box-seam display-1 text-muted empty-icon"></i>
          <p className="text-muted mt-3">No se encontraron productos.</p>
        </div>
      ) : (
        <>
          <div className="row row-cols-2 row-cols-md-3 row-cols-lg-4 g-3 g-md-4" data-stagger="0.07" data-stagger-offset="0.05">
            {products.map((product) => (
              <div key={product.id} className="col aos-item">
                <div className="card product-card h-100 border-0 shadow-sm">
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
                            <i className="bi bi-broadcast me-1"></i>{product.provider} · SKALE · Zero Gas
                          </p>
                        )}
                        {product.tags && (
                          <div className="d-flex flex-wrap gap-1 mb-1">
                            {product.tags.split(",").slice(0, 3).map((tag) => (
                              <span key={tag} className="badge" style={{ background: "rgba(99,102,241,.15)", color: "#818cf8", border: "1px solid rgba(99,102,241,.25)", fontWeight: 500, fontSize: ".65rem" }}>{tag.trim()}</span>
                            ))}
                          </div>
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
                  <div className="card-footer bg-transparent border-0 d-flex gap-2">
                    <a href={`/productos/${product.slug}`} className="btn btn-outline-primary btn-sm flex-fill">Ver detalle</a>
                    {product.productType === "external_game" ? (
                      <a href={product.externalUrl ?? "#"} target="_blank" rel="noopener noreferrer" className="btn btn-sm" style={{ background: "linear-gradient(45deg,#7c3aed,#2563eb)", color: "#fff", whiteSpace: "nowrap" }} title="Jugar en Blink Galaxy">
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
                    <WishlistButton productId={product.id} />
                  </div>
                </div>
              </div>
            ))}
          </div>
          {totalPages > 1 && (
            <nav className="mt-4 aos-item" aria-label="Paginación">
              <ul className="pagination justify-content-center">
                <li className={`page-item${page <= 1 ? " disabled" : ""}`}>
                  <a className="page-link" href={buildUrl({ page: String(page - 1) })}>‹</a>
                </li>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <li key={p} className={`page-item${p === page ? " active" : ""}`}>
                    <a className="page-link" href={buildUrl({ page: String(p) })}>{p}</a>
                  </li>
                ))}
                <li className={`page-item${page >= totalPages ? " disabled" : ""}`}>
                  <a className="page-link" href={buildUrl({ page: String(page + 1) })}>›</a>
                </li>
              </ul>
            </nav>
          )}
        </>
      )}

      <script dangerouslySetInnerHTML={{ __html: `
        (function() {
          const track = document.getElementById('heroTrack');
          if (!track) return;
          const dots = document.querySelectorAll('.hero-dot');
          const total = dots.length;
          let idx = 0, timer = null;
          function render() {
            track.style.transform = 'translateX(-' + (idx * 100) + '%)';
            dots.forEach((d,i) => d.classList.toggle('active', i === idx));
          }
          function next() { idx = (idx + 1) % total; render(); }
          function go(dir) { idx = (idx + dir + total) % total; render(); resetTimer(); }
          function resetTimer() { clearInterval(timer); timer = setInterval(next, 4000); }
          document.getElementById('heroPrev')?.addEventListener('click', () => go(-1));
          document.getElementById('heroNext')?.addEventListener('click', () => go(1));
          dots.forEach(dot => dot.addEventListener('click', () => { idx = parseInt(dot.dataset.index); render(); resetTimer(); }));
          let touchX = 0;
          track.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
          track.addEventListener('touchend', e => { const diff = touchX - e.changedTouches[0].clientX; if (Math.abs(diff) > 40) go(diff > 0 ? 1 : -1); }, { passive: true });
          const carousel = document.getElementById('heroCarousel');
          carousel?.addEventListener('mouseenter', () => clearInterval(timer));
          carousel?.addEventListener('mouseleave', resetTimer);
          render(); resetTimer();
        })();
      ` }} />
    </>
  );
}
