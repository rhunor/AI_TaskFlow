// src/app/api/tasks/suggestions/route.ts - Fixed version
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getPrioritySuggestions } from '@/lib/ai';

export async function GET(request: Request) {
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

    // Use getUser instead of getSession
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all incomplete tasks for the user
    const tasks = await prisma.task.findMany({
      where: {
        userId: user.id,
        isCompleted: false
      }
    });

    // If OpenAI API key is not set, return empty suggestions
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json([]);
    }

    // Get AI suggestions (if there are tasks)
    const suggestions = tasks.length > 0 ? await getPrioritySuggestions(tasks) : [];

    return NextResponse.json(suggestions);
  } catch (error) {
    console.error('Error fetching task suggestions:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}