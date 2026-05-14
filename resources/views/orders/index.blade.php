@extends('layouts.app')
@section('title', 'Mis Pedidos')

@push('styles')
<style>
    .orders-title {
        animation: fadeInLeft .5s ease both;
        background: linear-gradient(45deg, #818cf8, #c084fc);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }
    .orders-empty-icon {
        color: #818cf8 !important;
        animation: float 3s ease-in-out infinite;
    }
    .orders-table-wrap { animation: fadeInUp .5s .1s ease both; }

    /* Totales en gradiente */
    .order-total {
        background: linear-gradient(45deg, #818cf8, #c084fc);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        font-weight: bold;
    }
    /* ID del pedido */
    .order-id { color: #818cf8; font-weight: bold; }

    /* Filas de tabla animadas */
    .orders-table tbody tr {
        opacity: 0;
        transform: translateX(-12px);
        transition: opacity .4s ease, transform .4s ease, background .2s;
    }
    .orders-table tbody tr.visible { opacity: 1; transform: none; }
</style>
@endpush

@section('content')
<h2 class="fw-bold mb-4 orders-title"><i class="bi bi-box"></i> Mis Pedidos</h2>

@if($orders->isEmpty())
    <div class="text-center py-5">
        <i class="bi bi-box-seam display-1 orders-empty-icon"></i>
        <p class="text-muted mt-3">Aún no tienes pedidos.</p>
        <a href="{{ route('products.index') }}" class="btn btn-primary mt-2">Comprar ahora</a>
    </div>
@else

    {{-- ── Vista mobile: tarjetas ── --}}
    <div class="d-md-none">
        @foreach($orders as $order)
        @php $statusColor = match($order->status) {
            'pending' => 'warning', 'processing' => 'info',
            'shipped' => 'primary', 'delivered' => 'success', 'cancelled' => 'danger', default => 'secondary'
        }; @endphp
        <div class="card mb-3 aos-item">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start mb-2">
                    <span class="order-id fw-bold fs-5">#{{ $order->id }}</span>
                    <span class="badge bg-{{ $statusColor }}">{{ $order->status_label }}</span>
                </div>
                <div class="d-flex flex-column gap-1 mb-3">
                    <p class="small text-muted mb-0">
                        <i class="bi bi-calendar3 me-1"></i>{{ $order->created_at->format('d/m/Y') }}
                    </p>
                    <p class="small text-muted mb-0">
                        <i class="bi bi-truck me-1"></i>{{ $order->shippingMethod->name }}
                    </p>
                </div>
                <div class="d-flex justify-content-between align-items-center">
                    <span class="order-total fs-5">${{ number_format($order->total, 2) }}</span>
                    <a href="{{ route('orders.show', $order) }}" class="btn btn-sm btn-outline-primary">
                        <i class="bi bi-eye me-1"></i>Ver detalle
                    </a>
                </div>
            </div>
        </div>
        @endforeach
    </div>

    {{-- ── Vista desktop: tabla ── --}}
    <div class="d-none d-md-block table-responsive orders-table-wrap">
        <table class="table table-hover align-middle orders-table">
            <thead>
                <tr style="background: rgba(99,102,241,.2);">
                    <th>#Pedido</th><th>Fecha</th><th>Estado</th><th>Envío</th><th>Total</th><th></th>
                </tr>
            </thead>
            <tbody>
                @foreach($orders as $order)
                    <tr>
                        <td><span class="order-id">#{{ $order->id }}</span></td>
                        <td>{{ $order->created_at->format('d/m/Y') }}</td>
                        <td>
                            <span class="badge bg-{{ match($order->status) {
                                'pending' => 'warning', 'processing' => 'info',
                                'shipped' => 'primary', 'delivered' => 'success', 'cancelled' => 'danger', default => 'secondary'
                            } }}">{{ $order->status_label }}</span>
                        </td>
                        <td>{{ $order->shippingMethod->name }}</td>
                        <td><span class="order-total">${{ number_format($order->total, 2) }}</span></td>
                        <td>
                            <a href="{{ route('orders.show', $order) }}" class="btn btn-sm btn-outline-primary">
                                <i class="bi bi-eye"></i> Ver
                            </a>
                        </td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    </div>

@endif
@endsection

@push('scripts')
<script>
    document.querySelectorAll('.orders-table tbody tr').forEach((tr, i) => {
        tr.style.transitionDelay = (i * 0.07) + 's';
        requestAnimationFrame(() => tr.classList.add('visible'));
    });
</script>
@endpush
