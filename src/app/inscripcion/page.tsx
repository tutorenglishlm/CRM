'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase-client'

export default function InscripcionPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    parentName: '',
    parentPhone: '',
    studentName: '',
    studentAge: '',
    level: '',
    notes: '',
    inscripcionPaid: 'paid',
    coursePaid: 'pending',
    paymentMethod: 'cash',
  })

  function set(key: string, value: string) {
    setForm(f => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    // 1. Insert parent
    const { data: parent, error: pErr } = await supabase
      .from('parents')
      .insert({ name: form.parentName, phone: form.parentPhone })
      .select().single()

    if (pErr) { setError('Error al guardar. Intenta de nuevo.'); setLoading(false); return }

    // 2. Insert student
    const { data: student, error: sErr } = await supabase
      .from('students')
      .insert({ name: form.studentName, age: parseInt(form.studentAge), level: form.level, notes: form.notes, parent_id: parent.id })
      .select().single()

    if (sErr) { setError('Error al guardar alumno.'); setLoading(false); return }

    // 3. Insert registration
    const { data: registration, error: rErr } = await supabase
      .from('registrations')
      .insert({
        student_id: student.id,
        parent_id: parent.id,
        payment_status: form.coursePaid,
        payment_method: form.paymentMethod,
        status: 'active',
      })
      .select().single()

    if (rErr) { setError('Error al crear inscripción.'); setLoading(false); return }

    // 4. Insert payments
    const paymentsToInsert = [
      { student_id: student.id, registration_id: registration.id, type: 'inscripcion', amount: 250, paid: form.inscripcionPaid === 'paid', payment_method: form.paymentMethod },
      { student_id: student.id, registration_id: registration.id, type: 'course', amount: 1500, paid: form.coursePaid === 'paid', payment_method: form.paymentMethod },
    ]
    await supabase.from('payments').insert(paymentsToInsert)

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F4F5F8', padding: '1rem' }}>
        <div style={{ background: '#fff', borderRadius: 16, padding: '3rem 2rem', maxWidth: 420, width: '100%', textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
          <div style={{ fontSize: 48, marginBottom: '1rem' }}>✅</div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--navy)', marginBottom: '0.75rem' }}>¡Inscripción recibida!</h2>
          <p style={{ color: 'var(--muted)', fontSize: 15, marginBottom: '1.5rem' }}>Nos pondremos en contacto contigo pronto para confirmar tu lugar.</p>
          <p style={{ fontSize: 14, color: 'var(--muted)' }}>📞 668 148 9168</p>
        </div>
      </div>
    )
  }

  const inputStyle = {
    width: '100%', padding: '10px 12px', border: '1px solid var(--border)',
    borderRadius: 8, fontSize: 14, color: 'var(--navy)', background: '#fff'
  }
  const labelStyle = { fontSize: 13, color: 'var(--muted)', display: 'block', marginBottom: 5 }

  return (
    <div style={{ minHeight: '100vh', background: '#F4F5F8', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: 520, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%', background: 'var(--navy)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, fontWeight: 700, color: 'var(--gold)', marginBottom: '1rem'
          }}>TE</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--navy)', margin: '0 0 6px' }}>
            Tutor<span style={{ color: 'var(--gold)' }}>English</span>LM
          </h1>
          <p style={{ fontSize: 14, color: 'var(--muted)' }}>Formulario de inscripción · Curso Intensivo de Inglés · Verano 2025</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Parent */}
          <div style={{ background: '#fff', borderRadius: 12, padding: '1.5rem', marginBottom: '1rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--navy)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              👤 Datos del padre / tutor
            </h2>
            <div style={{ marginBottom: '1rem' }}>
              <label style={labelStyle}>Nombre completo *</label>
              <input required style={inputStyle} placeholder="Ej. Laura Martínez" value={form.parentName} onChange={e => set('parentName', e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Teléfono / WhatsApp *</label>
              <input required style={inputStyle} placeholder="668 000 0000" value={form.parentPhone} onChange={e => set('parentPhone', e.target.value)} />
            </div>
          </div>

          {/* Student */}
          <div style={{ background: '#fff', borderRadius: 12, padding: '1.5rem', marginBottom: '1rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--navy)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              🎓 Datos del alumno
            </h2>
            <div style={{ marginBottom: '1rem' }}>
              <label style={labelStyle}>Nombre completo del alumno *</label>
              <input required style={inputStyle} placeholder="Ej. Sofía Martínez" value={form.studentName} onChange={e => set('studentName', e.target.value)} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: '1rem' }}>
              <div>
                <label style={labelStyle}>Edad *</label>
                <input required type="number" min="6" max="99" style={inputStyle} placeholder="8" value={form.studentAge} onChange={e => set('studentAge', e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Nivel de inglés *</label>
                <select required style={inputStyle} value={form.level} onChange={e => set('level', e.target.value)}>
                  <option value="">Seleccionar...</option>
                  <option value="basic">Básico</option>
                  <option value="intermediate">Intermedio</option>
                  <option value="advanced">Avanzado</option>
                </select>
              </div>
            </div>
            <div>
              <label style={labelStyle}>Notas sobre el alumno</label>
              <textarea style={{ ...inputStyle, height: 80, resize: 'none' } as any}
                placeholder="Alergias, necesidades especiales, información relevante..."
                value={form.notes} onChange={e => set('notes', e.target.value)} />
            </div>
          </div>

          {/* Payment */}
          <div style={{ background: '#fff', borderRadius: 12, padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--navy)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              💰 Pago
            </h2>
            <div style={{ background: 'var(--gold-light)', borderRadius: 8, padding: '10px 14px', marginBottom: '1rem', fontSize: 13, color: 'var(--gold-dark)' }}>
              Inscripción: <strong>$250</strong> (incluye material) &nbsp;·&nbsp; Curso: <strong>$1,500</strong>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: '1rem' }}>
              <div>
                <label style={labelStyle}>Inscripción ($250)</label>
                <select style={inputStyle} value={form.inscripcionPaid} onChange={e => set('inscripcionPaid', e.target.value)}>
                  <option value="paid">Pagado</option>
                  <option value="pending">Pendiente</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Curso ($1,500)</label>
                <select style={inputStyle} value={form.coursePaid} onChange={e => set('coursePaid', e.target.value)}>
                  <option value="paid">Pagado</option>
                  <option value="partial">Parcial</option>
                  <option value="pending">Pendiente</option>
                </select>
              </div>
            </div>
            <div>
              <label style={labelStyle}>Método de pago</label>
              <select style={inputStyle} value={form.paymentMethod} onChange={e => set('paymentMethod', e.target.value)}>
                <option value="cash">Efectivo</option>
                <option value="transfer">Transferencia</option>
              </select>
            </div>
          </div>

          {error && (
            <div style={{ background: '#FDE8E8', color: '#A32D2D', padding: '12px 16px', borderRadius: 8, marginBottom: '1rem', fontSize: 14 }}>{error}</div>
          )}

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '14px', background: loading ? 'var(--muted)' : 'var(--navy)',
            color: '#fff', border: 'none', borderRadius: 10, fontSize: 16, fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer', transition: 'background 0.2s'
          }}>
            {loading ? 'Guardando...' : 'Enviar inscripción'}
          </button>

          <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--muted)', marginTop: '1rem' }}>
            Casa de la Cultura · San Miguel Zapotitlán · 668 148 9168
          </p>
        </form>
      </div>
    </div>
  )
}
