import React from 'react'
import { AdminHeader, AdminMobileNav, AdminFooter } from '@/components/admin'
import { adminNavigation } from '@/config/adminNavigation'

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <AdminHeader navigation={adminNavigation} />

      {/* Mobile Navigation */}
      <AdminMobileNav navigation={adminNavigation} />

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      <AdminFooter />
    </div>
  )
}

export default AdminLayout