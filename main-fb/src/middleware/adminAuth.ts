import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function validateAdminAccess() {
  const { userId } = await auth()
  
  if (!userId) {
    return { error: 'Unauthorized', status: 401 }
  }

  const user = await prisma.user.findUnique({ 
    where: { clerkId: userId },
    select: { role: true }
  })
  
  if (!user || !['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
    return { error: 'Forbidden - Admin access required', status: 403 }
  }

  return { user, userId }
}

export function createAdminHandler(handler: (req: Request, params?: any) => Promise<Response>) {
  return async (req: Request, params?: any) => {
    const validation = await validateAdminAccess()
    
    if ('error' in validation) {
      return NextResponse.json({ error: validation.error }, { status: validation.status })
    }

    return handler(req, params)
  }
}