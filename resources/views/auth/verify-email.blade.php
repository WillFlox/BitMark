@extends('layouts.app')
@section('title', 'Verifica tu correo')

@section('content')
<div class="d-flex justify-content-center py-3">
<div class="w-100" style="max-width:440px;animation:fadeInUp .45s ease both">

    <div class="text-center mb-4">
        <div style="font-size:3.5rem;animation:float 3s ease-in-out infinite;color:var(--accent)">
            <i class="bi bi-envelope-check"></i>
        </div>
        <h1 class="fw-bold fs-4 mt-2" style="background:linear-gradient(45deg,#818cf8,#c084fc);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">
            Verifica tu correo
        </h1>
    </div>

    <div class="card border-0 shadow-sm">
        <div class="card-body p-4">

            <p class="text-muted small mb-3">
                Gracias por registrarte. Antes de continuar, haz clic en el enlace de verificación que te enviamos por correo electrónico.
            </p>

            @if(session('status') === 'verification-link-sent')
                <div class="alert alert-success py-2 mb-3">
                    <i class="bi bi-check-circle-fill me-2"></i>
                    Se envió un nuevo enlace de verificación a tu correo.
                </div>
            @endif

            <div class="d-flex flex-column gap-2">
                <form method="POST" action="{{ route('verification.send') }}">
                    @csrf
                    <button type="submit" class="btn btn-primary w-100">
                        <i class="bi bi-envelope me-2"></i>Reenviar correo de verificación
                    </button>
                </form>

                <form method="POST" action="{{ route('logout') }}">
                    @csrf
                    <button type="submit" class="btn btn-outline-secondary w-100 btn-sm">
                        <i class="bi bi-box-arrow-right me-1"></i>Cerrar sesión
                    </button>
                </form>
            </div>

        </div>
    </div>

</div>
</div>
@endsection
