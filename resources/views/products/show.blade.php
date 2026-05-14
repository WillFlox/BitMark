@extends('layouts.app')
@section('title', $product->name)

@push('styles')
<style>
    .product-img-col { animation: fadeInLeft .55s ease both; }
    .product-img-col img {
        border: 1px solid rgba(255,255,255,.1);
        transition: transform .4s ease, box-shadow .4s ease;
    }
    .product-img-col img:hover {
        transform: scale(1.03) rotate(-.5deg);
        box-shadow: 0 20px 50px rgba(99,102,241,.35) !important;
    }

    .product-detail-col { animation: fadeInRight .55s .1s ease both; }

    /* Precio con gradiente deco.css */
    .product-price {
        animation: popIn .5s .3s ease both;
        background: linear-gradient(45deg, #818cf8, #c084fc);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        font-size: 2.2rem !important;
    }

    .product-detail-col .badge { animation: fadeInDown .4s .2s ease both; }
    .product-detail-col h1     { animation: fadeInUp .45s .25s ease both; }
    .stock-info  { animation: fadeInUp .4s .35s ease both; }
    .product-desc { animation: fadeInUp .4s .4s ease both; }
    .product-cta  { animation: fadeInUp .5s .5s ease both; }

    /* Latido en botón agregar */
    @keyframes heartbeat {
        0%, 100% { transform: scale(1); }
        25%       { transform: scale(1.07); }
        50%       { transform: scale(.97); }
        75%       { transform: scale(1.04); }
    }
    .btn-add-cart:hover {
        animation: heartbeat .5s ease !important;
        box-shadow: 0 15px 30px rgba(99,102,241,.55) !important;
    }

    .breadcrumb { animation: fadeInDown .4s ease both; }
</style>
@endpush

@section('content')
<nav aria-label="breadcrumb">
    <ol class="breadcrumb">
        <li class="breadcrumb-item"><a href="{{ route('products.index') }}">Productos</a></li>
        <li class="breadcrumb-item active">{{ $product->name }}</li>
    </ol>
</nav>

<div class="row g-4">
    <div class="col-md-5 product-img-col">
        <img src="{{ $product->image_url }}" class="img-fluid rounded shadow-sm" alt="{{ $product->name }}">
    </div>
    <div class="col-md-7 product-detail-col">
        <span class="badge bg-secondary">{{ $product->category->name }}</span>
        <h1 class="fw-bold mt-2">{{ $product->name }}</h1>
        <p class="fs-2 fw-bold product-price">${{ number_format($product->price, 2) }}</p>

        <div class="stock-info">
            @if($product->stock > 0)
                <p class="text-success"><i class="bi bi-check-circle-fill"></i> En stock ({{ $product->stock }} disponibles)</p>
            @else
                <p class="text-danger"><i class="bi bi-x-circle-fill"></i> Sin stock</p>
            @endif
        </div>

        <p class="text-muted product-desc">{{ $product->description }}</p>

        @if($product->stock > 0)
            <form action="{{ route('cart.add', $product) }}" method="POST" class="d-flex align-items-center gap-3 mt-4 product-cta">
                @csrf
                <input type="number" name="quantity" value="1" min="1" max="{{ $product->stock }}" class="form-control w-auto">
                <button class="btn btn-primary btn-lg btn-add-cart">
                    <i class="bi bi-cart-plus"></i> Agregar al carrito
                </button>
            </form>
        @endif
    </div>
</div>
@endsection
