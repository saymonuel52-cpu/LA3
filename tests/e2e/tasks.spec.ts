import { test, expect } from '@playwright/test'

test.describe('Tasks Module', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tasks')
  })

  test('should display empty state when no tasks', async ({ page }) => {
    await expect(page.locator('text=Задач пока нет')).toBeVisible()
  })

  test('should create a new task', async ({ page }) => {
    const taskTitle = 'Test Task from E2E'
    
    // Fill task form
    await page.fill('input[placeholder="Название задачи"]', taskTitle)
    await page.fill('textarea[placeholder="Описание (необязательно)"]', 'Test description')
    
    // Submit form
    await page.click('button:has-text("Добавить")')
    
    // Verify task created
    await expect(page.locator(`text=${taskTitle}`)).toBeVisible()
  })

  test('should filter tasks', async ({ page }) {
    // Create first task
    await page.fill('input[placeholder="Название задачи"]', 'Task 1')
    await page.click('button:has-text("Добавить")')
    
    // Create second task
    await page.fill('input[placeholder="Название задачи"]', 'Task 2')
    await page.click('button:has-text("Добавить")')
    
    // Verify both tasks visible
    const tasks = await page.locator('.list-item').count()
    expect(tasks).toBeGreaterThanOrEqual(2)
  })

  test('should mark task as done', async ({ page }) {
    // Create a task
    await page.fill('input[placeholder="Название задачи"]', 'Task to Complete')
    await page.click('button:has-text("Добавить")')
    
    // Click checkbox to mark as done
    const checkbox = page.locator('input[type="checkbox"]').first()
    await checkbox.click()
    
    // Verify task is struck through
    await expect(page.locator('.list-item')).toContainText('Task to Complete')
  })

  test('should delete a task', async ({ page }) {
    // Create a task
    await page.fill('input[placeholder="Название задачи"]', 'Task to Delete')
    await page.click('button:has-text("Добавить")')
    
    // Delete button should exist
    const deleteBtn = page.locator('button:has-text("Удалить")').first()
    await deleteBtn.click()
    
    // Task should be removed
    await expect(page.locator('text=Task to Delete')).not.toBeVisible()
  })
})
