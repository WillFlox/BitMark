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
  const productType = (formData.get("product_type") as string) || "physical";
  const price = productType === "external_game" ? 0 : parseFloat(formData.get("price") as string) || 0;
  const stock = productType === "external_game" ? 0 : parseInt(formData.get("stock") as string) || 0;
  const image = (formData.get("image") as string)?.trim() || null;
  const active = formData.get("active") === "on";
  const externalUrl = (formData.get("external_url") as string)?.trim() || null;
  const provider = (formData.get("provider") as string)?.trim() || null;
  const tags = (formData.get("tags") as string)?.trim() || null;

  const slug = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

  await prisma.product.update({
    where: { id },
    data: { name, slug, description, categoryId, price, stock, image, active, productType, externalUrl, provider, tags },
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
                  <div className="col-md-6">
                    <label className="form-label">Tipo de producto *</label>
                    <select name="product_type" className="form-select" id="product_type_edit" defaultValue={product.productType}>
                      <option value="physical">Físico</option>
                      <option value="digital">Digital</option>
                      <option value="external_game">Juego externo</option>
                    </select>
                  </div>
                  <div className="col-md-6" id="price_field_edit">
                    <label className="form-label">Precio ($) *</label>
                    <input type="number" name="price" className="form-control" min="0" step="0.01" defaultValue={product.price} />
                  </div>
                  <div className="col-md-6" id="stock_field_edit">
                    <label className="form-label">Stock *</label>
                    <input type="number" name="stock" className="form-control" min="0" defaultValue={product.stock} />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Descripción</label>
                    <textarea name="description" className="form-control" rows={3} defaultValue={product.description ?? ""}></textarea>
                  </div>
                  <ImageUpload currentImage={product.image} />
                  <div className="col-md-6" id="external_url_field_edit">
                    <label className="form-label">URL externa (juego)</label>
                    <input type="url" name="external_url" className="form-control" placeholder="https://..." defaultValue={product.externalUrl ?? ""} />
                  </div>
                  <div className="col-md-6" id="provider_field_edit">
                    <label className="form-label">Proveedor / Publisher</label>
                    <input type="text" name="provider" className="form-control" placeholder="Ej: Blink Galaxy" defaultValue={product.provider ?? ""} />
                  </div>
                  <div className="col-12" id="tags_field_edit">
                    <label className="form-label">Etiquetas (separadas por coma)</label>
                    <input type="text" name="tags" className="form-control" placeholder="Ej: MMO,RPG,Free to Play,SKALE" defaultValue={product.tags ?? ""} />
                    <div className="form-text">Ej: MMO, Racing, Play-to-Earn, SKALE, Zero Gas</div>
                  </div>
                  <div className="col-12">
                    <div className="form-check">
                      <input type="checkbox" name="active" id="active" className="form-check-input" defaultChecked={product.active} />
                      <label htmlFor="active" className="form-check-label">Producto activo (visible en la tienda)</label>
                    </div>
                  </div>
                </div>
                <script dangerouslySetInnerHTML={{ __html: `
                  (function(){
                    var sel = document.getElementById('product_type_edit');
                    function toggle(){
                      var isGame = sel.value === 'external_game';
                      ['price_field_edit','stock_field_edit'].forEach(function(id){ document.getElementById(id).style.display = isGame ? 'none' : ''; });
                      ['external_url_field_edit','provider_field_edit','tags_field_edit'].forEach(function(id){ document.getElementById(id).style.display = isGame ? '' : 'none'; });
                    }
                    sel.addEventListener('change', toggle);
                    toggle();
                  })();
                ` }} />
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
