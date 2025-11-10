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
      'Location, vente, estimation : des annonces vérifiées, des visites immersives et un suivi en temps réel pour vos projets.',
    icon: Home,
    link: '/recherche',
    tag: 'Trouver un bien',
    features: [
      'Matching intelligent avec vos critères',
      'Visites virtuelles et dossiers digitaux',
      'Accompagnement transactionnel intégral',
    ],
    gradient: 'from-blue-500/90 via-blue-400/90 to-blue-600/80',
  },
  {
    title: 'Gestion locative',
    description:
      'Automatisez l’administration de vos biens, sécurisez vos revenus et offrez une expérience premium à vos locataires.',
    icon: Building2,
    link: '/gestion-locative',
    tag: 'Piloter ses revenus',
    features: [
      'Contrats, quittances et documents centralisés',
      'Relances et encaissements automatisés',
      'Tableau de bord financier temps réel',
    ],
    gradient: 'from-emerald-500/90 via-emerald-400/90 to-emerald-600/80',
  },
  {
    title: 'Suite hôtelière',
    description:
      'Une plateforme moderne pour opérer vos établissements, booster vos réservations et fidéliser vos clients.',
    icon: Hotel,
    link: '/hotellerie',
    tag: 'Réinventer l’accueil',
    features: [
      'PMS complet avec channel manager natif',
      'Portail client & conciergerie digitale',
      'Revenue management assisté par la donnée',
    ],
    gradient: 'from-primary-500/90 via-primary-400/90 to-primary-600/80',
  },
]

const proofPoints = [
  { label: 'Biens actifs sur la plateforme', value: '1 200+' },
  { label: 'Taux de satisfaction client', value: '97%' },
  { label: 'Réservations confirmées chaque mois', value: '3 500+' },
  { label: 'Valeur locative gérée', value: '3,2 M€' },
]

const experiences = [
  {
    title: 'Un socle omnicanal',
    copy: 'Web, mobile, email, SMS : chaque interaction est pensée pour prolonger votre image de marque et fluidifier le parcours.',
    icon: Sparkles,
  },
  {
    title: 'Pilotage augmenté',
    copy: 'Dashboards contextuels, alertes intelligentes, projection de trésorerie… vos décisions sont éclairées par la donnée.',
    icon: LineChart,
  },
  {
    title: 'Sécurité & conformité',
    copy: 'Infrastructure hébergée en Europe, RLS, traçabilité complète. Vos données, vos règles.',
    icon: ShieldCheck,
  },
]

