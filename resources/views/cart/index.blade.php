@extends('layouts.app')
@section('title', 'Mi Carrito')

@push('styles')
<style>
    .cart-title { animation: fadeInLeft .45s ease both; }

    /* Items slide-in stagger */
    .cart-item {
        opacity: 0;
        transform: translateX(-20px);
        transition: opacity .4s ease, transform .4s ease, background .25s;
    }
    .cart-item.visible { opacity: 1; transform: none; }
    .cart-item:hover   { background: rgba(129,140,248,.07) !important; }
    .cart-item img     { transition: transform .3s ease; border-radius: 8px; }
    .cart-item:hover img { transform: scale(1.08); }

    /* Panel resumen sticky */
    .summary-card {
        animation: fadeInRight .5s .15s ease both;
        position: sticky;
        top: 80px;
    }

    /* Precio gradiente */
    .summary-total {
        animation: popIn .5s .4s ease both;
        font-size: 1.5rem;
        background: linear-gradient(45deg, #818cf8, #c084fc);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }

    /* Vacío flotante */
    .cart-empty-icon {
        color: #818cf8 !important;
        animation: float 3s ease-in-out infinite;
    }

    /* Precio por línea */
    .item-line-total {
        background: linear-gradient(45deg, #818cf8, #c084fc);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }
</style>
@endpush

@section('content')
<h2 class="fw-bold mb-4 cart-title"><i class="bi bi-cart3"></i> Mi Carrito</h2>

@if(empty($cart))
    <div class="text-center py-5">
        <i class="bi bi-cart-x display-1 text-muted cart-empty-icon"></i>
        <p class="text-muted mt-3">Tu carrito está vacío.</p>
        <a href="{{ route('products.index') }}" class="btn btn-primary mt-2">Ver productos</a>
    </div>
@else
    <div class="row g-4">
        <div class="col-lg-8">
            <div class="card border-0 shadow-sm">
                {{-- Cabecera de tabla solo en desktop --}}
                <div class="d-none d-md-flex px-3 py-2 border-bottom" style="background:rgba(99,102,241,.08)">
                    <div style="width:80px" class="text-muted small fw-semibold"></div>
                    <div class="flex-grow-1 text-muted small fw-semibold ms-3">Producto</div>
                    <div style="width:140px" class="text-muted small fw-semibold text-center">Cantidad</div>
                    <div style="width:90px"  class="text-muted small fw-semibold text-end">Subtotal</div>
                    <div style="width:40px"></div>
                </div>

                <div class="card-body p-0">
                    @foreach($cart as $id => $item)
                    @php
                        $imgSrc = $item['image']
                            ? (str_starts_with($item['image'], 'http') ? $item['image'] : asset('storage/'.$item['image']))
                            : 'https://placehold.co/80x80/1e293b/818cf8?text=' . rawurlencode(substr($item['name'],0,1));
                    @endphp
                    <div class="cart-item border-bottom mx-0 px-3 py-3">
                        <div class="d-flex align-items-start gap-3">

                            {{-- Imagen --}}
                            <a href="#" class="flex-shrink-0">
                                <img src="{{ $imgSrc }}" class="rounded" alt="{{ $item['name'] }}"
                                     style="width:72px;height:72px;object-fit:cover;">
                            </a>

                            {{-- Contenido principal --}}
                            <div class="flex-grow-1 min-w-0">
                                <p class="fw-bold mb-0 lh-sm">{{ $item['name'] }}</p>
                                <p class="text-muted small mb-0">${{ number_format($item['price'], 2) }} c/u</p>

                                {{-- Fila de controles (siempre visible) --}}
                                <div class="d-flex align-items-center gap-2 mt-2 flex-wrap">
                                    <form action="{{ route('cart.update', $id) }}" method="POST"
                                          class="d-flex align-items-center gap-1">
                                        @csrf @method('PATCH')
                                        <input type="number" name="quantity" value="{{ $item['quantity'] }}"
                                               min="1" class="form-control form-control-sm"
                                               style="width:64px">
                                        <button class="btn btn-sm btn-outline-secondary" title="Actualizar">
                                            <i class="bi bi-arrow-clockwise"></i>
                                        </button>
                                    </form>

                                    {{-- Subtotal línea --}}
                                    <span class="fw-bold item-line-total ms-auto">
                                        ${{ number_format($item['price'] * $item['quantity'], 2) }}
                                    </span>

                                    {{-- Eliminar --}}
                                    <form action="{{ route('cart.remove', $id) }}" method="POST">
                                        @csrf @method('DELETE')
                                        <button class="btn btn-sm btn-outline-danger" title="Eliminar">
                                            <i class="bi bi-trash"></i>
                                        </button>
                                    </form>
                                </div>
                            </div>

                        </div>
                    </div>
                    @endforeach
                </div>
            </div>

            <form action="{{ route('cart.clear') }}" method="POST" class="mt-2 text-end">
                @csrf @method('DELETE')
                <button class="btn btn-sm btn-outline-danger">
                    <i class="bi bi-trash3"></i> Vaciar carrito
                </button>
            </form>
        </div>

        <div class="col-lg-4">
            <div class="card border-0 shadow-sm summary-card">
                <div class="card-body">
                    <h5 class="fw-bold">Resumen del pedido</h5>
                    <hr>
                    <div class="d-flex justify-content-between mb-3 align-items-center">
                        <span class="text-muted">Subtotal</span>
                        <strong class="summary-total">${{ number_format($total, 2) }}</strong>
                    </div>
                    @auth
                        <a href="{{ route('checkout.index') }}" class="btn btn-checkout btn-primary w-100 btn-lg text-white">
                            <i class="bi bi-credit-card"></i> Ir al checkout
                        </a>
                    @else
                        <a href="{{ route('login') }}" class="btn btn-primary w-100">Inicia sesión para comprar</a>
                    @endauth
                </div>
            </div>
        </div>
    </div>
@endif
@endsection

@push('scripts')
<script>
    /* Stagger animado para los items del carrito */
    document.querySelectorAll('.cart-item').forEach((el, i) => {
        el.style.transitionDelay = (i * 0.07) + 's';
        requestAnimationFrame(() => el.classList.add('visible'));
    });
</script>
@endpush
