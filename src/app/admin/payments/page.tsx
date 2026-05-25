'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-client'

const TYPE: Record<string,string> = { per_session:'Por sesión', monthly:'Mensual', package:'Paquete', registration:'Inscripción', expense:'Gasto', other:'Otro' }

export default function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState('all')
  const [form, setForm] = useState({ student_id:'', type:'monthly', amount:'', paid:'true', payment_method:'cash', description:'', due_date:'' })
  const supabase = createClient()

  async function load() {
    const [{ data:p },{ data:s }] = await Promise.all([
      supabase.from('payments').select('id, amount, paid, type, payment_method, description, due_date, created_at, students(name), classes(name)').order('created_at', { ascending:false }),
      supabase.from('students').select('id, name').eq('status','active').order('name'),
    ])
    setPayments(p || [])
    setStudents(s || [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    await supabase.from('payments').insert({
      student_id: form.student_id||null, type:form.type,
      amount:parseFloat(form.amount), paid:form.paid==='true',
      payment_method:form.payment_method, description:form.description||null,
      due_date:form.due_date||null,
      paid_date:form.paid==='true'?new Date().toISOString().split('T')[0]:null,
    })
    setShowForm(false)
    setForm({ student_id:'', type:'monthly', amount:'', paid:'true', payment_method:'cash', description:'', due_date:'' })
    load()
  }

  async function togglePaid(id: string, current: boolean) {
    await supabase.from('payments').update({ paid:!current, paid_date:!current?new Date().toISOString().split('T')[0]:null }).eq('id', id)
    load()
  }

  const inp = { width:'100%', padding:'9px 12px', border:'1px solid #E2E8F0', borderRadius:8, fontSize:13, color:'#0F172A', background:'#fff', outline:'none', boxSizing:'border-box' as const }
  const filtered = filter==='all'?payments:filter==='paid'?payments.filter(p=>p.paid&&p.type!=='expense'):filter==='pending'?payments.filter(p=>!p.paid&&p.type!=='expense'):payments.filter(p=>p.type==='expense')
  const collected = payments.filter(p=>p.paid&&p.type!=='expense').reduce((a,p)=>a+p.amount,0)
  const pending = payments.filter(p=>!p.paid&&p.type!=='expense').reduce((a,p)=>a+p.amount,0)
  const expenses = payments.filter(p=>p.type==='expense').reduce((a,p)=>a+p.amount,0)

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:700, color:'#0F172A', letterSpacing:'-0.4px' }}>Pagos</h1>
          <p style={{ color:'#94A3B8', fontSize:13, marginTop:4 }}>Historial completo de ingresos y gastos</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{ display:'flex', alignItems:'center', gap:6, padding:'9px 16px', borderRadius:8, background:'#0F172A', color:'#fff', border:'none', fontSize:13, fontWeight:500, cursor:'pointer' }}>
          <i className="ti ti-plus" style={{ fontSize:15 }} aria-hidden="true" /> Registrar pago
        </button>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14, marginBottom:24 }}>
        {[
          { label:'Ingresos cobrados', value:`$${collected.toLocaleString()}`, color:'#10B981', bg:'#ECFDF5', icon:'ti-trending-up' },
          { label:'Por cobrar', value:`$${pending.toLocaleString()}`, color:'#EF4444', bg:'#FEF2F2', icon:'ti-clock' },
          { label:'Gastos', value:`$${expenses.toLocaleString()}`, color:'#F59E0B', bg:'#FFFBEB', icon:'ti-trending-down' },
        ].map(m => (
          <div key={m.label} style={{ background:'#fff', borderRadius:12, padding:'18px 20px', border:'1px solid #E2E8F0', display:'flex', alignItems:'center', gap:14 }}>
            <div style={{ width:40, height:40, borderRadius:10, background:m.bg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <i className={`ti ${m.icon}`} style={{ fontSize:18, color:m.color }} aria-hidden="true" />
            </div>
            <div>
              <div style={{ fontSize:11, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:4 }}>{m.label}</div>
              <div style={{ fontSize:20, fontWeight:700, color:m.color, letterSpacing:'-0.4px' }}>{m.value}</div>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div style={{ background:'#fff', borderRadius:12, padding:'20px 24px', marginBottom:20, border:'1px solid #E2E8F0' }}>
          <div style={{ fontSize:14, fontWeight:600, color:'#0F172A', marginBottom:16 }}>Registrar movimiento</div>
          <form onSubmit={handleAdd}>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(160px, 1fr))', gap:12, marginBottom:12 }}>
              <div><label style={{ fontSize:11, color:'#94A3B8', display:'block', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.06em' }}>Alumno</label>
                <select style={inp} value={form.student_id} onChange={e => setForm(f=>({...f,student_id:e.target.value}))}>
                  <option value="">Sin alumno</option>{students.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div><label style={{ fontSize:11, color:'#94A3B8', display:'block', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.06em' }}>Tipo</label>
                <select style={inp} value={form.type} onChange={e => setForm(f=>({...f,type:e.target.value}))}>
                  {Object.entries(TYPE).map(([k,v])=><option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div><label style={{ fontSize:11, color:'#94A3B8', display:'block', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.06em' }}>Monto *</label><input required type="number" style={inp} value={form.amount} onChange={e => setForm(f=>({...f,amount:e.target.value}))} placeholder="0.00" /></div>
              <div><label style={{ fontSize:11, color:'#94A3B8', display:'block', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.06em' }}>Estado</label>
                <select style={inp} value={form.paid} onChange={e => setForm(f=>({...f,paid:e.target.value}))}>
                  <option value="true">Pagado</option><option value="false">Pendiente</option>
                </select>
              </div>
              <div><label style={{ fontSize:11, color:'#94A3B8', display:'block', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.06em' }}>Método</label>
                <select style={inp} value={form.payment_method} onChange={e => setForm(f=>({...f,payment_method:e.target.value}))}>
                  <option value="cash">Efectivo</option><option value="transfer">Transferencia</option><option value="other">Otro</option>
                </select>
              </div>
              <div><label style={{ fontSize:11, color:'#94A3B8', display:'block', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.06em' }}>Descripción</label><input style={inp} value={form.description} onChange={e => setForm(f=>({...f,description:e.target.value}))} placeholder="Ej. Agosto 2025" /></div>
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <button type="submit" style={{ padding:'8px 18px', borderRadius:8, background:'#0F172A', color:'#fff', border:'none', fontSize:13, fontWeight:500, cursor:'pointer' }}>Guardar</button>
              <button type="button" onClick={()=>setShowForm(false)} style={{ padding:'8px 18px', borderRadius:8, background:'#F1F5F9', color:'#475569', border:'none', fontSize:13, cursor:'pointer' }}>Cancelar</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display:'flex', gap:6, marginBottom:14 }}>
        {[['all','Todos'],['paid','Cobrados'],['pending','Pendientes'],['expense','Gastos']].map(([f,l])=>(
          <button key={f} onClick={()=>setFilter(f)} style={{ padding:'6px 12px', borderRadius:20, border:`1px solid ${filter===f?'#0F172A':'#E2E8F0'}`, fontSize:12, cursor:'pointer', background:filter===f?'#0F172A':'#fff', color:filter===f?'#fff':'#64748B' }}>{l}</button>
        ))}
      </div>

      <div style={{ background:'#fff', borderRadius:12, border:'1px solid #E2E8F0', overflow:'hidden' }}>
        {loading?<div style={{ padding:'2rem', textAlign:'center', color:'#94A3B8' }}>Cargando...</div>:
         filtered.length===0?<div style={{ padding:'3rem', textAlign:'center', color:'#94A3B8', fontSize:13 }}>Sin registros.</div>:(
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
            <thead><tr style={{ background:'#F8FAFC', borderBottom:'1px solid #E2E8F0' }}>
              {['Alumno','Tipo','Descripción','Monto','Estado','Método','Fecha'].map(h=>(
                <th key={h} style={{ textAlign:'left', padding:'10px 16px', fontSize:11, fontWeight:600, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'0.06em' }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>{filtered.map((p: any)=>(
              <tr key={p.id} style={{ borderBottom:'1px solid #F8FAFC' }}>
                <td style={{ padding:'12px 16px', fontWeight:500, color:'#0F172A' }}>{p.students?.name||'—'}</td>
                <td style={{ padding:'12px 16px', color:'#64748B' }}>{TYPE[p.type]||p.type}</td>
                <td style={{ padding:'12px 16px', color:'#64748B' }}>{p.description||'—'}</td>
                <td style={{ padding:'12px 16px', fontWeight:600, color:p.type==='expense'?'#EF4444':'#10B981' }}>{p.type==='expense'?'-':'+'}${p.amount?.toLocaleString()}</td>
                <td style={{ padding:'12px 16px' }}>
                  <button onClick={()=>togglePaid(p.id,p.paid)} style={{ fontSize:11, padding:'3px 10px', borderRadius:20, fontWeight:500, cursor:'pointer', border:'none', background:p.paid?'#ECFDF5':'#FEF2F2', color:p.paid?'#065F46':'#991B1B' }}>
                    {p.paid?'Pagado':'Pendiente'}
                  </button>
                </td>
                <td style={{ padding:'12px 16px', color:'#64748B' }}>{p.payment_method==='cash'?'Efectivo':p.payment_method==='transfer'?'Transferencia':p.payment_method||'—'}</td>
                <td style={{ padding:'12px 16px', color:'#94A3B8' }}>{p.created_at?new Date(p.created_at).toLocaleDateString('es-MX'):'—'}</td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>
    </div>
  )
}
