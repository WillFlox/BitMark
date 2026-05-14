import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import ImageUpload from "./../_components/ImageUpload";

async function createProduct(formData: FormData) {
  "use server";
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

  await prisma.product.create({
    data: { name, slug, description, categoryId, price, stock, image, active, productType, externalUrl, provider, tags },
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
                  <div className="col-md-6">
                    <label className="form-label">Tipo de producto *</label>
                    <select name="product_type" className="form-select" id="product_type_create">
                      <option value="physical">Físico</option>
                      <option value="digital">Digital</option>
                      <option value="external_game">Juego externo</option>
                    </select>
                  </div>
                  <div className="col-md-6" id="price_field_create">
                    <label className="form-label">Precio ($) *</label>
                    <input type="number" name="price" className="form-control" min="0" step="0.01" placeholder="0.00" />
                  </div>
                  <div className="col-md-6" id="stock_field_create">
                    <label className="form-label">Stock *</label>
                    <input type="number" name="stock" className="form-control" min="0" placeholder="0" />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Descripción</label>
                    <textarea name="description" className="form-control" rows={3} placeholder="Descripción del producto..."></textarea>
                  </div>
                  <ImageUpload />
                  <div className="col-md-6" id="external_url_field_create" style={{ display: "none" }}>
                    <label className="form-label">URL externa (juego)</label>
                    <input type="url" name="external_url" className="form-control" placeholder="https://..." />
                  </div>
                  <div className="col-md-6" id="provider_field_create" style={{ display: "none" }}>
                    <label className="form-label">Proveedor / Publisher</label>
                    <input type="text" name="provider" className="form-control" placeholder="Ej: Blink Galaxy" />
                  </div>
                  <div className="col-12" id="tags_field_create" style={{ display: "none" }}>
                    <label className="form-label">Etiquetas (separadas por coma)</label>
                    <input type="text" name="tags" className="form-control" placeholder="Ej: MMO,RPG,Free to Play,SKALE" />
                    <div className="form-text">Ej: MMO, Racing, Play-to-Earn, SKALE, Zero Gas</div>
                  </div>
                  <div className="col-12">
                    <div className="form-check">
                      <input type="checkbox" name="active" id="active" className="form-check-input" defaultChecked />
                      <label htmlFor="active" className="form-check-label">Producto activo (visible en la tienda)</label>
                    </div>
                  </div>
                </div>
                <script dangerouslySetInnerHTML={{ __html: `
                  (function(){
                    var sel = document.getElementById('product_type_create');
                    function toggle(){
                      var isGame = sel.value === 'external_game';
                      ['price_field_create','stock_field_create'].forEach(function(id){ document.getElementById(id).style.display = isGame ? 'none' : ''; });
                      ['external_url_field_create','provider_field_create','tags_field_create'].forEach(function(id){ document.getElementById(id).style.display = isGame ? '' : 'none'; });
                    }
                    sel.addEventListener('change', toggle);
                    toggle();
                  })();
                ` }} />
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
