<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ShippingMethod;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CheckoutController extends Controller
{
    public function index()
    {
        $cart = session('cart', []);

        if (empty($cart)) {
            return redirect()->route('cart.index')->with('error', 'Tu carrito está vacío.');
        }

        $shippingMethods = ShippingMethod::where('active', true)->get();
        $subtotal = collect($cart)->sum(fn($item) => $item['price'] * $item['quantity']);

        return view('checkout.index', compact('cart', 'shippingMethods', 'subtotal'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'shipping_method_id' => 'required|exists:shipping_methods,id',
            'shipping_address'   => 'required|string|max:255',
            'shipping_city'      => 'required|string|max:100',
            'shipping_phone'     => 'required|string|max:20',
        ]);

        $cart = session('cart', []);
        if (empty($cart)) {
            return redirect()->route('cart.index')->with('error', 'Tu carrito está vacío.');
        }

        $shippingMethod = ShippingMethod::findOrFail($request->shipping_method_id);
        $subtotal       = collect($cart)->sum(fn($item) => $item['price'] * $item['quantity']);
        $total          = $subtotal + $shippingMethod->price;

        DB::transaction(function () use ($request, $cart, $shippingMethod, $subtotal, $total) {
            $order = Order::create([
                'user_id'            => auth()->id(),
                'shipping_method_id' => $shippingMethod->id,
                'status'             => 'pending',
                'subtotal'           => $subtotal,
                'shipping_cost'      => $shippingMethod->price,
                'total'              => $total,
                'shipping_address'   => $request->shipping_address,
                'shipping_city'      => $request->shipping_city,
                'shipping_phone'     => $request->shipping_phone,
            ]);

            foreach ($cart as $item) {
                $product = Product::findOrFail($item['id']);
                OrderItem::create([
                    'order_id'   => $order->id,
                    'product_id' => $product->id,
                    'quantity'   => $item['quantity'],
                    'unit_price' => $item['price'],
                    'subtotal'   => $item['price'] * $item['quantity'],
                ]);
                $product->decrement('stock', $item['quantity']);
            }

            session()->forget('cart');
            session(['last_order_id' => $order->id]);
        });

        return redirect()->route('orders.confirmation')->with('success', '¡Pedido realizado con éxito!');
    }
}
