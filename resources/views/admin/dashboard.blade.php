@extends('layouts.app')
@section('title', 'Panel Admin')

@section('content')
<div class="d-flex justify-content-between align-items-center mb-4">
    <h2 class="fw-bold"><i class="bi bi-speedometer2"></i> Panel de Administración</h2>
</div>

<div class="row g-3 mb-5">
    <div class="col-sm-6 col-lg-3">
        <div class="card border-0 shadow-sm text-center p-3">
            <i class="bi bi-box-seam display-6 text-primary"></i>
            <h3 class="fw-bold mt-2">{{ $stats['products'] }}</h3>
            <p class="text-muted mb-0">Productos</p>
            <a href="{{ route('admin.products.index') }}" class="stretched-link"></a>
        </div>
    </div>
    <div class="col-sm-6 col-lg-3">
        <div class="card border-0 shadow-sm text-center p-3">
            <i class="bi bi-bag display-6 text-success"></i>
            <h3 class="fw-bold mt-2">{{ $stats['orders'] }}</h3>
            <p class="text-muted mb-0">Pedidos totales</p>
            <a href="{{ route('admin.orders.index') }}" class="stretched-link"></a>
        </div>
    </div>
    <div class="col-sm-6 col-lg-3">
        <div class="card border-0 shadow-sm text-center p-3">
            <i class="bi bi-clock-history display-6 text-warning"></i>
            <h3 class="fw-bold mt-2">{{ $stats['pending_orders'] }}</h3>
            <p class="text-muted mb-0">Pedidos pendientes</p>
        </div>
    </div>
    <div class="col-sm-6 col-lg-3">
        <div class="card border-0 shadow-sm text-center p-3">
            <i class="bi bi-currency-dollar display-6 text-info"></i>
            <h3 class="fw-bold mt-2">${{ number_format($stats['revenue'], 2) }}</h3>
            <p class="text-muted mb-0">Ingresos totales</p>
        </div>
    </div>
</div>

@if($stats['low_stock'] > 0)
    <div class="alert alert-warning">
        <i class="bi bi-exclamation-triangle"></i>
        Hay <strong>{{ $stats['low_stock'] }}</strong> producto(s) con stock bajo (menos de 5 unidades).
        <a href="{{ route('admin.products.index') }}" class="alert-link">Revisar inventario</a>
    </div>
@endif

<h5 class="fw-bold mb-3">Últimos pedidos</h5>
<div class="table-responsive">
    <table class="table table-hover align-middle">
        <thead class="table-dark">
            <tr><th>#</th><th>Cliente</th><th>Estado</th><th>Envío</th><th>Total</th><th>Fecha</th><th></th></tr>
        </thead>
        <tbody>
            @foreach($recentOrders as $order)
                <tr>
                    <td>#{{ $order->id }}</td>
                    <td>{{ $order->user->name }}</td>
                    <td>
                        <span class="badge bg-{{ match($order->status) {
                            'pending' => 'warning', 'processing' => 'info',
                            'shipped' => 'primary', 'delivered' => 'success', 'cancelled' => 'danger', default => 'secondary'
                        } }}">{{ $order->status_label }}</span>
                    </td>
                    <td>{{ $order->shippingMethod->name }}</td>
                    <td>${{ number_format($order->total, 2) }}</td>
                    <td>{{ $order->created_at->format('d/m/Y H:i') }}</td>
                    <td><a href="{{ route('admin.orders.show', $order) }}" class="btn btn-sm btn-outline-primary">Ver</a></td>
                </tr>
            @endforeach
        </tbody>
    </table>
</div>
@endsection
