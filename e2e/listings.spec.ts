import { test, expect } from '@playwright/test'

test.describe('Listings Flow', () => {
  test('should search for listings', async ({ page }) => {
    await page.goto('/recherche')
    
    // Vérifier que la page de recherche se charge
    await expect(page.getByRole('heading', { name: /rechercher un bien/i })).toBeVisible()
    
    // Remplir le formulaire de recherche
    const searchInput = page.getByPlaceholder(/ville|quartier/i).or(page.getByRole('textbox').first())
    if (await searchInput.isVisible()) {
      await searchInput.fill('Lomé')
      
      // Attendre que les résultats se chargent (si applicable)
      await page.waitForTimeout(1000)
    }
  })

  test('should filter listings by type', async ({ page }) => {
    await page.goto('/recherche')
    await page.waitForLoadState('networkidle')
    
    // Sélectionner un type de transaction (premier combobox sur la page)
    const typeSelect = page.getByRole('combobox').first()
    await expect(typeSelect).toBeVisible({ timeout: 5000 })
    
    // Sélectionner "Location" dans le premier select (Type de transaction)
    await typeSelect.selectOption({ label: 'Location' })
    await page.waitForTimeout(1000) // Attendre que les filtres s'appliquent
  })

  test('should view listing details', async ({ page }) => {
    await page.goto('/')
    
    // Attendre que les listings se chargent
    await page.waitForTimeout(2000)
    
    // Trouver le premier lien d'annonce
    const firstListingLink = page.locator('a[href*="/annonce/"]').first()
    
    if (await firstListingLink.isVisible()) {
      await firstListingLink.click()
      
      // Vérifier qu'on est sur la page de détail
      await expect(page).toHaveURL(/.*\/annonce\/.+/)
      
      // Vérifier la présence d'éléments clés
      // Note: ajuster selon votre structure réelle
      await expect(page.getByRole('heading').first()).toBeVisible()
    } else {
      test.skip('No listings available to test')
    }
  })

  test('should navigate to create listing page (requires auth)', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Cliquer sur le lien "Publier" (peut être dans le header)
    const publishLink = page.getByRole('link', { name: /publier|nouvelle annonce/i }).first()
    
    await expect(publishLink).toBeVisible({ timeout: 5000 })
    await publishLink.click()
    
    // Attendre la navigation
    await page.waitForURL(/\/(connexion|publier)/, { timeout: 10000 })
    
    // Si non connecté, on devrait être redirigé vers la connexion
    // Sinon, on devrait être sur la page de publication
    const currentUrl = page.url()
    expect(currentUrl.includes('/connexion') || currentUrl.includes('/publier')).toBeTruthy()
  })
})

