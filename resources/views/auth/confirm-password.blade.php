@extends('layouts.app')
@section('title', 'Confirmar contraseña')

@section('content')
<div class="d-flex justify-content-center py-3">
<div class="w-100" style="max-width:440px;animation:fadeInUp .45s ease both">

    <div class="text-center mb-4">
        <div style="font-size:3rem;color:var(--accent)"><i class="bi bi-shield-lock"></i></div>
        <h1 class="fw-bold fs-4 mt-2" style="background:linear-gradient(45deg,#818cf8,#c084fc);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">
            Área segura
        </h1>
    </div>

    <div class="card border-0 shadow-sm">
        <div class="card-body p-4">

            <p class="text-muted small mb-4">
                Esta es una zona segura de la aplicación. Confirma tu contraseña para continuar.
            </p>

            <form method="POST" action="{{ route('password.confirm') }}">
                @csrf

                <div class="mb-4">
                    <label class="form-label" for="password">Contraseña</label>
                    <input id="password" type="password" name="password"
                           class="form-control @error('password') is-invalid @enderror"
                           required autocomplete="current-password" placeholder="••••••••">
                    @error('password')
                        <div class="invalid-feedback">{{ $message }}</div>
                    @enderror
                </div>

                <button type="submit" class="btn btn-primary w-100">
                    <i class="bi bi-check-lg me-2"></i>Confirmar
                </button>
            </form>

        </div>
    </div>

</div>
</div>
@endsection
