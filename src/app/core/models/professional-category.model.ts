export enum ProfessionalCategory {
  PHYSICIAN = 'PHYSICIAN',
  PSYCHOLOGIST = 'PSYCHOLOGIST',
  NUTRITIONIST = 'NUTRITIONIST',
  SPEECH_THERAPIST = 'SPEECH_THERAPIST',
  OCCUPATIONAL_THERAPIST = 'OCCUPATIONAL_THERAPIST',
  PSYCHOPEDAGOGIST = 'PSYCHOPEDAGOGIST',
  PHYSIOTHERAPIST = 'PHYSIOTHERAPIST',
  OTHER = 'OTHER',
}

export type ProfessionalCategoryType = keyof typeof ProfessionalCategory;

export const PROFESSIONAL_CATEGORY_LABELS: Record<ProfessionalCategory, string> = {
  [ProfessionalCategory.PHYSICIAN]: 'Médico',
  [ProfessionalCategory.PSYCHOLOGIST]: 'Psicólogo',
  [ProfessionalCategory.NUTRITIONIST]: 'Nutricionista',
  [ProfessionalCategory.SPEECH_THERAPIST]: 'Fonoaudiólogo',
  [ProfessionalCategory.OCCUPATIONAL_THERAPIST]: 'Terapeuta Ocupacional',
  [ProfessionalCategory.PSYCHOPEDAGOGIST]: 'Psicopedagogo',
  [ProfessionalCategory.PHYSIOTHERAPIST]: 'Fisioterapeuta',
  [ProfessionalCategory.OTHER]: 'Outro',
};
