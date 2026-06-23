import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Activity,
  ArrowRight,
  ClipboardList,
  HeartPulse,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  User,
} from 'lucide-react';

const floatingCards = [
  {
    icon: HeartPulse,
    label: 'Live vitals',
    className: 'left-[6%] top-[18%]',
    delay: 0,
  },
  {
    icon: Activity,
    label: 'Queue pulse',
    className: 'right-[8%] top-[14%]',
    delay: 0.8,
  },
  {
    icon: ClipboardList,
    label: 'Smart intake',
    className: 'left-[10%] bottom-[18%]',
    delay: 1.4,
  },
  {
    icon: ShieldCheck,
    label: 'Care ready',
    className: 'right-[12%] bottom-[22%]',
    delay: 0.4,
  },
];

const HomePage = () => {
  const navigate = useNavigate();

  const choices = [
    {
      title: 'I am a Patient',
      subtitle: 'Check in, answer your health questionnaire, or track your token.',
      icon: User,
      action: 'Enter Patient Portal',
      path: '/patient',
      accent: 'from-sky-500 to-teal-500',
      glow: 'shadow-sky-200/70',
    },
    {
      title: 'I am a Doctor',
      subtitle: 'Review queue insights, patient flow, and live clinic analytics.',
      icon: Stethoscope,
      action: 'Open Doctor Dashboard',
      path: '/doctor-login',
      accent: 'from-rose-500 to-orange-500',
      glow: 'shadow-rose-200/70',
    },
  ];

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,#dff8ff_0,#f7fbff_32%,#fff7ed_100%)] px-4 py-8 text-slate-950">
      <div className="absolute inset-0 opacity-70">
        <div className="absolute -left-24 top-16 h-72 w-72 rounded-full bg-cyan-200/50 blur-3xl" />
        <div className="absolute right-[-5rem] top-28 h-80 w-80 rounded-full bg-orange-200/50 blur-3xl" />
        <div className="absolute bottom-[-7rem] left-1/3 h-96 w-96 rounded-full bg-emerald-200/40 blur-3xl" />
      </div>

      <div className="pointer-events-none absolute inset-0 hidden md:block">
        {floatingCards.map((card) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 24, rotate: -4 }}
            animate={{
              opacity: 1,
              y: [0, -16, 0],
              rotate: [-3, 3, -3],
            }}
            transition={{
              opacity: { duration: 0.5, delay: card.delay },
              y: { duration: 6, repeat: Infinity, delay: card.delay, ease: 'easeInOut' },
              rotate: { duration: 7, repeat: Infinity, delay: card.delay, ease: 'easeInOut' },
            }}
            className={`absolute ${card.className} floating-health-card`}
          >
            <card.icon className="h-6 w-6 text-teal-600" />
            <span>{card.label}</span>
          </motion.div>
        ))}
      </div>

      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="mb-10 text-center"
        >
          <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/75 px-4 py-2 text-sm font-semibold text-teal-700 shadow-sm backdrop-blur">
            <Sparkles className="h-4 w-4" />
            Queue Cure
          </div>
          <h1 className="mx-auto max-w-3xl text-4xl font-black leading-tight text-slate-950 sm:text-6xl">
            Who is using the clinic today?
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-600">
            Choose your portal and jump straight into a faster, calmer healthcare queue experience.
          </p>
        </motion.div>

        <div className="grid w-full max-w-5xl grid-cols-1 gap-6 md:grid-cols-2">
          {choices.map((choice, index) => (
            <motion.button
              key={choice.title}
              type="button"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + index * 0.12, duration: 0.5 }}
              whileHover={{ y: -8, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(choice.path)}
              className={`group relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/[0.82] p-7 text-left shadow-2xl ${choice.glow} backdrop-blur-xl`}
            >
              <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${choice.accent}`} />
              <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-slate-100 transition-transform duration-500 group-hover:scale-125" />
              <div className="relative">
                <div className={`mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${choice.accent} shadow-lg`}>
                  <choice.icon className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-2xl font-black text-slate-950">{choice.title}</h2>
                <p className="mt-3 min-h-[4rem] text-base leading-7 text-slate-600">{choice.subtitle}</p>
                <div className="mt-8 inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white transition-all group-hover:gap-4">
                  {choice.action}
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        <motion.a
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.65 }}
          href="/dashboard"
          className="mt-8 text-sm font-semibold text-slate-500 hover:text-slate-950"
        >
          Staff reception dashboard
        </motion.a>
      </section>
    </main>
  );
};

export default HomePage;
