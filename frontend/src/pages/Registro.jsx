import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Building2,
  Eye,
  EyeOff,
  GraduationCap,
  UserPlus,
} from 'lucide-react'

import { authApi } from '../api/client.js'
import logoFull from '../assets/logo-monsters.png'
import BlurText from '../components/reactbits/BlurText.jsx'
import GradientText from '../components/reactbits/GradientText.jsx'
import SoftAurora from '../components/reactbits/SoftAurora.jsx'
import Field from '../components/ui/Field.jsx'
import Loader from '../components/ui/Loader.jsx'
import ThemeToggle from '../components/ui/ThemeToggle.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import { getErrorMessage, NIVELES, TIPOS_DOCUMENTO, tipoDocumentoLabel } from '../utils/format.js'

const FORM_INICIAL = {
  tipoDocumento: 'CC',
  numeroDocumento: '',
  nombres: '',
  apellidos: '',
  email: '',
  telefono: '',
  password: '',
  confirmarPassword: '',
  facultadId: '',
  programa: '',
}

export default function Registro() {
  const { registrarEstudiante } = useAuth()
  const { isDark } = useTheme()
  const navigate = useNavigate()

  const [programas, setProgramas] = useState([])
  const [cargandoProgramas, setCargandoProgramas] = useState(true)
  const [errorProgramas, setErrorProgramas] = useState(null)
  const [form, setForm] = useState(FORM_INICIAL)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [verPassword, setVerPassword] = useState(false)

  const cargarProgramas = async () => {
    setCargandoProgramas(true)
    setErrorProgramas(null)

    try {
      const respuesta = await authApi.programasParaRegistro()
      setProgramas(respuesta?.data ?? [])
    } catch (error) {
      setErrorProgramas(error)
    } finally {
      setCargandoProgramas(false)
    }
  }

  useEffect(() => {
    cargarProgramas()
  }, [])

  const facultades = useMemo(() => {
    const mapa = new Map()

    programas.forEach((programa) => {
      if (programa.facultad && !mapa.has(programa.facultad.id)) {
        mapa.set(programa.facultad.id, programa.facultad)
      }
    })

    return [...mapa.values()].sort((a, b) => a.nombre.localeCompare(b.nombre))
  }, [programas])

  const programasDeFacultad = useMemo(() => {
    if (!form.facultadId) return []
    return programas
      .filter((programa) => programa.facultad?.id === form.facultadId)
      .sort((a, b) => a.nombre.localeCompare(b.nombre))
  }, [programas, form.facultadId])

  const actualizar = (campo) => (event) => {
    const valor = event.target.value

    setForm((actual) => {
      if (campo === 'facultadId') {
        return { ...actual, facultadId: valor, programa: '' }
      }

      return { ...actual, [campo]: valor }
    })
    setErrors((actual) => ({ ...actual, [campo]: undefined }))
  }

  const validar = () => {
    const siguientes = {}
    const numeroDocumento = form.numeroDocumento.trim()
    const nombres = form.nombres.trim()
    const apellidos = form.apellidos.trim()
    const email = form.email.trim()
    const telefono = form.telefono.trim()

    if (!TIPOS_DOCUMENTO.includes(form.tipoDocumento)) {
      siguientes.tipoDocumento = 'Selecciona un tipo de documento válido.'
    }

    if (!/^[0-9A-Za-z]{5,20}$/.test(numeroDocumento)) {
      siguientes.numeroDocumento = 'Debe tener entre 5 y 20 caracteres, solo letras y números.'
    }

    if (nombres.length < 2 || nombres.length > 80) {
      siguientes.nombres = 'Debe tener entre 2 y 80 caracteres.'
    }

    if (apellidos.length < 2 || apellidos.length > 80) {
      siguientes.apellidos = 'Debe tener entre 2 y 80 caracteres.'
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      siguientes.email = 'Escribe un correo electrónico válido.'
    }

    if (telefono && !/^[0-9+ ]{7,20}$/.test(telefono)) {
      siguientes.telefono = 'Debe tener entre 7 y 20 dígitos. Puedes usar + y espacios.'
    }

    if (form.password.length < 8 || form.password.length > 72) {
      siguientes.password = 'La contraseña debe tener entre 8 y 72 caracteres.'
    }

    if (form.password !== form.confirmarPassword) {
      siguientes.confirmarPassword = 'Las contraseñas no coinciden.'
    }

    if (!form.facultadId) {
      siguientes.facultadId = 'Selecciona la facultad de tu programa.'
    }

    if (!form.programa) {
      siguientes.programa = 'Selecciona el programa al que perteneces.'
    }

    setErrors(siguientes)
    return Object.keys(siguientes).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!validar()) return

    setEnviando(true)
    setFormError('')

    try {
      await registrarEstudiante({
        tipoDocumento: form.tipoDocumento,
        numeroDocumento: form.numeroDocumento.trim(),
        nombres: form.nombres.trim(),
        apellidos: form.apellidos.trim(),
        email: form.email.trim(),
        telefono: form.telefono.trim(),
        password: form.password,
        programa: form.programa,
      })

      navigate('/mi-panel', { replace: true })
    } catch (error) {
      setFormError(getErrorMessage(error))
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="auth-page auth-page--registro">
      <ThemeToggle floating />

      <aside className="auth-aside">
        <div className="auth-aside__aurora" aria-hidden="true">
          <SoftAurora
            spectrum={0.2}
            color1={isDark ? '#25101f' : '#f9efe6'}
            color2={isDark ? '#9b2f5c' : '#b54872'}
            lightMode={!isDark}
            speed={0.38}
            scale={1.3}
            brightness={0.92}
            opacity={0.9}
            enableMouseInteraction
            mouseInfluence={0.16}
            clickPulse
          />
        </div>
        <div className="auth-aside__overlay" aria-hidden="true" />

        <div className="auth-aside__brand">
          <img className="auth-brand-logo" src={logoFull} alt="Monsters University" />
        </div>

        <div className="auth-aside__content">
          <span className="hero__eyebrow">
            <span className="hero__eyebrow-dot" aria-hidden="true" />
            Nuevo ingreso · 2026 - 2
          </span>

          <h1 className="auth-aside__title">
            <BlurText
              text="Inscríbete a tu"
              animateBy="words"
              delay={80}
              stepDuration={0.45}
              direction="top"
              effect="blur"
              blur={9}
              distance={34}
            />
            <span className="auth-aside__title-accent">
              <GradientText
                colors={
                  isDark
                    ? ['#f2d59a', '#e6a8c4', '#d9ad55', '#f2d59a']
                    : ['#8a5f14', '#9b2f5c', '#c9942f', '#8a5f14']
                }
                animationSpeed={7}
                variant="flow"
                glow={0.14}
              >
                programa académico
              </GradientText>
            </span>
          </h1>

          <p className="auth-aside__subtitle">
            Crea tu cuenta y elige el programa al que perteneces. Tu panel mostrará únicamente tu
            facultad y sus programas.
          </p>

          <ul className="auth-points">
            <li>
              <span className="auth-points__icon" aria-hidden="true">
                <Building2 />
              </span>
              <span>
                <strong>Una facultad, tu comunidad</strong>
                Verás la facultad de tu programa y la oferta que la compone.
              </span>
            </li>
            <li>
              <span className="auth-points__icon" aria-hidden="true">
                <GraduationCap />
              </span>
              <span>
                <strong>Tu programa desde el inicio</strong>
                Queda registrado en tu perfil apenas creas la cuenta.
              </span>
            </li>
          </ul>
        </div>

        <p className="auth-aside__footer">Monsters University · Admisiones</p>
      </aside>

      <main className="auth-main auth-main--wide">
        <div className="auth-card auth-card--wide">
          <div className="auth-card__head">
            <Link to="/login" className="auth-back">
              <ArrowLeft />
              Volver al inicio de sesión
            </Link>
            <span className="eyebrow">Registro de estudiantes</span>
            <h2 className="auth-card__title">Crea tu cuenta</h2>
            <p className="auth-card__subtitle">
              Completa tus datos y selecciona el programa al que perteneces.
            </p>
          </div>

          {formError ? (
            <div className="form-error" role="alert">
              <AlertCircle aria-hidden="true" />
              <span>{formError}</span>
            </div>
          ) : null}

          {errorProgramas ? (
            <div className="form-error" role="alert">
              <AlertCircle aria-hidden="true" />
              <span>
                No se pudieron cargar los programas. {getErrorMessage(errorProgramas)}
              </span>
              <button type="button" className="btn btn--sm btn--secondary" onClick={cargarProgramas}>
                Reintentar
              </button>
            </div>
          ) : null}

          <form className="stack auth-form" onSubmit={handleSubmit} noValidate>
            <section className="auth-section" aria-labelledby="registro-datos">
              <div className="auth-section__head">
                <span className="auth-section__step" aria-hidden="true">
                  1
                </span>
                <div>
                  <h3 id="registro-datos">Datos personales</h3>
                  <p>Así te identificaremos en el panel académico.</p>
                </div>
              </div>

              <div className="form-grid">
                <Field
                  label="Tipo de documento"
                  htmlFor="registro-tipo"
                  required
                  error={errors.tipoDocumento}
                >
                  <select
                    id="registro-tipo"
                    className="select"
                    value={form.tipoDocumento}
                    onChange={actualizar('tipoDocumento')}
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
                  htmlFor="registro-numero"
                  required
                  error={errors.numeroDocumento}
                  hint="Entre 5 y 20 letras o números."
                >
                  <input
                    id="registro-numero"
                    className="input"
                    value={form.numeroDocumento}
                    onChange={actualizar('numeroDocumento')}
                    placeholder="1088123456"
                    maxLength={20}
                    autoFocus
                    aria-invalid={Boolean(errors.numeroDocumento)}
                  />
                </Field>

                <Field label="Nombres" htmlFor="registro-nombres" required error={errors.nombres}>
                  <input
                    id="registro-nombres"
                    className="input"
                    value={form.nombres}
                    onChange={actualizar('nombres')}
                    placeholder="Juan José"
                    maxLength={80}
                    aria-invalid={Boolean(errors.nombres)}
                  />
                </Field>

                <Field label="Apellidos" htmlFor="registro-apellidos" required error={errors.apellidos}>
                  <input
                    id="registro-apellidos"
                    className="input"
                    value={form.apellidos}
                    onChange={actualizar('apellidos')}
                    placeholder="Velásquez Parra"
                    maxLength={80}
                    aria-invalid={Boolean(errors.apellidos)}
                  />
                </Field>

                <Field
                  label="Correo electrónico"
                  htmlFor="registro-email"
                  required
                  error={errors.email}
                  hint="Lo usarás para iniciar sesión."
                >
                  <input
                    id="registro-email"
                    className="input"
                    type="email"
                    value={form.email}
                    onChange={actualizar('email')}
                    placeholder="nombre@ucp.edu.co"
                    maxLength={120}
                    autoComplete="email"
                    aria-invalid={Boolean(errors.email)}
                  />
                </Field>

                <Field
                  label="Teléfono"
                  htmlFor="registro-telefono"
                  error={errors.telefono}
                  hint="Opcional. Entre 7 y 20 dígitos."
                >
                  <input
                    id="registro-telefono"
                    className="input"
                    type="tel"
                    value={form.telefono}
                    onChange={actualizar('telefono')}
                    placeholder="3001234567"
                    maxLength={20}
                    aria-invalid={Boolean(errors.telefono)}
                  />
                </Field>

                <Field
                  label="Contraseña"
                  htmlFor="registro-password"
                  required
                  error={errors.password}
                  hint="Mínimo 8 caracteres."
                >
                  <div className="password-field">
                    <input
                      id="registro-password"
                      className="input"
                      type={verPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={actualizar('password')}
                      placeholder="Crea una contraseña"
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
                  htmlFor="registro-password-2"
                  required
                  error={errors.confirmarPassword}
                >
                  <input
                    id="registro-password-2"
                    className="input"
                    type={verPassword ? 'text' : 'password'}
                    value={form.confirmarPassword}
                    onChange={actualizar('confirmarPassword')}
                    placeholder="Repite tu contraseña"
                    autoComplete="new-password"
                    maxLength={72}
                    aria-invalid={Boolean(errors.confirmarPassword)}
                  />
                </Field>
              </div>
            </section>

            <section className="auth-section" aria-labelledby="registro-programa">
              <div className="auth-section__head">
                <span className="auth-section__step" aria-hidden="true">
                  2
                </span>
                <div>
                  <h3 id="registro-programa">Tu programa académico</h3>
                  <p>Elige la facultad y luego el programa al que perteneces.</p>
                </div>
              </div>

              {cargandoProgramas ? (
                <Loader text="Cargando facultades y programas…" />
              ) : programas.length === 0 ? (
                <div className="form-note" role="status">
                  <AlertCircle aria-hidden="true" />
                  <span>
                    Todavía no hay programas disponibles. La administración debe crear una facultad y
                    un programa antes de abrir el registro.
                  </span>
                </div>
              ) : (
                <div className="form-grid">
                  <Field
                    label="Facultad"
                    htmlFor="registro-facultad"
                    required
                    error={errors.facultadId}
                    hint={
                      facultades.length === 1
                        ? 'Solo hay una facultad registrada.'
                        : 'Filtra los programas disponibles.'
                    }
                  >
                    <select
                      id="registro-facultad"
                      className="select"
                      value={form.facultadId}
                      onChange={actualizar('facultadId')}
                      aria-invalid={Boolean(errors.facultadId)}
                    >
                      <option value="">Selecciona una facultad</option>
                      {facultades.map((facultad) => (
                        <option key={facultad.id} value={facultad.id}>
                          {facultad.nombre}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field
                    label="Programa"
                    htmlFor="registro-programa-select"
                    required
                    error={errors.programa}
                    hint={
                      form.facultadId
                        ? `${programasDeFacultad.length} programa(s) en esta facultad.`
                        : 'Primero selecciona una facultad.'
                    }
                  >
                    <select
                      id="registro-programa-select"
                      className="select"
                      value={form.programa}
                      onChange={actualizar('programa')}
                      disabled={!form.facultadId}
                      aria-invalid={Boolean(errors.programa)}
                    >
                      <option value="">
                        {form.facultadId ? 'Selecciona tu programa' : 'Selecciona una facultad'}
                      </option>
                      {programasDeFacultad.map((programa) => {
                        const nivel = NIVELES.find((item) => item.value === programa.nivel)
                        return (
                          <option key={programa.id} value={programa.id}>
                            {programa.nombre} · {programa.codigo}
                            {nivel ? ` (${nivel.label})` : ''}
                          </option>
                        )
                      })}
                    </select>
                  </Field>
                </div>
              )}
            </section>

            <div className="form-note">
              <AlertCircle aria-hidden="true" />
              <span>
                Al registrarte quedas inscrito a un único programa. Podrás consultar tu facultad y sus
                programas desde tu panel.
              </span>
            </div>

            <button
              type="submit"
              className="btn btn--primary btn--block auth-submit"
              disabled={enviando || cargandoProgramas || programas.length === 0}
            >
              {enviando ? <span className="spinner spinner--sm" aria-hidden="true" /> : <UserPlus />}
              {enviando ? 'Creando tu cuenta…' : 'Crear cuenta e inscribirme'}
              {enviando ? null : <ArrowRight />}
            </button>
          </form>

          <div className="auth-card__footer">
            <p>
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" className="auth-link">
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
