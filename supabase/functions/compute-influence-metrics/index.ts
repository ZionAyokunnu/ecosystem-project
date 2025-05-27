
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Indicator {
  indicator_id: string;
  name: string;
  current_value: number;
  category: string;
}

interface HistoricalTrend {
  trend_id: string;
  indicator_id: string;
  year: number;
  value: number;
}

interface Relationship {
  relationship_id: string;
  parent_id: string;
  child_id: string;
  influence_weight: number;
  influence_score: number;
}

// Statistical utility functions
function mean(arr: number[]): number {
  return arr.reduce((sum, val) => sum + val, 0) / arr.length;
}

function standardDeviation(arr: number[]): number {
  const avg = mean(arr);
  const squareDiffs = arr.map(value => Math.pow(value - avg, 2));
  const avgSquareDiff = mean(squareDiffs);
  return Math.sqrt(avgSquareDiff);
}

function zScore(arr: number[]): number[] {
  const avg = mean(arr);
  const std = standardDeviation(arr);
  return std === 0 ? arr.map(() => 0) : arr.map(val => (val - avg) / std);
}

function correlation(x: number[], y: number[]): number {
  if (x.length !== y.length || x.length === 0) return 0;
  
  const n = x.length;
  const meanX = mean(x);
  const meanY = mean(y);
  
  let numerator = 0;
  let sumXSquared = 0;
  let sumYSquared = 0;
  
  for (let i = 0; i < n; i++) {
    const deltaX = x[i] - meanX;
    const deltaY = y[i] - meanY;
    numerator += deltaX * deltaY;
    sumXSquared += deltaX * deltaX;
    sumYSquared += deltaY * deltaY;
  }
  
  const denominator = Math.sqrt(sumXSquared * sumYSquared);
  return denominator === 0 ? 0 : numerator / denominator;
}

function linearRegression(X: number[][], y: number[]): number[] {
  if (X.length === 0 || X[0].length === 0) return [];
  
  const n = X.length;
  const m = X[0].length;
  
  // Add intercept column (constant term)
  const XWithIntercept = X.map(row => [1, ...row]);
  
  // Calculate (X^T * X)^-1 * X^T * y using normal equation
  const XTranspose = transpose(XWithIntercept);
  const XTX = matrixMultiply(XTranspose, XWithIntercept);
  const XTy = matrixVectorMultiply(XTranspose, y);
  
  try {
    const XTXInverse = matrixInverse(XTX);
    const coefficients = matrixVectorMultiply(XTXInverse, XTy);
    return coefficients;
  } catch (error) {
    console.warn('Matrix inversion failed, using fallback:', error);
    return new Array(m + 1).fill(0);
  }
}

function transpose(matrix: number[][]): number[][] {
  if (matrix.length === 0) return [];
  return matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]));
}

function matrixMultiply(A: number[][], B: number[][]): number[][] {
  if (A.length === 0 || B.length === 0 || A[0].length !== B.length) {
    throw new Error('Invalid matrix dimensions');
  }
  
  const result: number[][] = [];
  for (let i = 0; i < A.length; i++) {
    result[i] = [];
    for (let j = 0; j < B[0].length; j++) {
      let sum = 0;
      for (let k = 0; k < B.length; k++) {
        sum += A[i][k] * B[k][j];
      }
      result[i][j] = sum;
    }
  }
  return result;
}

function matrixVectorMultiply(matrix: number[][], vector: number[]): number[] {
  return matrix.map(row => 
    row.reduce((sum, val, idx) => sum + val * vector[idx], 0)
  );
}

