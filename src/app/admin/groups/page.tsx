'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-client'

export default function GroupsPage() {
  const [groups, setGroups] = useState<any[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [enrollments, setEnrollments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selected, setSelected] = useState<any>(null)
  const [addingStudent, setAddingStudent] = useState(false)
  const [studentToAdd, setStudentToAdd] = useState('')
  const [paymentType, setPaymentType] = useState('monthly')
  const [form, setForm] = useState({ name:'', level:'basic', day_of_week:'', time_start:'', time_end:'', price_monthly:'', price_per_session:'', price_package:'', package_sessions:'', max_students:'10' })
  const supabase = createClient()

  async function load() {
    const [{ data:g },{ data:s },{ data:e }] = await Promise.all([
      supabase.from('classes').select('*').eq('type','group').order('created_at', { ascending:false }),
      supabase.from('students').select('id, name, level').eq('status','active').order('name'),
      supabase.from('class_enrollments').select('*, students(id, name, level), classes(id, name)'),
    ])
    setGroups(g || [])
    setStudents(s || [])
    setEnrollments(e || [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    await supabase.from('classes').insert({
      name:form.name, type:'group', level:form.level,
      day_of_week:form.day_of_week||null,
      time_start:form.time_start||null, time_end:form.time_end||null,
      price_monthly:parseFloat(form.price_monthly)||null,
      price_per_session:parseFloat(form.price_per_session)||null,
      price_package:parseFloat(form.price_package)||null,
      package_sessions:parseInt(form.package_sessions)||null,
      max_students:parseInt(form.max_students)||10,
      status:'active',
    })
    setShowForm(false)
    setForm({ name:'', level:'basic', day_of_week:'', time_start:'', time_end:'', price_monthly:'', price_per_session:'', price_package:'', package_sessions:'', max_students:'10' })
    load()
  }

  async function addStudentToGroup() {
    if (!studentToAdd || !selected) return
    await supabase.from('class_enrollments').upsert({ student_id:studentToAdd, class_id:selected.id, payment_type:paymentType, status:'active' })
    setStudentToAdd('')
    setAddingStudent(false)
    load()
  }

  async function removeStudent(enrollmentId: string) {
    await supabase.from('class_enrollments').delete().eq('id', enrollmentId)
    load()
  }

  function groupEnrollments(groupId: string) {
    return enrollments.filter(e=>e.class_id===groupId)
  }

  const LEVEL: Record<string,string> = { basic:'Básico', intermediate:'Intermedio', advanced:'Avanzado', mixed:'Mixto' }
  const PTYPE: Record<string,string> = { monthly:'Mensual', per_session:'Por sesión', package:'Paquete' }
  const inp = { width:'100%', padding:'9px 12px', border:'1px solid #E2E8F0', borderRadius:8, fontSize:13, color:'#0F172A', background:'#fff', outline:'none', boxSizing:'border-box' as const }

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:700, color:'#0F172A', letterSpacing:'-0.4px' }}>Grupos</h1>
          <p style={{ color:'#94A3B8', fontSize:13, marginTop:4 }}>Gestiona tus clases grupales y sus alumnos</p>
        </div>
        <button onClick={()=>setShowForm(!showForm)} style={{ display:'flex', alignItems:'center', gap:6, padding:'9px 16px', borderRadius:8, background:'#0F172A', color:'#fff', border:'none', fontSize:13, fontWeight:500, cursor:'pointer' }}>
          <i className="ti ti-plus" style={{ fontSize:15 }} aria-hidden="true" /> Nuevo grupo
        </button>
      </div>

      {showForm && (
        <div style={{ background:'#fff', borderRadius:12, padding:'20px 24px', marginBottom:20, border:'1px solid #E2E8F0' }}>
          <div style={{ fontSize:14, fontWeight:600, color:'#0F172A', marginBottom:16 }}>Nuevo grupo</div>
          <form onSubmit={handleAdd}>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(160px, 1fr))', gap:12, marginBottom:12 }}>
              <div><label style={{ fontSize:11, color:'#94A3B8', display:'block', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.06em' }}>Nombre *</label><input required style={inp} value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="Ej. Grupo Intermedio A" /></div>
              <div><label style={{ fontSize:11, color:'#94A3B8', display:'block', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.06em' }}>Nivel</label>
                <select style={inp} value={form.level} onChange={e=>setForm(f=>({...f,level:e.target.value}))}>
                  <option value="basic">Básico</option><option value="intermediate">Intermedio</option><option value="advanced">Avanzado</option><option value="mixed">Mixto</option>
                </select>
              </div>
              <div><label style={{ fontSize:11, color:'#94A3B8', display:'block', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.06em' }}>Día</label><input style={inp} value={form.day_of_week} onChange={e=>setForm(f=>({...f,day_of_week:e.target.value}))} placeholder="Lunes, Miércoles..." /></div>
              <div><label style={{ fontSize:11, color:'#94A3B8', display:'block', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.06em' }}>Hora inicio</label><input type="time" style={inp} value={form.time_start} onChange={e=>setForm(f=>({...f,time_start:e.target.value}))} /></div>
              <div><label style={{ fontSize:11, color:'#94A3B8', display:'block', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.06em' }}>Hora fin</label><input type="time" style={inp} value={form.time_end} onChange={e=>setForm(f=>({...f,time_end:e.target.value}))} /></div>
              <div><label style={{ fontSize:11, color:'#94A3B8', display:'block', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.06em' }}>Máx. alumnos</label><input type="number" style={inp} value={form.max_students} onChange={e=>setForm(f=>({...f,max_students:e.target.value}))} /></div>
              <div><label style={{ fontSize:11, color:'#94A3B8', display:'block', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.06em' }}>Precio mensual</label><input type="number" style={inp} value={form.price_monthly} onChange={e=>setForm(f=>({...f,price_monthly:e.target.value}))} placeholder="0" /></div>
              <div><label style={{ fontSize:11, color:'#94A3B8', display:'block', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.06em' }}>Precio por sesión</label><input type="number" style={inp} value={form.price_per_session} onChange={e=>setForm(f=>({...f,price_per_session:e.target.value}))} placeholder="0" /></div>
              <div><label style={{ fontSize:11, color:'#94A3B8', display:'block', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.06em' }}>Precio paquete</label><input type="number" style={inp} value={form.price_package} onChange={e=>setForm(f=>({...f,price_package:e.target.value}))} placeholder="0" /></div>
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <button type="submit" style={{ padding:'8px 18px', borderRadius:8, background:'#0F172A', color:'#fff', border:'none', fontSize:13, fontWeight:500, cursor:'pointer' }}>Guardar</button>
              <button type="button" onClick={()=>setShowForm(false)} style={{ padding:'8px 18px', borderRadius:8, background:'#F1F5F9', color:'#475569', border:'none', fontSize:13, cursor:'pointer' }}>Cancelar</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display:'grid', gridTemplateColumns:selected?'1fr 360px':'repeat(auto-fill, minmax(300px, 1fr))', gap:20 }}>
        <div style={{ display:'grid', gridTemplateColumns:selected?'1fr':'repeat(auto-fill, minmax(300px, 1fr))', gap:16, alignContent:'start' }}>
          {loading ? <div style={{ color:'#94A3B8' }}>Cargando...</div> :
           groups.length === 0 ? <div style={{ color:'#94A3B8', fontSize:13 }}>Sin grupos. Crea el primero.</div> :
           groups.map(g=>{
            const enr = groupEnrollments(g.id)
            const isSelected = selected?.id===g.id
            return (
              <div key={g.id} onClick={()=>setSelected(isSelected?null:g)} style={{ background:'#fff', borderRadius:12, border:`1px solid ${isSelected?'#0F172A':'#E2E8F0'}`, overflow:'hidden', cursor:'pointer', transition:'border-color 0.15s' }}>
                <div style={{ height:3, background:'#F59E0B' }} />
                <div style={{ padding:'16px 20px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
                    <div style={{ fontSize:15, fontWeight:600, color:'#0F172A' }}>{g.name}</div>
                    <span style={{ fontSize:11, padding:'2px 8px', borderRadius:20, background:'#F1F5F9', color:'#475569' }}>{LEVEL[g.level]||g.level}</span>
                  </div>
                  {g.day_of_week && <div style={{ fontSize:12, color:'#64748B', marginBottom:6 }}>
                    <i className="ti ti-calendar" style={{ fontSize:12, marginRight:4 }} aria-hidden="true" />
                    {g.day_of_week}{g.time_start?` · ${g.time_start.slice(0,5)}`:''}{ g.time_end?` – ${g.time_end.slice(0,5)}`:''}
                  </div>}
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:10 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                      <i className="ti ti-users" style={{ fontSize:13, color:'#94A3B8' }} aria-hidden="true" />
                      <span style={{ fontSize:12, color:'#64748B' }}>{enr.length} / {g.max_students} alumnos</span>
                    </div>
                    <div style={{ display:'flex', gap:-6 }}>
                      {enr.slice(0,4).map((e,i)=>(
                        <div key={e.id} style={{ width:24, height:24, borderRadius:'50%', background:'#F1F5F9', border:'2px solid #fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:600, color:'#475569', marginLeft:i>0?-6:0 }}>
                          {e.students?.name?.charAt(0)}
                        </div>
                      ))}
                      {enr.length>4 && <div style={{ width:24, height:24, borderRadius:'50%', background:'#E2E8F0', border:'2px solid #fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, color:'#64748B', marginLeft:-6 }}>+{enr.length-4}</div>}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {selected && (
          <div style={{ background:'#fff', borderRadius:12, border:'1px solid #E2E8F0', alignSelf:'start' }}>
            <div style={{ padding:'16px 20px', borderBottom:'1px solid #F8FAFC', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div style={{ fontSize:14, fontWeight:600, color:'#0F172A' }}>{selected.name}</div>
              <button onClick={()=>setSelected(null)} style={{ background:'none', border:'none', cursor:'pointer', color:'#94A3B8' }}>
                <i className="ti ti-x" style={{ fontSize:16 }} aria-hidden="true" />
              </button>
            </div>

            <div style={{ padding:'12px 20px', borderBottom:'1px solid #F8FAFC' }}>
              {[
                { label:'Nivel', value:LEVEL[selected.level]||selected.level },
                { label:'Horario', value:selected.day_of_week?(selected.day_of_week+(selected.time_start?` · ${selected.time_start.slice(0,5)}`:'')+(selected.time_end?` – ${selected.time_end.slice(0,5)}`:'')):('—') },
                { label:'Capacidad', value:`${groupEnrollments(selected.id).length} / ${selected.max_students}` },
              ].map(r=>(
                <div key={r.label} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:'1px solid #F8FAFC', fontSize:13 }}>
                  <span style={{ color:'#94A3B8' }}>{r.label}</span>
                  <span style={{ color:'#0F172A', fontWeight:500 }}>{r.value}</span>
                </div>
              ))}
            </div>

            <div style={{ padding:'16px 20px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                <div style={{ fontSize:13, fontWeight:600, color:'#0F172A' }}>Alumnos inscritos</div>
                <button onClick={()=>setAddingStudent(!addingStudent)} style={{ display:'flex', alignItems:'center', gap:4, padding:'5px 10px', borderRadius:6, background:'#F1F5F9', border:'none', fontSize:12, cursor:'pointer', color:'#475569' }}>
                  <i className="ti ti-plus" style={{ fontSize:13 }} aria-hidden="true" /> Agregar
                </button>
              </div>

              {addingStudent && (
                <div style={{ background:'#F8FAFC', borderRadius:8, padding:'12px', marginBottom:12 }}>
                  <div style={{ marginBottom:8 }}>
                    <select style={{ ...inp, marginBottom:8 }} value={studentToAdd} onChange={e=>setStudentToAdd(e.target.value)}>
                      <option value="">Seleccionar alumno...</option>
                      {students.filter(s=>!groupEnrollments(selected.id).find(e=>e.student_id===s.id)).map(s=>(
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                    <select style={inp} value={paymentType} onChange={e=>setPaymentType(e.target.value)}>
                      <option value="monthly">Mensual</option>
                      <option value="per_session">Por sesión</option>
                      <option value="package">Paquete</option>
                    </select>
                  </div>
                  <div style={{ display:'flex', gap:6 }}>
                    <button onClick={addStudentToGroup} disabled={!studentToAdd} style={{ padding:'6px 14px', borderRadius:6, background:studentToAdd?'#0F172A':'#94A3B8', color:'#fff', border:'none', fontSize:12, cursor:studentToAdd?'pointer':'not-allowed', fontWeight:500 }}>Agregar</button>
                    <button onClick={()=>setAddingStudent(false)} style={{ padding:'6px 14px', borderRadius:6, background:'#fff', border:'1px solid #E2E8F0', color:'#64748B', fontSize:12, cursor:'pointer' }}>Cancelar</button>
                  </div>
                </div>
              )}

              {groupEnrollments(selected.id).length === 0 ? (
                <div style={{ textAlign:'center', color:'#94A3B8', fontSize:13, padding:'20px 0' }}>Sin alumnos inscritos.</div>
              ) : groupEnrollments(selected.id).map(e=>(
                <div key={e.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 0', borderBottom:'1px solid #F8FAFC' }}>
                  <div style={{ width:28, height:28, borderRadius:'50%', background:'#F1F5F9', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:600, color:'#475569', flexShrink:0 }}>
                    {e.students?.name?.charAt(0)}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, fontWeight:500, color:'#0F172A' }}>{e.students?.name}</div>
                    <div style={{ fontSize:11, color:'#94A3B8' }}>{PTYPE[e.payment_type]||e.payment_type}</div>
                  </div>
                  <button onClick={()=>removeStudent(e.id)} style={{ background:'none', border:'none', cursor:'pointer', color:'#CBD5E1', padding:4 }}>
                    <i className="ti ti-trash" style={{ fontSize:14 }} aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
