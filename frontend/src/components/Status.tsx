export function Loading(){return <div className="card animate-pulse text-muted">Loading secure range data…</div>}
export function ErrorBox({error}:{error:unknown}){return <div className="error" role="alert">{error instanceof Error?error.message:'An unexpected error occurred'}</div>}
export function Empty({children}:{children:React.ReactNode}){return <div className="card text-center text-muted">{children}</div>}
export function Difficulty({value}:{value:string}){const color=value==='Hard'?'text-red-300 border-red-500/30':value==='Medium'?'text-amber-300 border-amber-500/30':'text-acid border-acid/30';return <span className={`pill ${color}`}>{value}</span>}
