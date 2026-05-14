import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import ImageUpload from "./../_components/ImageUpload";

async function createProduct(formData: FormData) {
  "use server";
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

  await prisma.product.create({
    data: { name, slug, description, categoryId, price, stock, image, active },
  });

  revalidatePath("/admin/products");
  revalidatePath("/productos");
  redirect("/admin/products?success=Producto+creado+exitosamente");
}

export default async function AdminProductCreatePage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <>
      <nav aria-label="breadcrumb" style={{ animation: "fadeInDown .4s ease both" }}>
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><a href="/admin">Admin</a></li>
          <li className="breadcrumb-item"><a href="/admin/products">Productos</a></li>
          <li className="breadcrumb-item active">Nuevo producto</li>
        </ol>
      </nav>

      <h2 className="fw-bold mb-4" style={{ animation: "fadeInLeft .5s ease both" }}>
        <i className="bi bi-plus-circle me-2"></i>Nuevo Producto
      </h2>

      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm" style={{ animation: "fadeInUp .5s .1s ease both" }}>
            <div className="card-body p-4">
              <form action={createProduct}>
                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label">Nombre del producto *</label>
                    <input type="text" name="name" className="form-control" required placeholder="Ej: Auriculares Bluetooth" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Categoría *</label>
                    <select name="category_id" className="form-select" required>
                      <option value="">Seleccionar categoría</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Precio ($) *</label>
                    <input type="number" name="price" className="form-control" required min="0" step="0.01" placeholder="0.00" />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Stock *</label>
                    <input type="number" name="stock" className="form-control" required min="0" placeholder="0" />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Descripción</label>
                    <textarea name="description" className="form-control" rows={3} placeholder="Descripción del producto..."></textarea>
                  </div>
                  <ImageUpload />
                  <div className="col-12">
                    <div className="form-check">
                      <input type="checkbox" name="active" id="active" className="form-check-input" defaultChecked />
                      <label htmlFor="active" className="form-check-label">Producto activo (visible en la tienda)</label>
                    </div>
                  </div>
                </div>
                <div className="d-flex gap-2 mt-4">
                  <button type="submit" className="btn btn-primary">
                    <i className="bi bi-floppy me-1"></i>Crear producto
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
