import { createClient } from '@/lib/supabase-server'
import Link from 'next/link'

export default async function StudentsPage() {
  const supabase = createClient()
  const { data: students } = await supabase
    .from('students')
    .select(`
      id, name, age, level, notes, created_at,
      parents(name, phone),
      registrations(id, payment_status)
    `)
    .order('created_at', { ascending: false })

  const levelColor: Record<string, { bg: string; color: string }> = {
    basic: { bg: 'var(--navy-pale)', color: 'var(--navy)' },
    intermediate: { bg: 'var(--gold-light)', color: 'var(--gold-dark)' },
    advanced: { bg: '#E6F4EC', color: '#1A7A3C' },
  }
  const levelLabel: Record<string, string> = { basic: 'Básico', intermediate: 'Intermedio', advanced: 'Avanzado' }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--navy)', margin: 0 }}>Alumnos</h1>
          <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 4 }}>{students?.length ?? 0} registrados</p>
        </div>
        <Link href="/inscripcion" target="_blank" style={{
          background: 'var(--navy)', color: '#fff', padding: '10px 18px',
          borderRadius: 8, textDecoration: 'none', fontSize: 14, fontWeight: 600
        }}>+ Nueva inscripción</Link>
      </div>

      <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        {(!students || students.length === 0) ? (
          <div style={{ padding: '2rem', color: 'var(--muted)', textAlign: 'center' }}>No hay alumnos aún.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead style={{ background: '#F4F5F8' }}>
              <tr>
                {['Alumno', 'Edad', 'Nivel', 'Tutor', 'Teléfono', 'Pago', 'Notas'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '12px 16px', color: 'var(--muted)', fontWeight: 500, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.map((s: any) => {
                const lc = levelColor[s.level] || { bg: '#eee', color: '#333' }
                const reg = s.registrations?.[0]
                const ps = reg?.payment_status
                return (
                  <tr key={s.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--navy)' }}>{s.name}</td>
                    <td style={{ padding: '12px 16px' }}>{s.age}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ background: lc.bg, color: lc.color, fontSize: 12, padding: '3px 10px', borderRadius: 20, fontWeight: 500 }}>
                        {levelLabel[s.level] ?? s.level}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>{s.parents?.name ?? '—'}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--muted)' }}>{s.parents?.phone ?? '—'}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        fontSize: 12, padding: '3px 10px', borderRadius: 20, fontWeight: 500,
                        background: ps === 'paid' ? '#E6F4EC' : ps === 'partial' ? 'var(--gold-light)' : '#FDE8E8',
                        color: ps === 'paid' ? '#1A7A3C' : ps === 'partial' ? 'var(--gold-dark)' : '#A32D2D',
                      }}>
                        {ps === 'paid' ? 'Pagado' : ps === 'partial' ? 'Parcial' : 'Pendiente'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--muted)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {s.notes || '—'}
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
