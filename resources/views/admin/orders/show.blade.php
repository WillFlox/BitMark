@extends('layouts.app')
@section('title', 'Pedido #' . $order->id)

@section('content')
<div class="d-flex justify-content-between align-items-center mb-4">
    <h2 class="fw-bold">Pedido #{{ $order->id }}</h2>
    <a href="{{ route('admin.orders.index') }}" class="btn btn-outline-secondary"><i class="bi bi-arrow-left"></i> Volver</a>
</div>

<div class="row g-4">
    <div class="col-md-8">
        <div class="card border-0 shadow-sm mb-4">
            <div class="card-header bg-white fw-bold">Productos</div>
            <div class="card-body">
                @foreach($order->items as $item)
                    <div class="d-flex justify-content-between align-items-center border-bottom py-2">
                        <div>
                            <strong>{{ $item->product->name }}</strong>
                            <span class="text-muted small ms-2">× {{ $item->quantity }}</span>
                        </div>
                        <span>${{ number_format($item->subtotal, 2) }}</span>
                    </div>
                @endforeach
                <div class="d-flex justify-content-between mt-3"><span>Subtotal</span><span>${{ number_format($order->subtotal, 2) }}</span></div>
                <div class="d-flex justify-content-between"><span>Envío</span><span>${{ number_format($order->shipping_cost, 2) }}</span></div>
                <div class="d-flex justify-content-between fw-bold fs-5 mt-1"><span>Total</span><span>${{ number_format($order->total, 2) }}</span></div>
            </div>
        </div>

        <div class="card border-0 shadow-sm">
            <div class="card-header bg-white fw-bold">Datos de envío</div>
            <div class="card-body">
                <p class="mb-1"><i class="bi bi-person"></i> {{ $order->user->name }} — {{ $order->user->email }}</p>
                <p class="mb-1"><i class="bi bi-geo-alt"></i> {{ $order->shipping_address }}, {{ $order->shipping_city }}</p>
                <p class="mb-0"><i class="bi bi-telephone"></i> {{ $order->shipping_phone }}</p>
                <p class="mb-0 mt-1"><i class="bi bi-truck"></i> {{ $order->shippingMethod->name }} ({{ $order->shippingMethod->estimated_days }} días)</p>
            </div>
        </div>
    </div>

    <div class="col-md-4">
        <div class="card border-0 shadow-sm">
            <div class="card-header bg-white fw-bold">Cambiar estado</div>
            <div class="card-body">
                <p>Estado actual: <span class="badge bg-{{ match($order->status) {
                    'pending' => 'warning', 'processing' => 'info',
                    'shipped' => 'primary', 'delivered' => 'success', 'cancelled' => 'danger', default => 'secondary'
                } }}">{{ $order->status_label }}</span></p>
                <form action="{{ route('admin.orders.status', $order) }}" method="POST">
                    @csrf @method('PATCH')
                    <select name="status" class="form-select mb-3">
                        @foreach(['pending' => 'Pendiente', 'processing' => 'Procesando', 'shipped' => 'Enviado', 'delivered' => 'Entregado', 'cancelled' => 'Cancelado'] as $val => $label)
                            <option value="{{ $val }}" @selected($order->status === $val)>{{ $label }}</option>
                        @endforeach
                    </select>
                    <button class="btn btn-primary w-100">Actualizar estado</button>
                </form>
            </div>
        </div>
    </div>
</div>
@endsection
