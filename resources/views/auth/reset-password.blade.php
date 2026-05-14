@extends('layouts.app')
@section('title', 'Restablecer contraseña')

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
                <rect width="28" height="28" rx="7" fill="url(#bm-rp)"/>
                <path d="M8 7h7.5a3.5 3.5 0 0 1 0 7H8V7z" fill="white" opacity=".95"/>
                <path d="M8 14h8a3.5 3.5 0 0 1 0 7H8v-7z" fill="white" opacity=".75"/>
                <defs>
                    <linearGradient id="bm-rp" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
                        <stop stop-color="#6366f1"/><stop offset="1" stop-color="#a855f7"/>
                    </linearGradient>
                </defs>
            </svg>
            <span class="fw-bold fs-4" style="color:var(--text)">BitMark</span>
        </a>
        <h1 class="fw-bold fs-4 auth-title mb-1">Nueva contraseña</h1>
        <p class="text-muted small mb-0">Elige una contraseña segura para tu cuenta</p>
    </div>

    <div class="card border-0 shadow-sm">
        <div class="card-body p-4">

            <form method="POST" action="{{ route('password.store') }}">
                @csrf
                <input type="hidden" name="token" value="{{ $request->route('token') }}">

                <div class="mb-3">
                    <label class="form-label" for="email">Correo electrónico</label>
                    <input id="email" type="email" name="email"
                           class="form-control @error('email') is-invalid @enderror"
                           value="{{ old('email', $request->email) }}" required autofocus
                           autocomplete="username">
                    @error('email')
                        <div class="invalid-feedback">{{ $message }}</div>
                    @enderror
                </div>

                <div class="mb-3">
                    <label class="form-label" for="password">Nueva contraseña</label>
                    <input id="password" type="password" name="password"
                           class="form-control @error('password') is-invalid @enderror"
                           required autocomplete="new-password" placeholder="Mínimo 8 caracteres">
                    @error('password')
                        <div class="invalid-feedback">{{ $message }}</div>
                    @enderror
                </div>

                <div class="mb-4">
                    <label class="form-label" for="password_confirmation">Confirmar contraseña</label>
                    <input id="password_confirmation" type="password" name="password_confirmation"
                           class="form-control" required autocomplete="new-password"
                           placeholder="Repite tu contraseña">
                </div>

                <button type="submit" class="btn btn-primary w-100 btn-lg">
                    <i class="bi bi-shield-lock me-2"></i>Restablecer contraseña
                </button>
            </form>

        </div>
    </div>

</div>
</div>
@endsection
