'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { db } from '@/lib/db/database'

interface Profile {
  id: string
  name: string
  icon: string
  description: string
  modules: string[]
  color: string
}

const PROFILES: Profile[] = [
  {
    id: 'freelancer',
    name: 'Фрилансер',
    icon: '💻',
    description: 'Управление задачами, финансами и клиентами',
    modules: ['dashboard', 'tasks', 'finance', 'crm', 'appointments'],
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'beauty',
    name: 'Салон красоты',
    icon: '💇',
    description: 'Запись клиентов, процедуры, финансы',
    modules: ['dashboard', 'appointments', 'finance', 'calendar', 'crm'],
    color: 'from-pink-500 to-rose-500'
  },
  {
    id: 'fitness',
    name: 'Фитнес-тренер',
    icon: '💪',
    description: 'Записи, здоровье, расписание',
    modules: ['dashboard', 'appointments', 'health', 'calendar', 'tasks'],
    color: 'from-green-500 to-emerald-500'
  },
  {
    id: 'student',
    name: 'Студент',
    icon: '📚',
    description: 'Учеба, задачи, заметки',
    modules: ['dashboard', 'tasks', 'notes', 'calendar', 'finance'],
    color: 'from-purple-500 to-indigo-500'
  }
]

export default function OnboardingWizard() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    checkCompleted()
  }, [])

  async function checkCompleted() {
    const completed = await db.settings.where('key').equals('onboarding_completed').first()
    if (completed) {
      router.push('/dashboard')
    }
  }

  async function selectProfile(profile: Profile) {
    setSelectedProfile(profile)
    setStep(2)
  }

  async function completeOnboarding() {
    if (!selectedProfile) return
    
    setLoading(true)
    try {
      const userId = crypto.randomUUID()
      
      // Create default workspaces
      const contexts = ['home', 'work'] as const
      for (const context of contexts) {
        await db.workspaces.add({
          id: crypto.randomUUID(),
          user_id: userId,
          name: context === 'home' ? 'Личное' : 'Работа',
          context,
          icon: context === 'home' ? '🏠' : '💼',
          color: context === 'home' ? '#3b82f6' : '#10b981',
          is_default: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          sync_version: 0,
        } as any)
      }

      // Configure modules based on profile
      for (const moduleId of selectedProfile.modules) {
        await db.moduleConfigs.add({
          id: crypto.randomUUID(),
          user_id: userId,
          module_id: moduleId,
          enabled: true,
          position: selectedProfile.modules.indexOf(moduleId),
          config: { visibleInMobile: selectedProfile.modules.indexOf(moduleId) < 5 },
          context_visibility: { home: true, work: true, study: true },
          last_used: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as any)
      }

      // Mark onboarding as completed
      await db.settings.add({
        id: crypto.randomUUID(),
        user_id: userId,
        key: 'onboarding_completed',
        value: { profile: selectedProfile.id, completed_at: new Date().toISOString() },
        context: 'home',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        sync_version: 0,
      } as any)

      router.push('/dashboard')
    } catch (error) {
      console.error('Onboarding failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {step === 1 && (
          <div className="text-center mb-8 animate-fade-in">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mx-auto mb-6 shadow-2xl">
              <span className="text-4xl text-white font-bold">L</span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">
              Добро пожаловать в LAD 2
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Ваша персональная операционная система
            </p>
            
            <button
              onClick={() => setStep(2)}
              className="px-8 py-4 text-lg font-semibold rounded-xl text-white transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
              style={{
                background: 'linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)',
              }}
            >
              Начать настройку →
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-8 animate-slide-up">
            <h2 className="text-2xl font-bold mb-2 dark:text-white">Кто вы?</h2>
            <p className="text-secondary mb-6">Выберите профиль для быстрой настройки</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {PROFILES.map((profile) => (
                <button
                  key={profile.id}
                  onClick={() => selectProfile(profile)}
                  className="card p-6 text-left hover:scale-105 transition-all"
                  style={{
                    border: selectedProfile?.id === profile.id ? '3px solid #8B5CF6' : '2px solid #E2E8F0',
                  }}
                >
                  <div className={`text-4xl mb-3`}>{profile.icon}</div>
                  <h3 className="font-semibold text-lg mb-1 dark:text-white">{profile.name}</h3>
                  <p className="text-sm text-secondary">{profile.description}</p>
                </button>
              ))}
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setStep(1)}
                className="btn btn-secondary flex-1"
              >
                Назад
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!selectedProfile}
                className="flex-1 font-semibold py-3 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: selectedProfile 
                    ? 'linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)' 
                    : '#CBD5E1',
                  color: 'white',
                }}
              >
                Продолжить →
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-8 animate-slide-up">
            <h2 className="text-2xl font-bold mb-2 dark:text-white">
              {selectedProfile?.icon} {selectedProfile?.name}
            </h2>
            <p className="text-secondary mb-6">
              Настроим приложение для ваших задач
            </p>

            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                <span className="text-green-500 text-xl">✓</span>
                <span className="dark:text-white">Добавлены модули: {selectedProfile?.modules.length}</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                <span className="text-green-500 text-xl">✓</span>
                <span className="dark:text-white">Созданы рабочие пространства</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <span className="text-blue-500 text-xl">⚙️</span>
                <span className="dark:text-white">Настроена мобильная навигация</span>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full"></div>
                <span className="ml-3 dark:text-white">Настройка...</span>
              </div>
            ) : (
              <button
                onClick={completeOnboarding}
                className="w-full font-semibold py-4 text-lg rounded-xl text-white transition-all shadow-lg hover:shadow-xl"
                style={{
                  background: 'linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)',
                }}
              >
                Готово! Открыть приложение →
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
