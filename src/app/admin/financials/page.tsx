import { createClient } from '@/lib/supabase-server'

export default async function FinancialsPage() {
  const supabase = createClient()

  const { data: payments } = await supabase
    .from('payments')
    .select(`
      id, amount, type, paid, payment_method, notes, created_at,
      students(name)
    `)
    .order('created_at', { ascending: false })

  const all = payments || []
  const totalInscripcion = all.filter(p => p.type === 'inscripcion' && p.paid).reduce((a, p) => a + p.amount, 0)
  const totalCourse = all.filter(p => p.type === 'course' && p.paid).reduce((a, p) => a + p.amount, 0)
  const totalExpenses = all.filter(p => p.type === 'expense').reduce((a, p) => a + p.amount, 0)
  const totalPending = all.filter(p => !p.paid && p.type !== 'expense').reduce((a, p) => a + p.amount, 0)
  const net = totalInscripcion + totalCourse - totalExpenses

  const metrics = [
    { label: 'Inscripciones cobradas', value: `$${totalInscripcion.toLocaleString()}` },
    { label: 'Cursos cobrados', value: `$${totalCourse.toLocaleString()}`, color: '#1A7A3C' },
    { label: 'Por cobrar', value: `$${totalPending.toLocaleString()}`, color: '#A32D2D' },
    { label: 'Gastos', value: `$${totalExpenses.toLocaleString()}`, color: '#A32D2D' },
    { label: 'Neto', value: `$${net.toLocaleString()}`, color: net >= 0 ? '#1A7A3C' : '#A32D2D' },
  ]

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--navy)', margin: 0 }}>Finanzas</h1>
        <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 4 }}>Resumen financiero del curso</p>
      </div>

      {/* Metric cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: '1.5rem' }}>
        {metrics.map(m => (
          <div key={m.label} style={{
            background: '#fff', borderRadius: 12, padding: '1.25rem',
            borderLeft: '3px solid var(--gold)', boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
          }}>
            <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 8 }}>{m.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: (m as any).color || 'var(--navy)' }}>{m.value}</div>
          </div>
        ))}
      </div>

      {/* Transaction log */}
      <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--navy)', margin: 0 }}>Registro de movimientos</h2>
        </div>
        {all.length === 0 ? (
          <div style={{ padding: '2rem', color: 'var(--muted)', textAlign: 'center' }}>Sin movimientos aún.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead style={{ background: '#F4F5F8' }}>
              <tr>
                {['Concepto', 'Alumno', 'Método', 'Fecha', 'Monto'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '10px 16px', color: 'var(--muted)', fontWeight: 500, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {all.map((p: any) => {
                const isExpense = p.type === 'expense'
                const typeLabel = p.type === 'inscripcion' ? 'Inscripción' : p.type === 'course' ? 'Curso' : 'Gasto'
                return (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '10px 16px' }}>
                      <div style={{ fontWeight: 500, color: 'var(--navy)' }}>{typeLabel}</div>
                      {p.notes && <div style={{ fontSize: 12, color: 'var(--muted)' }}>{p.notes}</div>}
                    </td>
                    <td style={{ padding: '10px 16px', color: 'var(--muted)' }}>{p.students?.name ?? '—'}</td>
                    <td style={{ padding: '10px 16px', color: 'var(--muted)' }}>
                      {p.payment_method === 'cash' ? 'Efectivo' : p.payment_method === 'transfer' ? 'Transferencia' : '—'}
                    </td>
                    <td style={{ padding: '10px 16px', color: 'var(--muted)' }}>
                      {new Date(p.created_at).toLocaleDateString('es-MX')}
                    </td>
                    <td style={{ padding: '10px 16px', fontWeight: 700, color: isExpense ? '#A32D2D' : '#1A7A3C' }}>
                      {isExpense ? '-' : '+'}${p.amount.toLocaleString()}
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
