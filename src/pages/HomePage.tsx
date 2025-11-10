import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Sparkles,
  Home,
  Hotel,
  Building2,
  ShieldCheck,
  Users,
  LineChart,
  CalendarHeart,
  MessageCircle,
  Zap,
} from 'lucide-react'

const fadeIn = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay },
  viewport: { once: true },
})

const heroFade = {
  initial: { opacity: 0, y: 30, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  transition: { duration: 0.8, ease: 'easeOut' },
}

const sections = [
  {
    title: 'Marketplace immobilier',
    description:
      "Location, vente, estimation : un inventaire qualifié, des visites immersives et un suivi transparent pour chaque transaction.",
    icon: Home,
    link: '/recherche',
    tag: 'Trouver un bien',
    features: [
      'Matching intelligent & alertes personnalisées',
      'Dossiers digitaux et visites virtuelles HD',
      'Accompagnement transactionnel sur-mesure',
    ],
    gradient: 'from-white via-blue-50 to-sky-100',
  },
  {
    title: 'Gestion locative',
    description:
      "Automatisez vos opérations, sécurisez vos encaissements et délivrez une expérience premium à vos propriétaires comme à vos locataires.",
    icon: Building2,
    link: '/gestion-locative',
    tag: 'Piloter ses revenus',
    features: [
      'Contrats, quittances & documents centralisés',
      'Relances et encaissements automatisés',
      'Tableau de bord financier en FCFA temps réel',
    ],
    gradient: 'from-white via-emerald-50 to-teal-100',
  },
  {
    title: 'Suite hôtelière',
    description:
      "Un PMS nouvelle génération pour booster vos réservations, fluidifier l’accueil et fidéliser vos clientèles corporate ou loisirs.",
    icon: Hotel,
    link: '/hotellerie',
    tag: 'Réinventer l’accueil',
    features: [
      'Channel manager & portail client intégrés',
      'Revenue management assisté par la donnée',
      'Conciergerie digitale & upsell automatisés',
    ],
    gradient: 'from-white via-primary-50 to-sky-100',
  },
]

const proofPoints = [
  { label: 'Biens actifs sur la plateforme', value: '1 200+' },
  { label: 'Taux de satisfaction client', value: '97%' },
  { label: 'Réservations confirmées chaque mois', value: '3 500+' },
  { label: 'Valeur locative gérée', value: '3,2 M FCFA' },
]

const experiences = [
  {
    title: 'Un socle omnicanal',
    copy: 'Web, mobile, email, SMS : vos clients et collaborateurs interagissent dans un univers cohérent et premium.',
    icon: Sparkles,
  },
  {
    title: 'Pilotage augmenté',
    copy: 'Dashboards, projections de trésorerie, alertes intelligentes : prenez vos décisions en un coup d’œil.',
    icon: LineChart,
  },
  {
    title: 'Sécurité & conformité',
    copy: 'Hébergement souverain, RLS renforcées, traçabilité complète : vos données sont protégées et maîtrisées.',
    icon: ShieldCheck,
  },
]

const journey = [
  {
    step: '01',
    title: 'Activation express',
    detail: "Onboarding guidé, paramétrage branding & équipes : vous êtes live en quinze jours.",
    icon: Users,
  },
  {
    step: '02',
    title: 'Expériences signatures',
    detail: 'Sites vitrines, tunnels de réservation, espaces propriétaires & locataires : chaque parcours porte votre ADN.',
    icon: CalendarHeart,
  },
  {
    step: '03',
    title: 'Croissance continue',
    detail: 'Customer Success dédié, intégrations API et roadmap personnalisée pour scaler vos opérations sans friction.',
    icon: MessageCircle,
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-primary-50/40 to-amber-50/30 text-neutral-900">
      {/* Soft gradients */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(65%_55%_at_50%_-15%,rgba(56,189,248,0.18),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(45%_40%_at_20%_20%,rgba(196,181,253,0.18),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(55%_45%_at_80%_10%,rgba(45,212,191,0.16),transparent)]" />
      </div>

      <main className="relative z-10 overflow-hidden">
        {/* Hero */}
        <section className="px-4 sm:px-6 lg:px-8 pt-28 pb-32">
          <motion.div
            className="max-w-7xl mx-auto grid lg:grid-cols-[1.1fr_0.9fr] gap-16 items-center"
            initial="initial"
            animate="animate"
            variants={heroFade}
          >
            <div>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm text-sm tracking-wide uppercase text-primary-600 border border-primary-200/50">
                <Sparkles className="h-4 w-4" />
                Plateforme premium Afrique de l’Ouest
              </span>
              <h1 className="mt-6 text-4xl md:text-6xl font-bold leading-tight tracking-tight text-neutral-900">
                L’immobilier & l’hôtellerie réinventés
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary-500 via-sky-500 to-emerald-500">
                  pour vos clients, vos équipes, vos revenus.
                </span>
              </h1>
              <p className="mt-6 text-lg md:text-xl text-neutral-600 leading-relaxed max-w-2xl">
                ImmoKey orchestre chaque étape : acquisition digitale, exploitation quotidienne,
                relation clients et pilotage financier. Une suite unifiée pour délivrer une
                expérience signature sur vos marchés africains.
              </p>

              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <Link
                  to="/recherche"
                  className="group inline-flex items-center justify-center gap-3 rounded-2xl bg-primary-600 text-white px-8 py-4 font-semibold shadow-[0_18px_38px_rgba(56,189,248,0.35)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_56px_rgba(56,189,248,0.45)]"
                >
                  Explorer le marketplace
                  <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center gap-3 rounded-2xl border border-primary-200 bg-white px-8 py-4 font-semibold text-primary-600 transition-all duration-300 hover:bg-primary-50"
                >
                  Parler à un expert
                </Link>
              </div>

              <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-6">
                {proofPoints.map((item, index) => (
                  <motion.div
                    key={item.label}
                    className="rounded-2xl border border-neutral-200 bg-white/80 shadow-sm backdrop-blur-sm p-4"
                    {...fadeIn(index * 0.1)}
                  >
                    <div className="text-2xl md:text-3xl font-semibold text-primary-600">
                      {item.value}
                    </div>
                    <div className="mt-2 text-sm text-neutral-500">{item.label}</div>
                  </motion.div>
                ))}
              </div>
            </div>

            <motion.div
              className="relative rounded-[32px] border border-white shadow-xl bg-gradient-to-br from-white via-primary-50/40 to-white p-8"
              {...fadeIn(0.3)}
            >
              <div className="absolute inset-0 rounded-[32px] bg-gradient-to-br from-primary-200/25 via-white to-transparent blur-3xl opacity-60" />
              <div className="relative space-y-6">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary-100 to-primary-300 flex items-center justify-center text-primary-700 shadow-lg">
                    <Zap className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm uppercase tracking-[0.2em] text-primary-500">Suite opérateur</p>
                    <p className="text-lg font-semibold text-neutral-900">Tout votre écosystème dans un cockpit unifié.</p>
                  </div>
                </div>

                <div className="grid gap-4">
                  {experiences.map((item) => (
                    <div
                      key={item.title}
                      className="rounded-2xl border border-primary-100 bg-white/90 p-5 transition-all duration-300 hover:border-primary-200 hover:shadow-lg"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-1 rounded-xl bg-primary-100 p-2 text-primary-600">
                          <item.icon className="h-4 w-4" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-neutral-900">{item.title}</h3>
                          <p className="mt-1 text-sm text-neutral-500">{item.copy}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* Modules */}
        <section className="px-4 sm:px-6 lg:px-8 py-24 bg-white/80 border-t border-primary-100">
          <div className="max-w-7xl mx-auto">
            <motion.div className="max-w-3xl" {...fadeIn()}>
              <span className="text-sm font-medium uppercase tracking-[0.3em] text-primary-500">Suite ImmoKey</span>
              <h2 className="mt-4 text-4xl md:text-5xl font-bold text-neutral-900 leading-tight">
                Trois modules, une vision.
              </h2>
              <p className="mt-4 text-lg text-neutral-600">
                Chaque brique est autonome et se connecte à vos outils internes. Activez les modules pertinents, paramétrez vos workflows et délivrez une expérience cohérente à vos équipes comme à vos clients.
              </p>
            </motion.div>

            <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-6">
              {sections.map((section, index) => (
                <motion.div
                  key={section.title}
                  className="relative rounded-[28px] transition-transform duration-500 hover:-translate-y-3"
                  {...fadeIn(index * 0.15)}
                >
                  <div className={`rounded-[28px] border border-white shadow-lg bg-gradient-to-br ${section.gradient} p-8 h-full flex flex-col`}>
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-primary-600">
                        {section.tag}
                      </span>
                      <div className="rounded-2xl bg-white/70 p-3 text-primary-600 shadow-sm">
                        <section.icon className="h-6 w-6" />
                      </div>
                    </div>

                    <h3 className="mt-8 text-2xl font-semibold text-neutral-900">{section.title}</h3>
                    <p className="mt-4 text-sm text-neutral-600 leading-relaxed flex-1">{section.description}</p>

                    <ul className="mt-6 space-y-3 text-sm text-neutral-600">
                      {section.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2">
                          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <Link
                      to={section.link}
                      className="mt-10 inline-flex items-center justify-start gap-2 text-sm font-semibold text-primary-600 hover:text-primary-700"
                    >
                      Découvrir le module
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Parcours client */}
        <section className="px-4 sm:px-6 lg:px-8 py-24 bg-gradient-to-br from-white via-primary-50/40 to-slate-50">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-[0.9fr_1.1fr] gap-16 items-start">
            <motion.div {...fadeIn()}>
              <span className="text-sm font-medium uppercase tracking-[0.3em] text-primary-500">Méthodologie ImmoKey</span>
              <h2 className="mt-4 text-4xl md:text-5xl font-bold text-neutral-900 leading-tight">
                Une implantation orchestrée pour viser l’excellence.
              </h2>
              <p className="mt-4 text-lg text-neutral-600">
                Nous combinons expertise terrain, design d’expérience et puissance technologique pour propulser vos opérations. Customer Success dédié, intégrations sur mesure et roadmap continue assurent votre croissance.
              </p>
              <div className="mt-10 flex items-center gap-6">
                <div className="rounded-2xl border border-primary-100 bg-white px-6 py-4 text-left shadow-sm">
                  <p className="text-3xl font-semibold text-primary-600">15 jours</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.25em] text-neutral-500">
                    Mise en production moyenne
                  </p>
                </div>
                <div className="rounded-2xl border border-primary-100 bg-white px-6 py-4 text-left shadow-sm">
                  <p className="text-3xl font-semibold text-primary-600">24/7</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.25em] text-neutral-500">
                    Support proactif & monitoring
                  </p>
                </div>
              </div>
            </motion.div>

            <div className="grid gap-6">
              {journey.map((item, index) => (
                <motion.div
                  key={item.step}
                  className="rounded-3xl border border-primary-100 bg-white shadow-sm p-6 md:p-8"
                  {...fadeIn(index * 0.15)}
                >
                  <div className="flex items-start gap-4 md:gap-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-100 text-primary-600 font-semibold text-sm">
                      {item.step}
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <item.icon className="h-5 w-5 text-primary-500" />
                        <h3 className="text-xl font-semibold text-neutral-900">{item.title}</h3>
                      </div>
                      <p className="mt-3 text-sm text-neutral-600 leading-relaxed">{item.detail}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA finale */}
        <section className="px-4 sm:px-6 lg:px-8 pb-24">
          <motion.div
            className="relative max-w-6xl mx-auto overflow-hidden rounded-[36px] border border-primary-100 bg-gradient-to-br from-primary-100 via-white to-sky-100 p-[1px]"
            {...fadeIn()}
          >
            <div className="relative rounded-[36px] bg-white px-8 py-14 md:px-14 md:py-20 shadow-[0_40px_80px_rgba(15,23,42,0.08)]">
              <div className="absolute inset-0 bg-[radial-gradient(50%_60%_at_50%_0%,rgba(56,189,248,0.25),transparent)]" />
              <div className="relative flex flex-col items-center text-center">
                <span className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-5 py-2 text-xs uppercase tracking-[0.3em] text-primary-600">
                  Lancement express
                </span>
                <h2 className="mt-6 text-4xl md:text-5xl font-bold text-neutral-900 leading-tight max-w-3xl">
                  Déployez ImmoKey et proposez une expérience signature dès ce trimestre.
                </h2>
                <p className="mt-4 text-lg text-neutral-600 max-w-2xl">
                  Plan de mise en œuvre, personnalisation graphique, formations équipes : nous orchestrons chaque étape pour que vous soyez opérationnel·le rapidement et sans friction.
                </p>
                <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
                  <Link
                    to="/inscription"
                    className="group inline-flex items-center justify-center gap-3 rounded-full bg-primary-600 text-white px-10 py-4 font-semibold shadow-[0_20px_48px_rgba(56,189,248,0.35)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_64px_rgba(56,189,248,0.45)]"
                  >
                    Créer mon espace
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </Link>
                  <Link
                    to="/hotellerie/demo"
                    className="inline-flex items-center justify-center gap-3 rounded-full border border-primary-200 px-10 py-4 font-semibold text-primary-600 transition-all duration-300 hover:bg-primary-50"
                  >
                    Programmer une démo
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </section>
      </main>
    </div>
  )
}
