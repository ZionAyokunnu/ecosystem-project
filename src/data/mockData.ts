import { Indicator, Relationship } from '@/types';

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
    { indicator_id: 'core', name: 'Core Wellbeing', current_value: 75, category: 'Core', description: 'Root core indicator' },
    
    // Level 2: A, B, C, D, E
    { indicator_id: 'A', name: 'Health Domain', current_value: 80, category: 'Health', description: 'Health domain indicator' },
    { indicator_id: 'B', name: 'Economic Domain', current_value: 70, category: 'Economic', description: 'Economic domain indicator' },
    { indicator_id: 'C', name: 'Education Domain', current_value: 72, category: 'Education', description: 'Education domain indicator' },
    { indicator_id: 'D', name: 'Environment Domain', current_value: 68, category: 'Environment', description: 'Environment domain indicator' },
    { indicator_id: 'E', name: 'Social Domain', current_value: 74, category: 'Social', description: 'Social domain indicator' },
    
    // Level 3: a, b, c, d, e, f, g, h, i, j, k, l
    { indicator_id: 'a', name: 'Primary Healthcare', current_value: 85, category: 'Health', description: 'Primary healthcare access' },
    { indicator_id: 'b', name: 'Mental Health', current_value: 75, category: 'Health', description: 'Mental health services' },
    { indicator_id: 'c', name: 'Employment Rate', current_value: 65, category: 'Economic', description: 'Employment rate indicator' },
    { indicator_id: 'd', name: 'Income Level', current_value: 60, category: 'Economic', description: 'Average income level' },
    { indicator_id: 'e', name: 'School Enrollment', current_value: 78, category: 'Education', description: 'School enrollment rate' },
    { indicator_id: 'f', name: 'Literacy Rate', current_value: 82, category: 'Education', description: 'Adult literacy rate' },
    { indicator_id: 'g', name: 'Air Quality', current_value: 70, category: 'Environment', description: 'Air quality index' },
    { indicator_id: 'h', name: 'Water Access', current_value: 88, category: 'Environment', description: 'Clean water access' },
    { indicator_id: 'i', name: 'Community Cohesion', current_value: 76, category: 'Social', description: 'Community cohesion index' },
    { indicator_id: 'j', name: 'Safety Index', current_value: 73, category: 'Social', description: 'Community safety index' },
    { indicator_id: 'k', name: 'Social Support', current_value: 79, category: 'Social', description: 'Social support networks' },
    { indicator_id: 'l', name: 'Cultural Access', current_value: 71, category: 'Social', description: 'Cultural activities access' },
    
    // Level 4: a1, b1, c1, d1, e1, f1, g1, h1, i1, j1, k1, l1
    { indicator_id: 'a1', name: 'Clinic Density', current_value: 82, category: 'Health', description: 'Number of clinics per capita' },
    { indicator_id: 'b1', name: 'Therapy Access', current_value: 68, category: 'Health', description: 'Mental health therapy access' },
    { indicator_id: 'c1', name: 'Job Opportunities', current_value: 62, category: 'Economic', description: 'Available job opportunities' },
    { indicator_id: 'd1', name: 'Wage Levels', current_value: 58, category: 'Economic', description: 'Average wage levels' },
    { indicator_id: 'e1', name: 'Early Education', current_value: 75, category: 'Education', description: 'Early childhood education' },
    { indicator_id: 'f1', name: 'Digital Literacy', current_value: 80, category: 'Education', description: 'Digital literacy skills' },
    { indicator_id: 'g1', name: 'Pollution Control', current_value: 72, category: 'Environment', description: 'Pollution control measures' },
    { indicator_id: 'h1', name: 'Sanitation Access', current_value: 85, category: 'Environment', description: 'Sanitation facilities access' },
    { indicator_id: 'i1', name: 'Local Events', current_value: 74, category: 'Social', description: 'Community events frequency' },
    { indicator_id: 'j1', name: 'Crime Rate', current_value: 71, category: 'Social', description: 'Crime rate indicator' },
    { indicator_id: 'k1', name: 'Family Networks', current_value: 77, category: 'Social', description: 'Family support networks' },
    { indicator_id: 'l1', name: 'Arts Programs', current_value: 69, category: 'Social', description: 'Arts and culture programs' },
  ];

  const mockRelationships: Relationship[] = [
    // Level 1 -> Level 2: core -> A, B, C, D, E
    { relationship_id: 'r1', parent_id: 'core', child_id: 'A', influence_weight: 20, influence_score: 0.8 },
    { relationship_id: 'r2', parent_id: 'core', child_id: 'B', influence_weight: 20, influence_score: 0.75 },
    { relationship_id: 'r3', parent_id: 'core', child_id: 'C', influence_weight: 20, influence_score: 0.77 },
    { relationship_id: 'r4', parent_id: 'core', child_id: 'D', influence_weight: 20, influence_score: 0.73 },
    { relationship_id: 'r5', parent_id: 'core', child_id: 'E', influence_weight: 20, influence_score: 0.76 },
    
    // Level 2 -> Level 3: A -> a, b (multiparent: a also has parent B for demonstration)
    { relationship_id: 'r6', parent_id: 'A', child_id: 'a', influence_weight: 50, influence_score: 0.9 },
    { relationship_id: 'r7', parent_id: 'A', child_id: 'b', influence_weight: 50, influence_score: 0.85 },
    // B -> c, d (multiparent: c also connects to A)
    { relationship_id: 'r8', parent_id: 'B', child_id: 'c', influence_weight: 50, influence_score: 0.88 },
    { relationship_id: 'r9', parent_id: 'B', child_id: 'd', influence_weight: 50, influence_score: 0.82 },
    // MULTIPARENT: a has both A and B as parents
    { relationship_id: 'r10', parent_id: 'B', child_id: 'a', influence_weight: 30, influence_score: 0.75 },
    // C -> e, f
    { relationship_id: 'r11', parent_id: 'C', child_id: 'e', influence_weight: 50, influence_score: 0.87 },
    { relationship_id: 'r12', parent_id: 'C', child_id: 'f', influence_weight: 50, influence_score: 0.9 },
    // D -> g, h
    { relationship_id: 'r13', parent_id: 'D', child_id: 'g', influence_weight: 50, influence_score: 0.83 },
    { relationship_id: 'r14', parent_id: 'D', child_id: 'h', influence_weight: 50, influence_score: 0.91 },
    // E -> i, j, k, l
    { relationship_id: 'r15', parent_id: 'E', child_id: 'i', influence_weight: 25, influence_score: 0.86 },
    { relationship_id: 'r16', parent_id: 'E', child_id: 'j', influence_weight: 25, influence_score: 0.84 },
    { relationship_id: 'r17', parent_id: 'E', child_id: 'k', influence_weight: 25, influence_score: 0.89 },
    { relationship_id: 'r18', parent_id: 'E', child_id: 'l', influence_weight: 25, influence_score: 0.81 },
    // MULTIPARENT: c also has parent C
    { relationship_id: 'r19', parent_id: 'C', child_id: 'c', influence_weight: 25, influence_score: 0.78 },
    
    // Level 3 -> Level 4: a -> a1, b1
    { relationship_id: 'r20', parent_id: 'a', child_id: 'a1', influence_weight: 50, influence_score: 0.92 },
    { relationship_id: 'r21', parent_id: 'a', child_id: 'b1', influence_weight: 50, influence_score: 0.85 },
    // b -> b1 (multiparent - b1 has both a and b)
    { relationship_id: 'r22', parent_id: 'b', child_id: 'b1', influence_weight: 40, influence_score: 0.88 },
    // c -> c1, d1
    { relationship_id: 'r23', parent_id: 'c', child_id: 'c1', influence_weight: 50, influence_score: 0.87 },
    { relationship_id: 'r24', parent_id: 'c', child_id: 'd1', influence_weight: 50, influence_score: 0.83 },
    // d -> d1 (multiparent - d1 has both c and d)
    { relationship_id: 'r25', parent_id: 'd', child_id: 'd1', influence_weight: 40, influence_score: 0.86 },
    // e -> e1, f1
    { relationship_id: 'r26', parent_id: 'e', child_id: 'e1', influence_weight: 50, influence_score: 0.89 },
    { relationship_id: 'r27', parent_id: 'e', child_id: 'f1', influence_weight: 50, influence_score: 0.91 },
    // f -> f1 (multiparent)
    { relationship_id: 'r28', parent_id: 'f', child_id: 'f1', influence_weight: 40, influence_score: 0.88 },
    // g -> g1, h1
    { relationship_id: 'r29', parent_id: 'g', child_id: 'g1', influence_weight: 50, influence_score: 0.84 },
    { relationship_id: 'r30', parent_id: 'g', child_id: 'h1', influence_weight: 50, influence_score: 0.9 },
    // h -> h1 (multiparent)
    { relationship_id: 'r31', parent_id: 'h', child_id: 'h1', influence_weight: 40, influence_score: 0.92 },
    // i -> i1, j1
    { relationship_id: 'r32', parent_id: 'i', child_id: 'i1', influence_weight: 50, influence_score: 0.87 },
    { relationship_id: 'r33', parent_id: 'i', child_id: 'j1', influence_weight: 50, influence_score: 0.85 },
    // j -> j1 (multiparent)
    { relationship_id: 'r34', parent_id: 'j', child_id: 'j1', influence_weight: 40, influence_score: 0.86 },
    // k -> k1, l1
    { relationship_id: 'r35', parent_id: 'k', child_id: 'k1', influence_weight: 50, influence_score: 0.9 },
    { relationship_id: 'r36', parent_id: 'k', child_id: 'l1', influence_weight: 50, influence_score: 0.88 },
    // l -> l1 (multiparent)
    { relationship_id: 'r37', parent_id: 'l', child_id: 'l1', influence_weight: 40, influence_score: 0.84 },
  ];

  return { indicators: mockIndicators, relationships: mockRelationships };
};

