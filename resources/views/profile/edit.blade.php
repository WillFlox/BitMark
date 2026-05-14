@extends('layouts.app')
@section('title', 'Mi Perfil')
@section('meta_description', 'Gestiona tu información personal, contraseña y configuración de cuenta en BitMark.')

@push('styles')
<style>
    /* ── Encabezado ── */
    .profile-title {
        background: linear-gradient(45deg, #818cf8, #c084fc);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        animation: fadeInLeft .5s ease both;
    }

    /* ── Avatar ── */
    .profile-avatar {
        width: 80px; height: 80px;
        border-radius: 50%;
        background: linear-gradient(135deg, var(--btn-from), var(--btn-to));
        display: flex; align-items: center; justify-content: center;
        font-size: 2rem; font-weight: 800; color: #fff;
        flex-shrink: 0;
        box-shadow: 0 8px 24px rgba(99,102,241,.4);
        animation: popIn .5s ease both;
    }

    /* ── Sección headers ── */
    .section-label {
        font-size: .7rem;
        font-weight: 700;
        letter-spacing: .12em;
        text-transform: uppercase;
        color: var(--accent);
        margin-bottom: 4px;
    }

    /* ── Zona de peligro ── */
    .danger-zone {
        border: 1px solid rgba(248,113,113,.25) !important;
        background: rgba(248,113,113,.04) !important;
    }
    .danger-zone .card-header {
        background: rgba(248,113,113,.1) !important;
        border-bottom: 1px solid rgba(248,113,113,.2) !important;
        color: var(--danger) !important;
    }

    /* ── Animaciones stagger ── */
    .profile-card { animation: fadeInUp .45s ease both; }
    .profile-card:nth-child(2) { animation-delay: .08s; }
    .profile-card:nth-child(3) { animation-delay: .16s; }

    /* ── Badge de rol ── */
    .role-badge {
        display: inline-flex; align-items: center; gap: 5px;
        padding: 3px 10px; border-radius: 999px;
        font-size: .72rem; font-weight: 600;
        background: rgba(129,140,248,.15);
        border: 1px solid rgba(129,140,248,.3);
        color: var(--accent);
    }
    .role-badge.admin {
        background: rgba(251,191,36,.15);
        border-color: rgba(251,191,36,.3);
        color: var(--warning);
    }
</style>
@endpush

@section('content')

{{-- ── Encabezado de página ── --}}
<div class="d-flex align-items-center gap-3 mb-4 flex-wrap" style="animation: fadeInDown .4s ease both">
    <div class="profile-avatar">
        {{ strtoupper(substr(auth()->user()->name, 0, 1)) }}
    </div>
    <div>
        <h2 class="fw-bold mb-0 profile-title">Mi Perfil</h2>
        <div class="d-flex align-items-center gap-2 mt-1 flex-wrap">
            <span class="text-muted small">{{ auth()->user()->email }}</span>
            <span class="role-badge {{ auth()->user()->role === 'admin' ? 'admin' : '' }}">
                <i class="bi bi-{{ auth()->user()->role === 'admin' ? 'shield-check' : 'person-check' }}"></i>
                {{ auth()->user()->role === 'admin' ? 'Administrador' : 'Cliente' }}
            </span>
        </div>
    </div>
</div>

<div class="row g-4">
    <div class="col-lg-8">

        {{-- ── 1. Información personal ── --}}
        <div class="card border-0 shadow-sm profile-card mb-4">
            <div class="card-header">
                <p class="section-label mb-0"><i class="bi bi-person me-1"></i>Información personal</p>
            </div>
            <div class="card-body">
                <p class="text-muted small mb-4">Actualiza tu nombre y correo electrónico.</p>

                @if(session('status') === 'profile-updated')
                    <div class="alert alert-success alert-dismissible fade show py-2" role="alert">
                        <i class="bi bi-check-circle-fill me-2"></i>Perfil actualizado correctamente.
                        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                    </div>
                @endif

                <form method="POST" action="{{ route('profile.update') }}">
                    @csrf @method('PATCH')

                    <div class="row g-3">
                        <div class="col-sm-6">
                            <label class="form-label" for="name">Nombre completo</label>
                            <input id="name" type="text" name="name"
                                   class="form-control @error('name') is-invalid @enderror"
                                   value="{{ old('name', $user->name) }}" required autofocus>
                            @error('name')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>
                        <div class="col-sm-6">
                            <label class="form-label" for="email">Correo electrónico</label>
                            <input id="email" type="email" name="email"
                                   class="form-control @error('email') is-invalid @enderror"
                                   value="{{ old('email', $user->email) }}" required>
                            @error('email')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>
                    </div>

                    <div class="mt-4">
                        <button type="submit" class="btn btn-primary">
                            <i class="bi bi-floppy me-1"></i>Guardar cambios
                        </button>
                    </div>
                </form>
            </div>
        </div>

        {{-- ── 2. Cambiar contraseña ── --}}
        <div class="card border-0 shadow-sm profile-card mb-4">
            <div class="card-header">
                <p class="section-label mb-0"><i class="bi bi-lock me-1"></i>Contraseña</p>
            </div>
            <div class="card-body">
                <p class="text-muted small mb-4">Usa una contraseña larga y aleatoria para mantener tu cuenta segura.</p>

                @if(session('status') === 'password-updated')
                    <div class="alert alert-success alert-dismissible fade show py-2" role="alert">
                        <i class="bi bi-check-circle-fill me-2"></i>Contraseña actualizada correctamente.
                        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                    </div>
                @endif

                <form method="POST" action="{{ route('password.update') }}">
                    @csrf @method('PUT')

                    <div class="row g-3">
                        <div class="col-12">
                            <label class="form-label" for="current_password">Contraseña actual</label>
                            <input id="current_password" type="password" name="current_password"
                                   class="form-control @error('current_password', 'updatePassword') is-invalid @enderror"
                                   autocomplete="current-password">
                            @error('current_password', 'updatePassword')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>
                        <div class="col-sm-6">
                            <label class="form-label" for="password">Nueva contraseña</label>
                            <input id="password" type="password" name="password"
                                   class="form-control @error('password', 'updatePassword') is-invalid @enderror"
                                   autocomplete="new-password">
                            @error('password', 'updatePassword')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>
                        <div class="col-sm-6">
                            <label class="form-label" for="password_confirmation">Confirmar contraseña</label>
                            <input id="password_confirmation" type="password" name="password_confirmation"
                                   class="form-control @error('password_confirmation', 'updatePassword') is-invalid @enderror"
                                   autocomplete="new-password">
                            @error('password_confirmation', 'updatePassword')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>
                    </div>

                    <div class="mt-4">
                        <button type="submit" class="btn btn-primary">
                            <i class="bi bi-shield-lock me-1"></i>Actualizar contraseña
                        </button>
                    </div>
                </form>
            </div>
        </div>

        {{-- ── 3. Zona de peligro ── --}}
        <div class="card border-0 shadow-sm profile-card danger-zone">
            <div class="card-header">
                <p class="section-label mb-0" style="color:var(--danger)!important">
                    <i class="bi bi-exclamation-triangle me-1"></i>Zona de peligro
                </p>
            </div>
            <div class="card-body">
                <p class="text-muted small mb-3">
                    Una vez que elimines tu cuenta, todos tus datos serán eliminados permanentemente.
                    Esta acción no se puede deshacer.
                </p>
                <button type="button" class="btn btn-outline-danger btn-sm"
                        data-bs-toggle="modal" data-bs-target="#deleteAccountModal">
                    <i class="bi bi-trash3 me-1"></i>Eliminar mi cuenta
                </button>
            </div>
        </div>

    </div>{{-- /col-lg-8 --}}

    {{-- ── Panel lateral de resumen ── --}}
    <div class="col-lg-4">
        <div class="card border-0 shadow-sm profile-card" style="position:sticky;top:80px">
            <div class="card-header">
                <p class="section-label mb-0"><i class="bi bi-person-circle me-1"></i>Resumen de cuenta</p>
            </div>
            <div class="card-body d-flex flex-column gap-3">

                {{-- Avatar grande --}}
                <div class="text-center py-2">
                    <div class="profile-avatar mx-auto mb-2" style="width:64px;height:64px;font-size:1.6rem">
                        {{ strtoupper(substr(auth()->user()->name, 0, 1)) }}
                    </div>
                    <p class="fw-bold mb-0">{{ auth()->user()->name }}</p>
                    <p class="text-muted small mb-0">{{ auth()->user()->email }}</p>
                </div>

                <hr>

                {{-- Estadísticas rápidas --}}
                @php
                    $orderCount = auth()->user()->orders()->count();
                    $memberSince = auth()->user()->created_at->format('M Y');
                @endphp

                <div class="d-flex justify-content-between align-items-center">
                    <span class="small text-muted"><i class="bi bi-box me-1"></i>Pedidos realizados</span>
                    <span class="fw-bold" style="color:var(--accent)">{{ $orderCount }}</span>
                </div>
                <div class="d-flex justify-content-between align-items-center">
                    <span class="small text-muted"><i class="bi bi-calendar3 me-1"></i>Miembro desde</span>
                    <span class="fw-bold small">{{ $memberSince }}</span>
                </div>

                <hr>

                {{-- Accesos rápidos --}}
                <a href="{{ route('orders.index') }}" class="btn btn-outline-primary btn-sm w-100">
                    <i class="bi bi-receipt me-1"></i>Ver mis pedidos
                </a>
                <a href="{{ route('products.index') }}" class="btn btn-outline-secondary btn-sm w-100">
                    <i class="bi bi-grid me-1"></i>Explorar productos
                </a>

            </div>
        </div>
    </div>

</div>{{-- /row --}}


{{-- ── Modal confirmación eliminar cuenta ── --}}
<div class="modal fade" id="deleteAccountModal" tabindex="-1" aria-labelledby="deleteModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content" style="background:var(--surface-solid);border:1px solid var(--border);border-radius:14px">
            <div class="modal-header" style="border-bottom:1px solid var(--border)">
                <h5 class="modal-title fw-bold" id="deleteModalLabel" style="color:var(--danger)">
                    <i class="bi bi-exclamation-triangle-fill me-2"></i>¿Eliminar cuenta?
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
            </div>
            <div class="modal-body">
                <p class="text-muted small mb-3">
                    Esta acción es <strong style="color:var(--danger)">irreversible</strong>.
                    Todos tus datos, pedidos e información personal serán eliminados permanentemente.
                </p>
                <form id="deleteAccountForm" method="POST" action="{{ route('profile.destroy') }}">
                    @csrf @method('DELETE')
                    <label class="form-label" for="delete_password">Confirma tu contraseña para continuar</label>
                    <input id="delete_password" type="password" name="password"
                           class="form-control @error('password', 'userDeletion') is-invalid @enderror"
                           placeholder="Tu contraseña actual">
                    @error('password', 'userDeletion')
                        <div class="invalid-feedback">{{ $message }}</div>
                    @enderror
                </form>
            </div>
            <div class="modal-footer" style="border-top:1px solid var(--border)">
                <button type="button" class="btn btn-outline-secondary btn-sm" data-bs-dismiss="modal">
                    Cancelar
                </button>
                <button type="submit" form="deleteAccountForm" class="btn btn-danger btn-sm">
                    <i class="bi bi-trash3 me-1"></i>Sí, eliminar mi cuenta
                </button>
            </div>
        </div>
    </div>
</div>

@endsection

@push('scripts')
<script>
    {{-- Abrir modal automáticamente si hay errores de validación de eliminación --}}
    @if($errors->userDeletion->isNotEmpty())
        document.addEventListener('DOMContentLoaded', () => {
            new bootstrap.Modal(document.getElementById('deleteAccountModal')).show();
        });
    @endif
</script>
@endpush
