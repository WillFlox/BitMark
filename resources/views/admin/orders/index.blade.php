@extends('layouts.app')
@section('title', 'Admin — Pedidos')

@section('content')
<h2 class="fw-bold mb-4"><i class="bi bi-bag"></i> Gestión de Pedidos</h2>

<div class="card border-0 shadow-sm">
    <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
            <thead class="table-dark">
                <tr><th>#</th><th>Cliente</th><th>Estado</th><th>Envío</th><th>Total</th><th>Fecha</th><th></th></tr>
            </thead>
            <tbody>
                @forelse($orders as $order)
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
                @empty
                    <tr><td colspan="7" class="text-center text-muted py-4">Sin pedidos.</td></tr>
                @endforelse
            </tbody>
        </table>
    </div>
</div>
<div class="mt-3">{{ $orders->links() }}</div>
@endsection
