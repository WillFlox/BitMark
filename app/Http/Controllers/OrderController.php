<?php

namespace App\Http\Controllers;

use App\Models\Order;

class OrderController extends Controller
{
    public function index()
    {
        $orders = auth()->user()->orders()->with(['items.product', 'shippingMethod'])->latest()->get();
        return view('orders.index', compact('orders'));
    }

    public function show(Order $order)
    {
        abort_if($order->user_id !== auth()->id(), 403);
        $order->load(['items.product', 'shippingMethod']);
        return view('orders.show', compact('order'));
    }

    public function confirmation()
    {
        $orderId = session('last_order_id');
        if (!$orderId) {
            return redirect()->route('products.index');
        }
        $order = Order::with(['items.product', 'shippingMethod'])->findOrFail($orderId);
        return view('orders.confirmation', compact('order'));
    }
}
