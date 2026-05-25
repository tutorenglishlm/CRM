'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import Link from 'next/link'
import { useParams } from 'next/navigation'

const LEVEL: Record<string,string> = { basic:'Básico', intermediate:'Intermedio', advanced:'Avanzado' }
const STATUS: Record<string,{label:string,bg:string,color:string}> = {
  active: { label:'Activo', bg:'#ECFDF5', color:'#065F46' },
  inactive: { label:'Inactivo', bg:'#FEF2F2', color:'#991B1B' },
  graduated: { label:'Graduado', bg:'#EFF6FF', color:'#1E40AF' },
}
const TYPE: Record<string,string> = { per_session:'Por sesión', monthly:'Mensual', package:'Paquete', registration:'Inscripción', expense:'Gasto', other:'Otro' }

export default function StudentProfilePage() {
  const { id } = useParams()
  const [student, setStudent] = useState<any>(null)
  const [payments, setPayments] = useState<any[]>([])
  const [bookings, setBookings] = useState<any[]>([])
  const [enrollments, setEnrollments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const [{ data:s },{ data:p },{ data:b },{ data:e }] = await Promise.all([
        supabase.from('students').select('*, parents(name, phone, email)').eq('id', id).single(),
        supabase.from('payments').select('*').eq('student_id', id).order('created_at', { ascending:false }),
        supabase.from('bookings').select('*, classes(name)').eq('student_id', id).order('date', { ascending:false }).limit(20),
        supabase.from('class_enrollments').select('*, classes(name, type, day_of_week, time_start, time_end)').eq('student_id', id),
      ])
      setStudent(s)
      setPayments(p || [])
      setBookings(b || [])
      setEnrollments(e || [])
      setLoading(false)
    }
    load()
  }, [id])

  if (loading) return <div style={{ color:'#94A3B8', padding:'2rem' }}>Cargando...</div>
  if (!student) return <div style={{ color:'#94A3B8', padding:'2rem' }}>Alumno no encontrado.</div>

  const st = STATUS[student.status] || STATUS.active
  const totalPaid = payments.filter(p=>p.paid&&p.type!=='expense').reduce((a,p)=>a+p.amount,0)
  const totalPending = payments.filter(p=>!p.paid&&p.type!=='expense').reduce((a,p)=>a+p.amount,0)
  const upcomingBookings = bookings.filter(b=>b.date>=new Date().toISOString().split('T')[0])
  const pastBookings = bookings.filter(b=>b.date<new Date().toISOString().split('T')[0])

  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <Link href="/admin/students" style={{ fontSize:13, color:'#94A3B8', textDecoration:'none', display:'inline-flex', alignItems:'center', gap:4, marginBottom:12 }}>
          <i className="ti ti-arrow-left" style={{ fontSize:14 }} aria-hidden="true" /> Volver a alumnos
        </Link>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
          <div style={{ display:'flex', alignItems:'center', gap:16 }}>
            <div style={{ width:56, height:56, borderRadius:'50%', background:'#F1F5F9', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, fontWeight:700, color:'#475569', flexShrink:0 }}>
              {student.name?.charAt(0)}
            </div>
            <div>
              <h1 style={{ fontSize:22, fontWeight:700, color:'#0F172A', letterSpacing:'-0.4px', margin:0 }}>{student.name}</h1>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:6 }}>
                <span style={{ fontSize:12, padding:'2px 8px', borderRadius:20, background:'#F1F5F9', color:'#475569' }}>{LEVEL[student.level]||student.level}</span>
                <span style={{ fontSize:12, padding:'2px 8px', borderRadius:20, background:st.bg, color:st.color, fontWeight:500 }}>{st.label}</span>
                {student.age && <span style={{ fontSize:12, color:'#94A3B8' }}>{student.age} años</span>}
              </div>
            </div>
          </div>
          {student.parents?.phone && (
            <a href={`https://wa.me/${student.parents.phone.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer" style={{ display:'flex', alignItems:'center', gap:8, padding:'9px 16px', borderRadius:8, background:'#ECFDF5', border:'1px solid #A7F3D0', color:'#065F46', textDecoration:'none', fontSize:13, fontWeight:500 }}>
              💬 WhatsApp {student.parents.name}
            </a>
          )}
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:24 }}>
        <div style={{ background:'#fff', borderRadius:12, padding:'16px 20px', border:'1px solid #E2E8F0' }}>
          <div style={{ fontSize:11, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>Total pagado</div>
          <div style={{ fontSize:24, fontWeight:700, color:'#10B981' }}>${totalPaid.toLocaleString()}</div>
        </div>
        <div style={{ background:'#fff', borderRadius:12, padding:'16px 20px', border:'1px solid #E2E8F0' }}>
          <div style={{ fontSize:11, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>Por pagar</div>
          <div style={{ fontSize:24, fontWeight:700, color:totalPending>0?'#EF4444':'#0F172A' }}>${totalPending.toLocaleString()}</div>
        </div>
        <div style={{ background:'#fff', borderRadius:12, padding:'16px 20px', border:'1px solid #E2E8F0' }}>
          <div style={{ fontSize:11, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>Sesiones próximas</div>
          <div style={{ fontSize:24, fontWeight:700, color:'#0F172A' }}>{upcomingBookings.length}</div>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:20 }}>

        {/* Contact info */}
        <div style={{ background:'#fff', borderRadius:12, border:'1px solid #E2E8F0', padding:'20px' }}>
          <div style={{ fontSize:14, fontWeight:600, color:'#0F172A', marginBottom:14 }}>Información de contacto</div>
          {[
            { label:'Tutor / Padre', value:student.parents?.name||'—', icon:'ti-user' },
            { label:'Teléfono', value:student.parents?.phone||'—', icon:'ti-phone' },
            { label:'Correo', value:student.parents?.email||'—', icon:'ti-mail' },
          ].map(r=>(
            <div key={r.label} style={{ display:'flex', gap:10, padding:'8px 0', borderBottom:'1px solid #F8FAFC' }}>
              <i className={`ti ${r.icon}`} style={{ fontSize:14, color:'#94A3B8', marginTop:1, flexShrink:0 }} aria-hidden="true" />
              <div>
                <div style={{ fontSize:10, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:1 }}>{r.label}</div>
                <div style={{ fontSize:13, color:'#0F172A' }}>{r.value}</div>
              </div>
            </div>
          ))}
          {student.notes && (
            <div style={{ marginTop:12, padding:'10px 12px', background:'#F8FAFC', borderRadius:8, fontSize:12, color:'#64748B' }}>
              <div style={{ fontSize:10, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:4 }}>Notas</div>
              {student.notes}
            </div>
          )}
        </div>

        {/* Enrolled classes */}
        <div style={{ background:'#fff', borderRadius:12, border:'1px solid #E2E8F0', padding:'20px' }}>
          <div style={{ fontSize:14, fontWeight:600, color:'#0F172A', marginBottom:14 }}>Clases inscritas</div>
          {enrollments.length===0?(
            <div style={{ color:'#94A3B8', fontSize:13, textAlign:'center', padding:'20px 0' }}>Sin clases inscritas.</div>
          ):enrollments.map((e:any)=>(
            <div key={e.id} style={{ padding:'10px 0', borderBottom:'1px solid #F8FAFC' }}>
              <div style={{ fontSize:13, fontWeight:500, color:'#0F172A' }}>{e.classes?.name}</div>
              <div style={{ fontSize:11, color:'#94A3B8', marginTop:2 }}>
                {e.classes?.day_of_week}{e.classes?.time_start?` · ${e.classes.time_start.slice(0,5)}`:''}
                {e.classes?.time_end?` – ${e.classes.time_end.slice(0,5)}`:''} · {e.payment_type}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming sessions */}
      {upcomingBookings.length > 0 && (
        <div style={{ background:'#fff', borderRadius:12, border:'1px solid #E2E8F0', marginBottom:20, overflow:'hidden' }}>
          <div style={{ padding:'16px 20px', borderBottom:'1px solid #F1F5F9' }}>
            <div style={{ fontSize:14, fontWeight:600, color:'#0F172A' }}>Próximas sesiones</div>
          </div>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
            <thead><tr style={{ background:'#F8FAFC' }}>
              {['Fecha','Hora','Clase','Tipo'].map(h=>(
                <th key={h} style={{ textAlign:'left', padding:'10px 16px', fontSize:11, fontWeight:600, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'0.06em' }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>{upcomingBookings.slice(0,5).map((b:any)=>(
              <tr key={b.id} style={{ borderBottom:'1px solid #F8FAFC' }}>
                <td style={{ padding:'10px 16px', fontWeight:500 }}>{new Date(b.date+'T12:00:00').toLocaleDateString('es-MX', { weekday:'short', day:'numeric', month:'short' })}</td>
                <td style={{ padding:'10px 16px', color:'#64748B' }}>{b.time_start?.slice(0,5)} – {b.time_end?.slice(0,5)}</td>
                <td style={{ padding:'10px 16px', color:'#64748B' }}>{b.classes?.name||b.title||'—'}</td>
                <td style={{ padding:'10px 16px' }}><span style={{ fontSize:11, padding:'2px 8px', borderRadius:20, background:b.type==='group'?'#FEF3C7':'#EFF6FF', color:b.type==='group'?'#D97706':'#1E40AF' }}>{b.type==='group'?'Grupal':'1 a 1'}</span></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}

      {/* Payment history */}
      <div style={{ background:'#fff', borderRadius:12, border:'1px solid #E2E8F0', overflow:'hidden' }}>
        <div style={{ padding:'16px 20px', borderBottom:'1px solid #F1F5F9', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div style={{ fontSize:14, fontWeight:600, color:'#0F172A' }}>Historial de pagos</div>
          <Link href="/admin/payments" style={{ fontSize:12, color:'#F59E0B', textDecoration:'none', fontWeight:500 }}>Ver todos →</Link>
        </div>
        {payments.length===0?(
          <div style={{ padding:'2rem', textAlign:'center', color:'#94A3B8', fontSize:13 }}>Sin pagos registrados.</div>
        ):(
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
            <thead><tr style={{ background:'#F8FAFC' }}>
              {['Tipo','Descripción','Monto','Estado','Fecha'].map(h=>(
                <th key={h} style={{ textAlign:'left', padding:'10px 16px', fontSize:11, fontWeight:600, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'0.06em' }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>{payments.map((p:any)=>(
              <tr key={p.id} style={{ borderBottom:'1px solid #F8FAFC' }}>
                <td style={{ padding:'10px 16px', color:'#64748B' }}>{TYPE[p.type]||p.type}</td>
                <td style={{ padding:'10px 16px', color:'#64748B' }}>{p.description||'—'}</td>
                <td style={{ padding:'10px 16px', fontWeight:600, color:p.type==='expense'?'#EF4444':'#10B981' }}>${p.amount?.toLocaleString()}</td>
                <td style={{ padding:'10px 16px' }}><span style={{ fontSize:11, padding:'3px 9px', borderRadius:20, background:p.paid?'#ECFDF5':'#FEF2F2', color:p.paid?'#065F46':'#991B1B', fontWeight:500 }}>{p.paid?'Pagado':'Pendiente'}</span></td>
                <td style={{ padding:'10px 16px', color:'#94A3B8' }}>{new Date(p.created_at).toLocaleDateString('es-MX')}</td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>
    </div>
  )
}
