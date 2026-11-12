import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AlertCircle, Mail, Pencil, Plus, Search, Trash2, UserPlus, Users } from 'lucide-react'

import { estudiantesApi } from '../api/client.js'
import Avatar from '../components/ui/Avatar.jsx'
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import ErrorBanner from '../components/ui/ErrorBanner.jsx'
import Field from '../components/ui/Field.jsx'
import TableSkeleton from '../components/ui/TableSkeleton.jsx'
import Modal from '../components/ui/Modal.jsx'
import PageHeader from '../components/ui/PageHeader.jsx'
import SortableTh from '../components/ui/SortableTh.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { useApiList } from '../hooks/useApiList.js'
import useSortable from '../hooks/useSortable.js'
import {
  formatDate,
  getErrorMessage,
  pluralize,
  TIPOS_DOCUMENTO,
  tipoDocumentoLabel,
} from '../utils/format.js'

const EMPTY_FORM = {
  tipoDocumento: 'CC',
  numeroDocumento: '',
  nombres: '',
  apellidos: '',
  email: '',
  telefono: '',
}

export default function Estudiantes() {
  const toast = useToast()
  const { items: estudiantes, loading, error, recargar } = useApiList(estudiantesApi.listar)

  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [tipoFilter, setTipoFilter] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const abrirCrear = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setErrors({})
    setFormError('')
    setModalOpen(true)
  }

  useEffect(() => {
    if (searchParams.get('nuevo') !== '1') return

    setEditing(null)
    setForm(EMPTY_FORM)
    setErrors({})
    setFormError('')
    setModalOpen(true)
    setSearchParams({}, { replace: true })
  }, [searchParams, setSearchParams])

  const filtrados = useMemo(() => {
    const term = search.trim().toLowerCase()

    return estudiantes.filter((estudiante) => {
      const fullName = `${estudiante.nombres} ${estudiante.apellidos}`.toLowerCase()
      const matchSearch =
        !term ||
        fullName.includes(term) ||
        estudiante.numeroDocumento.toLowerCase().includes(term) ||
        estudiante.email.toLowerCase().includes(term)

      const matchTipo = !tipoFilter || estudiante.tipoDocumento === tipoFilter

      return matchSearch && matchTipo
    })
  }, [estudiantes, search, tipoFilter])

  const getSortValue = useMemo(
    () => (estudiante, key) => {
      if (key === 'nombre') return `${estudiante.nombres} ${estudiante.apellidos}`
      if (key === 'documento') return estudiante.numeroDocumento
      if (key === 'telefono') return estudiante.telefono ?? ''
      if (key === 'registro') return new Date(estudiante.createdAt ?? 0).getTime()
      return ''
    },
    [],
  )

  const { sorted: estudiantesOrdenados, sort, toggleSort } = useSortable(filtrados, getSortValue)

  const resumen = useMemo(
    () =>
      TIPOS_DOCUMENTO.reduce((accumulator, tipo) => {
        accumulator[tipo] = estudiantes.filter((estudiante) => estudiante.tipoDocumento === tipo).length
        return accumulator
      }, {}),
    [estudiantes],
  )

  const abrirEditar = (estudiante) => {
    setEditing(estudiante)
    setForm({
      tipoDocumento: estudiante.tipoDocumento,
      numeroDocumento: estudiante.numeroDocumento,
      nombres: estudiante.nombres,
      apellidos: estudiante.apellidos,
      email: estudiante.email,
      telefono: estudiante.telefono ?? '',
    })
    setErrors({})
    setFormError('')
    setModalOpen(true)
  }

  const cerrarModal = () => {
    if (saving) return
    setModalOpen(false)
    setEditing(null)
    setForm(EMPTY_FORM)
    setErrors({})
    setFormError('')
  }

  const validar = () => {
    const nextErrors = {}
    const numeroDocumento = form.numeroDocumento.trim()
    const nombres = form.nombres.trim()
    const apellidos = form.apellidos.trim()
    const email = form.email.trim()
    const telefono = form.telefono.trim()

    if (!TIPOS_DOCUMENTO.includes(form.tipoDocumento)) {
      nextErrors.tipoDocumento = 'Selecciona un tipo de documento válido.'
    }

    if (!/^[0-9A-Za-z]{5,20}$/.test(numeroDocumento)) {
      nextErrors.numeroDocumento = 'Debe tener entre 5 y 20 caracteres, solo letras y números.'
    }

    if (nombres.length < 2 || nombres.length > 80) {
      nextErrors.nombres = 'Debe tener entre 2 y 80 caracteres.'
    }

    if (apellidos.length < 2 || apellidos.length > 80) {
      nextErrors.apellidos = 'Debe tener entre 2 y 80 caracteres.'
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = 'Escribe un correo electrónico válido.'
    }

    if (telefono && !/^[0-9+ ]{7,20}$/.test(telefono)) {
      nextErrors.telefono = 'Debe tener entre 7 y 20 dígitos. Puedes usar + y espacios.'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!validar()) return

    const payload = {
      tipoDocumento: form.tipoDocumento,
      numeroDocumento: form.numeroDocumento.trim(),
      nombres: form.nombres.trim(),
      apellidos: form.apellidos.trim(),
      email: form.email.trim(),
      telefono: form.telefono.trim(),
    }

    setSaving(true)
    setFormError('')

    try {
      if (editing) {
        await estudiantesApi.actualizar(editing._id, payload)
        toast.success('Estudiante actualizado correctamente.')
      } else {
        await estudiantesApi.crear(payload)
        toast.success('Estudiante registrado correctamente.')
      }

      setModalOpen(false)
      setEditing(null)
      setForm(EMPTY_FORM)
      await recargar()
    } catch (err) {
      setFormError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const confirmarEliminar = async () => {
    if (!deleteTarget) return

    setDeleting(true)
    try {
      await estudiantesApi.eliminar(deleteTarget._id)
      toast.success('Estudiante eliminado correctamente.')
      setDeleteTarget(null)
      await recargar()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setDeleting(false)
    }
  }

  const limpiarFiltros = () => {
    setSearch('')
    setTipoFilter('')
  }

  const hayFiltros = search || tipoFilter

  const actualizarCampo = (campo) => (event) => {
    setForm((current) => ({ ...current, [campo]: event.target.value }))
    setErrors((current) => ({ ...current, [campo]: undefined }))
  }

  return (
    <div>
      <PageHeader
        eyebrow="Comunidad académica"
        title="Estudiantes"
        description="Registra y actualiza la información de contacto y documento de los estudiantes."
        actions={
          <button type="button" className="btn btn--primary" onClick={abrirCrear}>
            <UserPlus />
            Nuevo estudiante
          </button>
        }
      />

      <div className="summary-chips">
        <span className="summary-chip">
          Total <strong>{estudiantes.length}</strong>
        </span>
        {TIPOS_DOCUMENTO.map((tipo) => (
          <span className="summary-chip" key={tipo}>
            {tipo} <strong>{resumen[tipo] ?? 0}</strong>
          </span>
        ))}
      </div>

      {error ? <ErrorBanner error={error} onRetry={recargar} /> : null}

      <div className="toolbar">
        <label className="search-box">
          <Search aria-hidden="true" />
          <span className="sr-only">Buscar estudiantes</span>
          <input
            className="input"
            type="search"
            placeholder="Buscar por nombre, documento o correo…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>

        <select
          className="select filter-select"
          value={tipoFilter}
          onChange={(event) => setTipoFilter(event.target.value)}
          aria-label="Filtrar por tipo de documento"
        >
          <option value="">Todos los documentos</option>
          {TIPOS_DOCUMENTO.map((tipo) => (
            <option key={tipo} value={tipo}>
              {tipo} · {tipoDocumentoLabel(tipo)}
            </option>
          ))}
        </select>

        {hayFiltros ? (
          <button type="button" className="btn btn--sm btn--ghost" onClick={limpiarFiltros}>
            Limpiar
          </button>
        ) : null}

        <span className="toolbar__count">
          {pluralize(filtrados.length, 'estudiante encontrado', 'estudiantes encontrados')}
        </span>
      </div>

      {loading ? (
        <TableSkeleton labels={['Estudiante', 'Documento', 'Teléfono', 'Registro', '']} rows={6} />
      ) : filtrados.length === 0 ? (
        <div className="panel">
          <EmptyState
            icon={Users}
            title={estudiantes.length === 0 ? 'Todavía no hay estudiantes' : 'No hay coincidencias'}
            description={
              estudiantes.length === 0
                ? 'Registra el primer estudiante para comenzar a construir la comunidad académica.'
                : 'Prueba con otro nombre, documento o limpia los filtros.'
            }
            action={
              estudiantes.length === 0 ? (
                <button type="button" className="btn btn--primary" onClick={abrirCrear}>
                  <Plus />
                  Registrar estudiante
                </button>
              ) : (
                <button type="button" className="btn btn--secondary" onClick={limpiarFiltros}>
                  Limpiar filtros
                </button>
              )
            }
          />
        </div>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <SortableTh label="Estudiante" sortKey="nombre" sort={sort} onSort={toggleSort} />
                <SortableTh label="Documento" sortKey="documento" sort={sort} onSort={toggleSort} />
                <SortableTh label="Teléfono" sortKey="telefono" sort={sort} onSort={toggleSort} />
                <SortableTh label="Registro" sortKey="registro" sort={sort} onSort={toggleSort} />
                <th aria-label="Acciones" />
              </tr>
            </thead>
            <tbody className="stagger-rows">
              {estudiantesOrdenados.map((estudiante) => (
                <tr key={estudiante._id}>
                  <td data-label="Estudiante">
                    <div className="cell-person">
                      <Avatar
                        avatar={estudiante.usuario?.avatar}
                        nombre={estudiante.nombres}
                        apellidos={estudiante.apellidos}
                      />
                      <div>
                        <div className="cell-main">
                          {estudiante.nombres} {estudiante.apellidos}
                        </div>
                        <div className="cell-sub">
                          <Mail
                            size={11}
                            style={{ display: 'inline', marginRight: 4, verticalAlign: '-1px' }}
                            aria-hidden="true"
                          />
                          {estudiante.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td data-label="Documento">
                    <span className="student-doc">
                      <span>{estudiante.tipoDocumento}</span>
                      {estudiante.numeroDocumento}
                    </span>
                  </td>
                  <td data-label="Teléfono" className="muted">
                    {estudiante.telefono || '—'}
                  </td>
                  <td data-label="Registro" className="muted cell-date">
                    {formatDate(estudiante.createdAt)}
                  </td>
                  <td className="cell-actions">
                    <div className="row-actions">
                      <button
                        type="button"
                        className="icon-btn"
                        onClick={() => abrirEditar(estudiante)}
                        aria-label={`Editar ${estudiante.nombres} ${estudiante.apellidos}`}
                        data-tooltip="Editar"
                        data-tooltip-side="top"
                      >
                        <Pencil />
                      </button>
                      <button
                        type="button"
                        className="icon-btn icon-btn--danger"
                        onClick={() => setDeleteTarget(estudiante)}
                        aria-label={`Eliminar ${estudiante.nombres} ${estudiante.apellidos}`}
                        data-tooltip="Eliminar"
                        data-tooltip-side="top"
                      >
                        <Trash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={cerrarModal}
        title={editing ? 'Editar estudiante' : 'Nuevo estudiante'}
        subtitle={
          editing
            ? 'Actualiza los datos de contacto y documento.'
            : 'Completa la información básica del estudiante.'
        }
        size="lg"
        footer={
          <>
            <button type="button" className="btn btn--secondary" onClick={cerrarModal} disabled={saving}>
              Cancelar
            </button>
            <button type="submit" form="estudiante-form" className="btn btn--primary" disabled={saving}>
              {saving ? <span className="spinner spinner--sm" aria-hidden="true" /> : null}
              {saving ? 'Guardando…' : editing ? 'Guardar cambios' : 'Registrar estudiante'}
            </button>
          </>
        }
      >
        <form id="estudiante-form" className="stack" onSubmit={handleSubmit} noValidate>
          {formError ? (
            <div className="form-error" role="alert">
              <AlertCircle aria-hidden="true" />
              <span>{formError}</span>
            </div>
          ) : null}

          <div className="form-grid">
            <Field
              label="Tipo de documento"
              htmlFor="estudiante-tipo"
              required
              error={errors.tipoDocumento}
            >
              <select
                id="estudiante-tipo"
                className="select"
                value={form.tipoDocumento}
                onChange={actualizarCampo('tipoDocumento')}
                aria-invalid={Boolean(errors.tipoDocumento)}
              >
                {TIPOS_DOCUMENTO.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo} · {tipoDocumentoLabel(tipo)}
                  </option>
                ))}
              </select>
            </Field>

            <Field
              label="Número de documento"
              htmlFor="estudiante-numero"
              required
              error={errors.numeroDocumento}
              hint="Entre 5 y 20 letras o números."
            >
              <input
                id="estudiante-numero"
                className="input"
                value={form.numeroDocumento}
                onChange={actualizarCampo('numeroDocumento')}
                placeholder="1088123456"
                maxLength={20}
                autoFocus
                aria-invalid={Boolean(errors.numeroDocumento)}
              />
            </Field>

            <Field label="Nombres" htmlFor="estudiante-nombres" required error={errors.nombres}>
              <input
                id="estudiante-nombres"
                className="input"
                value={form.nombres}
                onChange={actualizarCampo('nombres')}
                placeholder="Juan José"
                maxLength={80}
                aria-invalid={Boolean(errors.nombres)}
              />
            </Field>

            <Field label="Apellidos" htmlFor="estudiante-apellidos" required error={errors.apellidos}>
              <input
                id="estudiante-apellidos"
                className="input"
                value={form.apellidos}
                onChange={actualizarCampo('apellidos')}
                placeholder="Velásquez Parra"
                maxLength={80}
                aria-invalid={Boolean(errors.apellidos)}
              />
            </Field>

            <Field
              label="Correo electrónico"
              htmlFor="estudiante-email"
              required
              error={errors.email}
              hint="Se guarda en minúsculas."
            >
              <input
                id="estudiante-email"
                className="input"
                type="email"
                value={form.email}
                onChange={actualizarCampo('email')}
                placeholder="nombre@ucp.edu.co"
                maxLength={120}
                aria-invalid={Boolean(errors.email)}
              />
            </Field>

            <Field
              label="Teléfono"
              htmlFor="estudiante-telefono"
              error={errors.telefono}
              hint="Opcional. Entre 7 y 20 dígitos."
            >
              <input
                id="estudiante-telefono"
                className="input"
                type="tel"
                value={form.telefono}
                onChange={actualizarCampo('telefono')}
                placeholder="3001234567"
                maxLength={20}
                aria-invalid={Boolean(errors.telefono)}
              />
            </Field>
          </div>

          <div className="form-note">
            <AlertCircle aria-hidden="true" />
            <span>
              El número de documento es único. Si ya existe un estudiante con ese documento, no se
              permitirá el registro.
            </span>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => (deleting ? null : setDeleteTarget(null))}
        onConfirm={confirmarEliminar}
        loading={deleting}
        title="Eliminar estudiante"
        description={
          <>
            ¿Seguro que quieres eliminar a{' '}
            <strong>
              {deleteTarget?.nombres} {deleteTarget?.apellidos}
            </strong>
            ? Esta acción no se puede deshacer.
          </>
        }
      />
    </div>
  )
}
