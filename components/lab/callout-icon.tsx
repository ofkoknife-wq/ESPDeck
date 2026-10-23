import type { CalloutIcon } from './three/parts'
import { cn } from '@/lib/utils'

/** Line icons matched to learn-arduino callout glyphs (drop / screen / can / wave / plant). */
const PATHS: Record<CalloutIcon, { viewBox: string; paths: string[] }> = {
  drop: {
    viewBox: '0 0 40 40',
    paths: [
      'M20 4.5c5.5 7.4 10.5 13.3 10.5 19.2a10.5 10.5 0 0 1-21 0C9.5 17.8 14.5 11.9 20 4.5z',
      'M14.5 24.5a5.6 5.6 0 0 0 4.2 5.3',
    ],
  },
  screen: {
    viewBox: '0 0 44 40',
    paths: [
      'M4 5.5h36v25a2.5 2.5 0 0 1-2.5 2.5H6.5A2.5 2.5 0 0 1 4 30.5z',
      'M8.5 10h27v13a1 1 0 0 1-1 1h-25a1 1 0 0 1-1-1z',
      'M15.5 30.5v4.5M28.5 30.5v4.5M12 35h20',
    ],
  },
  can: {
    viewBox: '0 0 44 40',
    paths: [
      'M14 15.5h16v17a2.5 2.5 0 0 1-2.5 2.5h-11a2.5 2.5 0 0 1-2.5-2.5z',
      'M17.5 15.5a6 6 0 0 1 9-5.2',
      'M14 22 4.5 13.5',
      'm2.5 11.5 4-1.5 1.5 4z',
      'M30 19.5c4.5 0 7 2.2 7 5.5s-2.5 5.5-7 5.5',
    ],
  },
  wave: {
    viewBox: '0 0 44 40',
    paths: ['M2.5 23h6l4.5-11 6.5 19 6-25 5.5 21 3.5-7.5 2.5 3.5h5'],
  },
  plant: {
    viewBox: '0 0 40 40',
    paths: ['M11.5 25.5h17l-2.2 10.5H13.7z', 'M20 25.5V13', 'M14 16c2.5-5 6-8 6-8s3.5 3 6 8'],
  },
}

export function CalloutIconMark({ icon, className }: { icon: CalloutIcon; className?: string }) {
  const def = PATHS[icon]
  return (
    <svg
      viewBox={def.viewBox}
      className={cn('size-4 shrink-0 stroke-current', className)}
      fill="none"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {def.paths.map((d, i) => (
        <path key={i} d={d} fill={i === 3 && icon === 'can' ? 'currentColor' : undefined} />
      ))}
    </svg>
  )
}
