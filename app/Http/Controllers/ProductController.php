<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with('category')->where('active', true);

        if ($request->filled('category')) {
            $query->whereHas('category', fn($q) => $q->where('slug', $request->category));
        }

        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        if ($request->filled('min_price')) {
            $query->where('price', '>=', (float) $request->min_price);
        }

        if ($request->filled('max_price')) {
            $query->where('price', '<=', (float) $request->max_price);
        }

        $products    = $query->latest()->paginate(12)->withQueryString();
        $categories  = Category::all();
        $priceStats  = Product::where('active', true)
                              ->selectRaw('MIN(price) as min_val, MAX(price) as max_val')
                              ->first();

        return view('products.index', compact('products', 'categories', 'priceStats'));
    }

    public function show(Product $product)
    {
        abort_if(!$product->active, 404);
        return view('products.show', compact('product'));
    }
}
