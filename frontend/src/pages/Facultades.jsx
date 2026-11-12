import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Building2, Pencil, Plus, Search, Trash2 } from 'lucide-react'

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
import { formatDate, getErrorMessage, pluralize, shortId } from '../utils/format.js'

const EMPTY_FORM = { nombre: '' }

export default function Facultades() {
  const toast = useToast()
  const { items: facultades, loading, error, recargar } = useApiList(facultadesApi.listar)
  const { items: programas } = useApiList(programasApi.listar)

  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const abrirCrear = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setFormError('')
    setModalOpen(true)
  }

  useEffect(() => {
    if (searchParams.get('nuevo') !== '1') return

    setEditing(null)
    setForm(EMPTY_FORM)
    setFormError('')
    setModalOpen(true)
    setSearchParams({}, { replace: true })
  }, [searchParams, setSearchParams])

  const programasPorFacultad = useMemo(() => {
    return programas.reduce((accumulator, programa) => {
      const id = typeof programa.facultad === 'string' ? programa.facultad : programa.facultad?._id
      if (id) accumulator[id] = (accumulator[id] ?? 0) + 1
      return accumulator
    }, {})
  }, [programas])

  const filtradas = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return facultades

    return facultades.filter(
      (facultad) =>
        facultad.nombre.toLowerCase().includes(term) || facultad._id.toLowerCase().includes(term),
    )
  }, [facultades, search])

  const getSortValue = useMemo(
    () => (facultad, key) => {
      if (key === 'nombre') return facultad.nombre
      if (key === 'programas') return programasPorFacultad[facultad._id] ?? 0
      if (key === 'registro') return new Date(facultad.createdAt ?? 0).getTime()
      return ''
    },
    [programasPorFacultad],
  )

  const {
    sorted: facultadesOrdenadas,
    sort,
    toggleSort,
  } = useSortable(filtradas, getSortValue)

  const abrirEditar = (facultad) => {
    setEditing(facultad)
    setForm({ nombre: facultad.nombre })
    setFormError('')
    setModalOpen(true)
  }

  const cerrarModal = () => {
    if (saving) return
    setModalOpen(false)
    setEditing(null)
    setForm(EMPTY_FORM)
    setFormError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const nombre = form.nombre.trim()

    if (nombre.length < 3 || nombre.length > 150) {
      setFormError('El nombre debe tener entre 3 y 150 caracteres.')
      return
    }

    setSaving(true)
    setFormError('')

    try {
      if (editing) {
        await facultadesApi.actualizar(editing._id, { nombre })
        toast.success('Facultad actualizada correctamente.')
      } else {
        await facultadesApi.crear({ nombre })
        toast.success('Facultad creada correctamente.')
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

  const pedirEliminar = (facultad) => {
    const count = programasPorFacultad[facultad._id] ?? 0

    if (count > 0) {
      toast.error(
        `No puedes eliminar "${facultad.nombre}" porque tiene ${pluralize(count, 'programa', 'programas')}. Elimínalos o cámbialos de facultad primero.`,
      )
      return
    }

    setDeleteTarget(facultad)
  }

  const confirmarEliminar = async () => {
    if (!deleteTarget) return

    setDeleting(true)
    try {
      await facultadesApi.eliminar(deleteTarget._id)
      toast.success('Facultad eliminada correctamente.')
      setDeleteTarget(null)
      await recargar()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Estructura académica"
        title="Facultades"
        description="Organiza las unidades académicas que agrupan los programas de la institución."
        actions={
          <button type="button" className="btn btn--primary" onClick={abrirCrear}>
            <Plus />
            Nueva facultad
          </button>
        }
      />

      <div className="summary-chips">
        <span className="summary-chip">
          Total <strong>{facultades.length}</strong>
        </span>
        <span className="summary-chip">
          Con programas{' '}
          <strong>{facultades.filter((facultad) => (programasPorFacultad[facultad._id] ?? 0) > 0).length}</strong>
        </span>
        <span className="summary-chip">
          Sin programas{' '}
          <strong>{facultades.filter((facultad) => (programasPorFacultad[facultad._id] ?? 0) === 0).length}</strong>
        </span>
      </div>

      {error ? <ErrorBanner error={error} onRetry={recargar} /> : null}

      <div className="toolbar">
        <label className="search-box">
          <Search aria-hidden="true" />
          <span className="sr-only">Buscar facultades</span>
          <input
            className="input"
            type="search"
            placeholder="Buscar por nombre o identificador…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
        <span className="toolbar__count">
          {pluralize(filtradas.length, 'facultad encontrada', 'facultades encontradas')}
        </span>
      </div>

      {loading ? (
        <TableSkeleton labels={['Facultad', 'Programas', 'Registro', '']} rows={5} />
      ) : filtradas.length === 0 ? (
        <div className="panel">
          <EmptyState
            icon={Building2}
            title={facultades.length === 0 ? 'Todavía no hay facultades' : 'No hay coincidencias'}
            description={
              facultades.length === 0
                ? 'Crea la primera facultad para empezar a organizar los programas académicos.'
                : 'Prueba con otro nombre o limpia el buscador.'
            }
            action={
              facultades.length === 0 ? (
                <button type="button" className="btn btn--primary" onClick={abrirCrear}>
                  <Plus />
                  Crear facultad
                </button>
              ) : (
                <button type="button" className="btn btn--secondary" onClick={() => setSearch('')}>
                  Limpiar búsqueda
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
                <SortableTh label="Facultad" sortKey="nombre" sort={sort} onSort={toggleSort} />
                <SortableTh label="Programas" sortKey="programas" sort={sort} onSort={toggleSort} />
                <SortableTh label="Registro" sortKey="registro" sort={sort} onSort={toggleSort} />
                <th aria-label="Acciones" />
              </tr>
            </thead>
            <tbody className="stagger-rows">
              {facultadesOrdenadas.map((facultad) => {
                const count = programasPorFacultad[facultad._id] ?? 0

                return (
                  <tr key={facultad._id}>
                    <td data-label="Facultad">
                      <div className="cell-person">
                        <span className="avatar" aria-hidden="true">
                          {facultad.nombre.trim().charAt(0).toUpperCase()}
                        </span>
                        <div>
                          <div className="cell-main">{facultad.nombre}</div>
                          <div className="cell-sub mono">ID {shortId(facultad._id)}</div>
                        </div>
                      </div>
                    </td>
                    <td data-label="Programas">
                      <Badge tone={count > 0 ? 'blue' : 'slate'}>
                        {pluralize(count, 'programa', 'programas')}
                      </Badge>
                    </td>
                    <td data-label="Registro" className="muted cell-date">
                      {formatDate(facultad.createdAt)}
                    </td>
                    <td className="cell-actions">
                      <div className="row-actions">
                        <button
                          type="button"
                          className="icon-btn"
                          onClick={() => abrirEditar(facultad)}
                          aria-label={`Editar ${facultad.nombre}`}
                          data-tooltip="Editar"
                          data-tooltip-side="top"
                        >
                          <Pencil />
                        </button>
                        <button
                          type="button"
                          className="icon-btn icon-btn--danger"
                          onClick={() => pedirEliminar(facultad)}
                          aria-label={`Eliminar ${facultad.nombre}`}
                          data-tooltip={count > 0 ? 'Tiene programas asociados' : 'Eliminar'}
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

      {facultades.length > 0 ? (
        <p className="mt-2 muted" style={{ fontSize: '0.76rem' }}>
          Para eliminar una facultad primero debes mover o eliminar sus programas. Puedes administrarlos
          desde <Link to="/programas" className="text-success">Programas</Link>.
        </p>
      ) : null}

      <Modal
        open={modalOpen}
        onClose={cerrarModal}
        title={editing ? 'Editar facultad' : 'Nueva facultad'}
        subtitle={
          editing
            ? 'Actualiza el nombre de la unidad académica.'
            : 'Registra una unidad académica para agrupar programas.'
        }
        footer={
          <>
            <button type="button" className="btn btn--secondary" onClick={cerrarModal} disabled={saving}>
              Cancelar
            </button>
            <button
              type="submit"
              form="facultad-form"
              className="btn btn--primary"
              disabled={saving}
            >
              {saving ? <span className="spinner spinner--sm" aria-hidden="true" /> : null}
              {saving ? 'Guardando…' : editing ? 'Guardar cambios' : 'Crear facultad'}
            </button>
          </>
        }
      >
        <form id="facultad-form" className="stack" onSubmit={handleSubmit} noValidate>
          <Field
            label="Nombre de la facultad"
            htmlFor="facultad-nombre"
            required
            error={formError}
            hint="Entre 3 y 150 caracteres."
          >
            <input
              id="facultad-nombre"
              className="input"
              value={form.nombre}
              onChange={(event) => setForm({ nombre: event.target.value })}
              placeholder="Ej. Facultad de Ingeniería"
              autoFocus
              maxLength={150}
              aria-invalid={Boolean(formError)}
            />
          </Field>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => (deleting ? null : setDeleteTarget(null))}
        onConfirm={confirmarEliminar}
        loading={deleting}
        title="Eliminar facultad"
        description={
          <>
            ¿Seguro que quieres eliminar <strong>{deleteTarget?.nombre}</strong>? Esta acción no se puede
            deshacer.
          </>
        }
      />
    </div>
  )
}
