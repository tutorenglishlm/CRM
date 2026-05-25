'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-client'

const DAYS = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']
const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const HOURS = Array.from({length:14},(_,i)=>i+7)

const TYPE_COLOR: Record<string,{bg:string,color:string,border:string}> = {
  one_on_one: { bg:'#EFF6FF', color:'#1E40AF', border:'#BFDBFE' },
  group: { bg:'#FEF3C7', color:'#D97706', border:'#FDE68A' },
}

function generateRecurringDates(startDate: string, freq: string, endType: string, endDate: string, endCount: number): string[] {
  const dates: string[] = []
  const current = new Date(startDate + 'T12:00:00')
  const limit = endType === 'date' ? new Date(endDate + 'T12:00:00') : null
  const max = endType === 'count' ? endCount : 365

  while (dates.length < max) {
    dates.push(current.toISOString().split('T')[0])
    if (freq === 'weekly') current.setDate(current.getDate() + 7)
    else if (freq === 'biweekly') current.setDate(current.getDate() + 14)
    else if (freq === 'monthly') current.setMonth(current.getMonth() + 1)
    else if (freq === 'custom') current.setDate(current.getDate() + 7)
    if (limit && current > limit) break
    if (dates.length >= 365) break
  }
  return dates
}

export default function CalendarPage() {
  const [view, setView] = useState<'week'|'month'>('week')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [bookings, setBookings] = useState<any[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    student_id:'', class_id:'', title:'', date:'', time_start:'', time_end:'', type:'one_on_one', notes:'',
    recurring: false, recurrence_freq:'weekly', end_type:'count', end_date:'', end_count:'8'
  })
  const supabase = createClient()

  async function load() {
    const [{ data:b },{ data:s },{ data:c }] = await Promise.all([
      supabase.from('bookings').select('*, students(name), classes(name)').order('date').order('time_start'),
      supabase.from('students').select('id, name').eq('status','active').order('name'),
      supabase.from('classes').select('id, name, type').eq('status','active').order('name'),
    ])
    setBookings(b || [])
    setStudents(s || [])
    setClasses(c || [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    if (form.recurring) {
      const dates = generateRecurringDates(form.date, form.recurrence_freq, form.end_type, form.end_date, parseInt(form.end_count)||8)
      const groupId = crypto.randomUUID()
      const rows = dates.map(date => ({
        student_id: form.student_id||null,
        class_id: form.class_id||null,
        title: form.title||null,
        date,
        time_start: form.time_start,
        time_end: form.time_end,
        type: form.type,
        notes: form.notes||null,
        recurring: true,
        recurrence_freq: form.recurrence_freq,
        recurrence_group: groupId,
      }))
      await supabase.from('bookings').insert(rows)
    } else {
      await supabase.from('bookings').insert({
        student_id: form.student_id||null,
        class_id: form.class_id||null,
        title: form.title||null,
        date: form.date,
        time_start: form.time_start,
        time_end: form.time_end,
        type: form.type,
        notes: form.notes||null,
        recurring: false,
      })
    }

    setShowForm(false)
    setForm({ student_id:'', class_id:'', title:'', date:'', time_start:'', time_end:'', type:'one_on_one', notes:'', recurring:false, recurrence_freq:'weekly', end_type:'count', end_date:'', end_count:'8' })
    setSaving(false)
    load()
  }

  async function deleteBooking(id: string) {
    await supabase.from('bookings').delete().eq('id', id)
    load()
  }

  async function deleteRecurringGroup(groupId: string) {
    await supabase.from('bookings').delete().eq('recurrence_group', groupId)
    load()
  }

  function getWeekDates(date: Date) {
    const start = new Date(date)
    start.setDate(date.getDate() - date.getDay())
    return Array.from({length:7},(_,i)=>{ const d = new Date(start); d.setDate(start.getDate()+i); return d })
  }

  function getMonthDates(date: Date) {
    const year = date.getFullYear(), month = date.getMonth()
    const firstDay = new Date(year,month,1).getDay()
    const daysInMonth = new Date(year,month+1,0).getDate()
    const cells: (Date|null)[] = Array(firstDay).fill(null)
    for(let d=1;d<=daysInMonth;d++) cells.push(new Date(year,month,d))
    while(cells.length%7!==0) cells.push(null)
    return cells
  }

  function formatDate(d: Date) {
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
  }

  function bookingsForDate(dateStr: string) { return bookings.filter(b=>b.date===dateStr) }
  function bookingsForSlot(dateStr: string, hour: number) {
    return bookings.filter(b=>b.date===dateStr && parseInt(b.time_start?.split(':')[0]||'0')===hour)
  }

  function navigate(dir: number) {
    const d = new Date(currentDate)
    if(view==='week') d.setDate(d.getDate()+dir*7)
    else d.setMonth(d.getMonth()+dir)
    setCurrentDate(d)
  }

  const weekDates = getWeekDates(currentDate)
  const monthDates = getMonthDates(currentDate)
  const today = formatDate(new Date())
  const inp = { width:'100%', padding:'9px 12px', border:'1px solid #E2E8F0', borderRadius:8, fontSize:13, color:'#0F172A', background:'#fff', outline:'none', boxSizing:'border-box' as const }
  const FREQ_LABEL: Record<string,string> = { weekly:'Semanal', biweekly:'Quincenal', monthly:'Mensual', custom:'Personalizado' }

  const [deleteModal, setDeleteModal] = useState<any>(null)

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:700, color:'#0F172A', letterSpacing:'-0.4px' }}>Calendario</h1>
          <p style={{ color:'#94A3B8', fontSize:13, marginTop:4 }}>Clases y sesiones programadas</p>
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          <div style={{ display:'flex', gap:4, background:'#F1F5F9', borderRadius:8, padding:3 }}>
            {(['week','month'] as const).map(v=>(
              <button key={v} onClick={()=>setView(v)} style={{ padding:'6px 14px', borderRadius:6, border:'none', fontSize:12, cursor:'pointer', background:view===v?'#fff':'transparent', color:view===v?'#0F172A':'#64748B', fontWeight:view===v?500:400 }}>
                {v==='week'?'Semana':'Mes'}
              </button>
            ))}
          </div>
          <button onClick={()=>setShowForm(true)} style={{ display:'flex', alignItems:'center', gap:6, padding:'9px 16px', borderRadius:8, background:'#0F172A', color:'#fff', border:'none', fontSize:13, fontWeight:500, cursor:'pointer' }}>
            <i className="ti ti-plus" style={{ fontSize:15 }} aria-hidden="true" /> Nueva sesión
          </button>
        </div>
      </div>

      {/* Delete modal */}
      {deleteModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:100 }}>
          <div style={{ background:'#fff', borderRadius:16, padding:'28px', maxWidth:380, width:'100%', margin:'0 20px' }}>
            <div style={{ fontSize:15, fontWeight:600, color:'#0F172A', marginBottom:8 }}>Eliminar sesión</div>
            {deleteModal.recurrence_group ? (
              <>
                <p style={{ fontSize:13, color:'#64748B', marginBottom:20, lineHeight:1.6 }}>Esta sesión es parte de una serie recurrente. ¿Qué deseas eliminar?</p>
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  <button onClick={async()=>{ await deleteBooking(deleteModal.id); setDeleteModal(null) }} style={{ padding:'10px 16px', borderRadius:8, background:'#FEF2F2', color:'#991B1B', border:'1px solid #FECACA', fontSize:13, cursor:'pointer', fontWeight:500 }}>Solo esta sesión</button>
                  <button onClick={async()=>{ await deleteRecurringGroup(deleteModal.recurrence_group); setDeleteModal(null) }} style={{ padding:'10px 16px', borderRadius:8, background:'#0F172A', color:'#fff', border:'none', fontSize:13, cursor:'pointer', fontWeight:500 }}>Todas las sesiones de la serie</button>
                  <button onClick={()=>setDeleteModal(null)} style={{ padding:'10px 16px', borderRadius:8, background:'#F1F5F9', color:'#64748B', border:'none', fontSize:13, cursor:'pointer' }}>Cancelar</button>
                </div>
              </>
            ) : (
              <>
                <p style={{ fontSize:13, color:'#64748B', marginBottom:20 }}>¿Eliminar esta sesión? Esta acción no se puede deshacer.</p>
                <div style={{ display:'flex', gap:8 }}>
                  <button onClick={async()=>{ await deleteBooking(deleteModal.id); setDeleteModal(null) }} style={{ flex:1, padding:'10px', borderRadius:8, background:'#EF4444', color:'#fff', border:'none', fontSize:13, cursor:'pointer', fontWeight:500 }}>Eliminar</button>
                  <button onClick={()=>setDeleteModal(null)} style={{ flex:1, padding:'10px', borderRadius:8, background:'#F1F5F9', color:'#64748B', border:'none', fontSize:13, cursor:'pointer' }}>Cancelar</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {showForm && (
        <div style={{ background:'#fff', borderRadius:12, padding:'20px 24px', marginBottom:20, border:'1px solid #E2E8F0' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
            <div style={{ fontSize:14, fontWeight:600, color:'#0F172A' }}>Nueva sesión</div>
            <button onClick={()=>setShowForm(false)} style={{ background:'none', border:'none', cursor:'pointer', color:'#94A3B8' }}><i className="ti ti-x" style={{ fontSize:16 }} aria-hidden="true" /></button>
          </div>
          <form onSubmit={handleAdd}>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(160px, 1fr))', gap:12, marginBottom:16 }}>
              <div><label style={{ fontSize:11, color:'#94A3B8', display:'block', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.06em' }}>Alumno</label>
                <select style={inp} value={form.student_id} onChange={e=>setForm(f=>({...f,student_id:e.target.value}))}>
                  <option value="">Seleccionar...</option>
                  {students.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div><label style={{ fontSize:11, color:'#94A3B8', display:'block', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.06em' }}>Clase / Grupo</label>
                <select style={inp} value={form.class_id} onChange={e=>setForm(f=>({...f,class_id:e.target.value}))}>
                  <option value="">Sin clase</option>
                  {classes.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div><label style={{ fontSize:11, color:'#94A3B8', display:'block', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.06em' }}>Tipo</label>
                <select style={inp} value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))}>
                  <option value="one_on_one">1 a 1</option>
                  <option value="group">Grupal</option>
                </select>
              </div>
              <div><label style={{ fontSize:11, color:'#94A3B8', display:'block', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.06em' }}>Fecha inicio *</label>
                <input required type="date" style={inp} value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))} />
              </div>
              <div><label style={{ fontSize:11, color:'#94A3B8', display:'block', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.06em' }}>Hora inicio *</label>
                <input required type="time" style={inp} value={form.time_start} onChange={e=>setForm(f=>({...f,time_start:e.target.value}))} />
              </div>
              <div><label style={{ fontSize:11, color:'#94A3B8', display:'block', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.06em' }}>Hora fin *</label>
                <input required type="time" style={inp} value={form.time_end} onChange={e=>setForm(f=>({...f,time_end:e.target.value}))} />
              </div>
              <div><label style={{ fontSize:11, color:'#94A3B8', display:'block', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.06em' }}>Título (opcional)</label>
                <input style={inp} value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="Ej. Clase de conversación" />
              </div>
            </div>

            {/* Recurring toggle */}
            <div style={{ background:'#F8FAFC', borderRadius:10, padding:'14px 16px', marginBottom:16 }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: form.recurring?14:0 }}>
                <div>
                  <div style={{ fontSize:13, fontWeight:500, color:'#0F172A' }}>Sesión recurrente</div>
                  <div style={{ fontSize:11, color:'#94A3B8', marginTop:2 }}>Repite automáticamente esta sesión</div>
                </div>
                <button type="button" onClick={()=>setForm(f=>({...f,recurring:!f.recurring}))} style={{ width:44, height:24, borderRadius:12, background:form.recurring?'#0F172A':'#CBD5E1', border:'none', cursor:'pointer', position:'relative', transition:'background 0.2s', flexShrink:0 }}>
                  <div style={{ width:18, height:18, borderRadius:'50%', background:'#fff', position:'absolute', top:3, left:form.recurring?23:3, transition:'left 0.2s' }} />
                </button>
              </div>

              {form.recurring && (
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(160px, 1fr))', gap:12 }}>
                  <div><label style={{ fontSize:11, color:'#94A3B8', display:'block', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.06em' }}>Frecuencia</label>
                    <select style={inp} value={form.recurrence_freq} onChange={e=>setForm(f=>({...f,recurrence_freq:e.target.value}))}>
                      <option value="weekly">Semanal</option>
                      <option value="biweekly">Quincenal</option>
                      <option value="monthly">Mensual</option>
                      <option value="custom">Personalizado</option>
                    </select>
                  </div>
                  <div><label style={{ fontSize:11, color:'#94A3B8', display:'block', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.06em' }}>Termina</label>
                    <select style={inp} value={form.end_type} onChange={e=>setForm(f=>({...f,end_type:e.target.value}))}>
                      <option value="count">Después de N sesiones</option>
                      <option value="date">En una fecha</option>
                    </select>
                  </div>
                  {form.end_type==='count' ? (
                    <div><label style={{ fontSize:11, color:'#94A3B8', display:'block', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.06em' }}>Número de sesiones</label>
                      <input type="number" min="2" max="100" style={inp} value={form.end_count} onChange={e=>setForm(f=>({...f,end_count:e.target.value}))} />
                    </div>
                  ) : (
                    <div><label style={{ fontSize:11, color:'#94A3B8', display:'block', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.06em' }}>Fecha de fin</label>
                      <input type="date" style={inp} value={form.end_date} onChange={e=>setForm(f=>({...f,end_date:e.target.value}))} />
                    </div>
                  )}
                  {form.date && (
                    <div style={{ display:'flex', alignItems:'flex-end' }}>
                      <div style={{ padding:'9px 12px', background:'#EFF6FF', borderRadius:8, fontSize:12, color:'#1E40AF', width:'100%' }}>
                        {form.end_type==='count'
                          ? `${form.end_count} sesiones · ${FREQ_LABEL[form.recurrence_freq]}`
                          : `${FREQ_LABEL[form.recurrence_freq]} hasta ${form.end_date||'...'}`
                        }
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div style={{ display:'flex', gap:8 }}>
              <button type="submit" disabled={saving} style={{ padding:'8px 18px', borderRadius:8, background:saving?'#94A3B8':'#0F172A', color:'#fff', border:'none', fontSize:13, fontWeight:500, cursor:saving?'not-allowed':'pointer' }}>
                {saving?'Guardando...':form.recurring?`Crear ${form.end_count||''} sesiones`:'Guardar'}
              </button>
              <button type="button" onClick={()=>setShowForm(false)} style={{ padding:'8px 18px', borderRadius:8, background:'#F1F5F9', color:'#475569', border:'none', fontSize:13, cursor:'pointer' }}>Cancelar</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ background:'#fff', borderRadius:12, border:'1px solid #E2E8F0', overflow:'hidden' }}>
        <div style={{ padding:'14px 20px', borderBottom:'1px solid #F1F5F9', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <button onClick={()=>navigate(-1)} style={{ width:32, height:32, borderRadius:8, border:'1px solid #E2E8F0', background:'#fff', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <i className="ti ti-chevron-left" style={{ fontSize:16, color:'#475569' }} aria-hidden="true" />
          </button>
          <div style={{ fontSize:15, fontWeight:600, color:'#0F172A' }}>
            {view==='week'
              ? `${weekDates[0].getDate()} ${MONTHS[weekDates[0].getMonth()]} – ${weekDates[6].getDate()} ${MONTHS[weekDates[6].getMonth()]} ${weekDates[6].getFullYear()}`
              : `${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`
            }
          </div>
          <button onClick={()=>navigate(1)} style={{ width:32, height:32, borderRadius:8, border:'1px solid #E2E8F0', background:'#fff', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <i className="ti ti-chevron-right" style={{ fontSize:16, color:'#475569' }} aria-hidden="true" />
          </button>
        </div>

        {view==='week' && (
          <div style={{ overflowX:'auto' }}>
            <div style={{ minWidth:700 }}>
              <div style={{ display:'grid', gridTemplateColumns:'60px repeat(7, 1fr)', borderBottom:'1px solid #F1F5F9' }}>
                <div style={{ padding:'10px 8px' }} />
                {weekDates.map((d,i)=>{
                  const dateStr = formatDate(d)
                  const isToday = dateStr===today
                  return (
                    <div key={i} style={{ padding:'10px 8px', textAlign:'center', borderLeft:'1px solid #F8FAFC' }}>
                      <div style={{ fontSize:11, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:4 }}>{DAYS[d.getDay()]}</div>
                      <div style={{ width:28, height:28, borderRadius:'50%', background:isToday?'#0F172A':'transparent', color:isToday?'#fff':'#0F172A', fontSize:14, fontWeight:isToday?700:400, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto' }}>{d.getDate()}</div>
                    </div>
                  )
                })}
              </div>
              {HOURS.map(hour=>(
                <div key={hour} style={{ display:'grid', gridTemplateColumns:'60px repeat(7, 1fr)', borderBottom:'1px solid #F8FAFC', minHeight:56 }}>
                  <div style={{ padding:'6px 8px', fontSize:11, color:'#CBD5E1', textAlign:'right', paddingRight:12, paddingTop:8 }}>{hour}:00</div>
                  {weekDates.map((d,i)=>{
                    const dateStr = formatDate(d)
                    const slotBookings = bookingsForSlot(dateStr, hour)
                    return (
                      <div key={i} onClick={()=>{ setForm(f=>({...f,date:dateStr,time_start:`${String(hour).padStart(2,'0')}:00`,time_end:`${String(hour+1).padStart(2,'0')}:00`})); setShowForm(true) }} style={{ borderLeft:'1px solid #F8FAFC', padding:'3px 4px', cursor:'pointer', minHeight:56 }}>
                        {slotBookings.map(b=>{
                          const tc = TYPE_COLOR[b.type]||TYPE_COLOR.one_on_one
                          return (
                            <div key={b.id} style={{ background:tc.bg, border:`1px solid ${tc.border}`, borderRadius:6, padding:'4px 8px', marginBottom:2, position:'relative' }}>
                              <div style={{ fontSize:11, fontWeight:500, color:tc.color, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', paddingRight:16 }}>
                                {b.recurring && <span style={{ fontSize:9, marginRight:4, opacity:0.7 }}>↻</span>}
                                {b.students?.name||b.title||'Sesión'}
                              </div>
                              <div style={{ fontSize:10, color:tc.color, opacity:0.7 }}>{b.time_start?.slice(0,5)}–{b.time_end?.slice(0,5)}</div>
                              <button onClick={e=>{e.stopPropagation();setDeleteModal(b)}} style={{ position:'absolute', top:2, right:4, background:'none', border:'none', cursor:'pointer', color:tc.color, opacity:0.6, padding:0, fontSize:13, lineHeight:1 }}>×</button>
                            </div>
                          )
                        })}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        )}

        {view==='month' && (
          <div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', borderBottom:'1px solid #F1F5F9' }}>
              {DAYS.map(d=>(
                <div key={d} style={{ padding:'10px 8px', textAlign:'center', fontSize:11, fontWeight:600, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'0.06em' }}>{d}</div>
              ))}
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)' }}>
              {monthDates.map((d,i)=>{
                if(!d) return <div key={i} style={{ minHeight:100, borderRight:'1px solid #F8FAFC', borderBottom:'1px solid #F8FAFC', background:'#FAFAFA' }} />
                const dateStr = formatDate(d)
                const isToday = dateStr===today
                const dayBookings = bookingsForDate(dateStr)
                return (
                  <div key={i} onClick={()=>{ setForm(f=>({...f,date:dateStr})); setShowForm(true) }} style={{ minHeight:100, borderRight:'1px solid #F8FAFC', borderBottom:'1px solid #F8FAFC', padding:'8px 6px', cursor:'pointer' }}>
                    <div style={{ width:24, height:24, borderRadius:'50%', background:isToday?'#0F172A':'transparent', color:isToday?'#fff':'#0F172A', fontSize:12, fontWeight:isToday?700:400, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:4 }}>{d.getDate()}</div>
                    {dayBookings.slice(0,3).map(b=>{
                      const tc = TYPE_COLOR[b.type]||TYPE_COLOR.one_on_one
                      return (
                        <div key={b.id} onClick={e=>{e.stopPropagation();setDeleteModal(b)}} style={{ background:tc.bg, borderRadius:4, padding:'2px 6px', marginBottom:2, fontSize:10, color:tc.color, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                          {b.recurring && <span style={{ fontSize:9, marginRight:2 }}>↻</span>}
                          {b.time_start?.slice(0,5)} {b.students?.name||b.title||'Sesión'}
                        </div>
                      )
                    })}
                    {dayBookings.length>3 && <div style={{ fontSize:10, color:'#94A3B8' }}>+{dayBookings.length-3} más</div>}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      <div style={{ display:'flex', gap:16, marginTop:12, alignItems:'center' }}>
        {Object.entries(TYPE_COLOR).map(([key,val])=>(
          <div key={key} style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:'#64748B' }}>
            <div style={{ width:10, height:10, borderRadius:2, background:val.bg, border:`1px solid ${val.border}` }} />
            {key==='one_on_one'?'1 a 1':'Grupal'}
          </div>
        ))}
        <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:'#64748B' }}>
          <span style={{ fontSize:11 }}>↻</span> Recurrente
        </div>
      </div>
    </div>
  )
}
