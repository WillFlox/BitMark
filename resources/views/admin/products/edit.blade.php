@extends('layouts.app')
@section('title', 'Editar Producto')

@section('content')
<div class="d-flex justify-content-between align-items-center mb-4">
    <h2 class="fw-bold">Editar: {{ $product->name }}</h2>
    <a href="{{ route('admin.products.index') }}" class="btn btn-outline-secondary"><i class="bi bi-arrow-left"></i> Volver</a>
</div>

<div class="card border-0 shadow-sm">
    <div class="card-body">
        <form action="{{ route('admin.products.update', $product) }}" method="POST" enctype="multipart/form-data">
            @csrf @method('PUT')
            @include('admin.products._form')
            <button type="submit" class="btn btn-primary mt-3"><i class="bi bi-save"></i> Actualizar producto</button>
        </form>
    </div>
</div>
@endsection
