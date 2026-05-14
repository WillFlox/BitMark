@extends('layouts.app')
@section('title', 'Iniciar sesión')

@push('styles')
<style>
    .auth-card { animation: fadeInUp .45s ease both; max-width: 440px; }
    .auth-logo { animation: popIn .5s ease both; }
    .auth-title {
        background: linear-gradient(45deg, #818cf8, #c084fc);
        -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    }
    .divider-text {
        position: relative; text-align: center; color: var(--text-muted); font-size: .8rem;
    }
    .divider-text::before, .divider-text::after {
        content: ''; position: absolute; top: 50%; width: 42%; height: 1px;
        background: var(--border);
    }
    .divider-text::before { left: 0; }
    .divider-text::after  { right: 0; }
</style>
@endpush

@section('content')
<div class="d-flex justify-content-center py-3">
<div class="auth-card w-100">

    {{-- Logo + título --}}
    <div class="text-center mb-4 auth-logo">
        <a href="{{ route('products.index') }}" class="text-decoration-none d-inline-flex align-items-center gap-2 justify-content-center mb-3">
            <svg width="36" height="36" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="28" height="28" rx="7" fill="url(#bm-login)"/>
                <path d="M8 7h7.5a3.5 3.5 0 0 1 0 7H8V7z" fill="white" opacity=".95"/>
                <path d="M8 14h8a3.5 3.5 0 0 1 0 7H8v-7z" fill="white" opacity=".75"/>
                <defs>
                    <linearGradient id="bm-login" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
                        <stop stop-color="#6366f1"/><stop offset="1" stop-color="#a855f7"/>
                    </linearGradient>
                </defs>
            </svg>
            <span class="fw-bold fs-4" style="color:var(--text)">BitMark</span>
        </a>
        <h1 class="fw-bold fs-4 auth-title mb-1">Bienvenido de vuelta</h1>
        <p class="text-muted small mb-0">Inicia sesión para continuar comprando</p>
    </div>

    <div class="card border-0 shadow-sm">
        <div class="card-body p-4">

            @if(session('status'))
                <div class="alert alert-success py-2 mb-3">
                    <i class="bi bi-check-circle-fill me-2"></i>{{ session('status') }}
                </div>
            @endif

            <form method="POST" action="{{ route('login') }}">
                @csrf

                <div class="mb-3">
                    <label class="form-label" for="email">Correo electrónico</label>
                    <input id="email" type="email" name="email"
                           class="form-control @error('email') is-invalid @enderror"
                           value="{{ old('email') }}" required autofocus autocomplete="username"
                           placeholder="tu@email.com">
                    @error('email')
                        <div class="invalid-feedback">{{ $message }}</div>
                    @enderror
                </div>

                <div class="mb-3">
                    <div class="d-flex justify-content-between align-items-center mb-1">
                        <label class="form-label mb-0" for="password">Contraseña</label>
                        @if(Route::has('password.request'))
                            <a href="{{ route('password.request') }}" class="text-decoration-none small" style="color:var(--accent)">
                                ¿Olvidaste tu contraseña?
                            </a>
                        @endif
                    </div>
                    <input id="password" type="password" name="password"
                           class="form-control @error('password') is-invalid @enderror"
                           required autocomplete="current-password" placeholder="••••••••">
                    @error('password')
                        <div class="invalid-feedback">{{ $message }}</div>
                    @enderror
                </div>

                <div class="mb-4">
                    <div class="form-check">
                        <input id="remember_me" type="checkbox" name="remember" class="form-check-input">
                        <label for="remember_me" class="form-check-label small">Recordarme</label>
                    </div>
                </div>

                <button type="submit" class="btn btn-primary w-100 btn-lg">
                    <i class="bi bi-box-arrow-in-right me-2"></i>Iniciar sesión
                </button>
            </form>

            <div class="divider-text my-4">o</div>

            <p class="text-center small text-muted mb-0">
                ¿No tienes cuenta?
                <a href="{{ route('register') }}" class="text-decoration-none fw-semibold" style="color:var(--accent)">
                    Regístrate gratis
                </a>
            </p>

        </div>
    </div>

</div>
</div>
@endsection
