@extends('layouts.app')
@section('title', 'Checkout')

@push('styles')
<style>
    .checkout-title {
        animation: fadeInLeft .5s ease both;
        background: linear-gradient(45deg, #818cf8, #c084fc);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }
    .checkout-col-left  { animation: fadeInLeft .5s .1s ease both; }
    .checkout-col-right { animation: fadeInRight .5s .15s ease both; }

    /* Totales con gradiente */
    .checkout-total {
        background: linear-gradient(45deg, #818cf8, #c084fc);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        font-size: 1.4rem;
    }
    /* Radio métodos de envío */
    .method-option {
        border: 1px solid rgba(255,255,255,.1) !important;
        border-radius: 10px !important;
        background: rgba(15,23,42,.5);
        transition: background .3s, border-color .3s, transform .2s;
        cursor: pointer;
    }
    .method-option:hover {
        background: rgba(129,140,248,.1) !important;
        border-color: #818cf8 !important;
        transform: translateX(4px);
    }
    .method-option:has(input:checked) {
        background: rgba(99,102,241,.15) !important;
        border-color: #818cf8 !important;
        box-shadow: 0 0 15px rgba(129,140,248,.2);
    }
    /* Precio de envío */
    .shipping-price { color: #818cf8 !important; }
    /* Total final animado */
    #totalCost { color: #c084fc; font-weight: bold; }
</style>
@endpush

@section('content')
<h2 class="fw-bold mb-4 checkout-title"><i class="bi bi-credit-card"></i> Checkout</h2>

<form action="{{ route('checkout.store') }}" method="POST">
@csrf
<div class="row g-4">
    {{-- En mobile: el resumen va PRIMERO (order-first en xs, normal en lg) --}}
    <div class="col-lg-5 order-first order-lg-last checkout-col-right">
        <div class="card border-0 shadow-sm checkout-summary-sticky" style="top:80px">
            <div class="card-header fw-bold">Resumen del pedido</div>
            <div class="card-body">
                @foreach($cart as $item)
                    <div class="d-flex justify-content-between small mb-1 gap-2">
                        <span class="text-truncate">{{ $item['name'] }} × {{ $item['quantity'] }}</span>
                        <span class="flex-shrink-0">${{ number_format($item['price'] * $item['quantity'], 2) }}</span>
                    </div>
                @endforeach
                <hr>
                <div class="d-flex justify-content-between">
                    <span>Subtotal</span><strong>${{ number_format($subtotal, 2) }}</strong>
                </div>
                <div class="d-flex justify-content-between text-muted small">
                    <span>Envío</span><span id="shippingCost">—</span>
                </div>
                <hr>
                <div class="d-flex justify-content-between align-items-center">
                    <span class="fw-bold fs-5">Total</span>
                    <span id="totalCost" class="checkout-total">${{ number_format($subtotal, 2) }}</span>
                </div>
                <button type="submit" class="btn btn-success w-100 mt-3 btn-lg">
                    <i class="bi bi-bag-check"></i> Confirmar pedido
                </button>
            </div>
        </div>
    </div>

    <div class="col-lg-7 order-last order-lg-first checkout-col-left">
        <div class="card border-0 shadow-sm mb-4">
            <div class="card-header fw-bold">Datos de envío</div>
            <div class="card-body">
                <div class="mb-3">
                    <label class="form-label">Dirección</label>
                    <input type="text" name="shipping_address" class="form-control @error('shipping_address') is-invalid @enderror"
                           value="{{ old('shipping_address') }}" required>
                    @error('shipping_address') <div class="invalid-feedback">{{ $message }}</div> @enderror
                </div>
                <div class="mb-3">
                    <label class="form-label">Ciudad</label>
                    <input type="text" name="shipping_city" class="form-control @error('shipping_city') is-invalid @enderror"
                           value="{{ old('shipping_city') }}" required>
                    @error('shipping_city') <div class="invalid-feedback">{{ $message }}</div> @enderror
                </div>
                <div class="mb-3">
                    <label class="form-label">Teléfono</label>
                    <input type="text" name="shipping_phone" class="form-control @error('shipping_phone') is-invalid @enderror"
                           value="{{ old('shipping_phone') }}" required>
                    @error('shipping_phone') <div class="invalid-feedback">{{ $message }}</div> @enderror
                </div>
            </div>
        </div>

        <div class="card border-0 shadow-sm">
            <div class="card-header fw-bold">Método de envío</div>
            <div class="card-body">
                @foreach($shippingMethods as $method)
                    <div class="form-check method-option rounded p-3 mb-2">
                        <input class="form-check-input" type="radio" name="shipping_method_id"
                               id="method_{{ $method->id }}" value="{{ $method->id }}"
                               @checked(old('shipping_method_id') == $method->id || $loop->first) required>
                        <label class="form-check-label w-100" for="method_{{ $method->id }}">
                            <div class="d-flex justify-content-between">
                                <span><strong>{{ $method->name }}</strong> — {{ $method->description }}</span>
                                <span class="shipping-price fw-bold">
                                    {{ $method->price > 0 ? '$'.number_format($method->price,2) : 'Gratis' }}
                                </span>
                            </div>
                            <small class="text-muted">{{ $method->estimated_days }} día(s) hábil(es)</small>
                        </label>
                    </div>
                @endforeach
                @error('shipping_method_id') <div class="text-danger small">{{ $message }}</div> @enderror
            </div>
        </div>
    </div>

</div>
</form>
@endsection

@push('scripts')
<script>
const subtotal = {{ $subtotal }};
const methods = {
    @foreach($shippingMethods as $m)
    {{ $m->id }}: {{ $m->price }},
    @endforeach
};

document.querySelectorAll('input[name="shipping_method_id"]').forEach(radio => {
    radio.addEventListener('change', function() {
        const cost = methods[this.value] || 0;
        document.getElementById('shippingCost').textContent = cost > 0 ? '$' + cost.toFixed(2) : 'Gratis';
        document.getElementById('totalCost').textContent = '$' + (subtotal + cost).toFixed(2);
    });
});
document.querySelector('input[name="shipping_method_id"]:checked')?.dispatchEvent(new Event('change'));
</script>
@endpush
