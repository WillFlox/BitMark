@extends('layouts.app')
@section('title', 'Recuperar contraseña')

@push('styles')
<style>
    .auth-card { animation: fadeInUp .45s ease both; max-width: 440px; }
    .auth-title {
        background: linear-gradient(45deg, #818cf8, #c084fc);
        -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    }
</style>
@endpush

@section('content')
<div class="d-flex justify-content-center py-3">
<div class="auth-card w-100">

    <div class="text-center mb-4" style="animation: popIn .5s ease both">
        <a href="{{ route('products.index') }}" class="text-decoration-none d-inline-flex align-items-center gap-2 justify-content-center mb-3">
            <svg width="36" height="36" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="28" height="28" rx="7" fill="url(#bm-fp)"/>
                <path d="M8 7h7.5a3.5 3.5 0 0 1 0 7H8V7z" fill="white" opacity=".95"/>
                <path d="M8 14h8a3.5 3.5 0 0 1 0 7H8v-7z" fill="white" opacity=".75"/>
                <defs>
                    <linearGradient id="bm-fp" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
                        <stop stop-color="#6366f1"/><stop offset="1" stop-color="#a855f7"/>
                    </linearGradient>
                </defs>
            </svg>
            <span class="fw-bold fs-4" style="color:var(--text)">BitMark</span>
        </a>
        <h1 class="fw-bold fs-4 auth-title mb-1">Recupera tu contraseña</h1>
        <p class="text-muted small mb-0">Te enviaremos un enlace para restablecerla</p>
    </div>

    <div class="card border-0 shadow-sm">
        <div class="card-body p-4">

            @if(session('status'))
                <div class="alert alert-success py-2 mb-3">
                    <i class="bi bi-envelope-check-fill me-2"></i>{{ session('status') }}
                </div>
            @endif

            <form method="POST" action="{{ route('password.email') }}">
                @csrf

                <div class="mb-4">
                    <label class="form-label" for="email">Correo electrónico</label>
                    <input id="email" type="email" name="email"
                           class="form-control @error('email') is-invalid @enderror"
                           value="{{ old('email') }}" required autofocus
                           placeholder="tu@email.com">
                    @error('email')
                        <div class="invalid-feedback">{{ $message }}</div>
                    @enderror
                </div>

                <button type="submit" class="btn btn-primary w-100">
                    <i class="bi bi-envelope me-2"></i>Enviar enlace de recuperación
                </button>
            </form>

            <p class="text-center small text-muted mt-4 mb-0">
                <a href="{{ route('login') }}" class="text-decoration-none" style="color:var(--accent)">
                    <i class="bi bi-arrow-left me-1"></i>Volver al inicio de sesión
                </a>
            </p>

        </div>
    </div>

</div>
</div>
@endsection
