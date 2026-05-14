@extends('layouts.app')
@section('title', 'Pedido #' . $order->id)

@section('content')
<div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
    <h2 class="fw-bold mb-0">Pedido #{{ $order->id }}</h2>
    <a href="{{ route('orders.index') }}" class="btn btn-outline-secondary btn-sm">
        <i class="bi bi-arrow-left"></i> Mis pedidos
    </a>
</div>

@php $statusColor = match($order->status) {
    'pending' => 'warning', 'processing' => 'info',
    'shipped' => 'primary', 'delivered' => 'success', 'cancelled' => 'danger', default => 'secondary'
}; @endphp

<div class="row g-4">

    {{-- Estado visible en mobile arriba del todo --}}
    <div class="col-12 d-md-none">
        <div class="card border-0 shadow-sm">
            <div class="card-body d-flex justify-content-between align-items-center flex-wrap gap-2">
                <div>
                    <p class="small text-muted mb-1"><i class="bi bi-geo-alt me-1"></i>{{ $order->shipping_address }}, {{ $order->shipping_city }}</p>
                    <p class="small text-muted mb-0"><i class="bi bi-telephone me-1"></i>{{ $order->shipping_phone }}</p>
                </div>
                <span class="badge fs-6 bg-{{ $statusColor }}">{{ $order->status_label }}</span>
            </div>
        </div>
    </div>

    <div class="col-md-8">
        <div class="card border-0 shadow-sm">
            <div class="card-header fw-bold">Productos del pedido</div>
            <div class="card-body">
                @foreach($order->items as $item)
                    <div class="d-flex justify-content-between align-items-start border-bottom py-2 gap-2">
                        <div class="flex-grow-1 min-w-0">
                            <strong class="d-block text-truncate">{{ $item->product->name }}</strong>
                            <span class="text-muted small">× {{ $item->quantity }} unidades</span>
                        </div>
                        <span class="fw-semibold flex-shrink-0">${{ number_format($item->subtotal, 2) }}</span>
                    </div>
                @endforeach
                <div class="mt-3 d-flex flex-column gap-1">
                    <div class="d-flex justify-content-between text-muted small">
                        <span>Subtotal</span><span>${{ number_format($order->subtotal, 2) }}</span>
                    </div>
                    <div class="d-flex justify-content-between text-muted small">
                        <span>Envío ({{ $order->shippingMethod->name }})</span>
                        <span>${{ number_format($order->shipping_cost, 2) }}</span>
                    </div>
                    <hr class="my-1">
                    <div class="d-flex justify-content-between fw-bold fs-5">
                        <span>Total</span>
                        <span style="background:linear-gradient(45deg,#818cf8,#c084fc);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">
                            ${{ number_format($order->total, 2) }}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </div>

    {{-- Estado en desktop --}}
    <div class="col-md-4 d-none d-md-block">
        <div class="card border-0 shadow-sm">
            <div class="card-body">
                <h6 class="fw-bold mb-2">Estado del pedido</h6>
                <span class="badge fs-6 bg-{{ $statusColor }}">{{ $order->status_label }}</span>
                <hr>
                <p class="small mb-1"><i class="bi bi-geo-alt me-1"></i>{{ $order->shipping_address }}, {{ $order->shipping_city }}</p>
                <p class="small mb-0"><i class="bi bi-telephone me-1"></i>{{ $order->shipping_phone }}</p>
            </div>
        </div>
    </div>

</div>
@endsection
