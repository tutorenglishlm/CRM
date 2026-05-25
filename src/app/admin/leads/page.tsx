'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-client'

const STATUS: Record<string,{label:string,bg:string,color:string,dot:string}> = {
  new: { label:'Nuevo', bg:'#FEF3C7', color:'#D97706', dot:'#F59E0B' },
  contacted: { label:'Contactado', bg:'#EFF6FF', color:'#1D4ED8', dot:'#3B82F6' },
  enrolled: { label:'Inscrito', bg:'#ECFDF5', color:'#065F46', dot:'#10B981' },
  not_interested: { label:'No interesado', bg:'#FEF2F2', color:'#991B1B', dot:'#EF4444' },
}
const LEVEL: Record<string,string> = { basic:'Básico', intermediate:'Intermedio', advanced:'Avanzado' }
const CTYPE: Record<string,string> = { one_on_one:'1 a 1', group:'Grupal', both:'Cualquiera' }

export default function LeadsPage() {
  const [leads, setLeads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState<any>(null)
  const supabase = createClient()

  async function load() {
    const { data } = await supabase.from('leads').select('*').order('created_at', { ascending:false })
    setLeads(data || [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  async function updateStatus(id: string, status: string) {
    await supabase.from('leads').update({ status }).eq('id', id)
    setLeads(l=>l.map(x=>x.id===id?{...x,status}:x))
    if (selected?.id===id) setSelected((s:any)=>({...s,status}))
  }

  const filtered = filter==='all'?leads:leads.filter(l=>l.status===filter)
  const newCount = leads.filter(l=>l.status==='new').length

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <h1 style={{ fontSize:22, fontWeight:700, color:'#0F172A', letterSpacing:'-0.4px' }}>Solicitudes</h1>
            {newCount>0&&<span style={{ background:'#F59E0B', color:'#0F172A', fontSize:12, fontWeight:700, padding:'2px 8px', borderRadius:20 }}>{newCount}</span>}
          </div>
          <p style={{ color:'#94A3B8', fontSize:13, marginTop:4 }}>Interesados que completaron el formulario</p>
        </div>
        <a href="/inscripcion" target="_blank" style={{ display:'flex', alignItems:'center', gap:6, padding:'9px 16px', borderRadius:8, background:'#0F172A', color:'#fff', textDecoration:'none', fontSize:13, fontWeight:500 }}>
          <i className="ti ti-external-link" style={{ fontSize:15 }} aria-hidden="true" /> Ver formulario
        </a>
      </div>

      <div style={{ display:'flex', gap:6, marginBottom:20 }}>
        {[['all','Todos'],['new','Nuevos'],['contacted','Contactados'],['enrolled','Inscritos'],['not_interested','No interesados']].map(([f,l])=>(
          <button key={f} onClick={()=>setFilter(f)} style={{ padding:'6px 14px', borderRadius:20, border:`1px solid ${filter===f?'#0F172A':'#E2E8F0'}`, fontSize:12, cursor:'pointer', background:filter===f?'#0F172A':'#fff', color:filter===f?'#fff':'#64748B', fontWeight:filter===f?500:400 }}>{l}</button>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:selected?'1fr 360px':'1fr', gap:20 }}>
        <div style={{ background:'#fff', borderRadius:12, border:'1px solid #E2E8F0', overflow:'hidden' }}>
          {loading?<div style={{ padding:'2rem', color:'#94A3B8', textAlign:'center' }}>Cargando...</div>:
           filtered.length===0?<div style={{ padding:'3rem', color:'#94A3B8', textAlign:'center', fontSize:13 }}>Sin solicitudes.</div>:(
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ background:'#F8FAFC', borderBottom:'1px solid #E2E8F0' }}>
                  {['Estudiante','Contacto','Nivel','Tipo','Estado','Fecha',''].map(h=>(
                    <th key={h} style={{ textAlign:'left', padding:'10px 16px', fontSize:11, fontWeight:600, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'0.06em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((l:any)=>{
                  const s=STATUS[l.status as keyof typeof STATUS]||STATUS.new
                  return (
                    <tr key={l.id} onClick={()=>setSelected(selected?.id===l.id?null:l)} style={{ borderBottom:'1px solid #F8FAFC', cursor:'pointer', background:selected?.id===l.id?'#F8FAFC':'transparent' }}>
                      <td style={{ padding:'12px 16px' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                          <div style={{ width:30, height:30, borderRadius:'50%', background:'#FEF3C7', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:600, color:'#D97706', flexShrink:0 }}>{l.student_name?.charAt(0)}</div>
                          <span style={{ fontSize:13, fontWeight:500, color:'#0F172A' }}>{l.student_name}</span>
                        </div>
                      </td>
                      <td style={{ padding:'12px 16px' }}>
                        <div style={{ fontSize:12, color:'#0F172A' }}>{l.parent_name}</div>
                        <div style={{ fontSize:11, color:'#94A3B8' }}>{l.parent_phone}</div>
                      </td>
                      <td style={{ padding:'12px 16px' }}><span style={{ fontSize:11, padding:'2px 8px', borderRadius:20, background:'#F1F5F9', color:'#475569' }}>{LEVEL[l.level]||'—'}</span></td>
                      <td style={{ padding:'12px 16px', fontSize:12, color:'#64748B' }}>{CTYPE[l.class_type]||'—'}</td>
                      <td style={{ padding:'12px 16px' }}>
                        <span style={{ display:'inline-flex', alignItems:'center', gap:5, fontSize:11, padding:'3px 10px', borderRadius:20, background:s.bg, color:s.color, fontWeight:500 }}>
                          <span style={{ width:5, height:5, borderRadius:'50%', background:s.dot }} />{s.label}
                        </span>
                      </td>
                      <td style={{ padding:'12px 16px', fontSize:11, color:'#94A3B8' }}>{new Date(l.created_at).toLocaleDateString('es-MX')}</td>
                      <td style={{ padding:'12px 16px' }} onClick={e=>e.stopPropagation()}>
                        {l.parent_phone&&(
                          <a href={`https://wa.me/${l.parent_phone.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer" style={{ width:30, height:30, borderRadius:8, background:'#ECFDF5', display:'inline-flex', alignItems:'center', justifyContent:'center', textDecoration:'none', fontSize:14 }}>💬</a>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        {selected&&(
          <div style={{ background:'#fff', borderRadius:12, border:'1px solid #E2E8F0', padding:'20px', alignSelf:'start' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <div style={{ fontSize:14, fontWeight:600, color:'#0F172A' }}>Detalle</div>
              <button onClick={()=>setSelected(null)} style={{ background:'none', border:'none', cursor:'pointer', color:'#94A3B8', padding:4 }}>
                <i className="ti ti-x" style={{ fontSize:16 }} aria-hidden="true" />
              </button>
            </div>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', marginBottom:20 }}>
              <div style={{ width:52, height:52, borderRadius:'50%', background:'#FEF3C7', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, fontWeight:700, color:'#D97706', marginBottom:10 }}>{selected.student_name?.charAt(0)}</div>
              <div style={{ fontSize:15, fontWeight:600, color:'#0F172A' }}>{selected.student_name}</div>
              {selected.student_age&&<div style={{ fontSize:12, color:'#94A3B8', marginTop:2 }}>{selected.student_age} años</div>}
            </div>

            {[
              { label:'Tutor / Padre', value:selected.parent_name, icon:'ti-user' },
              { label:'Teléfono', value:selected.parent_phone, icon:'ti-phone' },
              { label:'Correo', value:selected.parent_email||'—', icon:'ti-mail' },
              { label:'Nivel', value:LEVEL[selected.level]||'—', icon:'ti-book' },
              { label:'Tipo de clase', value:CTYPE[selected.class_type]||'—', icon:'ti-calendar' },
            ].map(r=>(
              <div key={r.label} style={{ display:'flex', gap:10, padding:'8px 0', borderBottom:'1px solid #F8FAFC', alignItems:'flex-start' }}>
                <i className={`ti ${r.icon}`} style={{ fontSize:14, color:'#94A3B8', marginTop:1, flexShrink:0 }} aria-hidden="true" />
                <div>
                  <div style={{ fontSize:10, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:1 }}>{r.label}</div>
                  <div style={{ fontSize:13, color:'#0F172A' }}>{r.value}</div>
                </div>
              </div>
            ))}

            {selected.parent_phone&&(
              <a href={`https://wa.me/${selected.parent_phone.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'10px', borderRadius:8, background:'#ECFDF5', border:'1px solid #A7F3D0', color:'#065F46', textDecoration:'none', fontSize:13, fontWeight:500, marginTop:16, width:'100%' }}>
                💬 Contactar por WhatsApp
              </a>
            )}

            {selected.availability&&<div style={{ marginTop:12, padding:'10px 12px', background:'#F8FAFC', borderRadius:8, fontSize:12, color:'#64748B' }}><div style={{ fontSize:10, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:4 }}>Disponibilidad</div>{selected.availability}</div>}
            {selected.notes&&<div style={{ marginTop:8, padding:'10px 12px', background:'#F8FAFC', borderRadius:8, fontSize:12, color:'#64748B' }}><div style={{ fontSize:10, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:4 }}>Notas</div>{selected.notes}</div>}

            <div style={{ marginTop:16 }}>
              <div style={{ fontSize:11, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>Actualizar estado</div>
              <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                {Object.entries(STATUS).map(([key,val])=>(
                  <button key={key} onClick={()=>updateStatus(selected.id,key)} style={{ padding:'8px 12px', borderRadius:8, fontSize:12, cursor:'pointer', textAlign:'left', fontWeight:selected.status===key?600:400, border:`1px solid ${selected.status===key?val.dot:'#E2E8F0'}`, background:selected.status===key?val.bg:'#fff', color:selected.status===key?val.color:'#64748B', display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ width:6, height:6, borderRadius:'50%', background:selected.status===key?val.dot:'#CBD5E1', flexShrink:0 }} />{val.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
