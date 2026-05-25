'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import Link from 'next/link'

function StatCard({ label, value, sub, color, icon }: any) {
  return (
    <div style={{ background:'#fff', borderRadius:12, padding:'20px 24px', border:'1px solid #E2E8F0' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
        <div style={{ fontSize:12, fontWeight:500, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'0.06em' }}>{label}</div>
        <div style={{ width:32, height:32, borderRadius:8, background:'#F1F5F9', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <i className={`ti ${icon}`} style={{ fontSize:16, color:'#64748B' }} aria-hidden="true" />
        </div>
      </div>
      <div style={{ fontSize:28, fontWeight:700, color:color||'#0F172A', letterSpacing:'-0.5px', marginBottom:4 }}>{value}</div>
      {sub && <div style={{ fontSize:12, color:'#94A3B8' }}>{sub}</div>}
    </div>
  )
}

export default function Dashboard() {
  const [data, setData] = useState({ activeStudents:0, totalClasses:0, collected:0, pending:0, newLeads:0 })
  const [recentLeads, setRecentLeads] = useState<any[]>([])
  const [recentPayments, setRecentPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const [
        { count: activeStudents },
        { count: totalClasses },
        { data: payments },
        { count: newLeads },
        { data: leads },
        { data: recentPay },
      ] = await Promise.all([
        supabase.from('students').select('*', { count:'exact', head:true }).eq('status','active'),
        supabase.from('classes').select('*', { count:'exact', head:true }).eq('status','active'),
        supabase.from('payments').select('amount, paid, type'),
        supabase.from('leads').select('*', { count:'exact', head:true }).eq('status','new'),
        supabase.from('leads').select('id, student_name, parent_name, parent_phone, level, status, created_at').eq('status','new').order('created_at', { ascending:false }).limit(4),
        supabase.from('payments').select('id, amount, paid, type, description, created_at, students(name)').order('created_at', { ascending:false }).limit(5),
      ])
      const p = payments || []
      setData({
        activeStudents: activeStudents ?? 0,
        totalClasses: totalClasses ?? 0,
        collected: p.filter(x => x.paid && x.type !== 'expense').reduce((a, x) => a + x.amount, 0),
        pending: p.filter(x => !x.paid && x.type !== 'expense').reduce((a, x) => a + x.amount, 0),
        newLeads: newLeads ?? 0,
      })
      setRecentLeads(leads || [])
      setRecentPayments(recentPay || [])
      setLoading(false)
    }
    load()
  }, [])

  const levelLabel: Record<string,string> = { basic:'Básico', intermediate:'Intermedio', advanced:'Avanzado' }

  if (loading) return <div style={{ color:'#94A3B8', padding:'2rem' }}>Cargando...</div>

  return (
    <div>
      <div style={{ marginBottom:28 }}>
        <h1 style={{ fontSize:22, fontWeight:700, color:'#0F172A', letterSpacing:'-0.4px' }}>Dashboard</h1>
        <p style={{ color:'#94A3B8', fontSize:13, marginTop:4 }}>{new Date().toLocaleDateString('es-MX', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}</p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(160px, 1fr))', gap:16, marginBottom:28 }}>
        <StatCard label="Alumnos activos" value={data.activeStudents} sub="en clases" icon="ti-users" />
        <StatCard label="Clases activas" value={data.totalClasses} sub="grupales y 1:1" icon="ti-book" />
        <StatCard label="Cobrado" value={`$${data.collected.toLocaleString()}`} sub="ingresos confirmados" color="#10B981" icon="ti-trending-up" />
        <StatCard label="Por cobrar" value={`$${data.pending.toLocaleString()}`} sub="pagos pendientes" color={data.pending > 0 ? '#EF4444' : '#0F172A'} icon="ti-clock" />
        <StatCard label="Solicitudes nuevas" value={data.newLeads} sub="sin contactar" color={data.newLeads > 0 ? '#F59E0B' : '#0F172A'} icon="ti-user-plus" />
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
        <div style={{ background:'#fff', borderRadius:12, border:'1px solid #E2E8F0', overflow:'hidden' }}>
          <div style={{ padding:'16px 20px', borderBottom:'1px solid #F1F5F9', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div style={{ fontSize:14, fontWeight:600, color:'#0F172A' }}>Solicitudes recientes</div>
            <Link href="/admin/leads" style={{ fontSize:12, color:'#F59E0B', textDecoration:'none', fontWeight:500 }}>Ver todas →</Link>
          </div>
          <div style={{ padding:'8px 0' }}>
            {recentLeads.length === 0 ? (
              <div style={{ padding:'24px 20px', textAlign:'center', color:'#94A3B8', fontSize:13 }}>Sin solicitudes nuevas</div>
            ) : recentLeads.map((l: any) => (
              <div key={l.id} style={{ padding:'12px 20px', borderBottom:'1px solid #F8FAFC', display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:34, height:34, borderRadius:'50%', background:'#FEF3C7', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:600, color:'#D97706', flexShrink:0 }}>
                  {l.student_name?.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13, fontWeight:500, color:'#0F172A', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{l.student_name}</div>
                  <div style={{ fontSize:12, color:'#94A3B8' }}>{l.parent_name} · {l.parent_phone}</div>
                </div>
                {l.level && <span style={{ fontSize:11, padding:'2px 8px', borderRadius:20, background:'#F1F5F9', color:'#64748B', flexShrink:0 }}>{levelLabel[l.level] || l.level}</span>}
              </div>
            ))}
          </div>
        </div>

        <div style={{ background:'#fff', borderRadius:12, border:'1px solid #E2E8F0', overflow:'hidden' }}>
          <div style={{ padding:'16px 20px', borderBottom:'1px solid #F1F5F9', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div style={{ fontSize:14, fontWeight:600, color:'#0F172A' }}>Actividad de pagos</div>
            <Link href="/admin/payments" style={{ fontSize:12, color:'#F59E0B', textDecoration:'none', fontWeight:500 }}>Ver todos →</Link>
          </div>
          <div style={{ padding:'8px 0' }}>
            {recentPayments.length === 0 ? (
              <div style={{ padding:'24px 20px', textAlign:'center', color:'#94A3B8', fontSize:13 }}>Sin pagos registrados</div>
            ) : recentPayments.map((p: any) => (
              <div key={p.id} style={{ padding:'12px 20px', borderBottom:'1px solid #F8FAFC', display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:34, height:34, borderRadius:'50%', background:p.paid?'#ECFDF5':'#FEF2F2', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <i className={`ti ${p.type === 'expense' ? 'ti-arrow-down' : 'ti-arrow-up'}`} style={{ fontSize:15, color:p.type==='expense'?'#EF4444':'#10B981' }} aria-hidden="true" />
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13, fontWeight:500, color:'#0F172A', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.students?.name || 'Gasto'}</div>
                  <div style={{ fontSize:12, color:'#94A3B8' }}>{p.description || p.type}</div>
                </div>
                <div style={{ fontSize:14, fontWeight:600, color:p.type==='expense'?'#EF4444':'#10B981', flexShrink:0 }}>
                  {p.type==='expense'?'-':'+'}${p.amount?.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
