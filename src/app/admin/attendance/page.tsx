'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-client'

const ASTATUS: Record<string,{label:string,bg:string,color:string}> = {
  present: { label:'Presente', bg:'#ECFDF5', color:'#065F46' },
  absent: { label:'Ausente', bg:'#FEF2F2', color:'#991B1B' },
  late: { label:'Tarde', bg:'#FEF3C7', color:'#D97706' },
  excused: { label:'Justificado', bg:'#EFF6FF', color:'#1E40AF' },
}

export default function AttendancePage() {
  const [students, setStudents] = useState<any[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [attendance, setAttendance] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [records, setRecords] = useState<Record<string,string>>({})
  const supabase = createClient()

  async function load() {
    const [{ data:s },{ data:c },{ data:a }] = await Promise.all([
      supabase.from('students').select('id, name, level').eq('status','active').order('name'),
      supabase.from('classes').select('id, name, type').eq('status','active').order('name'),
      supabase.from('attendance').select('id, student_id, class_id, date, status, students(name), classes(name)').order('date', { ascending:false }).limit(60),
    ])
    setStudents(s || [])
    setClasses(c || [])
    setAttendance(a || [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  useEffect(() => {
    if (!selectedClass || !selectedDate) return
    const existing: Record<string,string> = {}
    attendance.filter(a=>a.class_id===selectedClass&&a.date===selectedDate).forEach(a=>{ existing[a.student_id]=a.status })
    const init: Record<string,string> = {}
    students.forEach(s=>{ init[s.id]=existing[s.id]||'present' })
    setRecords(init)
  }, [selectedClass, selectedDate, students, attendance])

  async function saveAttendance() {
    if (!selectedClass) return
    setSaving(true)
    await supabase.from('attendance').delete().eq('class_id',selectedClass).eq('date',selectedDate)
    const rows = Object.entries(records).map(([student_id,status])=>({ student_id, class_id:selectedClass, date:selectedDate, status }))
    await supabase.from('attendance').insert(rows)
    await load()
    setSaving(false)
  }

  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:22, fontWeight:700, color:'#0F172A', letterSpacing:'-0.4px' }}>Asistencia</h1>
        <p style={{ color:'#94A3B8', fontSize:13, marginTop:4 }}>Registra la asistencia por clase y fecha</p>
      </div>

      <div style={{ background:'#fff', borderRadius:12, padding:'20px 24px', marginBottom:20, border:'1px solid #E2E8F0' }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr auto', gap:12, alignItems:'end', marginBottom:selectedClass?20:0 }}>
          <div>
            <label style={{ fontSize:11, color:'#94A3B8', display:'block', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.06em' }}>Clase</label>
            <select style={{ width:'100%', padding:'9px 12px', border:'1px solid #E2E8F0', borderRadius:8, fontSize:13, color:'#0F172A', outline:'none' }} value={selectedClass} onChange={e=>setSelectedClass(e.target.value)}>
              <option value="">Seleccionar clase...</option>
              {classes.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize:11, color:'#94A3B8', display:'block', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.06em' }}>Fecha</label>
            <input type="date" style={{ width:'100%', padding:'9px 12px', border:'1px solid #E2E8F0', borderRadius:8, fontSize:13, color:'#0F172A', outline:'none' }} value={selectedDate} onChange={e=>setSelectedDate(e.target.value)} />
          </div>
          {selectedClass && (
            <button onClick={saveAttendance} disabled={saving} style={{ padding:'9px 20px', borderRadius:8, background:saving?'#94A3B8':'#0F172A', color:'#fff', border:'none', fontSize:13, fontWeight:500, cursor:saving?'not-allowed':'pointer', whiteSpace:'nowrap' }}>
              {saving?'Guardando...':'Guardar'}
            </button>
          )}
        </div>

        {selectedClass && students.length > 0 && (
          <div>
            <div style={{ fontSize:11, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:12 }}>Marcar asistencia</div>
            {students.map(s=>(
              <div key={s.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid #F8FAFC' }}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ width:28, height:28, borderRadius:'50%', background:'#F1F5F9', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:600, color:'#475569' }}>{s.name.charAt(0)}</div>
                  <span style={{ fontSize:13, fontWeight:500, color:'#0F172A' }}>{s.name}</span>
                </div>
                <div style={{ display:'flex', gap:6 }}>
                  {Object.entries(ASTATUS).map(([key,val])=>(
                    <button key={key} onClick={()=>setRecords(r=>({...r,[s.id]:key}))} style={{ padding:'5px 12px', borderRadius:20, fontSize:12, cursor:'pointer', fontWeight:records[s.id]===key?500:400, border:`1px solid ${records[s.id]===key?'transparent':'#E2E8F0'}`, background:records[s.id]===key?val.bg:'#fff', color:records[s.id]===key?val.color:'#94A3B8' }}>
                      {val.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedClass && students.length === 0 && (
          <div style={{ textAlign:'center', color:'#94A3B8', fontSize:13, padding:'20px 0' }}>No hay alumnos activos. Agrega alumnos primero.</div>
        )}
      </div>

      <div style={{ background:'#fff', borderRadius:12, border:'1px solid #E2E8F0', overflow:'hidden' }}>
        <div style={{ padding:'16px 20px', borderBottom:'1px solid #F1F5F9' }}>
          <div style={{ fontSize:14, fontWeight:600, color:'#0F172A' }}>Registro reciente</div>
        </div>
        {loading ? <div style={{ padding:'2rem', textAlign:'center', color:'#94A3B8' }}>Cargando...</div> :
         attendance.length === 0 ? <div style={{ padding:'3rem', textAlign:'center', color:'#94A3B8', fontSize:13 }}>Sin registros aún.</div> : (
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
            <thead><tr style={{ background:'#F8FAFC', borderBottom:'1px solid #E2E8F0' }}>
              {['Alumno','Clase','Fecha','Estado'].map(h=>(
                <th key={h} style={{ textAlign:'left', padding:'10px 16px', fontSize:11, fontWeight:600, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'0.06em' }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>{attendance.map((a: any)=>{
              const st = ASTATUS[a.status] || ASTATUS.present
              return (
                <tr key={a.id} style={{ borderBottom:'1px solid #F8FAFC' }}>
                  <td style={{ padding:'11px 16px', fontWeight:500, color:'#0F172A' }}>{a.students?.name||'—'}</td>
                  <td style={{ padding:'11px 16px', color:'#64748B' }}>{a.classes?.name||'—'}</td>
                  <td style={{ padding:'11px 16px', color:'#64748B' }}>{a.date}</td>
                  <td style={{ padding:'11px 16px' }}><span style={{ fontSize:11, padding:'3px 9px', borderRadius:20, background:st.bg, color:st.color, fontWeight:500 }}>{st.label}</span></td>
                </tr>
              )
            })}</tbody>
          </table>
        )}
      </div>
    </div>
  )
}
