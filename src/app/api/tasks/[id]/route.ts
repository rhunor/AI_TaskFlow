// src/app/api/tasks/[id]/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Get a specific task
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    const task = await prisma.task.findUnique({
      where: { 
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error('Error fetching task:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// Update a task
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    // Check if task exists and belongs to the user
    const existingTask = await prisma.task.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!existingTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const updates = await request.json();
    
    // Handle completion status change
    if (updates.isCompleted && !existingTask.isCompleted) {
      updates.completedAt = new Date();
      
      // Update user streak if task is completed
      await updateUserStreak(session.user.id);
    } else if (!updates.isCompleted && existingTask.isCompleted) {
      updates.completedAt = null;
    }

    const task = await prisma.task.update({
      where: { id: params.id },
      data: updates,
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// Delete a task
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    // Check if task exists and belongs to the user
    const existingTask = await prisma.task.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!existingTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    await prisma.task.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// Helper function to update user streak
async function updateUserStreak(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const userStreak = await prisma.streak.findUnique({
    where: { userId },
  });

  if (!userStreak) {
    // Create new streak if it doesn't exist
    await prisma.streak.create({
      data: {
        userId,
        currentStreak: 1,
        longestStreak: 1,
        lastActiveDate: today,
      },
    });
    return;
  }

  let { currentStreak, longestStreak, lastActiveDate } = userStreak;
  
  // Initialize if first time
  if (!lastActiveDate) {
    await prisma.streak.update({
      where: { userId },
      data: {
        currentStreak: 1,
        longestStreak: 1,
        lastActiveDate: today,
      },
    });
    return;
  }

  // Convert to date objects for comparison
  const lastActive = new Date(lastActiveDate);
  lastActive.setHours(0, 0, 0, 0);
  
  // Calculate date difference
  const diffTime = Math.abs(today.getTime() - lastActive.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  // If already logged in today, do nothing
  if (diffDays === 0) {
    return;
  }
  
  // If consecutive day, increment streak
  if (diffDays === 1) {
    currentStreak += 1;
    // Update longest streak if current is longer
    if (currentStreak > longestStreak) {
      longestStreak = currentStreak;
    }
  } else {
    // Streak broken
    currentStreak = 1;
  }
  
  // Update streak in database
  await prisma.streak.update({
    where: { userId },
    data: {
      currentStreak,
      longestStreak,
      lastActiveDate: today,
    },
  });
  
  // Check for streak badges
  await checkAndAwardStreakBadges(userId, currentStreak);
}

// Award badges based on streaks
async function checkAndAwardStreakBadges(userId: string, currentStreak: number) {
  const streakBadges = [
    { threshold: 3, name: "3-Day Streak", description: "Completed tasks for 3 consecutive days" },
    { threshold: 7, name: "Week Warrior", description: "Completed tasks for 7 consecutive days" },
    { threshold: 30, name: "Monthly Master", description: "Completed tasks for 30 consecutive days" }
  ];
  
  for (const badge of streakBadges) {
    if (currentStreak === badge.threshold) {
      // Check if user already has this badge
      const existingBadge = await prisma.badge.findFirst({
        where: {
          userId,
          name: badge.name
        }
      });
      
      if (!existingBadge) {
        await prisma.badge.create({
          data: {
            userId,
            name: badge.name,
            description: badge.description,
            imageUrl: `/badges/${badge.name.toLowerCase().replace(/\s+/g, '-')}.svg`
          }
        });
      }
    }
  }
}