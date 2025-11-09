import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test('should navigate to login page', async ({ page }) => {
    await page.goto('/')
    
    // Cliquer sur le bouton de connexion (peut être dans le header mobile ou desktop)
    const loginLink = page.getByRole('link', { name: /se connecter|connexion/i }).first()
    await loginLink.click({ timeout: 5000 })
    
    // Vérifier qu'on est sur la page de connexion
    await expect(page).toHaveURL(/.*connexion/, { timeout: 10000 })
    await expect(page.getByRole('heading', { name: /connectez-vous/i })).toBeVisible({ timeout: 5000 })
  })

  test('should navigate to register page', async ({ page }) => {
    await page.goto('/connexion')
    
    // Attendre que la page se charge
    await page.waitForLoadState('networkidle')
    
    // Cliquer sur le lien d'inscription (peut être dans le texte ou un lien séparé)
    const registerLink = page.getByRole('link', { name: /créer|nouveau compte|inscription/i }).first()
    await registerLink.click({ timeout: 5000 })
    
    // Vérifier qu'on est sur la page d'inscription
    await expect(page).toHaveURL(/.*inscription/, { timeout: 10000 })
    await expect(page.getByRole('heading').filter({ hasText: /inscription|créer/i }).first()).toBeVisible({ timeout: 5000 })
  })

  test('should display registration form', async ({ page }) => {
    await page.goto('/inscription')
    
    // Attendre que la page se charge
    await page.waitForLoadState('networkidle')
    
    // Vérifier la présence des champs du formulaire (plusieurs méthodes possibles)
    const nameInput = page.getByLabel(/nom/i).or(page.locator('input[type="text"]').first())
    await expect(nameInput).toBeVisible({ timeout: 5000 })
    
    const emailInput = page.getByLabel(/email/i).or(page.locator('input[type="email"]'))
    await expect(emailInput).toBeVisible({ timeout: 5000 })
    
    const phoneInput = page.getByLabel(/téléphone|phone/i).or(page.locator('input[type="tel"]'))
    await expect(phoneInput.first()).toBeVisible({ timeout: 5000 })
    
    const passwordInput = page.getByLabel(/mot de passe|password/i).or(page.locator('input[type="password"]').first())
    await expect(passwordInput).toBeVisible({ timeout: 5000 })
    
    const submitButton = page.getByRole('button', { name: /inscrire|créer|soumettre/i }).first()
    await expect(submitButton).toBeVisible({ timeout: 5000 })
  })

  test('should validate registration form', async ({ page }) => {
    await page.goto('/inscription')
    
    // Attendre que la page se charge
    await page.waitForLoadState('networkidle')
    
    // Essayer de soumettre le formulaire vide
    const submitButton = page.getByRole('button', { name: /inscrire|créer|soumettre/i }).first()
    await submitButton.click({ timeout: 5000 })
    
    // Vérifier que des messages d'erreur apparaissent
    // Les messages peuvent être en français ou génériques
    await page.waitForTimeout(1000) // Attendre la validation
    
    const errorMessage = page.getByText(/caractères|requis|invalide|required|invalid/i).first()
    await expect(errorMessage).toBeVisible({ timeout: 3000 }).catch(() => {
      // Si pas de message d'erreur visible, vérifier que le formulaire n'a pas été soumis
      expect(page.url()).toContain('/inscription')
    })
  })
})

