import { Category, Niche } from './types';

export const CATEGORIES: Category[] = [
  { id: 'all', label: 'All Niches' },
  { id: 'gaming', label: 'Gaming' },
  { id: 'asmr', label: 'ASMR' },
  { id: 'cooking', label: 'Cooking & Recipes' },
  { id: 'mindfulness', label: 'Meditation & Mindfulness' },
  { id: 'finance', label: 'Personal Finance' },
  { id: 'motivation', label: 'Motivational Videos' },
  { id: 'tech', label: 'Product Reviews & Tech' },
  { id: 'travel', label: 'Travel Vlogging' },
  { id: 'animated', label: 'Animated/Compilation Videos' },
];

export const NICHES: Niche[] = [
  // Gaming
  {
    id: 'gaming-walkthrough',
    title: 'No-Commentary Gameplay',
    description: 'Immersive 4K walkthroughs of trending games without voiceovers, focusing on pure visual experience.',
    iconName: 'Gamepad2',
    category: 'gaming',
    gradient: 'from-purple-600 to-blue-600'
  },
  {
    id: 'gaming-trivia',
    title: 'Gaming Facts & Trivia',
    description: 'Fast-paced "Did you know?" shorts about popular games with background gameplay footage.',
    iconName: 'Puzzle',
    category: 'gaming',
    gradient: 'from-indigo-600 to-purple-600'
  },
  
  // ASMR
  {
    id: 'asmr-visual',
    title: 'Visual ASMR',
    description: 'Satisfying loops of sand cutting, soap carving, and slime mixing for relaxation.',
    iconName: 'Sparkles',
    category: 'asmr',
    gradient: 'from-pink-500 to-rose-500'
  },
  {
    id: 'asmr-tech',
    title: 'Tech ASMR',
    description: 'High-fidelity audio recording of mechanical keyboards typing and mouse clicking.',
    iconName: 'Keyboard',
    category: 'asmr',
    gradient: 'from-emerald-400 to-cyan-500'
  },

  // Cooking
  {
    id: 'cooking-aesthetic',
    title: 'Aesthetic Baking',
    description: 'Calm, cinematic shots of baking processes with soothing music and text ingredients.',
    iconName: 'Cake',
    category: 'cooking',
    gradient: 'from-orange-400 to-red-400'
  },
  {
    id: 'cooking-fast',
    title: 'Speed Recipes',
    description: 'High-energy, fast-cut recipe tutorials focusing on quick meals and hacks.',
    iconName: 'Utensils',
    category: 'cooking',
    gradient: 'from-amber-500 to-orange-600'
  },

  // Mindfulness
  {
    id: 'mind-nature',
    title: 'Nature Ambiance',
    description: 'Peaceful footage of rain, forests, or oceans combined with calming soundscapes.',
    iconName: 'Trees',
    category: 'mindfulness',
    gradient: 'from-teal-500 to-green-600'
  },
  {
    id: 'mind-breath',
    title: 'Guided Breathing',
    description: 'Abstract visual pulses synchronized with breathing exercises for stress relief.',
    iconName: 'Wind',
    category: 'mindfulness',
    gradient: 'from-cyan-500 to-blue-500'
  },

  // Finance
  {
    id: 'finance-visual',
    title: 'Money Visualizations',
    description: 'Satisfying animations showing compound interest, savings growth, or budget splitting.',
    iconName: 'PieChart',
    category: 'finance',
    gradient: 'from-green-600 to-emerald-700'
  },
  {
    id: 'finance-news',
    title: 'Crypto/Stock Updates',
    description: 'Screen-share style videos analyzing market charts with AI voiceover commentary.',
    iconName: 'TrendingUp',
    category: 'finance',
    gradient: 'from-yellow-500 to-amber-600'
  },

  // Motivation
  {
    id: 'motiv-stoic',
    title: 'Stoic Philosophy',
    description: 'Dark, statuesque visuals with floating text quotes from Marcus Aurelius and Seneca.',
    iconName: 'ScrollText',
    category: 'motivation',
    gradient: 'from-slate-600 to-stone-800'
  },
  {
    id: 'motiv-lux',
    title: 'Luxury Motivation',
    description: 'High-end lifestyle footage (cars, travel) paired with motivational speeches.',
    iconName: 'Gem',
    category: 'motivation',
    gradient: 'from-violet-600 to-purple-800'
  },

  // Tech
  {
    id: 'tech-unbox',
    title: 'Silent Unboxing',
    description: 'Clean, hands-only unboxing of the latest tech gadgets on a minimal desk setup.',
    iconName: 'Package',
    category: 'tech',
    gradient: 'from-blue-600 to-indigo-600'
  },
  {
    id: 'tech-tips',
    title: 'Productivity Hacks',
    description: 'Screen recordings demonstrating software shortcuts and app workflows.',
    iconName: 'Laptop',
    category: 'tech',
    gradient: 'from-sky-500 to-cyan-600'
  },

  // Travel
  {
    id: 'travel-cinematic',
    title: 'Cinematic Travel',
    description: 'Montages of beautiful destinations using high-quality stock drone footage.',
    iconName: 'Plane',
    category: 'travel',
    gradient: 'from-blue-400 to-sky-500'
  },
  {
    id: 'travel-walk',
    title: 'City Walking Tours',
    description: 'First-person POV walking videos exploring streets of famous cities.',
    iconName: 'Map',
    category: 'travel',
    gradient: 'from-orange-400 to-amber-500'
  },

  // Animated
  {
    id: 'anim-explainer',
    title: 'Animated Explainers',
    description: 'Motion graphic videos explaining science, history, or fun facts.',
    iconName: 'Shapes',
    category: 'animated',
    gradient: 'from-pink-500 to-purple-500'
  },
  {
    id: 'anim-compilation',
    title: 'Fail/Win Compilations',
    description: 'Curated lists of funny or impressive clips with edited transitions.',
    iconName: 'Video',
    category: 'animated',
    gradient: 'from-red-500 to-rose-600'
  }
];