@extends('layouts.app')
@section('title', 'Nuevo Producto')

@section('content')
<div class="d-flex justify-content-between align-items-center mb-4">
    <h2 class="fw-bold">Nuevo Producto</h2>
    <a href="{{ route('admin.products.index') }}" class="btn btn-outline-secondary"><i class="bi bi-arrow-left"></i> Volver</a>
</div>

<div class="card border-0 shadow-sm">
    <div class="card-body">
        <form action="{{ route('admin.products.store') }}" method="POST" enctype="multipart/form-data">
            @csrf
            @include('admin.products._form')
            <button type="submit" class="btn btn-primary mt-3"><i class="bi bi-save"></i> Guardar producto</button>
        </form>
    </div>
</div>
@endsection
