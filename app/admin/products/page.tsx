import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { fmt, getImageUrl } from "@/types";

const PER_PAGE = 20;

async function deleteProduct(formData: FormData) {
  "use server";
  const id = parseInt(formData.get("product_id") as string);
  await prisma.product.delete({ where: { id } });
  revalidatePath("/admin/products");
  redirect("/admin/products?success=Producto+eliminado");
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; success?: string }>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page || "1") || 1);

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      include: { category: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
    }),
    prisma.product.count(),
  ]);

  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4" style={{ animation: "fadeInLeft .5s ease both" }}>
        <h2 className="fw-bold">
          <i className="bi bi-box-seam me-2"></i>Productos
        </h2>
        <a href="/admin/products/create" className="btn btn-primary">
          <i className="bi bi-plus-lg me-1"></i>Nuevo producto
        </a>
      </div>

      {sp.success && (
        <div className="alert alert-success alert-dismissible fade show">
          <i className="bi bi-check-circle-fill me-2"></i>{decodeURIComponent(sp.success)}
          <button type="button" className="btn-close" data-bs-dismiss="alert"></button>
        </div>
      )}

      <div className="table-responsive" style={{ animation: "fadeInUp .5s .1s ease both" }}>
        <table className="table table-hover align-middle">
          <thead className="table-dark">
            <tr>
              <th>Imagen</th><th>Nombre</th><th>Categoría</th><th>Precio</th><th>Stock</th><th>Estado</th><th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>
                  <img
                    src={getImageUrl(product.image, product.name)}
                    alt={product.name}
                    style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 8 }}
                  />
                </td>
                <td>
                  <strong>{product.name}</strong>
                  <br />
                  <small className="text-muted">{product.slug}</small>
                </td>
                <td>{product.category.name}</td>
                <td>${fmt(product.price)}</td>
                <td>
                  <span className={product.stock < 5 ? "text-danger fw-bold" : ""}>{product.stock}</span>
                </td>
                <td>
                  {product.active ? (
                    <span className="badge bg-success">Activo</span>
                  ) : (
                    <span className="badge bg-secondary">Inactivo</span>
                  )}
                </td>
                <td>
                  <div className="d-flex gap-2">
                    <a href={`/admin/products/${product.id}/edit`} className="btn btn-sm btn-outline-primary">
                      <i className="bi bi-pencil"></i>
                    </a>
                    <form action={deleteProduct}>
                      <input type="hidden" name="product_id" value={product.id} />
                      <button
                        type="submit"
                        className="btn btn-sm btn-outline-danger"
                        formAction={deleteProduct}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <nav className="mt-3">
          <ul className="pagination justify-content-center">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <li key={p} className={`page-item${p === page ? " active" : ""}`}>
                <a className="page-link" href={`/admin/products?page=${p}`}>{p}</a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </>
  );
}
