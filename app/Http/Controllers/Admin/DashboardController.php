<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;

class DashboardController extends Controller
{
    public function index()
    {
        $stats = [
            'products'      => Product::count(),
            'orders'        => Order::count(),
            'users'         => User::where('role', 'customer')->count(),
            'revenue'       => Order::where('status', '!=', 'cancelled')->sum('total'),
            'pending_orders' => Order::where('status', 'pending')->count(),
            'low_stock'     => Product::where('stock', '<', 5)->where('active', true)->count(),
        ];

        $recentOrders = Order::with(['user', 'shippingMethod'])->latest()->take(10)->get();

        return view('admin.dashboard', compact('stats', 'recentOrders'));
    }
}
