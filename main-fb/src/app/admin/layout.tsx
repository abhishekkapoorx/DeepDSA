import React from 'react'
import { AdminNavbar } from '@/components/navbar'

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-background">
      {/* Admin Navbar */}
      <AdminNavbar />

      {/* Main Content */}
      <main className="pt-16">{children}</main>
    </div>
  )
}

export default AdminLayout