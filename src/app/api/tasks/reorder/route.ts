// src/app/api/tasks/reorder/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Reorder tasks (for drag and drop functionality)
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get: (name) => cookieStore.get(name)?.value,
          set: (name, value, options) => {
            cookieStore.set({ name, value, ...options });
          },
          remove: (name, options) => {
            cookieStore.set({ name, value: '', ...options });
          },
        },
      }
    );

    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tasks } = await request.json();

    // Execute all updates in a transaction
    await prisma.$transaction(
      tasks.map((task: { id: string; position: number; severity?: string }) => {
        const updateData: any = { position: task.position };
        
        // Also update severity if it changed (moving between columns)
        if (task.severity) {
          updateData.severity = task.severity;
        }
        
        return prisma.task.update({
          where: { 
            id: task.id,
            userId: session.user.id
          },
          data: updateData,
        });
      })
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error reordering tasks:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}