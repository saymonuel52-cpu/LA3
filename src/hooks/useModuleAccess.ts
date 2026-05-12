import { useMemo } from 'react'
import { MODULE_CATALOG, getModuleById, ModuleCatalogItem } from '@/lib/module-catalog'
import { useUserStore, ModuleAccessStatus } from '@/stores/user-store'
import { useDashboardStore } from '@/stores/dashboard-store'

/**
 * Расширенный статус доступа с дополнительной информацией
 */
interface ModuleAccessResult {
  status: ModuleAccessStatus
  module?: ModuleCatalogItem
  price?: number
  subscriptionPrice?: number
  isCore: boolean
  requiresAuth: boolean
  hasRequested: boolean
  requestStatus?: 'pending' | 'approved' | 'rejected'
}

/**
 * Хук для проверки доступа к модулю
 * 
 * Возвращает статус доступа к модулю на основе:
 * - Идентификации пользователя
 * - Пройденного онбординга
 * - Разблокированных модулей
 * - Типа доступа модуля
 * 
 * @param moduleId - ID модуля из каталога
 * @returns Объект с информацией о доступе
 * 
 * @example
 * const { status, price, hasRequested } = useModuleAccess('finance')
 * 
 * if (status === 'available') {
 *   return <ModuleContent />
 * }
 * if (status === 'locked-paid') {
 *   return <PurchaseCard price={price} />
 * }
 */
export function useModuleAccess(moduleId: string): ModuleAccessResult {
  const { unlockedModules, isModuleUnlocked, getRequestsForModule } = useUserStore()
  const { dataMode } = useDashboardStore()
  
  const module = useMemo(() => getModuleById(moduleId), [moduleId])
  
  const result: ModuleAccessResult = useMemo(() => {
    if (!module) {
      return {
        status: 'unavailable',
        isCore: false,
        requiresAuth: false,
        hasRequested: false
      }
    }
    
    // Core модули всегда доступны
    if (module.isCore) {
      return {
        status: 'available',
        module,
        isCore: true,
        requiresAuth: module.requiresAuth ?? false,
        hasRequested: false
      }
    }
    
    // Если модуль уже разблокирован
    if (isModuleUnlocked(moduleId)) {
      return {
        status: 'available',
        module,
        isCore: false,
        requiresAuth: module.requiresAuth ?? false,
        hasRequested: false
      }
    }
    
    // Проверка заявок
    const requests = getRequestsForModule(moduleId)
    const pendingRequest = requests.find(r => r.status === 'pending')
    const approvedRequest = requests.find(r => r.status === 'approved')
    
    if (approvedRequest) {
      return {
        status: 'available',
        module,
        isCore: false,
        requiresAuth: module.requiresAuth ?? false,
        hasRequested: true,
        requestStatus: 'approved'
      }
    }
    
    if (pendingRequest) {
      return {
        status: 'locked-request',
        module,
        isCore: false,
        requiresAuth: module.requiresAuth ?? false,
        hasRequested: true,
        requestStatus: 'pending'
      }
    }
    
    // Проверка режима данных (демо до регистрации)
    const isDemoMode = dataMode === 'demo'
    
    if (isDemoMode) {
      // В демо-режиме показываем демо-статус для не-core модулей
      if (module.accessType === 'demo' || module.accessType === 'registration') {
        return {
          status: 'demo',
          module,
          isCore: false,
          requiresAuth: module.requiresAuth ?? false,
          hasRequested: false
        }
      }
      
      // Для платных модулей показываем locked-reg в демо
      if (module.accessType === 'paid' || module.accessType === 'request') {
        return {
          status: 'locked-reg',
          module,
          isCore: false,
          requiresAuth: module.requiresAuth ?? false,
          hasRequested: false
        }
      }
    }
    
    // Платные модули
    if (module.accessType === 'paid') {
      return {
        status: 'locked-paid',
        module,
        price: module.price,
        subscriptionPrice: module.subscriptionPrice,
        isCore: false,
        requiresAuth: module.requiresAuth ?? false,
        hasRequested: false
      }
    }
    
    // Модули по заявке
    if (module.accessType === 'request') {
      return {
        status: 'locked-request',
        module,
        isCore: false,
        requiresAuth: module.requiresAuth ?? false,
        hasRequested: false
      }
    }
    
    // Регистрационные модули
    if (module.accessType === 'registration') {
      return {
        status: 'locked-reg',
        module,
        isCore: false,
        requiresAuth: module.requiresAuth ?? false,
        hasRequested: false
      }
    }
    
    return {
      status: 'unavailable',
      module,
      isCore: false,
      requiresAuth: module.requiresAuth ?? false,
      hasRequested: false
    }
  }, [module, unlockedModules, dataMode, isModuleUnlocked, getRequestsForModule, moduleId])
  
  return result
}

/**
 * Хук для получения всех модулей с их статусами
 * 
 * @returns Массив модулей с информацией о доступе
 */
export function useAllModulesAccess() {
  const { unlockedModules, pendingRequests } = useUserStore()
  const { dataMode } = useDashboardStore()
  
  return useMemo(() => {
    return MODULE_CATALOG.map(module => {
      // Core модули
      if (module.isCore) {
        return {
          module,
          status: 'available' as ModuleAccessStatus,
          isCore: true
        }
      }
      
      // Разблокированные
      if (unlockedModules.includes(module.id)) {
        return {
          module,
          status: 'available' as ModuleAccessStatus,
          isCore: false
        }
      }
      
      // Заявки
      const requests = pendingRequests.filter(r => r.moduleId === module.id)
      const approvedRequest = requests.find(r => r.status === 'approved')
      const pendingRequest = requests.find(r => r.status === 'pending')
      
      if (approvedRequest) {
        return {
          module,
          status: 'available' as ModuleAccessStatus,
          isCore: false
        }
      }
      
      if (pendingRequest) {
        return {
          module,
          status: 'locked-request' as ModuleAccessStatus,
          isCore: false,
          requestStatus: 'pending'
        }
      }
      
      // Демо-режим
      if (dataMode === 'demo') {
        if (module.accessType === 'registration') {
          return {
            module,
            status: 'demo' as ModuleAccessStatus,
            isCore: false
          }
        }
      }
      
      // Платные
      if (module.accessType === 'paid') {
        return {
          module,
          status: 'locked-paid' as ModuleAccessStatus,
          price: module.price,
          subscriptionPrice: module.subscriptionPrice,
          isCore: false
        }
      }
      
      // Заявки
      if (module.accessType === 'request') {
        return {
          module,
          status: 'locked-request' as ModuleAccessStatus,
          isCore: false
        }
      }
      
      // Регистрация
      if (module.accessType === 'registration') {
        return {
          module,
          status: 'locked-reg' as ModuleAccessStatus,
          isCore: false
        }
      }
      
      return {
        module,
        status: 'unavailable' as ModuleAccessStatus,
        isCore: false
      }
    })
  }, [unlockedModules, pendingRequests, dataMode])
}
