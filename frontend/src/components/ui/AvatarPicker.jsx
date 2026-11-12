import { useState } from 'react'
import { AlertCircle, Check, ImageOff } from 'lucide-react'

import { AVATARES } from '../../assets/avatars/index.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { getErrorMessage } from '../../utils/format.js'
import Avatar from './Avatar.jsx'
import Modal from './Modal.jsx'

function AvatarPickerDialog({ onClose }) {
  const { usuario, actualizarAvatar } = useAuth()
  const toast = useToast()

  const [seleccion, setSeleccion] = useState(usuario?.avatar ?? null)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  const cerrar = () => {
    if (guardando) return
    onClose()
  }

  const guardar = async () => {
    setGuardando(true)
    setError('')

    try {
      await actualizarAvatar(seleccion)
      toast.success(
        seleccion === null
          ? 'Quitaste tu foto de perfil. Volverás a usar tus iniciales.'
          : 'Tu foto de perfil se actualizó correctamente.',
      )
      onClose()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setGuardando(false)
    }
  }

  return (
    <Modal
      open
      onClose={cerrar}
      title="Elige tu foto de perfil"
      subtitle="Escoge uno de los personajes de Monsters University. Se verá en tu cuenta y en tu panel."
      size="lg"
      footer={
        <>
          <button type="button" className="btn btn--secondary" onClick={cerrar} disabled={guardando}>
            Cancelar
          </button>
          <button type="button" className="btn btn--primary" onClick={guardar} disabled={guardando}>
            {guardando ? <span className="spinner spinner--sm" aria-hidden="true" /> : null}
            {guardando ? 'Guardando…' : 'Guardar foto'}
          </button>
        </>
      }
    >
      <div className="avatar-picker" role="group" aria-label="Opciones de foto de perfil">
        <button
          type="button"
          className={`avatar-option ${seleccion === null ? 'is-selected' : ''}`}
          onClick={() => setSeleccion(null)}
          aria-pressed={seleccion === null}
        >
          <span className="avatar-option__media avatar-option__media--none" aria-hidden="true">
            <ImageOff />
          </span>
          <span className="avatar-option__name">Sin foto</span>
          <span className="avatar-option__hint">Usar iniciales</span>
          {seleccion === null ? (
            <span className="avatar-option__check" aria-hidden="true">
              <Check />
            </span>
          ) : null}
        </button>

        {AVATARES.map((avatar) => {
          const activo = seleccion === avatar.id

          return (
            <button
              key={avatar.id}
              type="button"
              className={`avatar-option ${activo ? 'is-selected' : ''}`}
              onClick={() => setSeleccion(avatar.id)}
              aria-pressed={activo}
            >
              <Avatar avatar={avatar.id} className="avatar-option__media" />
              <span className="avatar-option__name">{avatar.nombre}</span>
              <span className="avatar-option__hint">{avatar.descripcion}</span>
              {activo ? (
                <span className="avatar-option__check" aria-hidden="true">
                  <Check />
                </span>
              ) : null}
            </button>
          )
        })}
      </div>

      {error ? (
        <div className="form-error avatar-picker__error" role="alert">
          <AlertCircle aria-hidden="true" />
          <span>{error}</span>
        </div>
      ) : null}
    </Modal>
  )
}

export default function AvatarPicker({ open, onClose }) {
  if (!open) return null

  return <AvatarPickerDialog onClose={onClose} />
}
