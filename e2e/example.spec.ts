import { test, expect } from '@playwright/test'

test.describe('ImmoKey E2E Tests', () => {
  test('should load homepage', async ({ page }) => {
    await page.goto('/')
    
    // Vérifier que la page se charge
    await expect(page).toHaveTitle(/ImmoKey/i)
    
    // Vérifier la présence d'éléments clés
    await expect(page.getByRole('heading', { name: /trouvez votre logement/i })).toBeVisible()
  })

  test('should navigate to search page', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Cliquer sur le lien de recherche (peut être dans le header)
    const searchLink = page.getByRole('link', { name: /rechercher/i }).first()
    await searchLink.click({ timeout: 5000 })
    
    // Vérifier qu'on est sur la page de recherche
    await expect(page).toHaveURL(/.*recherche/, { timeout: 10000 })
    await expect(page.getByRole('heading', { name: /rechercher/i })).toBeVisible({ timeout: 5000 })
  })

  test('should display listings on homepage', async ({ page }) => {
    await page.goto('/')
    
    // Attendre que les listings se chargent
    // Note: ajuster selon la structure réelle de votre page
    const listingsContainer = page.locator('[data-testid="listings"]').or(page.locator('.grid').first())
    
    // Vérifier qu'il y a au moins un élément de listing
    await expect(listingsContainer).toBeVisible({ timeout: 10000 })
  })
})

