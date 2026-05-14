import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import ImageUpload from "../../_components/ImageUpload";

async function updateProduct(formData: FormData) {
  "use server";
  const id = parseInt(formData.get("id") as string);
  const name = (formData.get("name") as string).trim();
  const description = (formData.get("description") as string)?.trim() || null;
  const categoryId = parseInt(formData.get("category_id") as string);
  const price = parseFloat(formData.get("price") as string);
  const stock = parseInt(formData.get("stock") as string);
  const image = (formData.get("image") as string)?.trim() || null;
  const active = formData.get("active") === "on";

  const slug = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

  await prisma.product.update({
    where: { id },
    data: { name, slug, description, categoryId, price, stock, image, active },
  });

  revalidatePath("/admin/products");
  revalidatePath("/productos");
  redirect("/admin/products?success=Producto+actualizado+exitosamente");
}

export default async function AdminProductEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const productId = parseInt(id);

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id: productId } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!product) notFound();

  return (
    <>
      <nav aria-label="breadcrumb" style={{ animation: "fadeInDown .4s ease both" }}>
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><a href="/admin">Admin</a></li>
          <li className="breadcrumb-item"><a href="/admin/products">Productos</a></li>
          <li className="breadcrumb-item active">Editar: {product.name}</li>
        </ol>
      </nav>

      <h2 className="fw-bold mb-4" style={{ animation: "fadeInLeft .5s ease both" }}>
        <i className="bi bi-pencil me-2"></i>Editar Producto
      </h2>

      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm" style={{ animation: "fadeInUp .5s .1s ease both" }}>
            <div className="card-body p-4">
              <form action={updateProduct}>
                <input type="hidden" name="id" value={product.id} />
                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label">Nombre del producto *</label>
                    <input type="text" name="name" className="form-control" required defaultValue={product.name} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Categoría *</label>
                    <select name="category_id" className="form-select" required defaultValue={product.categoryId}>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Precio ($) *</label>
                    <input type="number" name="price" className="form-control" required min="0" step="0.01" defaultValue={product.price} />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Stock *</label>
                    <input type="number" name="stock" className="form-control" required min="0" defaultValue={product.stock} />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Descripción</label>
                    <textarea name="description" className="form-control" rows={3} defaultValue={product.description ?? ""}></textarea>
                  </div>
                  <ImageUpload currentImage={product.image} />
                  <div className="col-12">
                    <div className="form-check">
                      <input type="checkbox" name="active" id="active" className="form-check-input" defaultChecked={product.active} />
                      <label htmlFor="active" className="form-check-label">Producto activo (visible en la tienda)</label>
                    </div>
                  </div>
                </div>
                <div className="d-flex gap-2 mt-4">
                  <button type="submit" className="btn btn-primary">
                    <i className="bi bi-floppy me-1"></i>Guardar cambios
                  </button>
                  <a href="/admin/products" className="btn btn-outline-secondary">Cancelar</a>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
