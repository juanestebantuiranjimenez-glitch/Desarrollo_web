import { useState } from 'react'
import { AlertCircle, CalendarDays, Eye, EyeOff, Mail, Plus, ShieldCheck } from 'lucide-react'

import { authApi } from '../api/client.js'
import Avatar from '../components/ui/Avatar.jsx'
import Field from '../components/ui/Field.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import ErrorBanner from '../components/ui/ErrorBanner.jsx'
import Loader from '../components/ui/Loader.jsx'
import Modal from '../components/ui/Modal.jsx'
import PageHeader from '../components/ui/PageHeader.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { useApiList } from '../hooks/useApiList.js'
import { formatDate, getErrorMessage, pluralize } from '../utils/format.js'

const EMPTY_FORM = {
  nombre: '',
  email: '',
  password: '',
  confirmarPassword: '',
}

export default function Administradores() {
  const toast = useToast()
  const { items: administradores, loading, error, recargar } = useApiList(
    authApi.listarAdministradores,
  )

  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)
  const [verPassword, setVerPassword] = useState(false)

  const abrirCrear = () => {
    setForm(EMPTY_FORM)
    setErrors({})
    setFormError('')
    setVerPassword(false)
    setModalOpen(true)
  }

  const cerrarModal = () => {
    if (saving) return
    setModalOpen(false)
    setForm(EMPTY_FORM)
    setErrors({})
    setFormError('')
  }

  const actualizar = (campo) => (event) => {
    setForm((actual) => ({ ...actual, [campo]: event.target.value }))
    setErrors((actual) => ({ ...actual, [campo]: undefined }))
  }

  const validar = () => {
    const siguientes = {}
    const nombre = form.nombre.trim()
    const email = form.email.trim()

    if (nombre.length < 2 || nombre.length > 120) {
      siguientes.nombre = 'Debe tener entre 2 y 120 caracteres.'
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      siguientes.email = 'Escribe un correo electrónico válido.'
    }

    if (form.password.length < 8 || form.password.length > 72) {
      siguientes.password = 'La contraseña debe tener entre 8 y 72 caracteres.'
    }

    if (form.password !== form.confirmarPassword) {
      siguientes.confirmarPassword = 'Las contraseñas no coinciden.'
    }

    setErrors(siguientes)
    return Object.keys(siguientes).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!validar()) return

    setSaving(true)
    setFormError('')

    try {
      await authApi.registrarAdministrador({
        nombre: form.nombre.trim(),
        email: form.email.trim(),
        password: form.password,
      })
      toast.success('Administrador creado correctamente.')
      setModalOpen(false)
      setForm(EMPTY_FORM)
      await recargar()
    } catch (err) {
      setFormError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Control de acceso"
        title="Administradores"
        description="Crea y consulta las cuentas con permisos para gestionar facultades, programas y estudiantes."
        actions={
          <button type="button" className="btn btn--primary" onClick={abrirCrear}>
            <Plus />
            Nuevo administrador
          </button>
        }
      />

      <div className="summary-chips">
        <span className="summary-chip">
          Total <strong>{administradores.length}</strong>
        </span>
        <span className="summary-chip">
          <ShieldCheck size={13} aria-hidden="true" /> Acceso completo
        </span>
      </div>

      {error ? <ErrorBanner error={error} onRetry={recargar} /> : null}

      {loading ? (
        <Loader text="Cargando administradores…" />
      ) : administradores.length === 0 ? (
        <div className="panel">
          <EmptyState
            icon={ShieldCheck}
            title="Todavía no hay administradores"
            description="Crea el primero para gestionar la información académica."
            action={
              <button type="button" className="btn btn--primary" onClick={abrirCrear}>
                <Plus />
                Nuevo administrador
              </button>
            }
          />
        </div>
      ) : (
        <>
          <div className="toolbar">
            <span className="toolbar__count">
              {pluralize(administradores.length, 'administrador registrado', 'administradores registrados')}
            </span>
          </div>

          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Administrador</th>
                  <th>Rol</th>
                  <th>Registro</th>
                </tr>
              </thead>
              <tbody>
                {administradores.map((admin) => (
                  <tr key={admin._id}>
                    <td data-label="Administrador">
                      <div className="cell-person">
                        <Avatar avatar={admin.avatar} nombre={admin.nombre} />
                        <div>
                          <div className="cell-main">{admin.nombre}</div>
                          <div className="cell-sub">
                            <Mail
                              size={11}
                              style={{ display: 'inline', marginRight: 4, verticalAlign: '-1px' }}
                              aria-hidden="true"
                            />
                            {admin.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td data-label="Rol">
                      <span className="badge badge--blue">
                        <ShieldCheck size={12} aria-hidden="true" />
                        Administrador
                      </span>
                    </td>
                    <td data-label="Registro" className="muted cell-date">
                      <CalendarDays
                        size={12}
                        style={{ display: 'inline', marginRight: 5, verticalAlign: '-2px' }}
                        aria-hidden="true"
                      />
                      {formatDate(admin.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <Modal
        open={modalOpen}
        onClose={cerrarModal}
        title="Nuevo administrador"
        subtitle="La cuenta tendrá acceso completo a la gestión académica."
        footer={
          <>
            <button type="button" className="btn btn--secondary" onClick={cerrarModal} disabled={saving}>
              Cancelar
            </button>
            <button type="submit" form="admin-form" className="btn btn--primary" disabled={saving}>
              {saving ? <span className="spinner spinner--sm" aria-hidden="true" /> : null}
              {saving ? 'Creando…' : 'Crear administrador'}
            </button>
          </>
        }
      >
        <form id="admin-form" className="stack" onSubmit={handleSubmit} noValidate>
          {formError ? (
            <div className="form-error" role="alert">
              <AlertCircle aria-hidden="true" />
              <span>{formError}</span>
            </div>
          ) : null}

          <div className="form-grid">
            <Field
              label="Nombre completo"
              htmlFor="admin-nombre"
              required
              error={errors.nombre}
              full
            >
              <input
                id="admin-nombre"
                className="input"
                value={form.nombre}
                onChange={actualizar('nombre')}
                placeholder="María Fernanda Restrepo"
                maxLength={120}
                autoFocus
                aria-invalid={Boolean(errors.nombre)}
              />
            </Field>

            <Field
              label="Correo electrónico"
              htmlFor="admin-email"
              required
              error={errors.email}
              full
              hint="Será el usuario para iniciar sesión."
            >
              <input
                id="admin-email"
                className="input"
                type="email"
                value={form.email}
                onChange={actualizar('email')}
                placeholder="admin@ucp.edu.co"
                maxLength={120}
                autoComplete="email"
                aria-invalid={Boolean(errors.email)}
              />
            </Field>

            <Field
              label="Contraseña"
              htmlFor="admin-password"
              required
              error={errors.password}
              hint="Entre 8 y 72 caracteres."
            >
              <div className="password-field">
                <input
                  id="admin-password"
                  className="input"
                  type={verPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={actualizar('password')}
                  placeholder="Contraseña segura"
                  autoComplete="new-password"
                  maxLength={72}
                  aria-invalid={Boolean(errors.password)}
                />
                <button
                  type="button"
                  className="password-field__toggle"
                  onClick={() => setVerPassword((actual) => !actual)}
                  aria-label={verPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {verPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </Field>

            <Field
              label="Confirmar contraseña"
              htmlFor="admin-password-2"
              required
              error={errors.confirmarPassword}
            >
              <input
                id="admin-password-2"
                className="input"
                type={verPassword ? 'text' : 'password'}
                value={form.confirmarPassword}
                onChange={actualizar('confirmarPassword')}
                placeholder="Repite la contraseña"
                autoComplete="new-password"
                maxLength={72}
                aria-invalid={Boolean(errors.confirmarPassword)}
              />
            </Field>
          </div>

          <div className="form-note">
            <ShieldCheck aria-hidden="true" />
            <span>
              Solo un administrador con sesión activa puede crear otras cuentas de administrador.
            </span>
          </div>
        </form>
      </Modal>
    </div>
  )
}
