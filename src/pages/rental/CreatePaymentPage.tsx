import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Save, DollarSign, Calendar } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { createPayment, getDueDate, getDueDatesByTenant } from '@/services/rental/paymentService'
import { getTenants, getTenant } from '@/services/rental/tenantService'
import type { Tenant } from '@/types/rental'

export default function CreatePaymentPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const dueDateId = searchParams.get('due_date')
  const tenantIdParam = searchParams.get('tenant')

  const { user, loading: authLoading } = useAuth()
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null)
  const [dueDates, setDueDates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    tenant_id: tenantIdParam || '',
    due_date_id: dueDateId || '',
    period_month: new Date().getMonth() + 1,
    period_year: new Date().getFullYear(),
    amount: 0,
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: 'cash' as 'cash' | 'bank_transfer' | 'mobile_money' | 'check' | 'other',
    transaction_reference: '',
    notes: '',
  })

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/connexion', { state: { from: '/gestion/paiements/nouveau' } })
      return
    }

    if (user) {
      fetchData()
    }
  }, [user, authLoading, navigate])

  useEffect(() => {
    if (formData.tenant_id && tenants.length > 0) {
      const tenant = tenants.find((t) => t.id === formData.tenant_id)
      if (tenant) {
        setSelectedTenant(tenant)
        fetchDueDates(tenant.id)
        // Pré-remplir avec le loyer mensuel du locataire
        if (!dueDateId && formData.amount === 0) {
          setFormData((prev) => ({ ...prev, amount: tenant.monthly_rent }))
        }
      }
    }
  }, [formData.tenant_id, tenants])

  useEffect(() => {
    if (dueDateId) {
      loadDueDate()
    }
  }, [dueDateId])

  const fetchData = async () => {
    if (!user) return

    setLoading(true)
    try {
      const tenantsData = await getTenants()
      setTenants(tenantsData)

      if (tenantIdParam) {
        const tenant = tenantsData.find((t) => t.id === tenantIdParam)
        if (tenant) {
          setSelectedTenant(tenant)
          await fetchDueDates(tenant.id)
        }
      }
    } catch (err: any) {
      console.error('Error fetching data:', err)
      setError('Erreur lors du chargement des données')
    } finally {
      setLoading(false)
    }
  }

  const fetchDueDates = async (tenantId: string) => {
    try {
      const data = await getDueDatesByTenant(tenantId)
      setDueDates(data.filter((dd) => dd.status !== 'paid'))
    } catch (err: any) {
      console.error('Error fetching due dates:', err)
    }
  }

  const loadDueDate = async () => {
    if (!dueDateId) return

    try {
      const dueDate = await getDueDate(dueDateId)
      setFormData((prev) => ({
        ...prev,
        tenant_id: dueDate.tenant_id,
        due_date_id: dueDateId,
        period_month: dueDate.period_month,
        period_year: dueDate.period_year,
        amount: dueDate.total_amount,
      }))

      // Charger le locataire
      const tenant = await getTenant(dueDate.tenant_id)
      setSelectedTenant(tenant)
      await fetchDueDates(dueDate.tenant_id)
    } catch (err: any) {
      console.error('Error loading due date:', err)
    }
  }

  const handleTenantChange = (tenantId: string) => {
    const tenant = tenants.find((t) => t.id === tenantId)
    setFormData({
      ...formData,
      tenant_id: tenantId,
      due_date_id: '', // Réinitialiser l'échéance sélectionnée
      amount: tenant?.monthly_rent || 0,
    })
  }

  const handleDueDateChange = (ddId: string) => {
    const dueDate = dueDates.find((dd) => dd.id === ddId)
    if (dueDate) {
      setFormData({
        ...formData,
        due_date_id: ddId,
        period_month: dueDate.period_month,
        period_year: dueDate.period_year,
        amount: dueDate.total_amount,
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSaving(true)

    try {
      // Validation
      if (!formData.tenant_id) {
        throw new Error('Veuillez sélectionner un locataire')
      }
      if (!formData.amount || formData.amount <= 0) {
        throw new Error('Le montant doit être supérieur à 0')
      }
      if (!formData.payment_date) {
        throw new Error('La date de paiement est requise')
      }

      // Récupérer le bien du locataire
      const tenant = await getTenant(formData.tenant_id)
      const propertyId = tenant.managed_property_id

      await createPayment({
        tenant_id: formData.tenant_id,
        managed_property_id: propertyId,
        due_date_id: formData.due_date_id || undefined,
        period_month: formData.period_month,
        period_year: formData.period_year,
        amount: formData.amount,
        payment_date: formData.payment_date,
        payment_method: formData.payment_method,
        transaction_reference: formData.transaction_reference || undefined,
        notes: formData.notes || undefined,
      })

      navigate('/gestion/paiements')
    } catch (err: any) {
      console.error('Error creating payment:', err)
      setError(err.message || 'Erreur lors de l\'enregistrement du paiement')
    } finally {
      setSaving(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price)
  }

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* En-tête */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/gestion/paiements')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft size={20} className="mr-2" />
          Retour
        </button>
        <h1 className="text-3xl font-bold flex items-center">
          <DollarSign className="text-primary-600 mr-3" size={32} />
          Enregistrer un paiement
        </h1>
        <p className="text-gray-600 mt-2">Enregistrez un nouveau paiement de loyer</p>
      </div>

      {error && (
        <div className="card mb-6 bg-red-50 border border-red-200">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Sélection du locataire */}
        <div className="card">
          <h2 className="text-2xl font-bold mb-4">Locataire</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Locataire <span className="text-red-600">*</span>
            </label>
            <select
              value={formData.tenant_id}
              onChange={(e) => handleTenantChange(e.target.value)}
              className="input-field"
              required
            >
              <option value="">Sélectionner un locataire</option>
              {tenants.map((tenant) => (
                <option key={tenant.id} value={tenant.id}>
                  {tenant.full_name} - {tenant.email}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Échéance (optionnel) */}
        {selectedTenant && dueDates.length > 0 && (
          <div className="card">
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <Calendar className="text-primary-600 mr-2" size={24} />
              Échéance (optionnel)
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lier à une échéance
              </label>
              <select
                value={formData.due_date_id}
                onChange={(e) => handleDueDateChange(e.target.value)}
                className="input-field"
              >
                <option value="">Aucune échéance (paiement libre)</option>
                {dueDates.map((dd) => (
                  <option key={dd.id} value={dd.id}>
                    {new Date(dd.due_date).toLocaleDateString('fr-FR', {
                      month: 'long',
                      year: 'numeric',
                    })}{' '}
                    - {formatPrice(dd.total_amount)} FCFA ({dd.status === 'overdue' ? 'En retard' : 'En attente'})
                  </option>
                ))}
              </select>
              <p className="mt-2 text-xs text-gray-500">
                Si vous liez ce paiement à une échéance, son statut sera mis à jour automatiquement
              </p>
            </div>
          </div>
        )}

        {/* Informations de paiement */}
        <div className="card">
          <h2 className="text-2xl font-bold mb-4">Informations de paiement</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de paiement <span className="text-red-600">*</span>
              </label>
              <input
                type="date"
                value={formData.payment_date}
                onChange={(e) =>
                  setFormData({ ...formData, payment_date: e.target.value })
                }
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Montant (FCFA) <span className="text-red-600">*</span>
              </label>
              <input
                type="number"
                value={formData.amount || ''}
                onChange={(e) =>
                  setFormData({ ...formData, amount: Number(e.target.value) })
                }
                className="input-field"
                min="1"
                step="0.01"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Méthode de paiement <span className="text-red-600">*</span>
              </label>
              <select
                value={formData.payment_method}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    payment_method: e.target.value as any,
                  })
                }
                className="input-field"
                required
              >
                <option value="cash">Espèces</option>
                <option value="bank_transfer">Virement bancaire</option>
                <option value="mobile_money">Mobile Money</option>
                <option value="check">Chèque</option>
                <option value="other">Autre</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Référence de transaction
              </label>
              <input
                type="text"
                value={formData.transaction_reference}
                onChange={(e) =>
                  setFormData({ ...formData, transaction_reference: e.target.value })
                }
                className="input-field"
                placeholder="Ex: MTN-123456"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Période concernée
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Mois</label>
                  <select
                    value={formData.period_month}
                    onChange={(e) =>
                      setFormData({ ...formData, period_month: Number(e.target.value) })
                    }
                    className="input-field"
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                      <option key={month} value={month}>
                        {new Date(2000, month - 1).toLocaleDateString('fr-FR', { month: 'long' })}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Année</label>
                  <input
                    type="number"
                    value={formData.period_year}
                    onChange={(e) =>
                      setFormData({ ...formData, period_year: Number(e.target.value) })
                    }
                    className="input-field"
                    min="2020"
                    max="2100"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="card">
          <h2 className="text-2xl font-bold mb-4">Notes</h2>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={4}
            className="input-field"
            placeholder="Notes additionnelles sur ce paiement..."
          />
        </div>

        {/* Boutons d'action */}
        <div className="flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/gestion/paiements')}
            className="btn-secondary"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={saving || tenants.length === 0}
            className="btn-primary flex items-center space-x-2"
          >
            <Save size={18} />
            <span>{saving ? 'Enregistrement...' : 'Enregistrer le paiement'}</span>
          </button>
        </div>
      </form>
    </div>
  )
}






