import art from './art.png'
import mike from './mike.png'
import squishy from './squishy.png'
import sulley from './sulley.png'

export const AVATARES = [
  {
    id: 'mike',
    nombre: 'Mike Wazowski',
    descripcion: 'Con gorra de Monsters University',
    src: mike,
  },
  {
    id: 'sulley',
    nombre: 'Sulley',
    descripcion: 'El asustador más querido',
    src: sulley,
  },
  {
    id: 'art',
    nombre: 'Art',
    descripcion: 'El experto en sustos',
    src: art,
  },
  {
    id: 'squishy',
    nombre: 'Squishy',
    descripcion: 'El futuro asustador',
    src: squishy,
  },
]

export const AVATARES_POR_ID = Object.fromEntries(AVATARES.map((avatar) => [avatar.id, avatar]))

export function obtenerAvatar(id) {
  return AVATARES_POR_ID[id] ?? null
}
