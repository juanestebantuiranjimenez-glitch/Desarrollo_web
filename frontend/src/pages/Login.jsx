import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AlertCircle, ArrowRight, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, Sparkles } from 'lucide-react'

import logoFull from '../assets/logo-monsters.png'
import BlurText from '../components/reactbits/BlurText.jsx'
import GradientText from '../components/reactbits/GradientText.jsx'
import SoftAurora from '../components/reactbits/SoftAurora.jsx'
import Field from '../components/ui/Field.jsx'
import ThemeToggle from '../components/ui/ThemeToggle.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import { getErrorMessage } from '../utils/format.js'

export default function Login() {
  const { iniciarSesion, sesionExpirada } = useAuth()
  const { isDark } = useTheme()
  const navigate = useNavigate()

  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [verPassword, setVerPassword] = useState(false)

  const actualizar = (campo) => (event) => {
    setForm((actual) => ({ ...actual, [campo]: event.target.value }))
    setErrors((actual) => ({ ...actual, [campo]: undefined }))
  }

  const validar = () => {
    const siguientes = {}
    const email = form.email.trim()

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      siguientes.email = 'Escribe un correo electrónico válido.'
    }

    if (form.password.length < 8) {
      siguientes.password = 'La contraseña debe tener al menos 8 caracteres.'
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
      const usuario = await iniciarSesion({
        email: form.email.trim(),
        password: form.password,
      })

      navigate(usuario?.rol === 'estudiante' ? '/mi-panel' : '/', { replace: true })
    } catch (error) {
      setFormError(getErrorMessage(error))
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="auth-page">
      <ThemeToggle floating />

      <aside className="auth-aside">
        <div className="auth-aside__aurora" aria-hidden="true">
          <SoftAurora
            spectrum={0.2}
            color1={isDark ? '#25101f' : '#f9efe6'}
            color2={isDark ? '#a4771f' : '#c9942f'}
            lightMode={!isDark}
            speed={0.4}
            scale={1.3}
            brightness={0.92}
            opacity={0.9}
            enableMouseInteraction
            mouseInfluence={0.18}
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
            Periodo académico 2026 - 2
          </span>

          <h1 className="auth-aside__title">
            <BlurText
              text="Tu futuro académico"
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
                empieza aquí
              </GradientText>
            </span>
          </h1>

          <p className="auth-aside__subtitle">
            Consulta tu programa, tu facultad y la oferta académica desde un solo lugar.
          </p>

          <ul className="auth-points">
            <li>
              <span className="auth-points__icon" aria-hidden="true">
                <ShieldCheck />
              </span>
              <span>
                <strong>Acceso seguro</strong>
                Tu información solo está disponible para ti y la administración.
              </span>
            </li>
            <li>
              <span className="auth-points__icon" aria-hidden="true">
                <Sparkles />
              </span>
              <span>
                <strong>Todo en un panel</strong>
                Tu programa, tu facultad y los programas de tu facultad.
              </span>
            </li>
          </ul>
        </div>

        <p className="auth-aside__footer">Monsters University · Admisiones</p>
      </aside>

      <main className="auth-main">
        <div className="auth-card">
          <div className="auth-card__head">
            <span className="eyebrow">Acceso institucional</span>
            <h2 className="auth-card__title">Inicia sesión</h2>
            <p className="auth-card__subtitle">
              Ingresa con tu correo y contraseña para continuar.
            </p>
          </div>

          {sesionExpirada ? (
            <div className="form-note form-note--warning" role="status">
              <LockKeyhole aria-hidden="true" />
              <span>Tu sesión expiró. Vuelve a ingresar para continuar.</span>
            </div>
          ) : null}

          {formError ? (
            <div className="form-error" role="alert">
              <AlertCircle aria-hidden="true" />
              <span>{formError}</span>
            </div>
          ) : null}

          <form className="stack auth-form" onSubmit={handleSubmit} noValidate>
            <Field label="Correo electrónico" htmlFor="login-email" required error={errors.email}>
              <input
                id="login-email"
                className="input"
                type="email"
                value={form.email}
                onChange={actualizar('email')}
                placeholder="nombre@ucp.edu.co"
                autoComplete="email"
                maxLength={120}
                autoFocus
                aria-invalid={Boolean(errors.email)}
              />
            </Field>

            <Field label="Contraseña" htmlFor="login-password" required error={errors.password}>
              <div className="password-field">
                <input
                  id="login-password"
                  className="input"
                  type={verPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={actualizar('password')}
                  placeholder="Tu contraseña"
                  autoComplete="current-password"
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

            <button type="submit" className="btn btn--primary btn--block auth-submit" disabled={enviando}>
              {enviando ? <span className="spinner spinner--sm" aria-hidden="true" /> : <Mail />}
              {enviando ? 'Ingresando…' : 'Entrar a mi cuenta'}
              {enviando ? null : <ArrowRight />}
            </button>
          </form>

          <div className="auth-card__footer">
            <p>
              ¿Aún no tienes cuenta?{' '}
              <Link to="/registro" className="auth-link">
                Regístrate como estudiante
              </Link>
            </p>
          </div>
        </div>

        <p className="auth-legal">
          Al continuar aceptas el uso de tus datos para la gestión académica de la institución.
        </p>
      </main>
    </div>
  )
}
