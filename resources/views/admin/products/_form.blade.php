<div class="row g-3">
    <div class="col-md-8">
        <label class="form-label">Nombre *</label>
        <input type="text" name="name" class="form-control @error('name') is-invalid @enderror"
               value="{{ old('name', $product->name ?? '') }}" required>
        @error('name') <div class="invalid-feedback">{{ $message }}</div> @enderror
    </div>

    <div class="col-md-4">
        <label class="form-label">Categoría *</label>
        <select name="category_id" class="form-select @error('category_id') is-invalid @enderror" required>
            <option value="">Seleccionar...</option>
            @foreach($categories as $cat)
                <option value="{{ $cat->id }}" @selected(old('category_id', $product->category_id ?? '') == $cat->id)>
                    {{ $cat->name }}
                </option>
            @endforeach
        </select>
        @error('category_id') <div class="invalid-feedback">{{ $message }}</div> @enderror
    </div>

    <div class="col-md-6">
        <label class="form-label">Precio *</label>
        <div class="input-group">
            <span class="input-group-text">$</span>
            <input type="number" name="price" step="0.01" min="0"
                   class="form-control @error('price') is-invalid @enderror"
                   value="{{ old('price', $product->price ?? '') }}" required>
        </div>
        @error('price') <div class="invalid-feedback">{{ $message }}</div> @enderror
    </div>

    <div class="col-md-6">
        <label class="form-label">Stock *</label>
        <input type="number" name="stock" min="0"
               class="form-control @error('stock') is-invalid @enderror"
               value="{{ old('stock', $product->stock ?? 0) }}" required>
        @error('stock') <div class="invalid-feedback">{{ $message }}</div> @enderror
    </div>

    <div class="col-12">
        <label class="form-label">Descripción</label>
        <textarea name="description" rows="3" class="form-control">{{ old('description', $product->description ?? '') }}</textarea>
    </div>

    <div class="col-md-6">
        <label class="form-label">Imagen</label>
        @isset($product)
            @if($product->image)
                <div class="mb-2">
                    <img src="{{ asset('storage/'.$product->image) }}" height="80" class="rounded" alt="">
                </div>
            @endif
        @endisset
        <input type="file" name="image" class="form-control" accept="image/*">
    </div>

    <div class="col-md-6 d-flex align-items-end">
        <div class="form-check form-switch">
            <input class="form-check-input" type="checkbox" name="active" id="active" value="1"
                   @checked(old('active', $product->active ?? true))>
            <label class="form-check-label" for="active">Producto activo</label>
        </div>
    </div>
</div>
