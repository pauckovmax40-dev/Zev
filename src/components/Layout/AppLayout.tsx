import React from 'react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

interface AppLayoutProps {
  children: React.ReactNode
  title: string
  breadcrumbs?: { label: string; path: string }[]
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  title,
  breadcrumbs,
}) => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 lg:ml-64">
        <Header title={title} breadcrumbs={breadcrumbs} />
        <div className="p-4 lg:p-8">{children}</div>
      </main>
    </div>
  )
}
