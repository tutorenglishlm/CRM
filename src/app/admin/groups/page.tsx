'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-client'

function generateWeeklyDates(startDate: string, dayOfWeek: string, endDate: string): string[] {
  const dayMap: Record<string,number> = { domingo:0, lunes:1, martes:2, miércoles:3, miercoles:3, jueves:4, viernes:5, sábado:6, sabado:6 }
  const targetDay = dayMap[dayOfWeek.toLowerCase().trim()]
  if (targetDay === undefined) return []
  const dates: string[] = []
  const current = new Date(startDate + 'T12:00:00')
  const end = new Date(endDate + 'T12:00:00')
  while (current.getDay() !== targetDay) current.setDate(current.getDate() + 1)
  while (current <= end) {
    dates.push(current.toISOString().split('T')[0])
    current.setDate(current.getDate() + 7)
  }
  return dates
}

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
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name:'', level:'basic', day_of_week:'', time_start:'', time_end:'',
    price_monthly:'', price_per_session:'', price_package:'', package_sessions:'', max_students:'10',
    schedule_start:'', schedule_end:''
  })
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
    setSaving(true)
    const { data: newGroup } = await supabase.from('classes').insert({
      name:form.name, type:'group', level:form.level,
      day_of_week:form.day_of_week||null,
      time_start:form.time_start||null, time_end:form.time_end||null,
      price_monthly:parseFloat(form.price_monthly)||null,
      price_per_session:parseFloat(form.price_per_session)||null,
      price_package:parseFloat(form.price_package)||null,
      package_sessions:parseInt(form.package_sessions)||null,
      max_students:parseInt(form.max_students)||10,
      status:'active',
    }).select().single()

    if (newGroup && form.day_of_week && form.time_start && form.time_end && form.schedule_start && form.schedule_end) {
      const dates = generateWeeklyDates(form.schedule_start, form.day_of_week, form.schedule_end)
      if (dates.length > 0) {
        const groupId = crypto.randomUUID()
        const bookings = dates.map(date => ({
          class_id: newGroup.id, title: form.name, date,
          time_start: form.time_start, time_end: form.time_end,
          type: 'group', recurring: true, recurrence_freq: 'weekly', recurrence_group: groupId,
        }))
        await supabase.from('bookings').insert(bookings)
      }
    }

    setShowForm(false)
    setForm({ name:'', level:'basic', day_of_week:'', time_start:'', time_end:'', price_monthly:'', price_per_session:'', price_package:'', package_sessions:'', max_students:'10', schedule_start:'', schedule_end:'' })
    setSaving(false)
    load()
  }

  async function addStudentToGroup() {
    if (!studentToAdd || !selected) return
    setSaving(true)
    await supabase.from('class_enrollments').upsert({ student_id:studentToAdd, class_id:selected.id, payment_type:paymentType, status:'active' })
    const price = paymentType==='monthly'?selected.price_monthly:paymentType==='per_session'?selected.price_per_session:paymentType==='package'?selected.price_package:null
    if (price) {
      await supabase.from('payments').insert({
        student_id:studentToAdd, class_id:selected.id, type:paymentType, amount:price, paid:false,
        description:`${selected.name} — ${paymentType==='monthly'?'Mensualidad':paymentType==='per_session'?'Sesión':'Paquete'}`,
      })
    }
    setStudentToAdd(''); setPaymentType('monthly'); setAddingStudent(false); setSaving(false); load()
  }

  async function removeStudent(enrollmentId: string) {
    await supabase.from('class_enrollments').delete().eq('id', enrollmentId)
    load()
  }

  async function deleteGroup(classId: string) {
    await Promise.all([
      supabase.from('bookings').delete().eq('class_id', classId),
      supabase.from('class_enrollments').delete().eq('class_id', classId),
      supabase.from('classes').delete().eq('id', classId),
    ])
    setSelected(null); load()
  }

  function groupEnrollments(groupId: string) { return enrollments.filter(e=>e.class_id===groupId) }

  const LEVEL: Record<string,string> = { basic:'Básico', intermediate:'Intermedio', advanced:'Avanzado', mixed:'Mixto' }
  const PTYPE: Record<string,string> = { monthly:'Mensual', per_session:'Por sesión', package:'Paquete' }
  const inp = { width:'100%', padding:'9px 12px', border:'1px solid #E2E8F0', borderRadius:8, fontSize:13, color:'#0F172A', background:'#fff', outline:'none', boxSizing:'border-box' as const }
  const lbl = { fontSize:11, color:'#94A3B8', display:'block', marginBottom:4, textTransform:'uppercase' as const, letterSpacing:'0.06em' }

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:700, color:'#0F172A', letterSpacing:'-0.4px' }}>Grupos</h1>
          <p style={{ color:'#94A3B8', fontSize:13, marginTop:4 }}>Los cambios se sincronizan con el calendario y pagos automáticamente</p>
        </div>
        <button onClick={()=>setShowForm(!showForm)} style={{ display:'flex', alignItems:'center', gap:6, padding:'9px 16px', borderRadius:8, background:'#0F172A', color:'#fff', border:'none', fontSize:13, fontWeight:500, cursor:'pointer' }}>
          <i className="ti ti-plus" style={{ fontSize:15 }} aria-hidden="true" /> Nuevo grupo
        </button>
      </div>

      {showForm && (
        <div style={{ background:'#fff', borderRadius:12, padding:'20px 24px', marginBottom:20, border:'1px solid #E2E8F0' }}>
          <div style={{ fontSize:14, fontWeight:600, color:'#0F172A', marginBottom:4 }}>Nuevo grupo</div>
          <div style={{ fontSize:12, color:'#94A3B8', marginBottom:16 }}>Si defines un horario y rango de fechas, las sesiones se crearán automáticamente en el calendario.</div>
          <form onSubmit={handleAdd}>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(160px, 1fr))', gap:12, marginBottom:16 }}>
              <div><label style={lbl}>Nombre *</label><input required style={inp} value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="Ej. Grupo Intermedio A" /></div>
              <div><label style={lbl}>Nivel</label>
                <select style={inp} value={form.level} onChange={e=>setForm(f=>({...f,level:e.target.value}))}>
                  <option value="basic">Básico</option><option value="intermediate">Intermedio</option><option value="advanced">Avanzado</option><option value="mixed">Mixto</option>
                </select>
              </div>
              <div><label style={lbl}>Día de la semana</label><input style={inp} value={form.day_of_week} onChange={e=>setForm(f=>({...f,day_of_week:e.target.value}))} placeholder="Lunes, Martes..." /></div>
              <div><label style={lbl}>Hora inicio</label><input type="time" style={inp} value={form.time_start} onChange={e=>setForm(f=>({...f,time_start:e.target.value}))} /></div>
              <div><label style={lbl}>Hora fin</label><input type="time" style={inp} value={form.time_end} onChange={e=>setForm(f=>({...f,time_end:e.target.value}))} /></div>
              <div><label style={lbl}>Máx. alumnos</label><input type="number" style={inp} value={form.max_students} onChange={e=>setForm(f=>({...f,max_students:e.target.value}))} /></div>
              <div><label style={lbl}>Precio mensual</label><input type="number" style={inp} value={form.price_monthly} onChange={e=>setForm(f=>({...f,price_monthly:e.target.value}))} placeholder="0" /></div>
              <div><label style={lbl}>Precio por sesión</label><input type="number" style={inp} value={form.price_per_session} onChange={e=>setForm(f=>({...f,price_per_session:e.target.value}))} placeholder="0" /></div>
              <div><label style={lbl}>Precio paquete</label><input type="number" style={inp} value={form.price_package} onChange={e=>setForm(f=>({...f,price_package:e.target.value}))} placeholder="0" /></div>
            </div>
            <div style={{ background:'#F8FAFC', borderRadius:10, padding:'14px 16px', marginBottom:16 }}>
              <div style={{ fontSize:13, fontWeight:500, color:'#0F172A', marginBottom:4 }}>📅 Rango de sesiones en calendario</div>
              <div style={{ fontSize:12, color:'#94A3B8', marginBottom:12 }}>Define el período para crear sesiones automáticamente.</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div><label style={lbl}>Fecha de inicio</label><input type="date" style={inp} value={form.schedule_start} onChange={e=>setForm(f=>({...f,schedule_start:e.target.value}))} /></div>
                <div><label style={lbl}>Fecha de fin</label><input type="date" style={inp} value={form.schedule_end} onChange={e=>setForm(f=>({...f,schedule_end:e.target.value}))} /></div>
              </div>
              {form.day_of_week && form.schedule_start && form.schedule_end && (
                <div style={{ marginTop:10, padding:'8px 12px', background:'#EFF6FF', borderRadius:8, fontSize:12, color:'#1E40AF' }}>
                  ↻ Se crearán sesiones cada {form.day_of_week} de {form.schedule_start} a {form.schedule_end}
                </div>
              )}
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <button type="submit" disabled={saving} style={{ padding:'8px 18px', borderRadius:8, background:saving?'#94A3B8':'#0F172A', color:'#fff', border:'none', fontSize:13, fontWeight:500, cursor:saving?'not-allowed':'pointer' }}>
                {saving?'Guardando...':'Crear grupo'}
              </button>
              <button type="button" onClick={()=>setShowForm(false)} style={{ padding:'8px 18px', borderRadius:8, background:'#F1F5F9', color:'#475569', border:'none', fontSize:13, cursor:'pointer' }}>Cancelar</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display:'grid', gridTemplateColumns:selected?'1fr 380px':'repeat(auto-fill, minmax(300px, 1fr))', gap:20 }}>
        <div style={{ display:'grid', gridTemplateColumns:selected?'1fr':'repeat(auto-fill, minmax(300px, 1fr))', gap:16, alignContent:'start' }}>
          {loading?<div style={{ color:'#94A3B8' }}>Cargando...</div>:
           groups.length===0?<div style={{ color:'#94A3B8', fontSize:13 }}>Sin grupos. Crea el primero.</div>:
           groups.map(g=>{
            const enr=groupEnrollments(g.id)
            const isSelected=selected?.id===g.id
            return (
              <div key={g.id} onClick={()=>setSelected(isSelected?null:g)} style={{ background:'#fff', borderRadius:12, border:`1px solid ${isSelected?'#0F172A':'#E2E8F0'}`, overflow:'hidden', cursor:'pointer' }}>
                <div style={{ height:3, background:'#F59E0B' }} />
                <div style={{ padding:'16px 20px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
                    <div style={{ fontSize:15, fontWeight:600, color:'#0F172A' }}>{g.name}</div>
                    <span style={{ fontSize:11, padding:'2px 8px', borderRadius:20, background:'#F1F5F9', color:'#475569' }}>{LEVEL[g.level]||g.level}</span>
                  </div>
                  {g.day_of_week&&<div style={{ fontSize:12, color:'#64748B', marginBottom:6 }}>📅 {g.day_of_week}{g.time_start?` · ${g.time_start.slice(0,5)}`:''}{ g.time_end?` – ${g.time_end.slice(0,5)}`:''}</div>}
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:10 }}>
                    <span style={{ fontSize:12, color:'#64748B' }}>{enr.length} / {g.max_students} alumnos</span>
                    <div style={{ display:'flex' }}>
                      {enr.slice(0,4).map((e:any,i:number)=>(
                        <div key={e.id} style={{ width:24, height:24, borderRadius:'50%', background:'#F1F5F9', border:'2px solid #fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:600, color:'#475569', marginLeft:i>0?-6:0 }}>{e.students?.name?.charAt(0)}</div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {selected&&(
          <div style={{ background:'#fff', borderRadius:12, border:'1px solid #E2E8F0', alignSelf:'start' }}>
            <div style={{ padding:'16px 20px', borderBottom:'1px solid #F8FAFC', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div style={{ fontSize:14, fontWeight:600, color:'#0F172A' }}>{selected.name}</div>
              <div style={{ display:'flex', gap:8 }}>
                <button onClick={()=>deleteGroup(selected.id)} style={{ padding:'5px 10px', borderRadius:6, background:'#FEF2F2', border:'1px solid #FECACA', color:'#991B1B', fontSize:12, cursor:'pointer' }}>Eliminar</button>
                <button onClick={()=>setSelected(null)} style={{ background:'none', border:'none', cursor:'pointer', color:'#94A3B8' }}><i className="ti ti-x" style={{ fontSize:16 }} aria-hidden="true" /></button>
              </div>
            </div>
            <div style={{ padding:'12px 20px', borderBottom:'1px solid #F8FAFC' }}>
              {[
                { label:'Nivel', value:LEVEL[selected.level]||selected.level },
                { label:'Horario', value:selected.day_of_week?(selected.day_of_week+(selected.time_start?` · ${selected.time_start.slice(0,5)}`:'')+(selected.time_end?` – ${selected.time_end.slice(0,5)}`:'')):('—') },
                { label:'Capacidad', value:`${groupEnrollments(selected.id).length} / ${selected.max_students}` },
                { label:'Precio mensual', value:selected.price_monthly?`$${selected.price_monthly}`:'—' },
                { label:'Precio por sesión', value:selected.price_per_session?`$${selected.price_per_session}`:'—' },
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
              {addingStudent&&(
                <div style={{ background:'#F8FAFC', borderRadius:8, padding:'12px', marginBottom:12 }}>
                  <div style={{ fontSize:11, color:'#94A3B8', marginBottom:8 }}>Se creará un pago pendiente automáticamente.</div>
                  <select style={{ ...inp, marginBottom:8 }} value={studentToAdd} onChange={e=>setStudentToAdd(e.target.value)}>
                    <option value="">Seleccionar alumno...</option>
                    {students.filter(s=>!groupEnrollments(selected.id).find((e:any)=>e.student_id===s.id)).map(s=>(
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                  <select style={{ ...inp, marginBottom:8 }} value={paymentType} onChange={e=>setPaymentType(e.target.value)}>
                    <option value="monthly">Mensual{selected.price_monthly?` · $${selected.price_monthly}`:''}</option>
                    <option value="per_session">Por sesión{selected.price_per_session?` · $${selected.price_per_session}`:''}</option>
                    <option value="package">Paquete{selected.price_package?` · $${selected.price_package}`:''}</option>
                  </select>
                  <div style={{ display:'flex', gap:6 }}>
                    <button onClick={addStudentToGroup} disabled={!studentToAdd||saving} style={{ padding:'6px 14px', borderRadius:6, background:studentToAdd&&!saving?'#0F172A':'#94A3B8', color:'#fff', border:'none', fontSize:12, cursor:studentToAdd&&!saving?'pointer':'not-allowed', fontWeight:500 }}>
                      {saving?'Agregando...':'Agregar'}
                    </button>
                    <button onClick={()=>setAddingStudent(false)} style={{ padding:'6px 14px', borderRadius:6, background:'#fff', border:'1px solid #E2E8F0', color:'#64748B', fontSize:12, cursor:'pointer' }}>Cancelar</button>
                  </div>
                </div>
              )}
              {groupEnrollments(selected.id).length===0?(
                <div style={{ textAlign:'center', color:'#94A3B8', fontSize:13, padding:'20px 0' }}>Sin alumnos inscritos.</div>
              ):groupEnrollments(selected.id).map((e:any)=>(
                <div key={e.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 0', borderBottom:'1px solid #F8FAFC' }}>
                  <div style={{ width:28, height:28, borderRadius:'50%', background:'#F1F5F9', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:600, color:'#475569', flexShrink:0 }}>{e.students?.name?.charAt(0)}</div>
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
