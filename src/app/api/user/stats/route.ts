// src/app/api/user/stats/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET() {
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

    // Get user streak info
    const streak = await prisma.streak.findUnique({
      where: { userId: session.user.id },
    });

    // Get user badges
    const badges = await prisma.badge.findMany({
      where: { userId: session.user.id },
      orderBy: { earnedAt: 'desc' },
    });

    // Get task stats
    const totalTasks = await prisma.task.count({
      where: { userId: session.user.id },
    });

    const completedTasks = await prisma.task.count({
      where: { 
        userId: session.user.id,
        isCompleted: true,
      },
    });

    // Get tasks completed this week
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const tasksThisWeek = await prisma.task.count({
      where: {
        userId: session.user.id,
        isCompleted: true,
        completedAt: {
          gte: startOfWeek,
        },
      },
    });

    return NextResponse.json({
      streak,
      badges,
      stats: {
        totalTasks,
        completedTasks,
        completionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
        tasksThisWeek,
      },
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}