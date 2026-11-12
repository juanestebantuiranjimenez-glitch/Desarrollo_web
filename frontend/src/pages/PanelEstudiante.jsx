import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BadgeCheck,
  BookOpen,
  Building2,
  CalendarDays,
  Camera,
  GraduationCap,
  Mail,
  Phone,
  ShieldCheck,
  UserRound,
} from 'lucide-react'

import { programasApi } from '../api/client.js'
import SpotlightCard from '../components/reactbits/SpotlightCard.jsx'
import SoftAurora from '../components/reactbits/SoftAurora.jsx'
import Avatar from '../components/ui/Avatar.jsx'
import AvatarPicker from '../components/ui/AvatarPicker.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import ErrorBanner from '../components/ui/ErrorBanner.jsx'
import Loader from '../components/ui/Loader.jsx'
import PageHeader from '../components/ui/PageHeader.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useApiList } from '../hooks/useApiList.js'
import {
  formatDate,
  nivelInfo,
  pluralize,
  tipoDocumentoLabel,
} from '../utils/format.js'

export default function PanelEstudiante() {
  const { usuario, estudiante } = useAuth()
  const { items: programas, loading, error, recargar } = useApiList(programasApi.listar)
  const [pickerOpen, setPickerOpen] = useState(false)

  const programa = estudiante?.programa ?? null
  const facultad = programa?.facultad ?? null
  const nivel = programa ? nivelInfo(programa.nivel) : null

  if (!estudiante) {
    return (
      <div className="student-panel">
        <PageHeader
          eyebrow="Mi espacio académico"
          title={`Hola, ${usuario?.nombre ?? 'estudiante'}`}
          description="Tu cuenta todavía no tiene un programa académico asociado."
        />
        <div className="panel">
          <EmptyState
            icon={GraduationCap}
            title="Programa no asignado"
            description="Pide a la administración que asocie tu cuenta a un programa para ver tu facultad y su oferta académica."
            action={
              <Link to="/login" className="btn btn--secondary">
                Volver al inicio
              </Link>
            }
          />
        </div>
      </div>
    )
  }

  return (
    <div className="student-panel">
      <section className="student-hero">
        <div className="student-hero__aurora" aria-hidden="true">
          <SoftAurora
            lightMode
            spectrum={0}
            color1="#f6e7ee"
            color2="#e8c98f"
            speed={0.32}
            scale={1.4}
            brightness={1.16}
            opacity={0.9}
            enableMouseInteraction
            mouseInfluence={0.14}
            clickPulse
          />
        </div>
        <div className="student-hero__overlay" aria-hidden="true" />

        <div className="student-hero__content">
          <span className="hero__eyebrow">
            <span className="hero__eyebrow-dot" aria-hidden="true" />
            Mi espacio académico · 2026 - 2
          </span>

          <h1 className="student-hero__title">
            Hola, {estudiante.nombres}
            <span className="student-hero__wave" aria-hidden="true">
              👋
            </span>
          </h1>

          <p className="student-hero__subtitle">
            Este es tu resumen académico. Aquí puedes consultar tu programa, tu facultad y los
            programas que hacen parte de ella.
          </p>

          <div className="student-hero__badges">
            <span className="badge badge--blue">
              <GraduationCap size={13} aria-hidden="true" />
              {programa?.nombre ?? 'Sin programa'}
            </span>
            {facultad ? (
              <span className="badge badge--teal">
                <Building2 size={13} aria-hidden="true" />
                {facultad.nombre}
              </span>
            ) : null}
            {nivel ? <span className="badge badge--slate">{nivel.label}</span> : null}
          </div>
        </div>

        <div className="student-hero__identity">
          <button
            type="button"
            className="student-hero__avatar-btn"
            onClick={() => setPickerOpen(true)}
            aria-label="Cambiar foto de perfil"
            title="Cambiar foto de perfil"
          >
            <Avatar
              avatar={usuario?.avatar}
              nombre={estudiante.nombres}
              apellidos={estudiante.apellidos}
              className="student-hero__avatar"
            />
            <span className="student-hero__avatar-edit" aria-hidden="true">
              <Camera />
            </span>
          </button>
          <span className="student-hero__identity-name">
            {estudiante.nombres} {estudiante.apellidos}
          </span>
          <span className="student-hero__identity-mail">{estudiante.email}</span>
          <button
            type="button"
            className="student-hero__avatar-link"
            onClick={() => setPickerOpen(true)}
          >
            Cambiar foto
          </button>
        </div>
      </section>

      {error ? <ErrorBanner error={error} onRetry={recargar} /> : null}

      <section className="student-info-grid" aria-label="Resumen de mi programa">
        <SpotlightCard
          theme="light"
          className="student-info-card"
          spotlightColor="rgba(155, 47, 92, 0.2)"
          spotlightSize={220}
          intensity={0.14}
          borderGlow={0.5}
          flare={false}
        >
          <span className="student-info-card__icon student-info-card__icon--blue" aria-hidden="true">
            <BookOpen />
          </span>
          <span className="student-info-card__label">Mi programa</span>
          <strong className="student-info-card__value">{programa?.nombre ?? 'Sin asignar'}</strong>
          <span className="student-info-card__hint">
            {programa ? `Código ${programa.codigo} · ${nivel?.label ?? programa.nivel}` : 'Pendiente'}
          </span>
        </SpotlightCard>

        <SpotlightCard
          theme="light"
          className="student-info-card"
          spotlightColor="rgba(164, 119, 31, 0.2)"
          spotlightSize={220}
          intensity={0.14}
          borderGlow={0.5}
          flare={false}
        >
          <span className="student-info-card__icon student-info-card__icon--teal" aria-hidden="true">
            <Building2 />
          </span>
          <span className="student-info-card__label">Mi facultad</span>
          <strong className="student-info-card__value">{facultad?.nombre ?? 'Sin asignar'}</strong>
          <span className="student-info-card__hint">
            {loading ? 'Cargando oferta…' : pluralize(programas.length, 'programa disponible', 'programas disponibles')}
          </span>
        </SpotlightCard>

        <SpotlightCard
          theme="light"
          className="student-info-card"
          spotlightColor="rgba(201, 148, 47, 0.2)"
          spotlightSize={220}
          intensity={0.14}
          borderGlow={0.5}
          flare={false}
        >
          <span className="student-info-card__icon student-info-card__icon--gold" aria-hidden="true">
            <ShieldCheck />
          </span>
          <span className="student-info-card__label">Mi identificación</span>
          <strong className="student-info-card__value">
            {estudiante.tipoDocumento} {estudiante.numeroDocumento}
          </strong>
          <span className="student-info-card__hint">{tipoDocumentoLabel(estudiante.tipoDocumento)}</span>
        </SpotlightCard>
      </section>

      <section className="student-grid">
        <article className="panel">
          <div className="panel__header">
            <div>
              <h2 className="panel__title">Programas de mi facultad</h2>
              <p className="panel__subtitle">
                {facultad ? `Oferta académica de ${facultad.nombre}` : 'Oferta académica'}
              </p>
            </div>
            <span className="badge badge--slate">
              {loading ? '…' : pluralize(programas.length, 'programa', 'programas')}
            </span>
          </div>

          <div className="panel__body">
            {loading ? (
              <Loader text="Cargando los programas de tu facultad…" />
            ) : programas.length === 0 ? (
              <EmptyState
                icon={BookOpen}
                title="Sin programas"
                description="Tu facultad todavía no tiene programas registrados."
              />
            ) : (
              <div className="program-grid">
                {programas.map((item) => {
                  const esMio = item._id === programa?._id
                  const infoNivel = nivelInfo(item.nivel)

                  return (
                    <SpotlightCard
                      key={item._id}
                      theme="light"
                      className={`program-tile ${esMio ? 'program-tile--mine' : ''}`}
                      spotlightColor="rgba(155, 47, 92, 0.18)"
                      spotlightSize={200}
                      intensity={0.12}
                      borderGlow={0.45}
                      flare={false}
                    >
                      <div className="program-tile__head">
                        <span className="program-tile__icon" aria-hidden="true">
                          <GraduationCap />
                        </span>
                        <span className={`badge badge--${infoNivel.variant}`}>{infoNivel.label}</span>
                      </div>
                      <strong className="program-tile__name">{item.nombre}</strong>
                      <span className="program-tile__code">Código {item.codigo}</span>
                      {esMio ? (
                        <span className="program-tile__mine">
                          <BadgeCheck size={13} aria-hidden="true" />
                          Tu programa
                        </span>
                      ) : null}
                    </SpotlightCard>
                  )
                })}
              </div>
            )}
          </div>
        </article>

        <article className="panel">
          <div className="panel__header">
            <div>
              <h2 className="panel__title">Mis datos</h2>
              <p className="panel__subtitle">Información registrada en tu cuenta</p>
            </div>
            <span className="badge badge--blue">
              <UserRound size={12} aria-hidden="true" />
              Estudiante
            </span>
          </div>

          <div className="panel__body">
            <dl className="info-list">
              <div className="info-list__row">
                <dt>
                  <UserRound aria-hidden="true" />
                  Nombre completo
                </dt>
                <dd>
                  {estudiante.nombres} {estudiante.apellidos}
                </dd>
              </div>
              <div className="info-list__row">
                <dt>
                  <Mail aria-hidden="true" />
                  Correo electrónico
                </dt>
                <dd>{estudiante.email}</dd>
              </div>
              <div className="info-list__row">
                <dt>
                  <Phone aria-hidden="true" />
                  Teléfono
                </dt>
                <dd>{estudiante.telefono || 'No registrado'}</dd>
              </div>
              <div className="info-list__row">
                <dt>
                  <ShieldCheck aria-hidden="true" />
                  Documento
                </dt>
                <dd>
                  {estudiante.tipoDocumento} · {estudiante.numeroDocumento}
                </dd>
              </div>
              <div className="info-list__row">
                <dt>
                  <CalendarDays aria-hidden="true" />
                  Registro
                </dt>
                <dd>{formatDate(estudiante.createdAt)}</dd>
              </div>
              <div className="info-list__row">
                <dt>
                  <GraduationCap aria-hidden="true" />
                  Programa
                </dt>
                <dd>{programa?.nombre ?? 'Sin asignar'}</dd>
              </div>
              <div className="info-list__row">
                <dt>
                  <Building2 aria-hidden="true" />
                  Facultad
                </dt>
                <dd>{facultad?.nombre ?? 'Sin asignar'}</dd>
              </div>
            </dl>
          </div>

          <div className="panel__footer">
            <span className="muted" style={{ fontSize: '0.76rem' }}>
              Esta información es de solo lectura. Si necesitas un cambio, contacta a la
              administración.
            </span>
          </div>
        </article>
      </section>

      <AvatarPicker open={pickerOpen} onClose={() => setPickerOpen(false)} />
    </div>
  )
}