const journey = [
  {
    step: '01',
    title: 'Activation express',
    detail: 'Un onboarding accompagné pour paramétrer vos équipes, vos biens et votre branding en quelques jours.',
    icon: Users,
  },
  {
    step: '02',
    title: 'Expériences signatures',
    detail: 'Sites vitrines, tunnels de réservation, espaces locataires ou propriétaires : nous déployons vos journeys clés en main.',
    icon: CalendarHeart,
  },
  {
    step: '03',
    title: 'Croissance continue',
    detail: 'Suivi dédié, roadmap personnalisée et intégrations API pour connecter votre stack existante.',
    icon: MessageCircle,
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-50">
      {/* Gradient aurora */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_-20%,rgba(80,184,255,0.25),rgba(9,9,11,0.92))]" />
        <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_80%_10%,rgba(56,189,248,0.18),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(40%_45%_at_20%_15%,rgba(147,51,234,0.12),transparent)]" />
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
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-sm tracking-wide uppercase text-primary-200 border border-white/10">
                <Sparkles className="h-4 w-4" />
                Plateforme premium Afrique de l’Ouest
              </span>
              <h1 className="mt-6 text-4xl md:text-6xl font-bold leading-tight text-white tracking-tight">
                L’immobilier & l’hôtellerie réinventés
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary-300 via-sky-300 to-emerald-300">
                  pour vos clients, vos équipes, vos revenus.
                </span>
              </h1>
              <p className="mt-6 text-lg md:text-xl text-neutral-300 leading-relaxed max-w-2xl">
                ImmoKey orchestre chaque étape de vos activités immobilières et hôtelières :
                acquisition digitale, exploitation, relation client et pilotage financier. Un
                cockpit unique pour délivrer une expérience exceptionnelle.
              </p>

              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <Link
                  to="/recherche"
                  className="group inline-flex items-center justify-center gap-3 rounded-2xl bg-white text-neutral-900 px-8 py-4 font-semibold shadow-[0_20px_40px_rgba(80,184,255,0.25)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_30px_60px_rgba(80,184,255,0.35)]"
                >
                  Explorer le marketplace
                  <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center gap-3 rounded-2xl border border-white/20 px-8 py-4 font-semibold text-neutral-100 transition-all duration-300 hover:bg-white/5 hover:border-white/40"
                >
                  Parler à un expert
                </Link>
              </div>

              <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-6">
                {proofPoints.map((item, index) => (
                  <motion.div
                    key={item.label}
                    className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4"
                    {...fadeIn(index * 0.1)}
                  >
                    <div className="text-2xl md:text-3xl font-semibold text-white">
                      {item.value}
                    </div>
                    <div className="mt-2 text-sm text-neutral-400">{item.label}</div>
                  </motion.div>
                ))}
              </div>
            </div>

            <motion.div
              className="relative rounded-[32px] border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-8"
              {...fadeIn(0.3)}
            >
              <div className="absolute inset-0 rounded-[32px] bg-gradient-to-br from-white/20 via-white/5 to-transparent blur-3xl opacity-40" />
              <div className="relative space-y-6">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-500 flex items-center justify-center text-neutral-900 shadow-lg">
                    <Zap className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm uppercase tracking-[0.2em] text-neutral-300">
                      Suite opérateur
                    </p>
                    <p className="text-lg font-semibold text-white">
                      Tout votre écosystème dans un cockpit unifié.
                    </p>
                  </div>
                </div>

                <div className="grid gap-4">
                  {experiences.map((item, index) => (
                    <div
                      key={item.title}
                      className="rounded-2xl border border-white/10 bg-neutral-900/40 p-5 transition-all duration-300 hover:border-white/30 hover:bg-neutral-900/60"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-1 rounded-xl bg-white/10 p-2 text-primary-200">
                          <item.icon className="h-4 w-4" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">{item.title}</h3>
                          <p className="mt-1 text-sm text-neutral-400">{item.copy}</p>
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
        <section className="px-4 sm:px-6 lg:px-8 py-24 bg-neutral-950/60 border-t border-white/5">
          <div className="max-w-7xl mx-auto">
            <motion.div className="max-w-3xl" {...fadeIn()}>
              <span className="text-sm font-medium uppercase tracking-[0.3em] text-primary-200">
                Suite ImmoKey
              </span>
              <h2 className="mt-4 text-4xl md:text-5xl font-bold text-white leading-tight">
                Trois modules, une vision.
              </h2>
              <p className="mt-4 text-lg text-neutral-400">
                Chaque brique est pensée pour fonctionner en autonomie ou se synchroniser avec vos
                outils internes. Configurez votre environnement, vos workflows, vos accès — et
                délivrez une expérience sur-mesure à vos équipes comme à vos clients.
              </p>
            </motion.div>

            <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-6">
              {sections.map((section, index) => (
                <motion.div
                  key={section.title}
                  className="relative rounded-[28px] p-[1px] transition-transform duration-500 hover:-translate-y-3"
                  {...fadeIn(index * 0.15)}
                >
                  <div className={`rounded-[28px] bg-gradient-to-br ${section.gradient} p-8 h-full flex flex-col`}>
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-white/80">
                        {section.tag}
                      </span>
                      <div className="rounded-2xl bg-white/15 p-3 text-white">
                        <section.icon className="h-6 w-6" />
                      </div>
                    </div>

                    <h3 className="mt-8 text-2xl font-semibold text-white">{section.title}</h3>
                    <p className="mt-4 text-sm text-white/80 leading-relaxed flex-1">
                      {section.description}
                    </p>

                    <ul className="mt-6 space-y-3 text-sm text-white/70">
                      {section.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2">
                          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-white/70" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <Link
                      to={section.link}
                      className="mt-10 inline-flex items-center justify-start gap-2 text-sm font-semibold text-white hover:text-white/80"
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
        <section className="px-4 sm:px-6 lg:px-8 py-24">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-[0.9fr_1.1fr] gap-16 items-start">
            <motion.div {...fadeIn()}>
              <span className="text-sm font-medium uppercase tracking-[0.3em] text-primary-200">
                Méthodologie ImmoKey
              </span>
              <h2 className="mt-4 text-4xl md:text-5xl font-bold text-white leading-tight">
                Une implantation orchestrée pour viser l’excellence.
              </h2>
              <p className="mt-4 text-lg text-neutral-400">
                Nous combinons expertise terrain, design d’expérience et puissance technologique pour
                propulser vos opérations. Votre réussite est pilotée par une équipe Customer Success
                dédiée et des intégrations sur-mesure.
              </p>
              <div className="mt-10 flex items-center gap-6">
                <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-left">
                  <p className="text-3xl font-semibold text-white">15 jours</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.25em] text-neutral-400">
                    Mise en production moyenne
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-left">
                  <p className="text-3xl font-semibold text-white">24/7</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.25em] text-neutral-400">
                    Support proactif et monitoring
                  </p>
                </div>
              </div>
            </motion.div>

            <div className="grid gap-6">
              {journey.map((item, index) => (
                <motion.div
                  key={item.step}
                  className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 md:p-8"
                  {...fadeIn(index * 0.15)}
                >
                  <div className="flex items-start gap-4 md:gap-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-500/20 text-primary-200 font-semibold text-sm">
                      {item.step}
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <item.icon className="h-5 w-5 text-primary-200" />
                        <h3 className="text-xl font-semibold text-white">{item.title}</h3>
                      </div>
                      <p className="mt-3 text-sm text-neutral-300 leading-relaxed">
                        {item.detail}
                      </p>
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
            className="relative max-w-6xl mx-auto overflow-hidden rounded-[36px] border border-white/10 bg-gradient-to-br from-primary-500/25 via-sky-500/20 to-neutral-900 p-[1px]"
            {...fadeIn()}
          >
            <div className="relative rounded-[36px] bg-neutral-950/90 px-8 py-14 md:px-14 md:py-20">
              <div className="absolute inset-0 bg-[radial-gradient(50%_60%_at_50%_0%,rgba(96,165,250,0.35),transparent)]" />
              <div className="relative flex flex-col items-center text-center">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-5 py-2 text-xs uppercase tracking-[0.3em] text-neutral-100">
                  Lancement express
                </span>
                <h2 className="mt-6 text-4xl md:text-5xl font-bold text-white leading-tight max-w-3xl">
                  Déployez ImmoKey et délivrez une expérience signature dès ce trimestre.
                </h2>
                <p className="mt-4 text-lg text-neutral-300 max-w-2xl">
                  Plan de mise en œuvre, personnalisation graphique, formations équipes : nous
                  orchestrons chaque étape pour que vous soyez opérationnel·le rapidement et sans
                  friction.
                </p>
                <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
                  <Link
                    to="/inscription"
                    className="group inline-flex items-center justify-center gap-3 rounded-full bg-white text-neutral-900 px-10 py-4 font-semibold shadow-[0_18px_40px_rgba(56,189,248,0.35)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_60px_rgba(56,189,248,0.45)]"
                  >
                    Créer mon espace
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </Link>
                  <Link
                    to="/hotellerie/demo"
                    className="inline-flex items-center justify-center gap-3 rounded-full border border-white/20 px-10 py-4 font-semibold text-neutral-100 transition-all duration-300 hover:bg-white/10"
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
