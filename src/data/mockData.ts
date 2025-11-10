
import { Indicator, Relationship } from '@/types';

const DEFAULT_CREATED_AT = '2024-01-01T00:00:00Z';
const DEFAULT_SCALE = { min: 0, max: 100 };

const makeIndicator = (
  id: string,
  name: string,
  category: string,
  description: string,
  currentValue: number
): Indicator => ({
  id,
  code: id,
  name,
  description,
  category,
  measurement_type: 'rating_scale',
  scale_config: DEFAULT_SCALE,
  created_at: DEFAULT_CREATED_AT,
  indicator_id: id,
  current_value: currentValue,
});

const makeRelationship = (
  id: string,
  parentId: string,
  childId: string,
  weight: number,
  score: number,
  correlation: number = score,
  sampleSize: number = 100
): Relationship => ({
  relationship_id: id,
  parent_id: parentId,
  child_id: childId,
  influence_weight: weight,
  influence_score: score,
  parent_indicator_id: parentId,
  child_indicator_id: childId,
  correlation_coefficient: correlation,
  sample_size: sampleSize,
  calculated_at: DEFAULT_CREATED_AT,
});

// ============================================================================
// MOCK DATA TOGGLE - Set to true to use hardcoded test data instead of DB
// ============================================================================
export const USE_MOCK_DATA = true; // Set to false to reconnect to database

