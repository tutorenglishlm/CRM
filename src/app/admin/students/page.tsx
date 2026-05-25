'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-client'

const LEVEL: Record<string,string> = { basic:'Básico', intermediate:'Intermedio', advanced:'Avanzado' }
const STATUS: Record<string,{label:string,bg:string,color:string}> = {
  active: { label:'Activo', bg:'#ECFDF5', color:'#065F46' },
  inactive: { label:'Inactivo', bg:'#FEF2F2', color:'#991B1B' },
  graduated: { label:'Graduado', bg:'#EFF6FF', color:'#1E40AF' },
}

export default function StudentsPage() {
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState('active')
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({ name:'', age:'', level:'basic', notes:'', status:'active', parentName:'', parentPhone:'' })
  const supabase = createClient()

  async function load() {
    const { data } = await supabase.from('students').select('id, name, age, level, notes, status, created_at, parents(name, phone)').order('name')
    setStudents(data || [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    let parent_id = null
    if (form.parentName) {
      const { data: p } = await supabase.from('parents').insert({ name:form.parentName, phone:form.parentPhone }).select().single()
      parent_id = p?.id
    }
    await supabase.from('students').insert({ name:form.name, age:parseInt(form.age)||null, level:form.level, notes:form.notes, status:form.status, parent_id })
    setShowForm(false)
    setForm({ name:'', age:'', level:'basic', notes:'', status:'active', parentName:'', parentPhone:'' })
    load()
  }

  const inp = { width:'100%', padding:'9px 12px', border:'1px solid #E2E8F0', borderRadius:8, fontSize:13, color:'#0F172A', background:'#fff', outline:'none', boxSizing:'border-box' as const }
  const filtered = students.filter(s => {
    const matchFilter = filter === 'all' || s.status === filter
    const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.parents?.name?.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:700, color:'#0F172A', letterSpacing:'-0.4px' }}>Alumnos</h1>
          <p style={{ color:'#94A3B8', fontSize:13, marginTop:4 }}>{filtered.length} alumnos</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{ display:'flex', alignItems:'center', gap:6, padding:'9px 16px', borderRadius:8, background:'#0F172A', color:'#fff', border:'none', fontSize:13, fontWeight:500, cursor:'pointer' }}>
          <i className="ti ti-plus" style={{ fontSize:15 }} aria-hidden="true" /> Nuevo alumno
        </button>
      </div>

      {showForm && (
        <div style={{ background:'#fff', borderRadius:12, padding:'20px 24px', marginBottom:20, border:'1px solid #E2E8F0' }}>
          <div style={{ fontSize:14, fontWeight:600, color:'#0F172A', marginBottom:16 }}>Nuevo alumno</div>
          <form onSubmit={handleAdd}>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))', gap:12, marginBottom:12 }}>
              <div><label style={{ fontSize:11, color:'#94A3B8', display:'block', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.06em' }}>Nombre *</label><input required style={inp} value={form.name} onChange={e => setForm(f => ({ ...f, name:e.target.value }))} /></div>
              <div><label style={{ fontSize:11, color:'#94A3B8', display:'block', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.06em' }}>Edad</label><input type="number" style={inp} value={form.age} onChange={e => setForm(f => ({ ...f, age:e.target.value }))} /></div>
              <div><label style={{ fontSize:11, color:'#94A3B8', display:'block', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.06em' }}>Nivel</label>
                <select style={inp} value={form.level} onChange={e => setForm(f => ({ ...f, level:e.target.value }))}>
                  <option value="basic">Básico</option><option value="intermediate">Intermedio</option><option value="advanced">Avanzado</option>
                </select>
              </div>
              <div><label style={{ fontSize:11, color:'#94A3B8', display:'block', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.06em' }}>Tutor / Padre</label><input style={inp} value={form.parentName} onChange={e => setForm(f => ({ ...f, parentName:e.target.value }))} /></div>
              <div><label style={{ fontSize:11, color:'#94A3B8', display:'block', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.06em' }}>Teléfono tutor</label><input style={inp} value={form.parentPhone} onChange={e => setForm(f => ({ ...f, parentPhone:e.target.value }))} /></div>
              <div><label style={{ fontSize:11, color:'#94A3B8', display:'block', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.06em' }}>Estado</label>
                <select style={inp} value={form.status} onChange={e => setForm(f => ({ ...f, status:e.target.value }))}>
                  <option value="active">Activo</option><option value="inactive">Inactivo</option><option value="graduated">Graduado</option>
                </select>
              </div>
            </div>
            <div style={{ marginBottom:14 }}><label style={{ fontSize:11, color:'#94A3B8', display:'block', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.06em' }}>Notas</label><textarea style={{ ...inp, height:60, resize:'none' } as any} value={form.notes} onChange={e => setForm(f => ({ ...f, notes:e.target.value }))} /></div>
            <div style={{ display:'flex', gap:8 }}>
              <button type="submit" style={{ padding:'8px 18px', borderRadius:8, background:'#0F172A', color:'#fff', border:'none', fontSize:13, fontWeight:500, cursor:'pointer' }}>Guardar</button>
              <button type="button" onClick={() => setShowForm(false)} style={{ padding:'8px 18px', borderRadius:8, background:'#F1F5F9', color:'#475569', border:'none', fontSize:13, cursor:'pointer' }}>Cancelar</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display:'flex', gap:10, marginBottom:16, alignItems:'center' }}>
        <div style={{ position:'relative', flex:1, maxWidth:280 }}>
          <i className="ti ti-search" style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', fontSize:14, color:'#94A3B8' }} aria-hidden="true" />
          <input style={{ width:'100%', padding:'8px 12px 8px 32px', border:'1px solid #E2E8F0', borderRadius:8, fontSize:13, color:'#0F172A', outline:'none', boxSizing:'border-box' }} placeholder="Buscar alumno..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div style={{ display:'flex', gap:4 }}>
          {[['active','Activos'],['inactive','Inactivos'],['graduated','Graduados'],['all','Todos']].map(([f,l]) => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding:'7px 12px', borderRadius:20, border:`1px solid ${filter===f?'#0F172A':'#E2E8F0'}`, fontSize:12, cursor:'pointer', background:filter===f?'#0F172A':'#fff', color:filter===f?'#fff':'#64748B' }}>{l}</button>
          ))}
        </div>
      </div>

      <div style={{ background:'#fff', borderRadius:12, border:'1px solid #E2E8F0', overflow:'hidden' }}>
        {loading ? <div style={{ padding:'2rem', textAlign:'center', color:'#94A3B8' }}>Cargando...</div> :
         filtered.length === 0 ? <div style={{ padding:'3rem', textAlign:'center', color:'#94A3B8', fontSize:13 }}>Sin alumnos.</div> : (
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
            <thead><tr style={{ background:'#F8FAFC', borderBottom:'1px solid #E2E8F0' }}>
              {['Alumno','Edad','Nivel','Estado','Tutor','Teléfono','Notas'].map(h => (
                <th key={h} style={{ textAlign:'left', padding:'10px 16px', fontSize:11, fontWeight:600, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'0.06em' }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>{filtered.map((s: any) => {
              const st = STATUS[s.status]
              return (
                <tr key={s.id} style={{ borderBottom:'1px solid #F8FAFC' }}>
                  <td style={{ padding:'12px 16px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <div style={{ width:30, height:30, borderRadius:'50%', background:'#F1F5F9', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:600, color:'#475569', flexShrink:0 }}>{s.name.charAt(0)}</div>
                      <span style={{ fontWeight:500, color:'#0F172A' }}>{s.name}</span>
                    </div>
                  </td>
                  <td style={{ padding:'12px 16px', color:'#64748B' }}>{s.age||'—'}</td>
                  <td style={{ padding:'12px 16px' }}><span style={{ fontSize:11, padding:'2px 8px', borderRadius:20, background:'#F1F5F9', color:'#475569', fontWeight:500 }}>{LEVEL[s.level]}</span></td>
                  <td style={{ padding:'12px 16px' }}><span style={{ fontSize:11, padding:'3px 9px', borderRadius:20, background:st.bg, color:st.color, fontWeight:500 }}>{st.label}</span></td>
                  <td style={{ padding:'12px 16px', color:'#64748B' }}>{s.parents?.name||'—'}</td>
                  <td style={{ padding:'12px 16px', color:'#64748B' }}>{s.parents?.phone||'—'}</td>
                  <td style={{ padding:'12px 16px', color:'#94A3B8', maxWidth:160, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{s.notes||'—'}</td>
                </tr>
              )
            })}</tbody>
          </table>
        )}
      </div>
    </div>
  )
}
