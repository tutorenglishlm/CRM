'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-client'

const LEVEL: Record<string,string> = { basic:'Básico', intermediate:'Intermedio', advanced:'Avanzado', mixed:'Mixto' }
const TYPE: Record<string,{label:string,bg:string,color:string}> = {
  one_on_one: { label:'1 a 1', bg:'#EFF6FF', color:'#1E40AF' },
  group: { label:'Grupal', bg:'#FEF3C7', color:'#D97706' },
}

export default function ClassesPage() {
  const [classes, setClasses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name:'', type:'group', level:'basic', day_of_week:'', time_start:'', time_end:'', price_per_session:'', price_monthly:'', price_package:'', package_sessions:'', max_students:'10' })
  const supabase = createClient()

  async function load() {
    const { data } = await supabase.from('classes').select('*').order('created_at', { ascending:false })
    setClasses(data || [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    await supabase.from('classes').insert({
      name:form.name, type:form.type, level:form.level,
      day_of_week:form.day_of_week||null,
      time_start:form.time_start||null, time_end:form.time_end||null,
      price_per_session:parseFloat(form.price_per_session)||null,
      price_monthly:parseFloat(form.price_monthly)||null,
      price_package:parseFloat(form.price_package)||null,
      package_sessions:parseInt(form.package_sessions)||null,
      max_students:parseInt(form.max_students)||10,
    })
    setShowForm(false)
    setForm({ name:'', type:'group', level:'basic', day_of_week:'', time_start:'', time_end:'', price_per_session:'', price_monthly:'', price_package:'', package_sessions:'', max_students:'10' })
    load()
  }

  const inp = { width:'100%', padding:'9px 12px', border:'1px solid #E2E8F0', borderRadius:8, fontSize:13, color:'#0F172A', background:'#fff', outline:'none', boxSizing:'border-box' as const }

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:700, color:'#0F172A', letterSpacing:'-0.4px' }}>Clases</h1>
          <p style={{ color:'#94A3B8', fontSize:13, marginTop:4 }}>{classes.length} clases registradas</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{ display:'flex', alignItems:'center', gap:6, padding:'9px 16px', borderRadius:8, background:'#0F172A', color:'#fff', border:'none', fontSize:13, fontWeight:500, cursor:'pointer' }}>
          <i className="ti ti-plus" style={{ fontSize:15 }} aria-hidden="true" /> Nueva clase
        </button>
      </div>

      {showForm && (
        <div style={{ background:'#fff', borderRadius:12, padding:'20px 24px', marginBottom:20, border:'1px solid #E2E8F0' }}>
          <div style={{ fontSize:14, fontWeight:600, color:'#0F172A', marginBottom:16 }}>Nueva clase</div>
          <form onSubmit={handleAdd}>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(160px, 1fr))', gap:12, marginBottom:12 }}>
              <div><label style={{ fontSize:11, color:'#94A3B8', display:'block', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.06em' }}>Nombre *</label><input required style={inp} value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="Ej. Inglés Intermedio" /></div>
              <div><label style={{ fontSize:11, color:'#94A3B8', display:'block', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.06em' }}>Tipo</label>
                <select style={inp} value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))}>
                  <option value="group">Grupal</option><option value="one_on_one">1 a 1</option>
                </select>
              </div>
              <div><label style={{ fontSize:11, color:'#94A3B8', display:'block', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.06em' }}>Nivel</label>
                <select style={inp} value={form.level} onChange={e=>setForm(f=>({...f,level:e.target.value}))}>
                  <option value="basic">Básico</option><option value="intermediate">Intermedio</option><option value="advanced">Avanzado</option><option value="mixed">Mixto</option>
                </select>
              </div>
              <div><label style={{ fontSize:11, color:'#94A3B8', display:'block', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.06em' }}>Día</label><input style={inp} value={form.day_of_week} onChange={e=>setForm(f=>({...f,day_of_week:e.target.value}))} placeholder="Lunes, Miércoles..." /></div>
              <div><label style={{ fontSize:11, color:'#94A3B8', display:'block', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.06em' }}>Hora inicio</label><input type="time" style={inp} value={form.time_start} onChange={e=>setForm(f=>({...f,time_start:e.target.value}))} /></div>
              <div><label style={{ fontSize:11, color:'#94A3B8', display:'block', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.06em' }}>Hora fin</label><input type="time" style={inp} value={form.time_end} onChange={e=>setForm(f=>({...f,time_end:e.target.value}))} /></div>
              <div><label style={{ fontSize:11, color:'#94A3B8', display:'block', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.06em' }}>Precio por sesión</label><input type="number" style={inp} value={form.price_per_session} onChange={e=>setForm(f=>({...f,price_per_session:e.target.value}))} placeholder="0" /></div>
              <div><label style={{ fontSize:11, color:'#94A3B8', display:'block', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.06em' }}>Precio mensual</label><input type="number" style={inp} value={form.price_monthly} onChange={e=>setForm(f=>({...f,price_monthly:e.target.value}))} placeholder="0" /></div>
              <div><label style={{ fontSize:11, color:'#94A3B8', display:'block', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.06em' }}>Precio paquete</label><input type="number" style={inp} value={form.price_package} onChange={e=>setForm(f=>({...f,price_package:e.target.value}))} placeholder="0" /></div>
              <div><label style={{ fontSize:11, color:'#94A3B8', display:'block', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.06em' }}>Sesiones paquete</label><input type="number" style={inp} value={form.package_sessions} onChange={e=>setForm(f=>({...f,package_sessions:e.target.value}))} placeholder="10" /></div>
              <div><label style={{ fontSize:11, color:'#94A3B8', display:'block', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.06em' }}>Máx. alumnos</label><input type="number" style={inp} value={form.max_students} onChange={e=>setForm(f=>({...f,max_students:e.target.value}))} /></div>
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <button type="submit" style={{ padding:'8px 18px', borderRadius:8, background:'#0F172A', color:'#fff', border:'none', fontSize:13, fontWeight:500, cursor:'pointer' }}>Guardar</button>
              <button type="button" onClick={()=>setShowForm(false)} style={{ padding:'8px 18px', borderRadius:8, background:'#F1F5F9', color:'#475569', border:'none', fontSize:13, cursor:'pointer' }}>Cancelar</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:16 }}>
        {loading ? <div style={{ color:'#94A3B8' }}>Cargando...</div> :
         classes.length === 0 ? <div style={{ color:'#94A3B8', fontSize:13 }}>Sin clases. Crea la primera.</div> :
         classes.map((c: any) => {
          const t = TYPE[c.type] || { label:c.type, bg:'#F1F5F9', color:'#475569' }
          return (
            <div key={c.id} style={{ background:'#fff', borderRadius:12, border:'1px solid #E2E8F0', overflow:'hidden' }}>
              <div style={{ height:4, background:'#0F172A' }} />
              <div style={{ padding:'16px 20px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                  <div style={{ fontSize:15, fontWeight:600, color:'#0F172A' }}>{c.name}</div>
                  <span style={{ fontSize:11, padding:'2px 8px', borderRadius:20, background:t.bg, color:t.color, fontWeight:500, flexShrink:0, marginLeft:8 }}>{t.label}</span>
                </div>
                <div style={{ fontSize:12, color:'#94A3B8', marginBottom:4 }}>{LEVEL[c.level] || c.level}</div>
                {c.day_of_week && <div style={{ fontSize:12, color:'#64748B', marginBottom:4 }}>
                  <i className="ti ti-calendar" style={{ fontSize:12, marginRight:4 }} aria-hidden="true" />
                  {c.day_of_week}{c.time_start ? ` · ${c.time_start.slice(0,5)}` : ''}{c.time_end ? ` – ${c.time_end.slice(0,5)}` : ''}
                </div>}
                <div style={{ borderTop:'1px solid #F8FAFC', paddingTop:10, marginTop:10, display:'flex', gap:16, flexWrap:'wrap' }}>
                  {c.price_per_session && <div style={{ fontSize:12 }}><span style={{ color:'#94A3B8' }}>Sesión </span><strong style={{ color:'#0F172A' }}>${c.price_per_session}</strong></div>}
                  {c.price_monthly && <div style={{ fontSize:12 }}><span style={{ color:'#94A3B8' }}>Mensual </span><strong style={{ color:'#0F172A' }}>${c.price_monthly}</strong></div>}
                  {c.price_package && <div style={{ fontSize:12 }}><span style={{ color:'#94A3B8' }}>Paquete </span><strong style={{ color:'#0F172A' }}>${c.price_package} ({c.package_sessions} ses.)</strong></div>}
                </div>
              </div>
            </div>
          )
         })}
      </div>
    </div>
  )
}
