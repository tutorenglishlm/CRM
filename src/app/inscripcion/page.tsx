'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase-client'

export default function InformacionPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    parentName: '', parentPhone: '', parentEmail: '',
    studentName: '', studentAge: '', level: '',
    availability: '', classType: '', notes: '',
  })

  function set(key: string, value: string) {
    setForm(f => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error: err } = await supabase.from('leads').insert({
      parent_name: form.parentName, parent_phone: form.parentPhone,
      parent_email: form.parentEmail, student_name: form.studentName,
      student_age: parseInt(form.studentAge) || null, level: form.level,
      availability: form.availability, class_type: form.classType,
      notes: form.notes, status: 'new',
    })
    if (err) { setError('Hubo un problema. Por favor intenta de nuevo.'); setLoading(false); return }
    setSuccess(true)
    setLoading(false)
  }

  const inp: React.CSSProperties = { width: '100%', padding: '11px 14px', border: '1.5px solid #DDE2EF', borderRadius: 10, fontSize: 15, color: '#1B2A4A', background: '#fff', outline: 'none', fontFamily: 'system-ui, sans-serif', boxSizing: 'border-box' }
  const lbl: React.CSSProperties = { fontSize: 13, color: '#6B7A99', display: 'block', marginBottom: 6, fontWeight: 500 }

  if (success) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F4F5F8', padding: '1rem' }}>
      <div style={{ background: '#fff', borderRadius: 20, padding: '3rem 2rem', maxWidth: 440, width: '100%', textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#E6F4EC', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: 28 }}>✓</div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1B2A4A', marginBottom: '0.75rem' }}>¡Información recibida!</h2>
        <p style={{ color: '#6B7A99', fontSize: 15, lineHeight: 1.6, marginBottom: '1.5rem' }}>Gracias por tu interés en TutorEnglishLM. Nos pondremos en contacto contigo a la brevedad para darte más información.</p>
        <div style={{ background: '#F4F5F8', borderRadius: 12, padding: '1rem', fontSize: 14, color: '#6B7A99' }}>
          📞 <strong style={{ color: '#1B2A4A' }}>668 148 9168</strong>
          <span style={{ fontSize: 12, marginTop: 4, display: 'block' }}>También puedes contactarnos por WhatsApp</span>
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#F4F5F8', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: 540, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#1B2A4A', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, color: '#F5A623', marginBottom: '1rem' }}>TE</div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1B2A4A', margin: '0 0 6px' }}>Tutor<span style={{ color: '#F5A623' }}>English</span>LM</h1>
          <p style={{ fontSize: 13, color: '#6B7A99' }}>Enseñanza de Inglés · Casa de la Cultura, San Miguel Zapotitlán</p>
        </div>

        <div style={{ background: '#1B2A4A', borderRadius: 16, padding: '1.5rem', marginBottom: '1.25rem' }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 8 }}>Solicitud de información</div>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, margin: 0 }}>Completa este formulario y nos comunicaremos contigo para darte información sobre horarios y disponibilidad. Sin compromiso.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ background: '#fff', borderRadius: 16, padding: '1.5rem', marginBottom: '1rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#1B2A4A', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.8px' }}>👤 Datos de contacto</div>
            <div style={{ marginBottom: '1rem' }}><label style={lbl}>Nombre completo *</label><input required style={inp} placeholder="Tu nombre completo" value={form.parentName} onChange={e => set('parentName', e.target.value)} /></div>
            <div style={{ marginBottom: '1rem' }}><label style={lbl}>Teléfono / WhatsApp *</label><input required style={inp} placeholder="668 000 0000" value={form.parentPhone} onChange={e => set('parentPhone', e.target.value)} /></div>
            <div><label style={lbl}>Correo electrónico</label><input type="email" style={inp} placeholder="correo@ejemplo.com (opcional)" value={form.parentEmail} onChange={e => set('parentEmail', e.target.value)} /></div>
          </div>

          <div style={{ background: '#fff', borderRadius: 16, padding: '1.5rem', marginBottom: '1rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#1B2A4A', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.8px' }}>🎓 Datos del estudiante</div>
            <div style={{ marginBottom: '1rem' }}><label style={lbl}>Nombre del estudiante *</label><input required style={inp} placeholder="Nombre completo del estudiante" value={form.studentName} onChange={e => set('studentName', e.target.value)} /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div><label style={lbl}>Edad</label><input type="number" min="4" max="99" style={inp} placeholder="Ej. 12" value={form.studentAge} onChange={e => set('studentAge', e.target.value)} /></div>
              <div><label style={lbl}>Nivel de inglés</label>
                <select style={inp} value={form.level} onChange={e => set('level', e.target.value)}>
                  <option value="">No sé / no estoy seguro</option>
                  <option value="basic">Básico / sin experiencia</option>
                  <option value="intermediate">Intermedio</option>
                  <option value="advanced">Avanzado</option>
                </select>
              </div>
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: 16, padding: '1.5rem', marginBottom: '1rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#1B2A4A', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.8px' }}>📅 Preferencias</div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={lbl}>¿Qué tipo de clase te interesa?</label>
              <select style={inp} value={form.classType} onChange={e => set('classType', e.target.value)}>
                <option value="">No estoy seguro</option>
                <option value="one_on_one">Clase individual (1 a 1)</option>
                <option value="group">Clase grupal</option>
                <option value="both">Cualquiera de las dos</option>
              </select>
            </div>
            <div>
              <label style={lbl}>¿Cuál es tu disponibilidad de horario?</label>
              <textarea style={{ ...inp, height: 80, resize: 'none' } as React.CSSProperties} placeholder="Ej. Lunes y miércoles por la tarde..." value={form.availability} onChange={e => set('availability', e.target.value)} />
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: 16, padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#1B2A4A', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.8px' }}>💬 ¿Algo más que debamos saber?</div>
            <textarea style={{ ...inp, height: 90, resize: 'none' } as React.CSSProperties} placeholder="Metas, preguntas, necesidades especiales..." value={form.notes} onChange={e => set('notes', e.target.value)} />
          </div>

          {error && <div style={{ background: '#FDE8E8', color: '#A32D2D', padding: '12px 16px', borderRadius: 10, marginBottom: '1rem', fontSize: 14 }}>{error}</div>}

          <button type="submit" disabled={loading} style={{ width: '100%', padding: '15px', background: loading ? '#6B7A99' : '#1B2A4A', color: '#fff', border: 'none', borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'system-ui, sans-serif' }}>
            {loading ? 'Enviando...' : 'Enviar solicitud de información'}
          </button>

          <p style={{ textAlign: 'center', fontSize: 12, color: '#6B7A99', marginTop: '1rem', lineHeight: 1.5 }}>
            Al enviar este formulario no estás comprometido a nada.<br />Te contactaremos para darte más información.
          </p>
        </form>
      </div>
    </div>
  )
}
