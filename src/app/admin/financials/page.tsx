'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-client'

const TYPE: Record<string,string> = { per_session:'Por sesión', monthly:'Mensual', package:'Paquete', registration:'Inscripción', expense:'Gasto', other:'Otro' }

export default function FinancialsPage() {
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('month')
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('payments').select('id, amount, paid, type, payment_method, description, created_at, students(name)').order('created_at', { ascending:false })
      setPayments(data || [])
      setLoading(false)
    }
    load()
  }, [])

  const now = new Date()
  const filtered = payments.filter(p => {
    if (period==='all') return true
    const d = new Date(p.created_at)
    if (period==='month') return d.getMonth()===now.getMonth()&&d.getFullYear()===now.getFullYear()
    if (period==='year') return d.getFullYear()===now.getFullYear()
    return true
  })

  const income = filtered.filter(p=>p.paid&&p.type!=='expense').reduce((a,p)=>a+p.amount,0)
  const expenses = filtered.filter(p=>p.type==='expense').reduce((a,p)=>a+p.amount,0)
  const pending = filtered.filter(p=>!p.paid&&p.type!=='expense').reduce((a,p)=>a+p.amount,0)
  const net = income - expenses
  const byType: Record<string,number> = {}
  filtered.filter(p=>p.paid&&p.type!=='expense').forEach(p=>{ byType[p.type]=(byType[p.type]||0)+p.amount })
  const maxByType = Math.max(...Object.values(byType), 1)

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:700, color:'#0F172A', letterSpacing:'-0.4px' }}>Finanzas</h1>
          <p style={{ color:'#94A3B8', fontSize:13, marginTop:4 }}>Resumen financiero de TutorEnglishLM</p>
        </div>
        <div style={{ display:'flex', gap:4, background:'#F1F5F9', borderRadius:8, padding:3 }}>
          {[['month','Este mes'],['year','Este año'],['all','Todo']].map(([v,l])=>(
            <button key={v} onClick={()=>setPeriod(v)} style={{ padding:'6px 12px', borderRadius:6, border:'none', fontSize:12, cursor:'pointer', background:period===v?'#fff':'transparent', color:period===v?'#0F172A':'#64748B', fontWeight:period===v?500:400 }}>{l}</button>
          ))}
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:24 }}>
        {[
          { label:'Ingresos', value:`$${income.toLocaleString()}`, color:'#10B981', sub:'cobrados' },
          { label:'Gastos', value:`$${expenses.toLocaleString()}`, color:'#EF4444', sub:'registrados' },
          { label:'Por cobrar', value:`$${pending.toLocaleString()}`, color:'#F59E0B', sub:'pendientes' },
          { label:'Neto', value:`$${net.toLocaleString()}`, color:net>=0?'#10B981':'#EF4444', sub:'ingresos - gastos' },
        ].map(m=>(
          <div key={m.label} style={{ background:'#fff', borderRadius:12, padding:'20px', border:'1px solid #E2E8F0' }}>
            <div style={{ fontSize:11, fontWeight:600, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:10 }}>{m.label}</div>
            <div style={{ fontSize:26, fontWeight:700, color:m.color, letterSpacing:'-0.5px', marginBottom:4 }}>{m.value}</div>
            <div style={{ fontSize:11, color:'#94A3B8' }}>{m.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:24 }}>
        <div style={{ background:'#fff', borderRadius:12, padding:'20px', border:'1px solid #E2E8F0' }}>
          <div style={{ fontSize:14, fontWeight:600, color:'#0F172A', marginBottom:20 }}>Ingresos por tipo</div>
          {Object.keys(byType).length===0?<div style={{ color:'#94A3B8', fontSize:13, textAlign:'center', padding:'20px 0' }}>Sin ingresos en este periodo.</div>:
           Object.entries(byType).sort((a,b)=>b[1]-a[1]).map(([type,amount])=>(
            <div key={type} style={{ marginBottom:14 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                <span style={{ fontSize:12, color:'#475569' }}>{TYPE[type]||type}</span>
                <span style={{ fontSize:12, fontWeight:600, color:'#0F172A' }}>${(amount as number).toLocaleString()}</span>
              </div>
              <div style={{ height:6, background:'#F1F5F9', borderRadius:3, overflow:'hidden' }}>
                <div style={{ height:'100%', background:'#0F172A', borderRadius:3, width:`${Math.round((amount as number/maxByType)*100)}%` }} />
              </div>
            </div>
          ))}
        </div>

        <div style={{ background:'#fff', borderRadius:12, padding:'20px', border:'1px solid #E2E8F0' }}>
          <div style={{ fontSize:14, fontWeight:600, color:'#0F172A', marginBottom:20 }}>Resumen</div>
          {[
            { label:'Ingresos cobrados', value:income, color:'#10B981' },
            { label:'Gastos', value:expenses, color:'#EF4444' },
            { label:'Pagos pendientes', value:pending, color:'#F59E0B' },
          ].map(r=>(
            <div key={r.label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 0', borderBottom:'1px solid #F8FAFC' }}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <div style={{ width:8, height:8, borderRadius:'50%', background:r.color }} />
                <span style={{ fontSize:13, color:'#475569' }}>{r.label}</span>
              </div>
              <span style={{ fontSize:14, fontWeight:600, color:r.color }}>${r.value.toLocaleString()}</span>
            </div>
          ))}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'16px 0 0' }}>
            <span style={{ fontSize:14, fontWeight:600, color:'#0F172A' }}>Neto</span>
            <span style={{ fontSize:20, fontWeight:700, color:net>=0?'#10B981':'#EF4444', letterSpacing:'-0.4px' }}>${net.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div style={{ background:'#fff', borderRadius:12, border:'1px solid #E2E8F0', overflow:'hidden' }}>
        <div style={{ padding:'16px 20px', borderBottom:'1px solid #F1F5F9' }}>
          <div style={{ fontSize:14, fontWeight:600, color:'#0F172A' }}>Todos los movimientos</div>
        </div>
        {loading?<div style={{ padding:'2rem', textAlign:'center', color:'#94A3B8' }}>Cargando...</div>:
         filtered.length===0?<div style={{ padding:'3rem', textAlign:'center', color:'#94A3B8', fontSize:13 }}>Sin movimientos.</div>:(
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
            <thead><tr style={{ background:'#F8FAFC', borderBottom:'1px solid #E2E8F0' }}>
              {['Alumno','Tipo','Descripción','Método','Fecha','Monto'].map(h=>(
                <th key={h} style={{ textAlign:'left', padding:'10px 16px', fontSize:11, fontWeight:600, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'0.06em' }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>{filtered.map((p: any)=>(
              <tr key={p.id} style={{ borderBottom:'1px solid #F8FAFC' }}>
                <td style={{ padding:'11px 16px', fontWeight:500 }}>{p.students?.name||'—'}</td>
                <td style={{ padding:'11px 16px', color:'#64748B' }}>{TYPE[p.type]||p.type}</td>
                <td style={{ padding:'11px 16px', color:'#64748B' }}>{p.description||'—'}</td>
                <td style={{ padding:'11px 16px', color:'#64748B' }}>{p.payment_method==='cash'?'Efectivo':p.payment_method==='transfer'?'Transferencia':'—'}</td>
                <td style={{ padding:'11px 16px', color:'#94A3B8' }}>{new Date(p.created_at).toLocaleDateString('es-MX')}</td>
                <td style={{ padding:'11px 16px', fontWeight:700, color:p.type==='expense'?'#EF4444':'#10B981' }}>{p.type==='expense'?'-':'+'}${p.amount?.toLocaleString()}</td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>
    </div>
  )
}
