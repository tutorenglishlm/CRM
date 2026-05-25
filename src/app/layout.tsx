import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'TutorEnglishLM CRM',
  description: 'Sistema de gestión — Curso Intensivo de Inglés',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