function matrixInverse(matrix: number[][]): number[][] {
  const n = matrix.length;
  if (n === 0 || matrix[0].length !== n) {
    throw new Error('Matrix must be square');
  }
  
  // Create augmented matrix [A|I]
  const augmented: number[][] = [];
  for (let i = 0; i < n; i++) {
    augmented[i] = [...matrix[i]];
    for (let j = 0; j < n; j++) {
      augmented[i].push(i === j ? 1 : 0);
    }
  }
  
  // Gaussian elimination
  for (let i = 0; i < n; i++) {
    // Find pivot
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(augmented[k][i]) > Math.abs(augmented[maxRow][i])) {
        maxRow = k;
      }
    }
    
    // Swap rows
    [augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]];
    
    // Check for singular matrix
    if (Math.abs(augmented[i][i]) < 1e-10) {
      throw new Error('Matrix is singular');
    }
    
    // Scale pivot row
    const pivot = augmented[i][i];
    for (let j = 0; j < 2 * n; j++) {
      augmented[i][j] /= pivot;
    }
    
    // Eliminate column
    for (let k = 0; k < n; k++) {
      if (k !== i) {
        const factor = augmented[k][i];
        for (let j = 0; j < 2 * n; j++) {
          augmented[k][j] -= factor * augmented[i][j];
        }
      }
    }
  }
  
  // Extract inverse matrix
  const inverse: number[][] = [];
  for (let i = 0; i < n; i++) {
    inverse[i] = augmented[i].slice(n);
  }
  
  return inverse;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting influence metrics computation...');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Stage 1: Fetch all data
    console.log('Fetching indicators...');
    const { data: indicators, error: indicatorsError } = await supabase
      .from('indicators')
      .select('*');
    
    if (indicatorsError) throw indicatorsError;

    console.log('Fetching historical trends...');
    const { data: trends, error: trendsError } = await supabase
      .from('historical_trends')
      .select('*')
      .order('year', { ascending: true });
    
    if (trendsError) throw trendsError;

    console.log('Fetching relationships...');
    const { data: relationships, error: relationshipsError } = await supabase
      .from('relationships')
      .select('*');
    
    if (relationshipsError) throw relationshipsError;

    // Stage 2: Data transformation and filtering
    console.log('Processing data...');
    
    // Group trends by indicator
    const trendsByIndicator: Record<string, HistoricalTrend[]> = {};
    trends?.forEach(trend => {
      if (!trendsByIndicator[trend.indicator_id]) {
        trendsByIndicator[trend.indicator_id] = [];
      }
      trendsByIndicator[trend.indicator_id].push(trend);
    });

    // Filter indicators with sufficient data (at least 5 years)
    const validIndicators = indicators?.filter(indicator => {
      const indicatorTrends = trendsByIndicator[indicator.indicator_id] || [];
      const validYears = indicatorTrends.filter(t => t.value !== null && !isNaN(t.value));
      return validYears.length >= 5;
    }) || [];

    console.log(`Valid indicators: ${validIndicators.length}/${indicators?.length || 0}`);

    // Get all years and create aligned dataset
    const allYears = Array.from(new Set(trends?.map(t => t.year) || [])).sort();
    
    // Create normalized dataset
    const normalizedData: Record<string, Record<number, number>> = {};
    
    for (const indicator of validIndicators) {
      const indicatorTrends = trendsByIndicator[indicator.indicator_id] || [];
      const yearValues: Record<number, number> = {};
      
      indicatorTrends.forEach(trend => {
        if (trend.value !== null && !isNaN(trend.value)) {
          yearValues[trend.year] = trend.value;
        }
      });
      
      // Extract values for years that exist
      const values = allYears.map(year => yearValues[year]).filter(v => v !== undefined);
      
      if (values.length >= 5) {
        // Z-score normalization
        const zScored = zScore(values);
        let valueIndex = 0;
        normalizedData[indicator.indicator_id] = {};
        
        allYears.forEach(year => {
          if (yearValues[year] !== undefined) {
            normalizedData[indicator.indicator_id][year] = zScored[valueIndex];
            valueIndex++;
          }
        });
      }
    }

    // Stage 3: Compute influence scores (correlation-based)
    console.log('Computing influence scores...');
    const influenceScores: Record<string, number> = {};
    
    // Group relationships by parent
    const relationshipsByParent: Record<string, Relationship[]> = {};
    relationships?.forEach(rel => {
      if (!relationshipsByParent[rel.parent_id]) {
        relationshipsByParent[rel.parent_id] = [];
      }
      relationshipsByParent[rel.parent_id].push(rel);
    });

    for (const parentId of Object.keys(relationshipsByParent)) {
      const childRelationships = relationshipsByParent[parentId];
      const childIds = childRelationships.map(rel => rel.child_id);
      
      // Get overlapping years for all children
      const overlappingYears = allYears.filter(year => 
        childIds.every(childId => 
          normalizedData[childId] && normalizedData[childId][year] !== undefined
        )
      );
      
      if (overlappingYears.length < 3) {
        console.log(`Skipping parent ${parentId}: insufficient overlapping data`);
        continue;
      }
      
      // Create correlation matrix for children only
      const childData: Record<string, number[]> = {};
      childIds.forEach(childId => {
        if (normalizedData[childId]) {
          childData[childId] = overlappingYears.map(year => normalizedData[childId][year]);
        }
      });
      
      // Compute average correlation for each child with its siblings
      for (const childId of childIds) {
        if (!childData[childId]) continue;
        
        const correlations: number[] = [];
        for (const siblingId of childIds) {
          if (siblingId !== childId && childData[siblingId]) {
            const corr = correlation(childData[childId], childData[siblingId]);
            if (!isNaN(corr)) {
              correlations.push(Math.abs(corr)); // Use absolute correlation
            }
          }
        }
        
        const avgCorrelation = correlations.length > 0 ? mean(correlations) : 0;
        influenceScores[`${parentId}_${childId}`] = Math.max(0.01, Math.min(1.0, avgCorrelation));
      }
    }

    // Stage 4: Compute influence weights (OLS regression)
    console.log('Computing influence weights...');
    const influenceWeights: Record<string, number> = {};
    
    for (const parentId of Object.keys(relationshipsByParent)) {
      const childRelationships = relationshipsByParent[parentId];
      const childIds = childRelationships.map(rel => rel.child_id);
      
      if (!normalizedData[parentId]) continue;
      
      // Get overlapping years for parent and all children
      const overlappingYears = allYears.filter(year => 
        normalizedData[parentId][year] !== undefined &&
        childIds.every(childId => 
          normalizedData[childId] && normalizedData[childId][year] !== undefined
        )
      );
      
      if (overlappingYears.length < 5) {
        console.log(`Skipping regression for parent ${parentId}: insufficient overlapping data`);
        continue;
      }
      
      // Prepare regression data with 1-year lag
      const X: number[][] = [];
      const y: number[] = [];
      
      for (let i = 0; i < overlappingYears.length - 1; i++) {
        const currentYear = overlappingYears[i];
        const nextYear = overlappingYears[i + 1];
        
        // X = children values at current year
        const childValues = childIds.map(childId => normalizedData[childId][currentYear]);
        if (childValues.every(val => !isNaN(val))) {
          X.push(childValues);
          // y = parent value at next year
          y.push(normalizedData[parentId][nextYear]);
        }
      }
      
      if (X.length < 3) {
        console.log(`Skipping regression for parent ${parentId}: insufficient lagged data`);
        continue;
      }
      
      try {
        const coefficients = linearRegression(X, y);
        
        if (coefficients.length > 0) {
          // Intercept (self-influence)
          influenceWeights[`${parentId}_${parentId}`] = coefficients[0] * 100; // Scale to -100 to 100
          
          // Child coefficients
          for (let i = 0; i < childIds.length; i++) {
            if (coefficients[i + 1] !== undefined) {
              influenceWeights[`${parentId}_${childIds[i]}`] = coefficients[i + 1] * 100; // Scale to -100 to 100
            }
          }
        }
      } catch (error) {
        console.warn(`Regression failed for parent ${parentId}:`, error);
      }
    }

    // Stage 5: Update relationships table
    console.log('Updating relationships...');
    let updatedCount = 0;
    let skippedCount = 0;
    
    for (const relationship of relationships || []) {
      const scoreKey = `${relationship.parent_id}_${relationship.child_id}`;
      const weightKey = `${relationship.parent_id}_${relationship.child_id}`;
      
      const newScore = influenceScores[scoreKey];
      const newWeight = influenceWeights[weightKey];
      
      if (newScore !== undefined || newWeight !== undefined) {
        const updateData: any = {};
        if (newScore !== undefined) updateData.influence_score = newScore;
        if (newWeight !== undefined) updateData.influence_weight = newWeight;
        
        const { error: updateError } = await supabase
          .from('relationships')
          .update(updateData)
          .eq('relationship_id', relationship.relationship_id);
        
        if (updateError) {
          console.error(`Failed to update relationship ${relationship.relationship_id}:`, updateError);
        } else {
          updatedCount++;
        }
      } else {
        skippedCount++;
      }
    }

    const summary = {
      totalIndicators: indicators?.length || 0,
      validIndicators: validIndicators.length,
      totalRelationships: relationships?.length || 0,
      updatedRelationships: updatedCount,
      skippedRelationships: skippedCount,
      influenceScoreRange: {
        min: Math.min(...Object.values(influenceScores)),
        max: Math.max(...Object.values(influenceScores))
      },
      influenceWeightRange: {
        min: Math.min(...Object.values(influenceWeights)),
        max: Math.max(...Object.values(influenceWeights))
      }
    };

    console.log('Computation complete:', summary);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Influence metrics computed and updated successfully',
        summary
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error computing influence metrics:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});