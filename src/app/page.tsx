// src/app/page.tsx
import Link from 'next/link';
import { CheckSquare, ArrowRight, Check } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <CheckSquare className="h-8 w-8 text-blue-500" />
              <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">TaskFlow</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                Log in
              </Link>
              <Link href="/signup" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <div className="relative bg-white dark:bg-gray-900 overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="relative z-10 pb-8 bg-white dark:bg-gray-900 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
              <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
                <div className="sm:text-center lg:text-left">
                  <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
                    <span className="block">Manage your tasks</span>
                    <span className="block text-blue-600 dark:text-blue-400">with ease and style</span>
                  </h1>
                  <p className="mt-3 text-base text-gray-500 dark:text-gray-400 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                    TaskFlow helps you organize your tasks, track your progress, and boost your productivity 
                    with a beautiful and intuitive interface. Earn streaks and badges as you complete tasks!
                  </p>
                  <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                    <div className="rounded-md shadow">
                      <Link href="/signup" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10">
                        Get started
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Link>
                    </div>
                    <div className="mt-3 sm:mt-0 sm:ml-3">
                      <Link href="/login" className="w-full flex items-center justify-center px-8 py-3 border border-gray-300 dark:border-gray-600 text-base font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 md:py-4 md:text-lg md:px-10">
                        Log in
                      </Link>
                    </div>
                  </div>
                </div>
              </main>
            </div>
          </div>
          <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2 bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center p-8">
            <div className="rounded-lg shadow-xl bg-white dark:bg-gray-800 p-6 max-w-md w-full">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Your Tasks</h3>
              <div className="space-y-3">
                {[
                  { text: 'Complete project proposal', done: true },
                  { text: 'Review client feedback', done: true },
                  { text: 'Schedule team meeting', done: false },
                  { text: 'Update documentation', done: false },
                ].map((task, index) => (
                  <div key={index} className="flex items-start">
                    <div className={`flex-shrink-0 h-5 w-5 rounded-full border flex items-center justify-center ${
                      task.done 
                        ? 'bg-green-500 border-green-500' 
                        : 'border-gray-300 dark:border-gray-600'
                    }`}>
                      {task.done && <Check className="h-3 w-3 text-white" />}
                    </div>
                    <span className={`ml-2 text-gray-700 dark:text-gray-300 ${
                      task.done ? 'line-through text-gray-500 dark:text-gray-500' : ''
                    }`}>
                      {task.text}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                  <span>2/4 completed</span>
                  <div className="h-2 w-24 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: '50%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-12 bg-gray-50 dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:text-center">
              <h2 className="text-base text-blue-600 dark:text-blue-400 font-semibold tracking-wide uppercase">Features</h2>
              <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                Everything you need to stay organized
              </p>
              <p className="mt-4 max-w-2xl text-xl text-gray-500 dark:text-gray-400 lg:mx-auto">
                TaskFlow combines powerful features with a beautiful design to help you manage your tasks efficiently.
              </p>
            </div>

            <div className="mt-10">
              <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
                {[
                  {
                    title: 'Severity-Based Organization',
                    description: 'Organize your tasks by severity level with color-coded labels for easy identification.'
                  },
                  {
                    title: 'Drag and Drop Reordering',
                    description: 'Easily prioritize tasks by dragging and dropping them within or across severity levels.'
                  },
                  {
                    title: 'Streaks and Rewards',
                    description: 'Stay motivated with streaks and badges as you consistently complete your tasks.'
                  },
                  {
                    title: 'AI-Powered Suggestions',
                    description: 'Get smart task prioritization suggestions based on due dates and severity levels.'
                  },
                ].map((feature, index) => (
                  <div key={index} className="relative">
                    <div className="absolute h-12 w-12 rounded-md bg-blue-500 flex items-center justify-center">
                      <Check className="h-6 w-6 text-white" />
                    </div>
                    <p className="ml-16 text-lg leading-6 font-medium text-gray-900 dark:text-white">
                      {feature.title}
                    </p>
                    <p className="mt-2 ml-16 text-base text-gray-500 dark:text-gray-400">
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <CheckSquare className="h-6 w-6 text-blue-500" />
              <span className="ml-2 text-lg font-bold text-gray-900 dark:text-white">TaskFlow</span>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              © {new Date().getFullYear()} TaskFlow. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}