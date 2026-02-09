// ESAT Survey Question Constants
// Employee Satisfaction Survey with Likert scale 1-5

import type { ESATQuestion, ESATCategory } from './mockData';
import { Target, Scale, Users, Settings, Briefcase, MessageSquare } from 'lucide-react';

export const LIKERT_SCALE = [
  { value: 1, label: 'Sangat Tidak Setuju', color: 'text-red-600' },
  { value: 2, label: 'Tidak Setuju', color: 'text-orange-600' },
  { value: 3, label: 'Netral', color: 'text-gray-600' },
  { value: 4, label: 'Setuju', color: 'text-blue-600' },
  { value: 5, label: 'Sangat Setuju', color: 'text-green-600' }
] as const;

export const CATEGORY_LABELS: Record<ESATCategory, string> = {
  scope: 'Scope Pekerjaan',
  workload: 'Beban Kerja',
  collaboration: 'Kolaborasi Tim',
  process: 'Proses Kerja & Tools',
  pm_direction: 'Arahan PM',
  open_ended: 'Pertanyaan Tambahan'
};

export const CATEGORY_ICONS: Record<ESATCategory, string> = {
  scope: '🎯',
  workload: '⚖️',
  collaboration: '🤝',
  process: '⚙️',
  pm_direction: '👨‍💼',
  open_ended: '💭'
};

// Combined category info with icons
export const ESAT_CATEGORIES: Record<ESATCategory, { label: string; icon: any }> = {
  scope: { label: 'Scope Pekerjaan', icon: Target },
  workload: { label: 'Beban Kerja', icon: Scale },
  collaboration: { label: 'Kolaborasi Tim', icon: Users },
  process: { label: 'Proses Kerja & Tools', icon: Settings },
  pm_direction: { label: 'Arahan PM', icon: Briefcase },
  open_ended: { label: 'Pertanyaan Tambahan', icon: MessageSquare }
};

export const ESAT_QUESTIONS: ESATQuestion[] = [
  // Scope Pekerjaan (4 questions)
  {
    code: 'scope_1',
    category: 'scope',
    type: 'likert',
    text: 'Saya memahami dengan jelas role dan tanggung jawab saya di project SMILE'
  },
  {
    code: 'scope_2',
    category: 'scope',
    type: 'likert',
    text: 'Scope pekerjaan disampaikan dengan jelas sejak awal'
  },
  {
    code: 'scope_3',
    category: 'scope',
    type: 'likert',
    text: 'Target dan ekspektasi project realistis untuk dikerjakan'
  },
  {
    code: 'scope_4',
    category: 'scope',
    type: 'likert',
    text: 'Perubahan requirement tidak menganggu fokus utama pekerjaan'
  },

  // Beban Kerja (6 questions)
  {
    code: 'workload_1',
    category: 'workload',
    type: 'likert',
    text: 'Beban kerja yang saya terima saat ini masih dalam batas wajar'
  },
  {
    code: 'workload_2',
    category: 'workload',
    type: 'likert',
    text: 'Pembagian task dilakukan secara adil'
  },
  {
    code: 'workload_3',
    category: 'workload',
    type: 'likert',
    text: 'Task yang saya pegang sesuai dengan kapasitas saya'
  },
  {
    code: 'workload_4',
    category: 'workload',
    type: 'likert',
    text: 'Timeline project memungkinkan saya menyelesaikan pekerjaan tanpa harus lembur'
  },
  {
    code: 'workload_5',
    category: 'workload',
    type: 'likert',
    text: 'Prioritas task disampaikan dengan jelas ketika ada banyak task bersamaan'
  },
  {
    code: 'workload_6',
    category: 'workload',
    type: 'likert',
    text: 'Saya memiliki waktu yang cukup untuk menjaga kualitas hasil kerja'
  },

  // Kolaborasi Tim (3 questions)
  {
    code: 'collaboration_1',
    category: 'collaboration',
    type: 'likert',
    text: 'Komunikasi antar tim project berjalan efektif'
  },
  {
    code: 'collaboration_2',
    category: 'collaboration',
    type: 'likert',
    text: 'Tim saling membantu ketika ada anggota tim lain yang memiliki beban kerja tinggi'
  },
  {
    code: 'collaboration_3',
    category: 'collaboration',
    type: 'likert',
    text: 'Saya merasa aman menyampaikan kendala saya ke tim ataupun PM'
  },

  // Proses Kerja & Tools (3 questions)
  {
    code: 'process_1',
    category: 'process',
    type: 'likert',
    text: 'Tools dan sistem kerja yang digunakan mendukung efisiensi pekerjaan saya'
  },
  {
    code: 'process_2',
    category: 'process',
    type: 'likert',
    text: 'Workflow di project membantu saya mengurangi beban kerja saya'
  },
  {
    code: 'process_3',
    category: 'process',
    type: 'likert',
    text: 'Dokumentasi teknis cukup membantu saya mempercepat penyelesaian task'
  },

  // Arahan PM (4 questions)
  {
    code: 'pm_1',
    category: 'pm_direction',
    type: 'likert',
    text: 'PM memberikan arahan dan prioritas kerja yang jelas'
  },
  {
    code: 'pm_2',
    category: 'pm_direction',
    type: 'likert',
    text: 'PM responsif ketika ada kendala teknis atau beban kerja berlebih'
  },
  {
    code: 'pm_3',
    category: 'pm_direction',
    type: 'likert',
    text: 'PM terbuka terhadap diskusi terkait beban kerja dan timeline'
  },
  {
    code: 'pm_4',
    category: 'pm_direction',
    type: 'likert',
    text: 'PM menghargai effort tim'
  },

  // Open-Ended (2 questions)
  {
    code: 'open_1',
    category: 'open_ended',
    type: 'text',
    text: 'Hal apa yang paling membantu anda dalam mengerjakan project?'
  },
  {
    code: 'open_2',
    category: 'open_ended',
    type: 'text',
    text: 'Hal apa yang perlu diperbaiki agar proses kerja berjalan lebih baik?'
  }
];

// Helper to get questions by category
export function getQuestionsByCategory(category: ESATCategory): ESATQuestion[] {
  return ESAT_QUESTIONS.filter(q => q.category === category);
}

// Helper to get all categories in order
export function getAllCategories(): ESATCategory[] {
  return ['scope', 'workload', 'collaboration', 'process', 'pm_direction', 'open_ended'];
}

// Helper to count questions per category
export function getQuestionCount(category: ESATCategory): number {
  return ESAT_QUESTIONS.filter(q => q.category === category).length;
}

// Helper to get total Likert questions (excluding open-ended)
export function getLikertQuestionCount(): number {
  return ESAT_QUESTIONS.filter(q => q.type === 'likert').length;
}
