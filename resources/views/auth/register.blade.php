@extends('layouts.app')
@section('title', 'Crear cuenta')

@push('styles')
<style>
    .auth-card { animation: fadeInUp .45s ease both; max-width: 480px; }
    .auth-logo { animation: popIn .5s ease both; }
    .auth-title {
        background: linear-gradient(45deg, #818cf8, #c084fc);
        -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    }
    .password-strength {
        height: 3px; border-radius: 999px; margin-top: 6px;
        background: var(--border); overflow: hidden;
    }
    .password-strength-bar {
        height: 100%; border-radius: 999px; width: 0;
        transition: width .3s, background .3s;
    }
</style>
@endpush

@section('content')
<div class="d-flex justify-content-center py-3">
<div class="auth-card w-100">

    {{-- Logo + título --}}
    <div class="text-center mb-4 auth-logo">
        <a href="{{ route('products.index') }}" class="text-decoration-none d-inline-flex align-items-center gap-2 justify-content-center mb-3">
            <svg width="36" height="36" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="28" height="28" rx="7" fill="url(#bm-reg)"/>
                <path d="M8 7h7.5a3.5 3.5 0 0 1 0 7H8V7z" fill="white" opacity=".95"/>
                <path d="M8 14h8a3.5 3.5 0 0 1 0 7H8v-7z" fill="white" opacity=".75"/>
                <defs>
                    <linearGradient id="bm-reg" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
                        <stop stop-color="#6366f1"/><stop offset="1" stop-color="#a855f7"/>
                    </linearGradient>
                </defs>
            </svg>
            <span class="fw-bold fs-4" style="color:var(--text)">BitMark</span>
        </a>
        <h1 class="fw-bold fs-4 auth-title mb-1">Crea tu cuenta</h1>
        <p class="text-muted small mb-0">Únete y empieza a comprar hoy</p>
    </div>

    <div class="card border-0 shadow-sm">
        <div class="card-body p-4">

            <form method="POST" action="{{ route('register') }}">
                @csrf

                <div class="mb-3">
                    <label class="form-label" for="name">Nombre completo</label>
                    <input id="name" type="text" name="name"
                           class="form-control @error('name') is-invalid @enderror"
                           value="{{ old('name') }}" required autofocus autocomplete="name"
                           placeholder="Tu nombre">
                    @error('name')
                        <div class="invalid-feedback">{{ $message }}</div>
                    @enderror
                </div>

                <div class="mb-3">
                    <label class="form-label" for="email">Correo electrónico</label>
                    <input id="email" type="email" name="email"
                           class="form-control @error('email') is-invalid @enderror"
                           value="{{ old('email') }}" required autocomplete="username"
                           placeholder="tu@email.com">
                    @error('email')
                        <div class="invalid-feedback">{{ $message }}</div>
                    @enderror
                </div>

                <div class="mb-3">
                    <label class="form-label" for="password">Contraseña</label>
                    <input id="password" type="password" name="password"
                           class="form-control @error('password') is-invalid @enderror"
                           required autocomplete="new-password" placeholder="Mínimo 8 caracteres">
                    @error('password')
                        <div class="invalid-feedback">{{ $message }}</div>
                    @enderror
                    <div class="password-strength mt-2">
                        <div class="password-strength-bar" id="strengthBar"></div>
                    </div>
                    <p class="small mt-1 mb-0" id="strengthText" style="color:var(--text-muted)"></p>
                </div>

                <div class="mb-4">
                    <label class="form-label" for="password_confirmation">Confirmar contraseña</label>
                    <input id="password_confirmation" type="password" name="password_confirmation"
                           class="form-control" required autocomplete="new-password"
                           placeholder="Repite tu contraseña">
                </div>

                <button type="submit" class="btn btn-primary w-100 btn-lg">
                    <i class="bi bi-person-plus me-2"></i>Crear cuenta
                </button>
            </form>

            <p class="text-center small text-muted mt-4 mb-0">
                ¿Ya tienes cuenta?
                <a href="{{ route('login') }}" class="text-decoration-none fw-semibold" style="color:var(--accent)">
                    Inicia sesión
                </a>
            </p>

        </div>
    </div>

</div>
</div>
@endsection

@push('scripts')
<script>
    const pwInput = document.getElementById('password');
    const bar     = document.getElementById('strengthBar');
    const txt     = document.getElementById('strengthText');
    const levels  = [
        { min: 0,  color: '#f87171', label: 'Muy débil',  w: '20%' },
        { min: 4,  color: '#fbbf24', label: 'Débil',      w: '40%' },
        { min: 6,  color: '#818cf8', label: 'Regular',    w: '60%' },
        { min: 8,  color: '#34d399', label: 'Fuerte',     w: '80%' },
        { min: 12, color: '#10b981', label: 'Muy fuerte', w: '100%' },
    ];
    pwInput?.addEventListener('input', () => {
        const v = pwInput.value;
        if (!v) { bar.style.width = '0'; txt.textContent = ''; return; }
        const level = [...levels].reverse().find(l => v.length >= l.min) || levels[0];
        bar.style.width      = level.w;
        bar.style.background = level.color;
        txt.textContent      = level.label;
        txt.style.color      = level.color;
    });
</script>
@endpush
