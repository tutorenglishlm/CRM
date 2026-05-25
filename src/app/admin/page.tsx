import { createClient } from '@/lib/supabase-server'

export default async function AdminDashboard() {
  const supabase = createClient()

  const [
    { count: totalStudents },
    { data: payments },
    { data: registrations },
  ] = await Promise.all([
    supabase.from('students').select('*', { count: 'exact', head: true }),
    supabase.from('payments').select('amount, type, paid'),
    supabase.from('registrations').select('id, status, created_at, students(name), payment_status').order('created_at', { ascending: false }).limit(5),
  ])

  const totalExpected = (payments || []).filter(p => p.type === 'course').reduce((a, p) => a + (p.amount || 0), 0)
  const totalCollected = (payments || []).filter(p => p.paid).reduce((a, p) => a + (p.amount || 0), 0)
  const totalPending = totalExpected - totalCollected

  const metrics = [
    { label: 'Alumnos totales', value: totalStudents ?? 0, sub: 'registrados' },
    { label: 'Cobrado', value: `$${totalCollected.toLocaleString()}`, sub: `de $${totalExpected.toLocaleString()}`, color: '#1A7A3C' },
    { label: 'Por cobrar', value: `$${totalPending.toLocaleString()}`, sub: 'pendiente', color: '#A32D2D' },
    { label: 'Inscripciones', value: (payments || []).filter(p => p.type === 'inscripcion' && p.paid).length, sub: 'con inscripción' },
  ]

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--navy)', margin: 0 }}>Dashboard</h1>
        <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 4 }}>Curso Intensivo · Verano 2025 · Casa de la Cultura</p>
      </div>

      {/* Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: '1.5rem' }}>
        {metrics.map(m => (
          <div key={m.label} style={{
            background: '#fff', borderRadius: 12, padding: '1.25rem',
            borderLeft: '3px solid var(--gold)', boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
          }}>
            <div style={{ fontSize: 12, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 8 }}>{m.label}</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: (m as any).color || 'var(--navy)' }}>{m.value}</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>{m.sub}</div>
          </div>
        ))}
      </div>

      {/* Recent registrations */}
      <div style={{ background: '#fff', borderRadius: 12, padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--navy)', marginBottom: '1rem' }}>Inscripciones recientes</h2>
        {(!registrations || registrations.length === 0) ? (
          <p style={{ color: 'var(--muted)', fontSize: 14 }}>No hay inscripciones aún.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Alumno', 'Fecha', 'Estado pago'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '8px 0', color: 'var(--muted)', fontWeight: 500, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {registrations.map((r: any) => (
                <tr key={r.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '10px 0', fontWeight: 500 }}>{r.students?.name ?? '—'}</td>
                  <td style={{ padding: '10px 0', color: 'var(--muted)' }}>{new Date(r.created_at).toLocaleDateString('es-MX')}</td>
                  <td style={{ padding: '10px 0' }}>
                    <span style={{
                      fontSize: 12, padding: '3px 10px', borderRadius: 20, fontWeight: 500,
                      background: r.payment_status === 'paid' ? '#E6F4EC' : r.payment_status === 'partial' ? 'var(--gold-light)' : '#FDE8E8',
                      color: r.payment_status === 'paid' ? '#1A7A3C' : r.payment_status === 'partial' ? 'var(--gold-dark)' : '#A32D2D',
                    }}>
                      {r.payment_status === 'paid' ? 'Pagado' : r.payment_status === 'partial' ? 'Parcial' : 'Pendiente'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
