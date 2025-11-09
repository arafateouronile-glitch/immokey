import { Shield, Users, Building2, DollarSign, TrendingUp } from 'lucide-react'

export default function SuperAdminDashboardPage() {
  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <Shield className="h-8 w-8 text-primary-600" />
          <h1 className="text-3xl font-bold text-neutral-900">Super Admin Dashboard</h1>
        </div>
        <p className="text-neutral-600">Vue d'ensemble de la plateforme ImmoKey</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={<Users className="h-8 w-8 text-blue-600" />}
          title="Utilisateurs"
          value="-"
          description="Total d'utilisateurs"
          bgColor="bg-blue-50"
        />
        <StatCard
          icon={<Building2 className="h-8 w-8 text-green-600" />}
          title="Annonces"
          value="-"
          description="Annonces actives"
          bgColor="bg-green-50"
        />
        <StatCard
          icon={<Building2 className="h-8 w-8 text-purple-600" />}
          title="Établissements"
          value="-"
          description="Hôtels enregistrés"
          bgColor="bg-purple-50"
        />
        <StatCard
          icon={<DollarSign className="h-8 w-8 text-yellow-600" />}
          title="Revenus"
          value="-"
          description="Revenus totaux"
          bgColor="bg-yellow-50"
        />
      </div>

      {/* Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
          <h2 className="text-xl font-semibold text-neutral-900 mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-primary-600" />
            Activité Récente
          </h2>
          <p className="text-neutral-600 text-sm">
            Cette section affichera l'activité récente de la plateforme (inscriptions, annonces, réservations, etc.)
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
          <h2 className="text-xl font-semibold text-neutral-900 mb-4 flex items-center">
            <Shield className="h-5 w-5 mr-2 text-primary-600" />
            Alertes Système
          </h2>
          <p className="text-neutral-600 text-sm">
            Cette section affichera les alertes et notifications importantes pour les administrateurs.
          </p>
        </div>
      </div>

      {/* Development Notice */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          🚧 Dashboard en cours de développement
        </h3>
        <p className="text-blue-800">
          Ce tableau de bord Super Admin est en cours de développement. Les fonctionnalités complètes incluront :
        </p>
        <ul className="mt-3 space-y-1 text-blue-800 list-disc list-inside">
          <li>Gestion des utilisateurs et organisations</li>
          <li>Statistiques détaillées sur les revenus</li>
          <li>Modération des annonces et contenus</li>
          <li>Configuration des paramètres système</li>
          <li>Rapports et analytics avancés</li>
        </ul>
      </div>
    </div>
  )
}

interface StatCardProps {
  icon: React.ReactNode
  title: string
  value: string
  description: string
  bgColor: string
}

function StatCard({ icon, title, value, description, bgColor }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
      <div className={`w-12 h-12 rounded-lg ${bgColor} flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <h3 className="text-sm font-medium text-neutral-500 mb-1">{title}</h3>
      <p className="text-3xl font-bold text-neutral-900 mb-1">{value}</p>
      <p className="text-xs text-neutral-600">{description}</p>
    </div>
  )
}
