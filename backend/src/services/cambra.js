const FACTORS = {
  disease_indicators: [
    {
      code: 'visible_cavities',
      label: 'Visible active cavities',
      weight: 3,
      clinician_only: true,
      question: 'Are there visible active cavities on examination?',
    },
    {
      code: 'white_spot_lesions',
      label: 'White-spot lesions on smooth surfaces',
      weight: 3,
      clinician_only: true,
      question: 'Are there white-spot lesions on smooth surfaces?',
    },
    {
      code: 'recent_restorations',
      label: 'Restorations placed in last 3 years',
      weight: 3,
      clinician_only: false,
      question: 'Have you had any fillings, crowns, or other restorations in the past 3 years?',
    },
  ],

  risk_factors: [
    {
      code: 'visible_plaque',
      label: 'Visible plaque on teeth',
      weight: 1,
      clinician_only: true,
      question: 'Is there visible plaque accumulation?',
    },
    {
      code: 'frequent_snacking',
      label: 'Frequent snacking (>3 times daily)',
      weight: 1,
      clinician_only: false,
      question: 'Do you snack between meals more than 3 times per day?',
    },
    {
      code: 'sugary_drinks_daily',
      label: 'Sugary or acidic drinks daily',
      weight: 1,
      clinician_only: false,
      question: 'Do you drink sugary or acidic beverages (soda, juice, sports drinks) daily?',
    },
    {
      code: 'inadequate_fluoride',
      label: 'Inadequate fluoride exposure',
      weight: 1,
      clinician_only: false,
      question: 'Do you avoid fluoridated water and fluoride toothpaste?',
    },
    {
      code: 'dry_mouth',
      label: 'Dry mouth or reduced saliva',
      weight: 1,
      clinician_only: false,
      question: 'Do you often experience dry mouth, or take medications that reduce saliva?',
    },
    {
      code: 'irregular_visits',
      label: 'Irregular dental visits',
      weight: 1,
      clinician_only: false,
      question: 'Is it more than 12 months since your last dental check-up?',
    },
  ],

  protective_factors: [
    {
      code: 'fluoride_toothpaste_twice',
      label: 'Brushes twice daily with fluoride toothpaste',
      weight: -1,
      clinician_only: false,
      question: 'Do you brush twice a day with fluoride toothpaste?',
    },
    {
      code: 'fluoride_mouthwash',
      label: 'Uses fluoride mouthwash daily',
      weight: -1,
      clinician_only: false,
      question: 'Do you use a fluoride mouthwash daily?',
    },
    {
      code: 'fluoridated_water',
      label: 'Drinks fluoridated water',
      weight: -1,
      clinician_only: false,
      question: 'Do you drink fluoridated tap water regularly?',
    },
    {
      code: 'xylitol_gum',
      label: 'Chews xylitol gum',
      weight: -1,
      clinician_only: false,
      question: 'Do you chew xylitol gum after meals?',
    },
    {
      code: 'recent_cleaning',
      label: 'Cleaning in last 6 months',
      weight: -1,
      clinician_only: false,
      question: 'Have you had a professional dental cleaning in the past 6 months?',
    },
  ],
};

function getAllFactors() {
  return FACTORS;
}

function getPatientFactors() {
  const filterToPatient = arr => arr.filter(f => !f.clinician_only);
  return {
    disease_indicators: filterToPatient(FACTORS.disease_indicators),
    risk_factors: filterToPatient(FACTORS.risk_factors),
    protective_factors: filterToPatient(FACTORS.protective_factors),
  };
}

function computeScore(selectedCodes) {
  const selected = new Set(selectedCodes || []);
  const breakdown = {
    disease_indicators: [],
    risk_factors: [],
    protective_factors: [],
  };
  let score = 0;

  for (const category of ['disease_indicators', 'risk_factors', 'protective_factors']) {
    for (const factor of FACTORS[category]) {
      if (selected.has(factor.code)) {
        score += factor.weight;
        breakdown[category].push({
          code: factor.code,
          label: factor.label,
          weight: factor.weight,
        });
      }
    }
  }

  let risk_level;
  if (score <= 1) risk_level = 'low';
  else if (score <= 4) risk_level = 'moderate';
  else risk_level = 'high';

  const recommendations = getRecommendations(risk_level);

  return {
    score,
    risk_level,
    breakdown,
    recommendations,
  };
}

function getRecommendations(risk_level) {
  const base = {
    low: {
      recall_months: 6,
      headline: 'Maintain your current oral care routine.',
      items: [
        'Continue brushing twice daily with fluoride toothpaste',
        'Floss daily',
        'Schedule a check-up every 6 months',
      ],
    },
    moderate: {
      recall_months: 4,
      headline: 'You have some risk factors that increase cavity risk.',
      items: [
        'Use a fluoride mouthwash daily',
        'Limit sugary snacks and drinks between meals',
        'Schedule a cleaning every 4 months',
        'Ask your dentist about fluoride varnish during your next visit',
      ],
    },
    high: {
      recall_months: 3,
      headline: 'Your risk of new cavities is elevated. Take action with your dentist.',
      items: [
        'Schedule a cleaning and exam every 3 months',
        'Ask your dentist about prescription-strength fluoride toothpaste',
        'Discuss dietary changes — frequent sugar exposure is a major contributor',
        'Consider xylitol gum and fluoride varnish treatments',
        'If you have dry mouth, ask about saliva substitutes or stimulants',
      ],
    },
  };
  return base[risk_level];
}

function validateFactorCodes(codes) {
  if (!Array.isArray(codes)) {
    return { valid: false, message: 'factor_codes must be an array' };
  }
  const validCodes = new Set([
    ...FACTORS.disease_indicators.map(f => f.code),
    ...FACTORS.risk_factors.map(f => f.code),
    ...FACTORS.protective_factors.map(f => f.code),
  ]);
  for (const code of codes) {
    if (!validCodes.has(code)) {
      return { valid: false, message: `Unknown factor code: ${code}` };
    }
  }
  return { valid: true };
}

module.exports = {
  getAllFactors,
  getPatientFactors,
  computeScore,
  getRecommendations,
  validateFactorCodes,
};