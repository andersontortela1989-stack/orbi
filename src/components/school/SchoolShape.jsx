export const SCHOOL_COLORS = { blue:'#58B6E8', sun:'#FFC53D', coral:'#F0623E', grass:'#5BBE6E' };
export function SchoolShape({ shape='square', color='blue' }) {
  return <svg viewBox="0 0 60 60" aria-hidden="true" className="school-shape">
    <g fill={SCHOOL_COLORS[color]} stroke="#1C2746" strokeWidth="2">
      {shape==='circle' ? <circle cx="30" cy="30" r="23"/> : shape==='triangle' ? <path d="M30 6 55 53H5Z"/> : <rect x="7" y="7" width="46" height="46" rx="3"/>}
    </g>
  </svg>;
}
