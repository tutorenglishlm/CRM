'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase-client'

export default function InformacionPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ parentName:'', parentPhone:'', parentEmail:'', studentName:'', studentAge:'', level:'', availability:'', classType:'', notes:'' })

  function set(key: string, value: string) { setForm(f=>({...f,[key]:value})) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error:err } = await supabase.from('leads').insert({
      parent_name:form.parentName, parent_phone:form.parentPhone,
      parent_email:form.parentEmail||null, student_name:form.studentName,
      student_age:parseInt(form.studentAge)||null, level:form.level||null,
      availability:form.availability||null, class_type:form.classType||null,
      notes:form.notes||null, status:'new',
    })
    if (err) { setError('Hubo un problema. Por favor intenta de nuevo.'); setLoading(false); return }
    setSuccess(true)
    setLoading(false)
  }

  const inp: React.CSSProperties = { width:'100%', padding:'12px 14px', border:'1.5px solid #E2E8F0', borderRadius:10, fontSize:15, color:'#0F172A', background:'#fff', outline:'none', fontFamily:'Inter,system-ui,sans-serif', boxSizing:'border-box' }
  const lbl: React.CSSProperties = { fontSize:13, fontWeight:500, color:'#475569', display:'block', marginBottom:6 }
  const section: React.CSSProperties = { background:'#fff', borderRadius:16, padding:'24px', marginBottom:16, border:'1px solid #F1F5F9' }

  if (success) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#F8FAFC', padding:'1rem', fontFamily:'Inter,system-ui,sans-serif' }}>
      <div style={{ background:'#fff', borderRadius:24, padding:'48px 32px', maxWidth:460, width:'100%', textAlign:'center', border:'1px solid #E2E8F0' }}>
        <div style={{ width:64, height:64, borderRadius:'50%', background:'#ECFDF5', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px', fontSize:26, color:'#10B981' }}>✓</div>
        <h2 style={{ fontSize:22, fontWeight:700, color:'#0F172A', marginBottom:10, letterSpacing:'-0.4px' }}>¡Solicitud recibida!</h2>
        <p style={{ color:'#64748B', fontSize:15, lineHeight:1.7, marginBottom:24 }}>Gracias por tu interés. Nos pondremos en contacto contigo pronto para responder tus preguntas y coordinar los próximos pasos.</p>
        <div style={{ background:'#F8FAFC', borderRadius:12, padding:'16px', fontSize:14, color:'#64748B', border:'1px solid #E2E8F0' }}>
          También puedes contactarnos directamente:<br />
          <strong style={{ color:'#0F172A', fontSize:16 }}>668 148 9168</strong>
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:'#F8FAFC', fontFamily:'Inter,system-ui,sans-serif' }}>
      <div style={{ maxWidth:580, margin:'0 auto', padding:'40px 20px 60px' }}>
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ width:48, height:48, borderRadius:12, background:'#0F172A', display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize:17, fontWeight:700, color:'#F59E0B', marginBottom:16 }}>TE</div>
          <h1 style={{ fontSize:26, fontWeight:700, color:'#0F172A', letterSpacing:'-0.5px', marginBottom:8 }}>Tutor<span style={{ color:'#F59E0B' }}>English</span>LM</h1>
          <p style={{ fontSize:14, color:'#64748B', lineHeight:1.6 }}>Completa el formulario y te contactaremos para darte información sobre nuestros cursos, horarios y disponibilidad.</p>
        </div>

        <div style={{ background:'#0F172A', borderRadius:16, padding:'20px 24px', marginBottom:24, display:'flex', alignItems:'center', gap:16 }}>
          <div style={{ width:40, height:40, borderRadius:'50%', background:'rgba(245,158,11,0.15)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:18 }}>📩</div>
          <div>
            <div style={{ fontSize:14, fontWeight:600, color:'#F8FAFC', marginBottom:3 }}>Solicitud de información</div>
            <div style={{ fontSize:13, color:'#64748B' }}>Sin compromiso. Te respondemos a la brevedad.</div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={section}>
            <div style={{ fontSize:11, fontWeight:600, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:16 }}>Datos de contacto</div>
            <div style={{ marginBottom:14 }}><label style={lbl}>Nombre completo *</label><input required style={inp} placeholder="Tu nombre" value={form.parentName} onChange={e=>set('parentName',e.target.value)} /></div>
            <div style={{ marginBottom:14 }}><label style={lbl}>Teléfono / WhatsApp *</label><input required style={inp} placeholder="668 000 0000" value={form.parentPhone} onChange={e=>set('parentPhone',e.target.value)} /></div>
            <div><label style={lbl}>Correo electrónico <span style={{ color:'#94A3B8', fontWeight:400 }}>(opcional)</span></label><input type="email" style={inp} placeholder="correo@ejemplo.com" value={form.parentEmail} onChange={e=>set('parentEmail',e.target.value)} /></div>
          </div>

          <div style={section}>
            <div style={{ fontSize:11, fontWeight:600, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:16 }}>Datos del estudiante</div>
            <div style={{ marginBottom:14 }}><label style={lbl}>Nombre del estudiante *</label><input required style={inp} placeholder="Nombre completo" value={form.studentName} onChange={e=>set('studentName',e.target.value)} /></div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <div><label style={lbl}>Edad</label><input type="number" min="4" max="80" style={inp} placeholder="12" value={form.studentAge} onChange={e=>set('studentAge',e.target.value)} /></div>
              <div><label style={lbl}>Nivel de inglés</label>
                <select style={{ ...inp, appearance:'none' } as React.CSSProperties} value={form.level} onChange={e=>set('level',e.target.value)}>
                  <option value="">No estoy seguro</option>
                  <option value="basic">Principiante</option>
                  <option value="intermediate">Intermedio</option>
                  <option value="advanced">Avanzado</option>
                </select>
              </div>
            </div>
          </div>

          <div style={section}>
            <div style={{ fontSize:11, fontWeight:600, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:16 }}>Preferencias</div>
            <div style={{ marginBottom:14 }}>
              <label style={lbl}>¿Qué tipo de clase te interesa?</label>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
                {[['one_on_one','Individual'],['group','Grupal'],['both','Sin preferencia']].map(([v,l])=>(
                  <button key={v} type="button" onClick={()=>set('classType',v)} style={{ padding:'10px 8px', borderRadius:10, border:`1.5px solid ${form.classType===v?'#0F172A':'#E2E8F0'}`, background:form.classType===v?'#0F172A':'#fff', color:form.classType===v?'#fff':'#64748B', fontSize:13, cursor:'pointer', fontWeight:form.classType===v?500:400 }}>{l}</button>
                ))}
              </div>
            </div>
            <div><label style={lbl}>Disponibilidad <span style={{ color:'#94A3B8', fontWeight:400 }}>(opcional)</span></label>
              <textarea style={{ ...inp, height:80, resize:'none' } as React.CSSProperties} placeholder="Ej. Tardes entre semana, fines de semana por la mañana..." value={form.availability} onChange={e=>set('availability',e.target.value)} />
            </div>
          </div>

          <div style={section}>
            <div style={{ fontSize:11, fontWeight:600, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:16 }}>¿Algo más que debamos saber?</div>
            <textarea style={{ ...inp, height:90, resize:'none' } as React.CSSProperties} placeholder="Metas, preguntas, necesidades especiales..." value={form.notes} onChange={e=>set('notes',e.target.value)} />
          </div>

          {error && <div style={{ background:'#FEF2F2', border:'1px solid #FECACA', color:'#991B1B', padding:'12px 16px', borderRadius:10, marginBottom:16, fontSize:14 }}>{error}</div>}

          <button type="submit" disabled={loading} style={{ width:'100%', padding:'16px', background:loading?'#94A3B8':'#0F172A', color:'#fff', border:'none', borderRadius:12, fontSize:15, fontWeight:600, cursor:loading?'not-allowed':'pointer', fontFamily:'Inter,system-ui,sans-serif' }}>
            {loading?'Enviando...':'Enviar solicitud de información'}
          </button>
          <p style={{ textAlign:'center', fontSize:12, color:'#94A3B8', marginTop:14, lineHeight:1.6 }}>Al enviar no adquieres ningún compromiso.<br />Te contactaremos para darte más información.</p>
        </form>
      </div>
    </div>
  )
}
