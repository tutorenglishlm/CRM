import { createClient } from '@/lib/supabase-server'

export default async function RegistrationsPage() {
  const supabase = createClient()
  const { data: registrations } = await supabase
    .from('registrations')
    .select(`
      id, status, payment_status, payment_method, created_at,
      students(name, age, level),
      parents(name, phone)
    `)
    .order('created_at', { ascending: false })

  const levelLabel: Record<string, string> = { basic: 'Básico', intermediate: 'Intermedio', advanced: 'Avanzado' }

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--navy)', margin: 0 }}>Inscripciones</h1>
        <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 4 }}>{registrations?.length ?? 0} en total</p>
      </div>

      <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        {(!registrations || registrations.length === 0) ? (
          <div style={{ padding: '2rem', color: 'var(--muted)', textAlign: 'center' }}>No hay inscripciones aún.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead style={{ background: '#F4F5F8' }}>
              <tr>
                {['Alumno', 'Nivel', 'Tutor', 'Contacto', 'Pago', 'Método', 'Fecha'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '12px 16px', color: 'var(--muted)', fontWeight: 500, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {registrations.map((r: any) => {
                const ps = r.payment_status
                return (
                  <tr key={r.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--navy)' }}>{r.students?.name ?? '—'}</td>
                    <td style={{ padding: '12px 16px' }}>{levelLabel[r.students?.level] ?? r.students?.level ?? '—'}</td>
                    <td style={{ padding: '12px 16px' }}>{r.parents?.name ?? '—'}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--muted)' }}>{r.parents?.phone ?? '—'}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        fontSize: 12, padding: '3px 10px', borderRadius: 20, fontWeight: 500,
                        background: ps === 'paid' ? '#E6F4EC' : ps === 'partial' ? 'var(--gold-light)' : '#FDE8E8',
                        color: ps === 'paid' ? '#1A7A3C' : ps === 'partial' ? 'var(--gold-dark)' : '#A32D2D',
                      }}>
                        {ps === 'paid' ? 'Pagado' : ps === 'partial' ? 'Parcial' : 'Pendiente'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--muted)' }}>
                      {r.payment_method === 'cash' ? 'Efectivo' : r.payment_method === 'transfer' ? 'Transferencia' : '—'}
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--muted)' }}>
                      {new Date(r.created_at).toLocaleDateString('es-MX')}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
