@extends('layouts.app')
@section('title', 'Pedido confirmado')

@section('content')
<div class="text-center py-5">
    <i class="bi bi-check-circle-fill text-success display-1"></i>
    <h2 class="fw-bold mt-3">¡Pedido #{{ $order->id }} confirmado!</h2>
    <p class="text-muted">Recibirás tu pedido en {{ $order->shippingMethod->estimated_days }} día(s) hábil(es).</p>
</div>

<div class="row justify-content-center">
    <div class="col-md-7">
        <div class="card border-0 shadow-sm">
            <div class="card-body">
                <h5 class="fw-bold mb-3">Detalle del pedido</h5>
                @foreach($order->items as $item)
                    <div class="d-flex justify-content-between mb-2">
                        <span>{{ $item->product->name }} × {{ $item->quantity }}</span>
                        <span>${{ number_format($item->subtotal, 2) }}</span>
                    </div>
                @endforeach
                <hr>
                <div class="d-flex justify-content-between"><span>Subtotal</span><span>${{ number_format($order->subtotal, 2) }}</span></div>
                <div class="d-flex justify-content-between"><span>Envío ({{ $order->shippingMethod->name }})</span><span>${{ number_format($order->shipping_cost, 2) }}</span></div>
                <div class="d-flex justify-content-between fw-bold fs-5 mt-2"><span>Total</span><span>${{ number_format($order->total, 2) }}</span></div>
                <hr>
                <p class="small text-muted mb-0"><i class="bi bi-geo-alt"></i> {{ $order->shipping_address }}, {{ $order->shipping_city }}</p>
                <p class="small text-muted"><i class="bi bi-telephone"></i> {{ $order->shipping_phone }}</p>
            </div>
        </div>
        <div class="text-center mt-4 d-flex gap-3 justify-content-center">
            <a href="{{ route('orders.index') }}" class="btn btn-outline-primary">Mis pedidos</a>
            <a href="{{ route('products.index') }}" class="btn btn-primary">Seguir comprando</a>
        </div>
    </div>
</div>
@endsection
