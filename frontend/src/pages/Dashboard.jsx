import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BookOpen,
  Building2,
  GraduationCap,
  ListChecks,
  Plus,
  Sparkles,
  UserPlus,
  Users,
} from 'lucide-react'

import { estudiantesApi, facultadesApi, programasApi } from '../api/client.js'
import LevelChart from '../components/dashboard/LevelChart.jsx'
import StatCard from '../components/dashboard/StatCard.jsx'
import BlurText from '../components/reactbits/BlurText.jsx'
import GradientText from '../components/reactbits/GradientText.jsx'
import SoftAurora from '../components/reactbits/SoftAurora.jsx'
import Avatar from '../components/ui/Avatar.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import ErrorBanner from '../components/ui/ErrorBanner.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import { formatDate, pluralize } from '../utils/format.js'

const INITIAL_STATE = {
  loading: true,
  error: null,
  facultades: [],
  programas: [],
  estudiantes: [],
}

export default function Dashboard() {
  const { isDark } = useTheme()
  const [data, setData] = useState(INITIAL_STATE)

  const cargar = useCallback(async () => {
    setData((current) => ({ ...current, loading: true, error: null }))

    try {
      const [facultades, programas, estudiantes] = await Promise.all([
        facultadesApi.listar(),
        programasApi.listar(),
        estudiantesApi.listar(),
      ])

      setData({
        loading: false,
        error: null,
        facultades: facultades?.data ?? [],
        programas: programas?.data ?? [],
        estudiantes: estudiantes?.data ?? [],
      })
    } catch (error) {
      setData((current) => ({ ...current, loading: false, error }))
    }
  }, [])

  useEffect(() => {
    cargar()
  }, [cargar])

  const metrics = useMemo(() => {
    const { facultades, programas, estudiantes } = data
    const pregrado = programas.filter((programa) => programa.nivel === 'pregrado').length
    const posgrado = programas.filter((programa) => programa.nivel === 'posgrado').length

    return { facultades, programas, estudiantes, pregrado, posgrado }
  }, [data])

  const facultadesResumen = useMemo(() => {
    return metrics.facultades
      .map((facultad) => ({
        ...facultad,
        programas: metrics.programas.filter(
          (programa) => programa.facultad?._id === facultad._id || programa.facultad === facultad._id,
        ).length,
      }))
      .sort((a, b) => b.programas - a.programas || a.nombre.localeCompare(b.nombre))
  }, [metrics])

  const estudiantesRecientes = useMemo(() => {
    return [...metrics.estudiantes]
      .sort((a, b) => new Date(b.createdAt ?? 0) - new Date(a.createdAt ?? 0))
      .slice(0, 5)
  }, [metrics.estudiantes])

  const maxProgramas = Math.max(1, ...facultadesResumen.map((facultad) => facultad.programas))
  const porcentajePregrado =
    metrics.programas.length > 0 ? Math.round((metrics.pregrado / metrics.programas.length) * 100) : 0
  const facultadLider = facultadesResumen[0]

  return (
    <div className="dashboard">
      <section className="hero">
        <div className="hero__aurora" aria-hidden="true">
          <SoftAurora
            spectrum={0.2}
            color1={isDark ? '#2a0f26' : '#fdf8f0'}
            color2={isDark ? '#9b2f5c' : '#b54872'}
            lightMode={!isDark}
            speed={0.35}
            scale={1.35}
            brightness={0.95}
            opacity={0.9}
            enableMouseInteraction
            mouseInfluence={0.15}
            clickPulse
          />
        </div>
        <div className="hero__overlay" aria-hidden="true" />

        <div className="hero__content">
          <span className="hero__eyebrow">
            <span className="hero__eyebrow-dot" aria-hidden="true" />
            Periodo académico 2026 - 2
          </span>

          <h1 className="sr-only">
            Monsters University: gestión de facultades, programas y estudiantes
          </h1>

          <div className="hero__title" aria-hidden="true">
            <BlurText
              text="Toda la gestión académica"
              animateBy="words"
              delay={70}
              stepDuration={0.45}
              direction="top"
              effect="blur"
              blur={9}
              distance={38}
            />
            <span className="hero__title-accent">
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
                en un solo lugar
              </GradientText>
            </span>
          </div>

          <p className="hero__subtitle">
            Administra facultades, programas y estudiantes desde un panel claro y rápido.
          </p>

          <div className="hero__actions">
            <Link to="/estudiantes?nuevo=1" className="btn btn--primary">
              <UserPlus />
              Registrar estudiante
            </Link>
            <Link to="/programas" className="btn btn--secondary">
              <BookOpen />
              Explorar programas
            </Link>
          </div>
        </div>
      </section>

      {data.error ? <ErrorBanner error={data.error} onRetry={cargar} /> : null}

      <section className="stats-grid stagger" aria-label="Indicadores generales">
        <StatCard
          icon={Building2}
          tone="blue"
          label="Facultades"
          value={data.loading ? '—' : metrics.facultades.length}
          hint="Unidades académicas registradas"
          trend="Activo"
        />
        <StatCard
          icon={GraduationCap}
          tone="teal"
          label="Programas"
          value={data.loading ? '—' : metrics.programas.length}
          hint={data.loading ? 'Cargando oferta académica' : `${metrics.pregrado} de pregrado`}
          trend="Oferta"
        />
        <StatCard
          icon={Users}
          tone="gold"
          label="Estudiantes"
          value={data.loading ? '—' : metrics.estudiantes.length}
          hint="Personas registradas"
          trend="Total"
        />
        <StatCard
          icon={Sparkles}
          tone="navy"
          label="Posgrados"
          value={data.loading ? '—' : metrics.posgrado}
          hint="Programas de posgrado activos"
          trend="Académico"
        />
      </section>

      <section className="dashboard-grid stagger">
        <article className="panel">
          <div className="panel__header">
            <div>
              <h2 className="panel__title">Programas por nivel</h2>
              <p className="panel__subtitle">Distribución de la oferta académica registrada</p>
            </div>
            <span className="badge badge--slate">{pluralize(metrics.programas.length, 'programa', 'programas')}</span>
          </div>
          <div className="panel__body">
            {data.loading ? (
              <div className="stack">
                <div className="skeleton skeleton--line" />
                <div className="skeleton skeleton--line" />
                <div className="skeleton skeleton--line" />
              </div>
            ) : (
              <LevelChart programas={metrics.programas} />
            )}

            {!data.loading && metrics.programas.length > 0 ? (
              <div className="level-insights">
                <div className="level-insight">
                  <span className="level-insight__icon" aria-hidden="true">
                    <Sparkles />
                  </span>
                  <div>
                    <strong>{porcentajePregrado}% de la oferta es pregrado</strong>
                    <span>
                      {metrics.pregrado} de {metrics.programas.length} programas
                    </span>
                  </div>
                </div>

                {facultadLider ? (
                  <div className="level-insight">
                    <span className="level-insight__icon" aria-hidden="true">
                      <Building2 />
                    </span>
                    <div>
                      <strong>{facultadLider.nombre}</strong>
                      <span>Lidera con {pluralize(facultadLider.programas, 'programa', 'programas')}</span>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
          <div className="panel__footer">
            <Link to="/programas" className="btn btn--sm btn--ghost">
              Ver todos los programas
              <ArrowRight />
            </Link>
          </div>
        </article>

        <article className="panel">
          <div className="panel__header">
            <div>
              <h2 className="panel__title">Facultades</h2>
              <p className="panel__subtitle">Programas asociados a cada facultad</p>
            </div>
            <Link to="/facultades" className="icon-btn" aria-label="Ver facultades">
              <ArrowRight />
            </Link>
          </div>
          <div className="panel__body">
            {data.loading ? (
              <div className="stack">
                <div className="skeleton skeleton--line" />
                <div className="skeleton skeleton--line" />
                <div className="skeleton skeleton--line" />
              </div>
            ) : facultadesResumen.length === 0 ? (
              <EmptyState
                icon={Building2}
                title="Sin facultades"
                description="Crea la primera facultad para empezar a organizar los programas."
                action={
                  <Link to="/facultades?nuevo=1" className="btn btn--sm btn--primary">
                    <Plus />
                    Nueva facultad
                  </Link>
                }
              />
            ) : (
              <ul className="faculty-list stagger">
                {facultadesResumen.slice(0, 5).map((facultad) => (
                  <li className="faculty-item" key={facultad._id}>
                    <span className="faculty-item__mark" aria-hidden="true">
                      {facultad.nombre.trim().charAt(0).toUpperCase()}
                    </span>
                    <div className="faculty-item__body">
                      <div className="faculty-item__name" title={facultad.nombre}>
                        {facultad.nombre}
                      </div>
                      <div className="faculty-item__count">
                        {pluralize(facultad.programas, 'programa', 'programas')}
                      </div>
                    </div>
                    <div
                      className="faculty-item__bar"
                      title={`${facultad.programas} programas`}
                      aria-hidden="true"
                    >
                      <span style={{ width: `${Math.max(8, (facultad.programas / maxProgramas) * 100)}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </article>
      </section>

      <section className="dashboard-grid stagger">
        <article className="panel">
          <div className="panel__header">
            <div>
              <h2 className="panel__title">Últimos estudiantes</h2>
              <p className="panel__subtitle">Registros más recientes</p>
            </div>
            <Link to="/estudiantes" className="btn btn--sm btn--ghost">
              Ver todos
              <ArrowRight />
            </Link>
          </div>
          <div className="panel__body">
            {data.loading ? (
              <div className="stack">
                <div className="skeleton skeleton--line" />
                <div className="skeleton skeleton--line" />
                <div className="skeleton skeleton--line" />
              </div>
            ) : estudiantesRecientes.length === 0 ? (
              <EmptyState
                icon={Users}
                title="Aún no hay estudiantes"
                description="Registra el primer estudiante para verlo aquí."
                action={
                  <Link to="/estudiantes?nuevo=1" className="btn btn--sm btn--primary">
                    <UserPlus />
                    Registrar estudiante
                  </Link>
                }
              />
            ) : (
              <div className="table-wrap" style={{ boxShadow: 'none', border: 0 }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Estudiante</th>
                      <th>Documento</th>
                      <th>Registro</th>
                    </tr>
                  </thead>
                  <tbody className="stagger-rows">
                    {estudiantesRecientes.map((estudiante) => (
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
                              <div className="cell-sub">{estudiante.email}</div>
                            </div>
                          </div>
                        </td>
                        <td data-label="Documento">
                          <span className="student-doc">
                            <span>{estudiante.tipoDocumento}</span>
                            {estudiante.numeroDocumento}
                          </span>
                        </td>
                        <td data-label="Registro" className="muted cell-date">
                          {formatDate(estudiante.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </article>

        <article className="panel">
          <div className="panel__header">
            <div>
              <h2 className="panel__title">Acciones rápidas</h2>
              <p className="panel__subtitle">Atajos a las tareas más frecuentes</p>
            </div>
            <span className="badge badge--blue">
              <ListChecks size={12} />
              Panel
            </span>
          </div>
          <div className="panel__body">
            <div className="quick-grid stagger">
              <Link to="/estudiantes?nuevo=1" className="quick-action">
                <span className="quick-action__icon" aria-hidden="true">
                  <UserPlus />
                </span>
                <span className="quick-action__text">
                  <strong>Nuevo estudiante</strong>
                  <span>Registrar una persona</span>
                </span>
              </Link>
              <Link to="/facultades?nuevo=1" className="quick-action">
                <span className="quick-action__icon" aria-hidden="true">
                  <Building2 />
                </span>
                <span className="quick-action__text">
                  <strong>Nueva facultad</strong>
                  <span>Crear unidad académica</span>
                </span>
              </Link>
              <Link to="/programas?nuevo=1" className="quick-action">
                <span className="quick-action__icon" aria-hidden="true">
                  <GraduationCap />
                </span>
                <span className="quick-action__text">
                  <strong>Nuevo programa</strong>
                  <span>Agregar oferta académica</span>
                </span>
              </Link>
              <Link to="/facultades" className="quick-action">
                <span className="quick-action__icon" aria-hidden="true">
                  <ListChecks />
                </span>
                <span className="quick-action__text">
                  <strong>Administrar</strong>
                  <span>Ver todos los registros</span>
                </span>
              </Link>
            </div>
          </div>
          <div className="panel__footer">
            <span className="muted" style={{ fontSize: '0.74rem' }}>
              Los programas de posgrado son {metrics.posgrado} de {metrics.programas.length} en total.
            </span>
          </div>
        </article>
      </section>
    </div>
  )
}
