import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { AlertCircle, BookOpen, GraduationCap, Pencil, Plus, Search, Trash2 } from 'lucide-react'

import { facultadesApi, programasApi } from '../api/client.js'
import Badge from '../components/ui/Badge.jsx'
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
import { formatDate, getErrorMessage, NIVELES, nivelInfo, pluralize } from '../utils/format.js'

const EMPTY_FORM = { codigo: '', nombre: '', nivel: 'pregrado', facultad: '' }

export default function Programas() {
  const toast = useToast()
  const { items: programas, loading, error, recargar } = useApiList(programasApi.listar)
  const {
    items: facultades,
    loading: loadingFacultades,
    error: errorFacultades,
  } = useApiList(facultadesApi.listar)

  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [nivelFilter, setNivelFilter] = useState('')
  const [facultadFilter, setFacultadFilter] = useState('')
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
    setForm({ ...EMPTY_FORM, facultad: facultades[0]?._id ?? '' })
    setErrors({})
    setFormError('')
    setModalOpen(true)
  }

  useEffect(() => {
    if (searchParams.get('nuevo') !== '1') return

    setEditing(null)
    setForm({ ...EMPTY_FORM, facultad: facultades[0]?._id ?? '' })
    setErrors({})
    setFormError('')
    setModalOpen(true)
    setSearchParams({}, { replace: true })
  }, [searchParams, setSearchParams, facultades])

  const filtrados = useMemo(() => {
    const term = search.trim().toLowerCase()

    return programas.filter((programa) => {
      const facultadNombre = programa.facultad?.nombre ?? ''
      const matchSearch =
        !term ||
        programa.nombre.toLowerCase().includes(term) ||
        programa.codigo.toLowerCase().includes(term) ||
        facultadNombre.toLowerCase().includes(term)

      const matchNivel = !nivelFilter || programa.nivel === nivelFilter
      const matchFacultad =
        !facultadFilter ||
        programa.facultad?._id === facultadFilter ||
        programa.facultad === facultadFilter

      return matchSearch && matchNivel && matchFacultad
    })
  }, [programas, search, nivelFilter, facultadFilter])

  const getSortValue = useMemo(
    () => (programa, key) => {
      if (key === 'codigo') return programa.codigo
      if (key === 'nombre') return programa.nombre
      if (key === 'nivel') return nivelInfo(programa.nivel).label
      if (key === 'facultad') return programa.facultad?.nombre ?? ''
      if (key === 'registro') return new Date(programa.createdAt ?? 0).getTime()
      return ''
    },
    [],
  )

  const { sorted: programasOrdenados, sort, toggleSort } = useSortable(filtrados, getSortValue)

  const resumen = useMemo(
    () => ({
      pregrado: programas.filter((programa) => programa.nivel === 'pregrado').length,
      posgrado: programas.filter((programa) => programa.nivel === 'posgrado').length,
      otros: programas.filter((programa) => programa.nivel === 'otros').length,
    }),
    [programas],
  )

  const abrirEditar = (programa) => {
    setEditing(programa)
    setForm({
      codigo: programa.codigo,
      nombre: programa.nombre,
      nivel: programa.nivel,
      facultad: programa.facultad?._id ?? programa.facultad ?? '',
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
    const codigo = form.codigo.trim()
    const nombre = form.nombre.trim()

    if (codigo.length < 2 || codigo.length > 20) {
      nextErrors.codigo = 'El código debe tener entre 2 y 20 caracteres.'
    }

    if (nombre.length < 3 || nombre.length > 150) {
      nextErrors.nombre = 'El nombre debe tener entre 3 y 150 caracteres.'
    }

    if (!NIVELES.some((nivel) => nivel.value === form.nivel)) {
      nextErrors.nivel = 'Selecciona un nivel válido.'
    }

    if (!form.facultad) {
      nextErrors.facultad = 'Selecciona la facultad a la que pertenece.'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!validar()) return

    const payload = {
      codigo: form.codigo.trim(),
      nombre: form.nombre.trim(),
      nivel: form.nivel,
      facultad: form.facultad,
    }

    setSaving(true)
    setFormError('')

    try {
      if (editing) {
        await programasApi.actualizar(editing._id, payload)
        toast.success('Programa actualizado correctamente.')
      } else {
        await programasApi.crear(payload)
        toast.success('Programa creado correctamente.')
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
      await programasApi.eliminar(deleteTarget._id)
      toast.success('Programa eliminado correctamente.')
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
    setNivelFilter('')
    setFacultadFilter('')
  }

  const hayFiltros = search || nivelFilter || facultadFilter

  return (
    <div>
      <PageHeader
        eyebrow="Oferta académica"
        title="Programas"
        description="Administra los programas de pregrado, posgrado y otras modalidades, junto con su facultad."
        actions={
          <button
            type="button"
            className="btn btn--primary"
            onClick={abrirCrear}
            disabled={loadingFacultades}
          >
            <Plus />
            Nuevo programa
          </button>
        }
      />

      {errorFacultades ? (
        <div className="banner banner--warning mb-2" role="alert">
          <AlertCircle aria-hidden="true" />
          <div className="banner__content">
            No se pudieron cargar las facultades. No podrás crear o editar programas hasta que se
            restablezca la conexión.
          </div>
        </div>
      ) : null}

      {!loadingFacultades && facultades.length === 0 ? (
        <div className="banner banner--info mb-2" role="status">
          <AlertCircle aria-hidden="true" />
          <div className="banner__content">
            Primero debes crear una facultad para poder registrar programas.{' '}
            <Link to="/facultades?nuevo=1" className="text-success">
              Crear facultad
            </Link>
          </div>
        </div>
      ) : null}

      <div className="summary-chips">
        <span className="summary-chip">
          Total <strong>{programas.length}</strong>
        </span>
        <span className="summary-chip">
          Pregrado <strong>{resumen.pregrado}</strong>
        </span>
        <span className="summary-chip">
          Posgrado <strong>{resumen.posgrado}</strong>
        </span>
        <span className="summary-chip">
          Otros <strong>{resumen.otros}</strong>
        </span>
      </div>

      {error ? <ErrorBanner error={error} onRetry={recargar} /> : null}

      <div className="toolbar">
        <label className="search-box">
          <Search aria-hidden="true" />
          <span className="sr-only">Buscar programas</span>
          <input
            className="input"
            type="search"
            placeholder="Buscar por código, nombre o facultad…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>

        <select
          className="select filter-select"
          value={nivelFilter}
          onChange={(event) => setNivelFilter(event.target.value)}
          aria-label="Filtrar por nivel"
        >
          <option value="">Todos los niveles</option>
          {NIVELES.map((nivel) => (
            <option key={nivel.value} value={nivel.value}>
              {nivel.label}
            </option>
          ))}
        </select>

        <select
          className="select filter-select"
          value={facultadFilter}
          onChange={(event) => setFacultadFilter(event.target.value)}
          aria-label="Filtrar por facultad"
        >
          <option value="">Todas las facultades</option>
          {facultades.map((facultad) => (
            <option key={facultad._id} value={facultad._id}>
              {facultad.nombre}
            </option>
          ))}
        </select>

        {hayFiltros ? (
          <button type="button" className="btn btn--sm btn--ghost" onClick={limpiarFiltros}>
            Limpiar
          </button>
        ) : null}

        <span className="toolbar__count">
          {pluralize(filtrados.length, 'programa encontrado', 'programas encontrados')}
        </span>
      </div>

      {loading ? (
        <TableSkeleton labels={['Código', 'Programa', 'Nivel', 'Facultad', 'Registro', '']} rows={5} />
      ) : filtrados.length === 0 ? (
        <div className="panel">
          <EmptyState
            icon={GraduationCap}
            title={programas.length === 0 ? 'Todavía no hay programas' : 'No hay coincidencias'}
            description={
              programas.length === 0
                ? 'Registra el primer programa académico y asígnalo a una facultad.'
                : 'Prueba con otros filtros o limpia la búsqueda.'
            }
            action={
              programas.length === 0 ? (
                <button
                  type="button"
                  className="btn btn--primary"
                  onClick={abrirCrear}
                  disabled={facultades.length === 0}
                >
                  <Plus />
                  Crear programa
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
                <SortableTh label="Código" sortKey="codigo" sort={sort} onSort={toggleSort} />
                <SortableTh label="Programa" sortKey="nombre" sort={sort} onSort={toggleSort} />
                <SortableTh label="Nivel" sortKey="nivel" sort={sort} onSort={toggleSort} />
                <SortableTh label="Facultad" sortKey="facultad" sort={sort} onSort={toggleSort} />
                <SortableTh label="Registro" sortKey="registro" sort={sort} onSort={toggleSort} />
                <th aria-label="Acciones" />
              </tr>
            </thead>
            <tbody className="stagger-rows">
              {programasOrdenados.map((programa) => {
                const nivel = nivelInfo(programa.nivel)
                const facultadNombre = programa.facultad?.nombre ?? 'Sin facultad'

                return (
                  <tr key={programa._id}>
                    <td data-label="Código">
                      <span className="program-code">{programa.codigo}</span>
                    </td>
                    <td data-label="Programa">
                      <div className="cell-main">{programa.nombre}</div>
                    </td>
                    <td data-label="Nivel">
                      <Badge tone={nivel.variant}>{nivel.label}</Badge>
                    </td>
                    <td data-label="Facultad">
                      <div className="cell-main" style={{ fontWeight: 600 }}>
                        {facultadNombre}
                      </div>
                    </td>
                    <td data-label="Registro" className="muted cell-date">
                      {formatDate(programa.createdAt)}
                    </td>
                    <td className="cell-actions">
                      <div className="row-actions">
                        <button
                          type="button"
                          className="icon-btn"
                          onClick={() => abrirEditar(programa)}
                          aria-label={`Editar ${programa.nombre}`}
                          data-tooltip="Editar"
                          data-tooltip-side="top"
                        >
                          <Pencil />
                        </button>
                        <button
                          type="button"
                          className="icon-btn icon-btn--danger"
                          onClick={() => setDeleteTarget(programa)}
                          aria-label={`Eliminar ${programa.nombre}`}
                          data-tooltip="Eliminar"
                          data-tooltip-side="top"
                        >
                          <Trash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={cerrarModal}
        title={editing ? 'Editar programa' : 'Nuevo programa'}
        subtitle={
          editing
            ? 'Actualiza la información del programa académico.'
            : 'Agrega un programa y relaciónalo con una facultad.'
        }
        size="lg"
        footer={
          <>
            <button type="button" className="btn btn--secondary" onClick={cerrarModal} disabled={saving}>
              Cancelar
            </button>
            <button type="submit" form="programa-form" className="btn btn--primary" disabled={saving}>
              {saving ? <span className="spinner spinner--sm" aria-hidden="true" /> : null}
              {saving ? 'Guardando…' : editing ? 'Guardar cambios' : 'Crear programa'}
            </button>
          </>
        }
      >
        <form id="programa-form" className="stack" onSubmit={handleSubmit} noValidate>
          {formError ? (
            <div className="form-error" role="alert">
              <AlertCircle aria-hidden="true" />
              <span>{formError}</span>
            </div>
          ) : null}

          <div className="form-grid">
            <Field label="Código" htmlFor="programa-codigo" required error={errors.codigo} hint="Ej. ISI, DER, MED.">
              <input
                id="programa-codigo"
                className="input"
                value={form.codigo}
                onChange={(event) => {
                  setForm((current) => ({ ...current, codigo: event.target.value }))
                  setErrors((current) => ({ ...current, codigo: undefined }))
                }}
                placeholder="ISI"
                maxLength={20}
                autoFocus
                aria-invalid={Boolean(errors.codigo)}
              />
            </Field>

            <Field label="Nivel" htmlFor="programa-nivel" required error={errors.nivel}>
              <select
                id="programa-nivel"
                className="select"
                value={form.nivel}
                onChange={(event) => {
                  setForm((current) => ({ ...current, nivel: event.target.value }))
                  setErrors((current) => ({ ...current, nivel: undefined }))
                }}
                aria-invalid={Boolean(errors.nivel)}
              >
                {NIVELES.map((nivel) => (
                  <option key={nivel.value} value={nivel.value}>
                    {nivel.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field
              label="Nombre del programa"
              htmlFor="programa-nombre"
              required
              full
              error={errors.nombre}
              hint="Entre 3 y 150 caracteres."
            >
              <input
                id="programa-nombre"
                className="input"
                value={form.nombre}
                onChange={(event) => {
                  setForm((current) => ({ ...current, nombre: event.target.value }))
                  setErrors((current) => ({ ...current, nombre: undefined }))
                }}
                placeholder="Ej. Ingeniería de Sistemas"
                maxLength={150}
                aria-invalid={Boolean(errors.nombre)}
              />
            </Field>

            <Field
              label="Facultad"
              htmlFor="programa-facultad"
              required
              full
              error={errors.facultad}
              hint="El programa quedará asociado a esta facultad."
            >
              <select
                id="programa-facultad"
                className="select"
                value={form.facultad}
                onChange={(event) => {
                  setForm((current) => ({ ...current, facultad: event.target.value }))
                  setErrors((current) => ({ ...current, facultad: undefined }))
                }}
                aria-invalid={Boolean(errors.facultad)}
                disabled={facultades.length === 0}
              >
                <option value="">Selecciona una facultad</option>
                {facultades.map((facultad) => (
                  <option key={facultad._id} value={facultad._id}>
                    {facultad.nombre}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          {facultades.length === 0 ? (
            <div className="form-note">
              <BookOpen aria-hidden="true" />
              <span>
                No hay facultades registradas. Crea una facultad antes de guardar el programa.
              </span>
            </div>
          ) : null}
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => (deleting ? null : setDeleteTarget(null))}
        onConfirm={confirmarEliminar}
        loading={deleting}
        title="Eliminar programa"
        description={
          <>
            ¿Seguro que quieres eliminar <strong>{deleteTarget?.nombre}</strong> (
            {deleteTarget?.codigo})? Esta acción no se puede deshacer.
          </>
        }
      />
    </div>
  )
}
