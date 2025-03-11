// src/lib/ai.ts
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type Task = {
  id: string;
  title: string;
  description: string | null;
  dueDate: Date | null;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  isCompleted: boolean;
};

export async function getPrioritySuggestions(tasks: Task[]) {
  try {
    // Skip if there are no tasks or OpenAI API key is not set
    if (tasks.length === 0 || !process.env.OPENAI_API_KEY) {
      return [];
    }

    // Filter only incomplete tasks
    const incompleteTasks = tasks.filter(task => !task.isCompleted);
    
    if (incompleteTasks.length === 0) {
      return [];
    }

    // Format tasks for the prompt
    const tasksData = incompleteTasks.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description || '',
      dueDate: task.dueDate ? task.dueDate.toISOString() : 'No due date',
      severity: task.severity,
    }));

    // Create a prompt for the AI
    const prompt = `
      You are an AI assistant that helps users prioritize their tasks.
      Based on the following tasks, suggest which 3 tasks should be prioritized today.
      Consider due dates (prioritize tasks due soon), severity levels, and provide a brief reason for each suggestion.
      
      Tasks: ${JSON.stringify(tasksData, null, 2)}
      
      Respond with a JSON array containing objects with the following structure:
      [
        {
          "id": "task-id",
          "reason": "Brief explanation of why this task should be prioritized"
        }
      ]
      
      Only include the JSON in your response, nothing else.
    `;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
      max_tokens: 500,
    });

    // Parse the response
    const content = completion.choices[0]?.message?.content?.trim() || '';
    const suggestions = JSON.parse(content);

    // Match suggestions with the original tasks and return them
    return suggestions.map((suggestion: { id: string; reason: string }) => {
      const task = tasks.find(t => t.id === suggestion.id);
      return {
        ...task,
        reason: suggestion.reason,
      };
    });
  } catch (error) {
    console.error('Error getting AI suggestions:', error);
    return [];
  }
}

