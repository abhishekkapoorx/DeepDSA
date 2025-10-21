import { LayoutDashboard, Code, Users, BarChart3, Settings, BookOpen, Trophy } from 'lucide-react'

export const adminNavigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Problems', href: '/admin/problems', icon: Code },
  { name: 'Contests', href: '/admin/contests', icon: Trophy },
  { name: 'Editorials', href: '/admin/editorials', icon: BookOpen },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
] 