// Mock multi-generational test data structure with clear multiparentalism:
// Level 1: "core" (root)
// Level 2: A, B, C, D, E
// Level 3: a, b, c, d, e, f, g, h, i, j, k, l
// Level 4: a1, b1, c1, d1, e1, f1, g1, h1, i1, j1, k1, l1
export const createMockData = () => {
  const mockIndicators: Indicator[] = [
    // Level 1: Core (root)
    makeIndicator('core', 'Core Wellbeing', 'Core', 'Root core indicator', 75),
    
    // Level 2: A, B, C, D, E
    makeIndicator('A', 'A - Health Domain', 'Health', 'Health domain indicator', 80),
    makeIndicator('B', 'B - Economic Domain', 'Economic', 'Economic domain indicator', 70),
    makeIndicator('C', 'C - Education Domain', 'Education', 'Education domain indicator', 72),
    makeIndicator('D', 'D - Environment Domain', 'Environment', 'Environment domain indicator', 68),
    makeIndicator('E', 'E - Social Domain', 'Social', 'Social domain indicator', 74),
    
    // Level 3: a, b, c, d, e, f, g, h, i, j, k, l
    makeIndicator('a', 'a - Primary Healthcare', 'Health', 'Primary healthcare access', 85),
    makeIndicator('b', 'b - Mental Health', 'Health', 'Mental health services', 75),
    makeIndicator('c', 'c - Employment Rate', 'Economic', 'Employment rate indicator', 65),
    makeIndicator('d', 'd - Income Level', 'Economic', 'Average income level', 60),
    makeIndicator('e', 'e - School Enrollment', 'Education', 'School enrollment rate', 78),
    makeIndicator('f', 'f - Literacy Rate', 'Education', 'Adult literacy rate', 82),
    makeIndicator('g', 'g - Air Quality', 'Environment', 'Air quality index', 70),
    makeIndicator('h', 'h - Water Access', 'Environment', 'Clean water access', 88),
    makeIndicator('i', 'i - Community Cohesion', 'Social', 'Community cohesion index', 76),
    makeIndicator('j', 'j - Safety Index', 'Social', 'Community safety index', 73),
    makeIndicator('k', 'k - Social Support', 'Social', 'Social support networks', 79),
    makeIndicator('l', 'l - Cultural Access', 'Social', 'Cultural activities access', 71),
    
    // // Level 4: a1, b1, c1, d1, e1, f1, g1, h1, i1, j1, k1, l1
    // makeIndicator('a1', 'a1 - Clinic Density', 'Health', 'Number of clinics per capita', 82),
    // makeIndicator('b1', 'b1 - Therapy Access', 'Health', 'Mental health therapy access', 68),
    // makeIndicator('c1', 'c1 - Job Opportunities', 'Economic', 'Available job opportunities', 62),
    // makeIndicator('d1', 'd1 - Wage Levels', 'Economic', 'Average wage levels', 58),
    // makeIndicator('e1', 'e1 - Early Education', 'Education', 'Early childhood education', 75),
    // makeIndicator('f1', 'f1 - Digital Literacy', 'Education', 'Digital literacy skills', 80),
    // makeIndicator('g1', 'g1 - Pollution Control', 'Environment', 'Pollution control measures', 72),
    // makeIndicator('h1', 'h1 - Sanitation Access', 'Environment', 'Sanitation facilities access', 85),
    // makeIndicator('i1', 'i1 - Local Events', 'Social', 'Community events frequency', 74),
    // makeIndicator('j1', 'j1 - Crime Rate', 'Social', 'Crime rate indicator', 71),
    // makeIndicator('k1', 'k1 - Family Networks', 'Social', 'Family support networks', 77),
    // makeIndicator('l1', 'l1 - Arts Programs', 'Social', 'Arts and culture programs', 69),
  ];

  const mockRelationships: Relationship[] = [
    // Level 1 -> Level 2: core -> A, B, C, D, E (must sum to 100%)
    makeRelationship('r1', 'core', 'A', 20, 0.8),
    makeRelationship('r2', 'core', 'B', 20, 0.75),
    makeRelationship('r3', 'core', 'C', 20, 0.77),
    makeRelationship('r4', 'core', 'D', 20, 0.73),
    makeRelationship('r5', 'core', 'E', 20, 0.76),
    
    // Level 2 -> Level 3: A -> a, b (must sum to 100% for parent A)
    makeRelationship('r6', 'A', 'a', 60, 0.9),
    makeRelationship('r7', 'A', 'b', 40, 0.85),
    // B -> c, d, a (must sum to 100% for parent B) - multiparent: a also has parent A
    makeRelationship('r8', 'B', 'c', 35, 0.88),
    makeRelationship('r9', 'B', 'd', 35, 0.82),
    makeRelationship('r10', 'B', 'a', 30, 0.75),
    // C -> e, f, c (must sum to 100% for parent C) - multiparent: c also has parent B
    makeRelationship('r11', 'C', 'e', 40, 0.87),
    makeRelationship('r12', 'C', 'f', 40, 0.9),
    makeRelationship('r19', 'C', 'c', 20, 0.78),
    // D -> g, h (must sum to 100% for parent D)
    makeRelationship('r13', 'D', 'g', 50, 0.83),
    makeRelationship('r14', 'D', 'h', 50, 0.91),
    // E -> i, j, k, l (must sum to 100% for parent E)
    makeRelationship('r15', 'E', 'i', 25, 0.86),
    makeRelationship('r16', 'E', 'j', 25, 0.84),
    makeRelationship('r17', 'E', 'k', 25, 0.89),
    makeRelationship('r18', 'E', 'l', 25, 0.81),
    
    // // Level 3 -> Level 4: a -> a1, b1 (must sum to 100% for parent a)
    // { relationship_id: 'r20', parent_id: 'a', child_id: 'a1', influence_weight: 60, influence_score: 0.92 },
    // { relationship_id: 'r21', parent_id: 'a', child_id: 'b1', influence_weight: 40, influence_score: 0.85 },
    // // b -> b1 (must sum to 100% for parent b - multiparent: b1 has both a and b)
    // { relationship_id: 'r22', parent_id: 'b', child_id: 'b1', influence_weight: 100, influence_score: 0.88 },
    // // c -> c1, d1 (must sum to 100% for parent c)
    // { relationship_id: 'r23', parent_id: 'c', child_id: 'c1', influence_weight: 55, influence_score: 0.87 },
    // { relationship_id: 'r24', parent_id: 'c', child_id: 'd1', influence_weight: 45, influence_score: 0.83 },
    // // d -> d1 (must sum to 100% for parent d - multiparent: d1 has both c and d)
    // { relationship_id: 'r25', parent_id: 'd', child_id: 'd1', influence_weight: 100, influence_score: 0.86 },
    // // e -> e1, f1 (must sum to 100% for parent e)
    // { relationship_id: 'r26', parent_id: 'e', child_id: 'e1', influence_weight: 50, influence_score: 0.89 },
    // { relationship_id: 'r27', parent_id: 'e', child_id: 'f1', influence_weight: 50, influence_score: 0.91 },
    // // f -> f1 (must sum to 100% for parent f)
    // { relationship_id: 'r28', parent_id: 'f', child_id: 'f1', influence_weight: 100, influence_score: 0.88 },
    // // g -> g1, h1 (must sum to 100% for parent g)
    // { relationship_id: 'r29', parent_id: 'g', child_id: 'g1', influence_weight: 55, influence_score: 0.84 },
    // { relationship_id: 'r30', parent_id: 'g', child_id: 'h1', influence_weight: 45, influence_score: 0.9 },
    // // h -> h1 (must sum to 100% for parent h)
    // { relationship_id: 'r31', parent_id: 'h', child_id: 'h1', influence_weight: 100, influence_score: 0.92 },
    // // i -> i1, j1 (must sum to 100% for parent i)
    // { relationship_id: 'r32', parent_id: 'i', child_id: 'i1', influence_weight: 60, influence_score: 0.87 },
    // { relationship_id: 'r33', parent_id: 'i', child_id: 'j1', influence_weight: 40, influence_score: 0.85 },
    // // j -> j1 (must sum to 100% for parent j)
    // { relationship_id: 'r34', parent_id: 'j', child_id: 'j1', influence_weight: 100, influence_score: 0.86 },
    // // k -> k1, l1 (must sum to 100% for parent k)
    // { relationship_id: 'r35', parent_id: 'k', child_id: 'k1', influence_weight: 55, influence_score: 0.9 },
    // { relationship_id: 'r36', parent_id: 'k', child_id: 'l1', influence_weight: 45, influence_score: 0.88 },
    // // l -> l1 (must sum to 100% for parent l)
    // { relationship_id: 'r37', parent_id: 'l', child_id: 'l1', influence_weight: 100, influence_score: 0.84 },
  ];

  return { indicators: mockIndicators, relationships: mockRelationships };
};