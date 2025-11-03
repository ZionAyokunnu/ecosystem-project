import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import { SunburstNode, SunburstLink } from '@/types';
import { set } from 'date-fns';

interface SunburstChartProps {
  nodes: SunburstNode[];
  links: SunburstLink[];
  width?: number;
  height?: number;
  onSelect?: (indicatorId: string) => void;
  maxLayers?: number;
  showLabels?: boolean;
  onBreadcrumbsChange?: (items: Array<{ id: string; name: string }>) => void;
  onVisibleNodesChange?: (visible: SunburstNode[]) => void;
  onCoreChange?: (id: string | null) => void;
  fixedMode?: boolean;
}

const SunburstChart: React.FC<SunburstChartProps> = ({
  nodes,
  links,
  width = 600,
  height = 600,
  onSelect, 
  maxLayers = 3,
  showLabels = false,
  onBreadcrumbsChange,
  onVisibleNodesChange,
  onCoreChange
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [pivotId, setPivotId] = useState<string | null>(null);
  // stack of drill‑in pivots so we can step back one level at a time
  const [pivotStack, setPivotStack] = useState<string[]>([]);
    // which slice is currently selected (for highlight)
  const [selectedId, setSelectedId] = useState<string | null>(null);

    // Track previous visible node IDs to avoid infinite update loops
  const prevVisibleIds = useRef<string[]>([]);

  const prevCount = useRef(nodes.length + links.length);

  const pivotStackRef = useRef<string[]>([]);

  useEffect(() => {
    const thisCount = nodes.length + links.length;
    if (thisCount !== prevCount.current) {          // real data size changed
      setPivotId(null);
      setPivotStack([]);          // clear breadcrumb stack
      onCoreChange?.(null);
      prevCount.current = thisCount;
    }
  }, [nodes, links]);

  
  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return;
    console.clear();

    // === RAW INFLOW PROBE (no transforms) ===
    try {
      // 0) Basic presence
      console.log("🟦 RAW/INCOMING Sunburst props");
      console.log("nodes.length:", nodes?.length ?? "(undefined)");
      console.log("links.length:", links?.length ?? "(undefined)");

      // 1) Quick shape check
      const nodeKeys = new Set<string>();
      const linkKeys = new Set<string>();
      (nodes ?? []).slice(0, 50).forEach(n => Object.keys(n || {}).forEach(k => nodeKeys.add(k)));
      (links ?? []).slice(0, 50).forEach(l => Object.keys(l || {}).forEach(k => linkKeys.add(k)));

      console.log("node keys (sampled):", Array.from(nodeKeys).sort());
      console.log("link keys (sampled):", Array.from(linkKeys).sort());

      // 2) Show a small, readable sample
      console.log("nodes sample →");
      console.table((nodes ?? []).slice(0, 10));
      console.log("links sample →");
      console.table((links ?? []).slice(0, 10));

      // 3) Critical fields sanity on ALL links (counts only; cheap)
      let missingPid = 0, missingCid = 0, missingWeightish = 0;
      let zeroWeightish = 0, totalLinksSeen = 0;

      // which field(s) are actually present?
      const weightFieldGuesses = ["child_to_parent_weight", "influence_weight", "weight"];
      const scoreFieldGuesses  = ["influence_score", "correlation", "score"];

      (links ?? []).forEach(l => {
        totalLinksSeen++;
        const pid = (l as any)?.parent_id;
        const cid = (l as any)?.child_id;
        if (!pid) missingPid++;
        if (!cid) missingCid++;

        // detect the first existing weight-like field on this row
        const wf = weightFieldGuesses.find(f => (l as any)?.[f] !== undefined);
        if (!wf) {
          missingWeightish++;
        } else {
          const w = Number((l as any)[wf]);
          if (!Number.isFinite(w) || w === 0) zeroWeightish++;
        }
      });

      console.log("🔎 Link field presence:");
      console.log({ totalLinksSeen, missingPid, missingCid, missingWeightish, zeroWeightish });

      console.log("Weight fields seen (any row):",
        weightFieldGuesses.filter(f => (links ?? []).some(l => (l as any)?.[f] !== undefined))
      );
      console.log("Score fields seen (any row):",
        scoreFieldGuesses.filter(f => (links ?? []).some(l => (l as any)?.[f] !== undefined))
      );

      // 4) ID integrity (are node ids unique? do links reference unknown ids?)
      const nodeIds = new Set((nodes ?? []).map(n => (n as any)?.id).filter(Boolean));
      const dupNodeIds = (() => {
        const seen = new Set<string>();
        const dups = new Set<string>();
        (nodes ?? []).forEach(n => {
          const id = (n as any)?.id;
          if (!id) return;
          if (seen.has(id)) dups.add(id);
          else seen.add(id);
        });
        return Array.from(dups);
      })();

      let badRefs = 0;
      (links ?? []).forEach(l => {
        const pid = (l as any)?.parent_id;
        const cid = (l as any)?.child_id;
        if (pid && !nodeIds.has(pid)) badRefs++;
        if (cid && !nodeIds.has(cid)) badRefs++;
      });

      console.log("🧩 Node ID integrity:", {
        uniqueNodeIds: nodeIds.size,
        totalNodes: nodes?.length ?? 0,
        duplicateNodeIds: dupNodeIds.length,
        dupSamples: dupNodeIds.slice(0, 10),
        badLinkEndpointRefs: badRefs
      });

      // 5) Make it easy to inspect deeply in devtools
      (window as any).__sunburst_raw__ = { nodes, links };
      console.log("🔗 window.__sunburst_raw__ set (inspect in console)");

      // 6) Optional: quick download of raw as JSON (uncomment when needed)
      // const blob = new Blob([JSON.stringify({nodes, links}, null, 2)], {type: "application/json"});
      // (window as any).__sunburst_download__ = URL.createObjectURL(blob);
      // console.log("⬇️ Download raw JSON:", (window as any).__sunburst_download__);

    } catch (e) {
      console.error("RAW INFLOW PROBE failed:", e);
    }

    
    // Perfect utility function
    const norm = (v: unknown, fallback = 0) => {
      const n = v === null || v === undefined ? NaN : Number(v);
      return Number.isFinite(n) ? n : fallback;
    };
    
    // Smart field mapping + type coercion
    const linksN = links.map(l => ({
      parent_id: l.parent_id,
      child_id: l.child_id,
      weight: (() => {
        const raw = norm((l as any).child_to_parent_weight ?? (l as any).influence_weight ?? (l as any).weight, 0);
        // Scale up tiny values to prevent authority death
        return raw === 0 ? 0 : Math.max(raw, 0.1); // Minimum meaningful weight
      })(),
      score: norm((l as any).influence_score ?? (l as any).correlation, 0.1)
    }));
    
    console.log("🔎 normalized links sample:", linksN.slice(0, 5));
    
    const weightStats = linksN.reduce((stats, link) => {
      if (link.weight === 0) stats.zero++;
      else if (link.weight < 0.01) stats.tiny++;
      else stats.normal++;
      return stats;
    }, { zero: 0, tiny: 0, normal: 0 });
    
    console.log("🔍 Weight distribution:", weightStats);
    console.log("Sample weights:", linksN.slice(0, 10).map(l => l.weight));
    
    // Clear previous chart
    d3.select(svgRef.current).selectAll("*").remove();
    const svg = d3.select(svgRef.current)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("preserveAspectRatio", "xMidYMid meet")
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);
    

    // Build hierarchy data
    const nodeMap = new Map<string, any>();
    
    // Initialize nodes
    nodes.forEach(node => {
      nodeMap.set(node.id, {
        id: node.id,
        name: node.name,
        value: node.value,
        color: node.color,
        category: node.category,
        children: [],
        parents: new Set<string>()
      });
    });
      // 1) Debug: dump all nodes & links
  console.log("▶️ Sunburst data dump:", {
    allNodes: Array.from(nodeMap.values()).map(n => n.id),
    allLinks: links.map(l => `${l.parent_id}→${l.child_id}`)
  });
    // Build inverse child-to-parent mapping
    const childToParents = new Map<string, string[]>();
    linksN.forEach(link => {
      if (!childToParents.has(link.child_id)) {
        childToParents.set(link.child_id, []);
      }
      childToParents.get(link.child_id)!.push(link.parent_id);
    });

      // 2) Debug: show the mapping
  console.log("▶️ childToParents map:", Object.fromEntries(childToParents));

  // Drop self-parent entries so root detection ignores self-links
  childToParents.forEach((parents, childId) => {
    childToParents.set(childId, parents.filter(p => p !== childId));
  });
  // Recompute orphan candidates: those with no non-self parents
  const orphanIds = Array.from(nodeMap.values())
    .filter(node => {
      const parents = childToParents.get(node.id) || [];
      return parents.length === 0;
    })
    .map(node => node.id);
  console.log("▶️ Non-self orphan (root) candidates:", orphanIds);

    // Attach each child node under its parent(s) with relationship info
    linksN.forEach(link => {
      // Skip self-links to prevent cycles
      if (link.parent_id === link.child_id) return;
      const parent = nodeMap.get(link.parent_id);
      const child = nodeMap.get(link.child_id);
      if (parent && child) {
        // Add to children array if not already present
        if (!parent.children.some((c: any) => c.id === child.id)) {
          // Store the relationship info in the child for later reference
          const childWithRelationship = {
            ...child,
            weight: link.weight,
            correlation: link.score
          };
          parent.children.push(childWithRelationship);
        }
      }
    });

    // Build actual root nodes from orphanIds (non-self parents)
    const rootNodes = orphanIds
      .map(id => nodeMap.get(id))
      .filter((n): n is any => !!n);

    if (rootNodes.length === 0) {
      console.error("No root nodes found in the data");
      return;
    }

    // Determine root data: pivoted or full forest (treat 'root' as no pivot)
    const hierarchyData = pivotId && pivotId !== 'root'
      ? nodeMap.get(pivotId)!
    : {
        id: 'root',
        name: 'Root', 
        children: rootNodes.map(n => nodeMap.get(n.id)!) // Real nodes with .children
      };



      // 🎯 VISIBILITY-ONLY OPTIMIZATION: Determine visible nodes early
      function getVisibleNodeIds(pivotId: string | null, maxLayers: number): Set<string> {
        const visibleIds = new Set<string>();
        
        // Start from roots or pivot
        const startNodes = pivotId && pivotId !== 'root' 
          ? [pivotId] 
          : rootNodes.map(n => n.id);
        
        // BFS to collect visible nodes up to maxLayers depth
        const queue = startNodes.map(id => ({ id, depth: 0 }));
        
        while (queue.length > 0) {
          const { id, depth } = queue.shift()!;
          
          if (depth > maxLayers) continue;
          visibleIds.add(id);
          
          const node = nodeMap.get(id);
          if (node?.children && depth < maxLayers) {
            node.children.forEach(child => {
              queue.push({ id: child.id, depth: depth + 1 });
            });
          }
        }
        
        return visibleIds;
      }

      const visibleNodeIds = getVisibleNodeIds(pivotId, maxLayers);
      console.log(`🎯 Visible-only calculation: ${visibleNodeIds.size} nodes (vs ${nodeMap.size} total)`);



    //location 1
    // INSERT GRAVITY CALCULATION HERE *** (see function below)
    // *** GRAVITY MODEL ADDITION - Phase 1 ***
    function addGravityMetadata() {
      console.log("🧪 GRAVITY MODEL: Adding gravity metadata to VISIBLE nodes only");
      
      const AUTHORITY_DECAY_FACTOR = 1;
      
      // Step 1: Add gravity metadata to VISIBLE nodes only
      visibleNodeIds.forEach(nodeId => {
        const node = nodeMap.get(nodeId);
        if (node) {
          node.gravityPoints = new Map();
          node.totalGravity = 0;
          node.authorityLevel = 0;
          node.equilibriumAngle = 0;
        }
      });
      
      // Step 2: Calculate authority levels (VISIBLE only)
      const rootId = hierarchyData.id;
      function calculateAuthority(nodeId: string, authority = 1.0, depth = 0) {
        // ✅ STOP if node not visible
        if (!visibleNodeIds.has(nodeId)) return;
        
        const node = nodeMap.get(nodeId);
        if (!node || depth > maxLayers) return;
        
        node.authorityLevel = authority;
        
        if (node.children && node.children.length > 0) {
          // Only process visible children
          const visibleChildren = node.children.filter(child => visibleNodeIds.has(child.id));
          
          const totalChildInfluence = visibleChildren.reduce((sum: number, child: any) => {
            return sum + (typeof child.weight === 'number' ? child.weight : 0);
          }, 0);
          
          // IMPROVED: Handle zero-sum case properly
          const zeroSum = totalChildInfluence <= 0;
          const denom = zeroSum ? visibleChildren.length : totalChildInfluence;
          
          visibleChildren.forEach((childRef: any) => {
            const w = zeroSum ? 1 : Math.max(0, Number(childRef.weight) || 0);
            const childAuthority = authority * AUTHORITY_DECAY_FACTOR * (w / denom);
            calculateAuthority(childRef.id, childAuthority, depth + 1);
          });
        }
      }
      
      // Seed authority from visible roots/pivot
      if (pivotId && pivotId !== 'root') {
        calculateAuthority(pivotId, 1.0, 0);
      } else {
        rootNodes.forEach((rootNode: any) => {
          if (visibleNodeIds.has(rootNode.id)) {
            calculateAuthority(rootNode.id, 1.0, 0);
          }
        });
      }
    
      // Authority summary for visible nodes only
      console.log(`📊 VISIBLE AUTHORITY CALCULATION SUMMARY:`);
      const visibleAuthorityResults: Array<{id: string; authority: number; childCount: number}> = [];
      visibleNodeIds.forEach(nodeId => {
        const node = nodeMap.get(nodeId);
        if (node) {
          visibleAuthorityResults.push({
            id: node.id,
            authority: node.authorityLevel,
            childCount: node.children?.filter(c => visibleNodeIds.has(c.id)).length || 0
          });
        }
      });
      
      visibleAuthorityResults.sort((a, b) => b.authority - a.authority);
      console.log(`Authority calculated for ${visibleAuthorityResults.length} VISIBLE nodes:`);
      visibleAuthorityResults.slice(0, 10).forEach(r => {
        console.log(`  ${r.id}: authority=${r.authority.toFixed(3)}, visibleChildren=${r.childCount}`);
      });
    
      // Step 3: Distribute gravity points (VISIBLE parents only)
      visibleNodeIds.forEach(nodeId => {
        const node = nodeMap.get(nodeId);
        if (!node?.children || node.children.length === 0) return;
        
        // Only consider visible children
        const visibleChildren = node.children.filter(child => visibleNodeIds.has(child.id));
        if (visibleChildren.length === 0) return;
        
        const parentGravityBudget = (() => {
          const sumWeights = visibleChildren.reduce((s: number, c: any) => {
            return s + (typeof c.weight === 'number' ? c.weight : 0);
          }, 0);
          return sumWeights > 0 ? sumWeights : 1;
        })();
        
        const totalChildInfluenceScore = visibleChildren.reduce((sum: number, child: any) => {
          return sum + (typeof child.correlation === 'number' ? child.correlation : 0.1);
        }, 0);
        const safeScore = totalChildInfluenceScore > 0 ? totalChildInfluenceScore : 1;
    
        visibleChildren.forEach((childRef: any) => {
          const childNode = nodeMap.get(childRef.id);
          if (!childNode) return;
          
          const childCorrelation = typeof childRef.correlation === 'number' ? childRef.correlation : 0.1;
          const gravityPointsFromThisParent = (childCorrelation / safeScore) * parentGravityBudget;
          const finalGravityValue = gravityPointsFromThisParent * node.authorityLevel;
          
          childNode.gravityPoints.set(nodeId, finalGravityValue);
        });
      });
      
      // Step 4: Calculate total gravity for visible nodes only
      visibleNodeIds.forEach(nodeId => {
        const node = nodeMap.get(nodeId);
        if (node) {
          node.totalGravity = Array.from(node.gravityPoints.values()).reduce((sum: number, gravity: unknown) => {
            return sum + (typeof gravity === 'number' ? gravity : 0);
          }, 0);
        }
      });
      
      console.log("🧪 GRAVITY MODEL: VISIBLE-ONLY metadata calculation complete");
    }
    

    // Call the gravity calculation
    addGravityMetadata();
    
    console.log('PivotId:', pivotId);
    console.log('Hierarchy Data:', hierarchyData);


        // Create a lookup of influence_score for parent→child links
    const influenceScoreMap = new Map(
      linksN.map(link => [`${link.parent_id}_${link.child_id}`, link.score])
    );



        // Create hierarchy
    const root = d3.hierarchy(hierarchyData as any)
      .count()
      .sort((a, b) => {
        const pid = a.parent?.data.id;
        if (!pid) return 0;
        const scoreA = influenceScoreMap.get(`${pid}_${a.data.id}`) ?? 0;
        const scoreB = influenceScoreMap.get(`${pid}_${b.data.id}`) ?? 0;
        return scoreB - scoreA; // descending: highest influence first
      });

      
    // Build hierarchy and size/arcs based on node value, sorting siblings by influence_score
    // Calculate node values for sizing
    // root.sum((d: any) => d.value);
    // root.count()
    console.log('Root before partition:', root.descendants().map(d => ({ id: d.data.id, depth: d.depth })));
    
    const radius = Math.min(width, height) / 2;
    const layers = maxLayers;
    const ringWidth = radius / layers;
    
    // Create partition layout
    const partition = d3.partition()
      .size([2 * Math.PI, layers]);
    
    // Compute the partition layout
    partition(root);
    console.log('Root after partition:', root.descendants().map(d => ({
      id: d.data.id,
      depth: d.depth,
      x0: d.x0, x1: d.x1,
      y0: d.y0, y1: d.y1
    })));


    // *** PHASE 2: EQUILIBRIUM POSITIONING ***
    console.log("🌌 PHASE 2: Calculating Equilibrium Positions");

    // Field-consistent utility functions
    function fnv1a32(str: string): number {
      let h = 0x811c9dc5;
      for (let i = 0; i < str.length; i++) {
        h ^= str.charCodeAt(i);
        h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
      }
      return h >>> 0;
    }

    function stableHashToMinus1to1(id: string): number {
      return (fnv1a32(id) / 0xFFFFFFFF) * 2 - 1; // [-1,1]
    }

    function microJitterDeg(id: string, magDeg = 0.25): number {
      return stableHashToMinus1to1(id) * magDeg;
    }

    function massWeightedCircularMean(sources: Array<{angleDeg: number, mass: number}>): number | null {
      let sx = 0, sy = 0, wsum = 0;
      for (const s of sources) {
        const rad = s.angleDeg * Math.PI / 180;
        sx += Math.cos(rad) * s.mass;
        sy += Math.sin(rad) * s.mass;
        wsum += s.mass;
      }
      if (wsum <= 0 || (sx === 0 && sy === 0)) return null; // zero vector
      let deg = Math.atan2(sy, sx) * 180 / Math.PI;
      if (deg < 0) deg += 360;
      return deg;
    }



    //location 2
    // *** INSERT GRAVITY INSPECTION HERE// *** PHASE 2: EQUILIBRIUM POSITIONING ***
    console.log("🌌 PHASE 2: Calculating Equilibrium Positions");


    function calculateEquilibriumPositions() {
      // Step 1: Organize visible nodes by generation
      const generations = new Map<number, string[]>();
      visibleNodeIds.forEach(nodeId => {
        const node = nodeMap.get(nodeId);
        if (!node) return;
        
        // Calculate depth from pivot/root
        let depth = 0;
        const hierarchyNode = root.descendants().find(d => d.data.id === nodeId);
        if (hierarchyNode) {
          depth = hierarchyNode.depth;
        }
        
        if (!generations.has(depth)) {
          generations.set(depth, []);
        }
        generations.get(depth)!.push(nodeId);
      });
      
      console.log("📊 Generations:", Object.fromEntries(generations));
      
      // Step 2: Calculate equilibrium positions
      const equilibriumPositions = new Map<string, {angle: number, radius: number}>();
      
      // Generation 0 (root/pivot) - center
      const gen0 = generations.get(0) || [];
      gen0.forEach(nodeId => {
        equilibriumPositions.set(nodeId, { angle: 0, radius: 0 });
        console.log(`Gen-0 ${nodeId}: center (0°, 0)`);
      });
      
      // Generation 1 - Mass-proportional placement around ring
      const gen1 = generations.get(1) || [];
      if (gen1.length > 0) {
        console.log(`\n⚖️ Gen-1 Mass-Proportional Placement (${gen1.length} nodes):`);
        
        // Calculate mass shares for each child
        const massShares = gen1.map(nodeId => {
          const node = nodeMap.get(nodeId);
          const mass = node?.totalGravity || 0;
          return { nodeId, mass };
        });
        
        const totalMass = massShares.reduce((sum, item) => sum + item.mass, 0);
        
        if (totalMass > 0) {
          let cumulativeMass = 0;
          massShares.forEach(item => {
            const massShare = item.mass / totalMass;
            const sectorCenter = 360 * (cumulativeMass + massShare / 2);
            const jitter = microJitterDeg(item.nodeId, 0.3);
            const finalAngle = (sectorCenter + jitter) % 360;
            
            equilibriumPositions.set(item.nodeId, { 
              angle: finalAngle, 
              radius: 1 * ringWidth 
            });
            
            console.log(`  ${item.nodeId}: mass=${item.mass.toFixed(3)} (${(massShare*100).toFixed(1)}%) → ${sectorCenter.toFixed(1)}° + jitter=${jitter.toFixed(2)}° → ${finalAngle.toFixed(1)}°`);
            
            cumulativeMass += massShare;
          });
        } else {
          // Fallback for zero-mass case - equal spacing with jitter
          gen1.forEach((nodeId, index) => {
            const baseAngle = (index / gen1.length) * 360;
            const jitter = microJitterDeg(nodeId, 0.5);
            const finalAngle = (baseAngle + jitter) % 360;
            
            equilibriumPositions.set(nodeId, { 
              angle: finalAngle, 
              radius: 1 * ringWidth 
            });
            
            console.log(`  ${nodeId}: zero-mass fallback → ${finalAngle.toFixed(1)}°`);
          });
        }
      }
      
      // Generation 2+ - Mass-weighted circular mean from parents
      for (let depth = 2; depth <= Math.max(...generations.keys()); depth++) {
        const genNodes = generations.get(depth) || [];
        if (genNodes.length === 0) continue;
        
        console.log(`\n⚖️ Gen-${depth} Field-Derived Positions (${genNodes.length} nodes):`);
        
        genNodes.forEach(nodeId => {
          const node = nodeMap.get(nodeId);
          if (!node || !node.gravityPoints || node.gravityPoints.size === 0) {
            // No gravity sources - use jitter only
            const jitter = microJitterDeg(nodeId, 1.0);
            equilibriumPositions.set(nodeId, { 
              angle: jitter < 0 ? jitter + 360 : jitter, 
              radius: depth * ringWidth 
            });
            console.log(`  ${nodeId}: no gravity sources → jitter-only ${jitter.toFixed(1)}°`);
            return;
          }
          
          // Build parent angle/mass pairs
          const parentSources: Array<{angleDeg: number, mass: number}> = [];
          node.gravityPoints.forEach((gravityValue: number, parentId: string) => {
            const parentPos = equilibriumPositions.get(parentId);
            if (parentPos && gravityValue > 0) {
              parentSources.push({
                angleDeg: parentPos.angle,
                mass: gravityValue
              });
            }
          });
          
          console.log(`  ${nodeId} parents:`, parentSources.map(p => `${p.angleDeg.toFixed(1)}°(${p.mass.toFixed(2)})`));
          
          let finalAngle: number;
          
          if (parentSources.length === 0) {
            // No valid parents
            finalAngle = microJitterDeg(nodeId, 1.0);
            console.log(`    → No valid parents, jitter-only: ${finalAngle.toFixed(1)}°`);
          } else {
            // Try mass-weighted circular mean
            const weightedMean = massWeightedCircularMean(parentSources);
            
            if (weightedMean !== null) {
              // Normal case - weighted direction exists
              const jitter = microJitterDeg(nodeId, 0.15);
              finalAngle = (weightedMean + jitter) % 360;
              console.log(`    → Weighted mean: ${weightedMean.toFixed(1)}° + jitter: ${jitter.toFixed(2)}° = ${finalAngle.toFixed(1)}°`);
            } else {
              // Perfect cancellation - use simple mean of parent angles
              const simpleMean = parentSources.reduce((sum, p) => sum + p.angleDeg, 0) / parentSources.length;
              const jitter = microJitterDeg(nodeId, 0.3);
              finalAngle = (simpleMean + jitter) % 360;
              console.log(`    → Perfect cancellation, simple mean: ${simpleMean.toFixed(1)}° + jitter: ${jitter.toFixed(2)}° = ${finalAngle.toFixed(1)}°`);
            }
          }
          
          if (finalAngle < 0) finalAngle += 360;
          
          equilibriumPositions.set(nodeId, { 
            angle: finalAngle, 
            radius: depth * ringWidth 
          });
        });
      }
      
      return equilibriumPositions;
    }

    const equilibriumPositions = calculateEquilibriumPositions();

    // Step 3: Field vs D3 Comparison (Educational)
    console.log("\n🔍 PHASE 2: Field-Derived vs D3 Partition Comparison");
    console.log("(Field positions should now avoid 0° pile-ups)");

    let gen1Spread = 0;
    visibleNodeIds.forEach(nodeId => {
      const hierarchyNode = root.descendants().find(d => d.data.id === nodeId);
      const fieldPos = equilibriumPositions.get(nodeId);
      
      if (hierarchyNode && fieldPos && hierarchyNode.depth === 1) {
        const d3CenterAngle = ((hierarchyNode.x0 + hierarchyNode.x1) / 2 * 180) / Math.PI;
        const fieldAngle = fieldPos.angle;
        
        console.log(`${nodeId}: D3=${d3CenterAngle.toFixed(1)}°, Field=${fieldAngle.toFixed(1)}° (spread: ${Math.abs(d3CenterAngle - fieldAngle).toFixed(1)}°)`);
        gen1Spread += Math.abs(d3CenterAngle - fieldAngle);
      }
    });

    console.log(`Gen-1 total divergence from D3: ${gen1Spread.toFixed(1)}° (shows field independence)`);
    console.log("🎯 PHASE 2 Complete - Field-consistent positioning calculated");


    // *** PHASE 3: COLLISION RESOLUTION ***
    console.log("💥 PHASE 3: Collision Resolution");

    // Efficient proportional width calculator
    function calculateProportionalWidths(generationNodes: string[]) {
      const widths = new Map<string, number>();
      
      const totalGravityInGeneration = generationNodes.reduce((sum, nodeId) => {
        const node = nodeMap.get(nodeId);
        return sum + (node?.totalGravity || 0);
      }, 0);
      
      generationNodes.forEach(nodeId => {
        const node = nodeMap.get(nodeId);
        const nodeGravity = node?.totalGravity || 0;
        
        if (totalGravityInGeneration > 0) {
          widths.set(nodeId, 360 * (nodeGravity / totalGravityInGeneration));
        } else {
          widths.set(nodeId, 360 / generationNodes.length);
        }
      });
      
      return widths;
    }

    function resolveCollisions(equilibriumPositions: Map<string, {angle: number, radius: number}>) {

      // Step 2: Detect and resolve collisions by generation
      const finalPositions = new Map(equilibriumPositions); // Copy initial positions
      const generations = new Map<number, string[]>();
      
      // Organize by generation for collision resolution
      visibleNodeIds.forEach(nodeId => {
        const hierarchyNode = root.descendants().find(d => d.data.id === nodeId);
        if (hierarchyNode) {
          const depth = hierarchyNode.depth;
          if (!generations.has(depth)) {
            generations.set(depth, []);
          }
          generations.get(depth)!.push(nodeId);
        }
      });

      // Calculate proportional widths per generation
      const allWidths = new Map<string, number>();
      generations.forEach((nodes, depth) => {
        if (depth === 0) return; // Skip root
        const widths = calculateProportionalWidths(nodes);
        widths.forEach((width, nodeId) => allWidths.set(nodeId, width));
      });
      
      // NEW: Efficient proportional width calculator
      function calculateProportionalWidths(generationNodes: string[]) {
        const widths = new Map<string, number>();
        
        const totalGravityInGeneration = generationNodes.reduce((sum, nodeId) => {
          const node = nodeMap.get(nodeId);
          return sum + (node?.totalGravity || 0);
        }, 0);
        
        generationNodes.forEach(nodeId => {
          const node = nodeMap.get(nodeId);
          const nodeGravity = node?.totalGravity || 0;
          
          if (totalGravityInGeneration > 0) {
            widths.set(nodeId, 360 * (nodeGravity / totalGravityInGeneration));
          } else {
            widths.set(nodeId, 360 / generationNodes.length);
          }
        });
        
        return widths;
      }

      // Step 1: Calculate territories using pre-calculated widths
      const territories = new Map<string, {centerAngle: number, width: number, startAngle: number, endAngle: number}>();
      
      equilibriumPositions.forEach((pos, nodeId) => {
        const territoryWidth = allWidths.get(nodeId) ?? 30; // fallback
        
        territories.set(nodeId, {
          centerAngle: pos.angle,
          width: territoryWidth,
          startAngle: pos.angle - (territoryWidth / 2),
          endAngle: pos.angle + (territoryWidth / 2)
        });
      });

      // Resolve collisions generation by generation
      generations.forEach((nodes, depth) => {
        if (depth === 0 || nodes.length <= 1) return; // Skip root and single-node generations
        
        console.log(`\n🔧 Resolving Generation ${depth} collisions (${nodes.length} nodes):`);
        
        const MAX_ITERATIONS = 10;
        const PUSH_DAMPENING = 0.4; // Prevent oscillation
        
        for (let iteration = 0; iteration < MAX_ITERATIONS; iteration++) {
          let hasCollisions = false;
          const pushForces = new Map<string, number>(); // nodeId -> cumulative push angle
          
          // Detect overlaps in this generation
          for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
              const nodeA = nodes[i];
              const nodeB = nodes[j];
              
              const posA = finalPositions.get(nodeA)!;
              const posB = finalPositions.get(nodeB)!;
              const territoryA = territories.get(nodeA)!;
              const territoryB = territories.get(nodeB)!;
              
              // Recalculate territories based on current positions
              const startA = posA.angle - (territoryA.width / 2);
              const endA = posA.angle + (territoryA.width / 2);
              const startB = posB.angle - (territoryB.width / 2);
              const endB = posB.angle + (territoryB.width / 2);
              
              // Calculate overlap (simple linear overlap for now)
              const overlapStart = Math.max(startA, startB);
              const overlapEnd = Math.min(endA, endB);
              const overlapAmount = Math.max(0, overlapEnd - overlapStart);
              
              if (overlapAmount > 0.1) { // Minimum overlap threshold
                hasCollisions = true;
                
                const gravityA = nodeMap.get(nodeA)!.totalGravity;
                const gravityB = nodeMap.get(nodeB)!.totalGravity;
                
                // Determine stronger/weaker node
                const stronger = gravityA > gravityB ? nodeA : nodeB;
                const weaker = gravityA > gravityB ? nodeB : nodeA;
                const strongerPos = gravityA > gravityB ? posA : posB;
                const weakerPos = gravityA > gravityB ? posB : posA;
                
                // Calculate push direction (away from stronger node)
                let pushDirection = weakerPos.angle - strongerPos.angle;
                
                // Handle circular boundary
                if (pushDirection > 180) pushDirection -= 360;
                if (pushDirection < -180) pushDirection += 360;
                
                // Calculate push force (linear: overlap × mass differential)
                const massDifferential = Math.abs(gravityA - gravityB);
                const pushForce = overlapAmount * (1 + massDifferential * 0.1);
                const pushSign = pushDirection >= 0 ? 1 : -1;
                const actualPush = pushForce * pushSign * PUSH_DAMPENING;
                
                // Accumulate push force on weaker node
                if (!pushForces.has(weaker)) {
                  pushForces.set(weaker, 0);
                }
                pushForces.set(weaker, pushForces.get(weaker)! + actualPush);
                
                if (iteration === 0) { // Only log first iteration details
                  console.log(`  ${stronger}→${weaker}: ${overlapAmount.toFixed(1)}° overlap, push=${actualPush.toFixed(2)}°`);
                }
              }
            }
          }
          
          if (!hasCollisions) {
            console.log(`  ✅ Converged in ${iteration} iterations`);
            break;
          }
          
          // Apply push forces
          pushForces.forEach((totalPush, nodeId) => {
            const currentPos = finalPositions.get(nodeId)!;
            let newAngle = currentPos.angle + totalPush;
            
            // Normalize angle
            if (newAngle < 0) newAngle += 360;
            if (newAngle >= 360) newAngle -= 360;
            
            finalPositions.set(nodeId, { ...currentPos, angle: newAngle });
            
            if (iteration === MAX_ITERATIONS - 1) {
              console.log(`  ${nodeId}: ${currentPos.angle.toFixed(1)}° → ${newAngle.toFixed(1)}° (final push: ${totalPush.toFixed(2)}°)`);
            }
          });
          
          if (iteration === MAX_ITERATIONS - 1) {
            console.log(`  ⚠️ Reached max iterations with remaining collisions`);
          }
        }
      });
      
      return finalPositions;
    }

    const collisionResolvedPositions = resolveCollisions(equilibriumPositions);

    // Step 3: Final comparison - D3 vs Equilibrium vs Collision-Resolved
    console.log("\n🎯 PHASE 3: Final Position Comparison");
    visibleNodeIds.forEach(nodeId => {
      const hierarchyNode = root.descendants().find(d => d.data.id === nodeId);
      const equilibrium = equilibriumPositions.get(nodeId);
      const resolved = collisionResolvedPositions.get(nodeId);
      
      if (hierarchyNode && equilibrium && resolved) {
        const d3CenterAngle = ((hierarchyNode.x0 + hierarchyNode.x1) / 2 * 180) / Math.PI;
        
        console.log(`${nodeId}:`);
        console.log(`  D3:        ${d3CenterAngle.toFixed(1)}°`);
        console.log(`  Equilib:   ${equilibrium.angle.toFixed(1)}°`);
        console.log(`  Resolved:  ${resolved.angle.toFixed(1)}° (moved ${Math.abs(resolved.angle - equilibrium.angle).toFixed(1)}°)`);
      }
    });

    // Store resolved positions for next phase
    (window as any).__fieldPositions__ = collisionResolvedPositions;
    console.log("🎯 PHASE 3 Complete - Collision resolution done! Positions stored in window.__fieldPositions__");

    // *** INVESTIGATION: Let's see what's really happening ***
    console.log("\n🔍 FIELD MODEL INVESTIGATION");
    console.log("==========================================");

    // Investigation 1: Gen-1 Angle Distribution
    console.log("\n📊 Investigation 1: Gen-1 Angle Distribution");
    (() => {
      const gen1Nodes = Array.from(visibleNodeIds).filter(nodeId => {
        const hierarchyNode = root.descendants().find(d => d.data.id === nodeId);
        return hierarchyNode && hierarchyNode.depth === 1;
      });
      
      const gen1Data = gen1Nodes.map(nodeId => {
        const equilibrium = equilibriumPositions.get(nodeId);
        const resolved = collisionResolvedPositions.get(nodeId);
        const mass = nodeMap.get(nodeId)?.totalGravity || 0;
        return {
          id: nodeId,
          mass: mass,
          equilibriumAngle: equilibrium?.angle || 0,
          resolvedAngle: resolved?.angle || 0
        };
      }).sort((a, b) => a.equilibriumAngle - b.equilibriumAngle);
      
      console.log(`Gen-1 nodes: ${gen1Data.length}`);
      console.log("Equilibrium angles:", gen1Data.map(d => d.equilibriumAngle.toFixed(1)));
      console.log("Mass distribution:", gen1Data.map(d => d.mass.toFixed(2)));
      
      // Check if clustering near 0°/360°
      const near0 = gen1Data.filter(d => d.equilibriumAngle < 30 || d.equilibriumAngle > 330).length;
      const mid = gen1Data.filter(d => d.equilibriumAngle >= 30 && d.equilibriumAngle <= 330).length;
      console.log(`Clustering analysis: ${near0} nodes near 0°/360°, ${mid} nodes in middle range`);
      
      // Mass variance
      const masses = gen1Data.map(d => d.mass);
      const avgMass = masses.reduce((s, m) => s + m, 0) / masses.length;
      const massVariance = masses.reduce((s, m) => s + Math.pow(m - avgMass, 2), 0) / masses.length;
      console.log(`Mass stats: avg=${avgMass.toFixed(3)}, variance=${massVariance.toFixed(3)}, range=[${Math.min(...masses).toFixed(3)}, ${Math.max(...masses).toFixed(3)}]`);
    })();

    // Investigation 2: Territory Density Analysis
    console.log("\n📏 Investigation 2: Territory Density by Ring");
    (() => {
      const generations = new Map<number, string[]>();
      visibleNodeIds.forEach(nodeId => {
        const hierarchyNode = root.descendants().find(d => d.data.id === nodeId);
        if (hierarchyNode) {
          const depth = hierarchyNode.depth;
          if (!generations.has(depth)) generations.set(depth, []);
          generations.get(depth)!.push(nodeId);
        }
      });
      
      generations.forEach((nodes, depth) => {
        if (depth === 0) return; // Skip root
        
        const baseWidth = 1;
        const gravityMultiplier = 1;
        
        const territoryData = nodes.map(nodeId => {
          const node = nodeMap.get(nodeId);
          const gravity = node?.totalGravity || 0;
          const territoryWidth = baseWidth + (gravity * gravityMultiplier);
          return { nodeId, gravity, territoryWidth };
        });
        
        const totalTerritoryWidth = territoryData.reduce((sum, t) => sum + t.territoryWidth, 0);
        const averageTerritory = totalTerritoryWidth / nodes.length;
        const densityRatio = totalTerritoryWidth / 360;
        
        console.log(`Ring ${depth}: ${nodes.length} nodes`);
        console.log(`  Total claimed: ${totalTerritoryWidth.toFixed(1)}° vs 360° available`);
        console.log(`  Density ratio: ${densityRatio.toFixed(2)}x (>1.0 = guaranteed overlaps)`);
        console.log(`  Avg territory: ${averageTerritory.toFixed(1)}°`);
        console.log(`  Territory range: [${Math.min(...territoryData.map(t => t.territoryWidth)).toFixed(1)}°, ${Math.max(...territoryData.map(t => t.territoryWidth)).toFixed(1)}°]`);
      });
    })();

    // Investigation 3: Parent Angle Distribution for Gen-2+
    console.log("\n🎯 Investigation 3: Parent Angle Distribution");
    (() => {
      [2, 3].forEach(targetDepth => {
        const genNodes = Array.from(visibleNodeIds).filter(nodeId => {
          const hierarchyNode = root.descendants().find(d => d.data.id === nodeId);
          return hierarchyNode && hierarchyNode.depth === targetDepth;
        });
        
        if (genNodes.length === 0) return;
        
        console.log(`\nGen-${targetDepth} parent angle analysis:`);
        
        genNodes.slice(0, 5).forEach(nodeId => { // Show first 5 for readability
          const node = nodeMap.get(nodeId);
          if (!node || !node.gravityPoints) return;
          
          const parentData = Array.from(node.gravityPoints.entries()).map(([parentId, gravity]) => {
            const parentPos = collisionResolvedPositions.get(parentId);
            return {
              parentId,
              gravity,
              angle: parentPos?.angle || 0
            };
          }).sort((a, b) => a.angle - b.angle);
          
          const childPos = collisionResolvedPositions.get(nodeId);
          console.log(`  ${nodeId} (final: ${childPos?.angle.toFixed(1)}°):`);
          console.log(`    Parents: ${parentData.map(p => `${p.parentId}@${p.angle.toFixed(1)}°(${p.gravity.toFixed(2)})`).join(', ')}`);
          
          // Check if parents span wide angle range
          if (parentData.length > 1) {
            const angleSpread = Math.max(...parentData.map(p => p.angle)) - Math.min(...parentData.map(p => p.angle));
            const wraparoundSpread = 360 - angleSpread;
            const realSpread = Math.min(angleSpread, wraparoundSpread);
            console.log(`    Parent spread: ${realSpread.toFixed(1)}° (${realSpread > 180 ? 'wraparound' : 'normal'})`);
          }
        });
      });
    })();

    // Investigation 4: Collision Move Analysis (Circular Distance)
    console.log("\n💥 Investigation 4: Actual Collision Moves (Circular Distance)");
    (() => {
      function circularDistance(angle1: number, angle2: number): number {
        let diff = Math.abs(angle1 - angle2);
        return Math.min(diff, 360 - diff);
      }
      
      const moveData: Array<{nodeId: string, equilibrium: number, resolved: number, circularMove: number}> = [];
      
      visibleNodeIds.forEach(nodeId => {
        const equilibrium = equilibriumPositions.get(nodeId);
        const resolved = collisionResolvedPositions.get(nodeId);
        
        if (equilibrium && resolved) {
          const circularMove = circularDistance(equilibrium.angle, resolved.angle);
          moveData.push({
            nodeId,
            equilibrium: equilibrium.angle,
            resolved: resolved.angle,
            circularMove
          });
        }
      });
      
      // Sort by largest moves
      moveData.sort((a, b) => b.circularMove - a.circularMove);
      
      console.log("Largest collision moves (circular distance):");
      moveData.slice(0, 10).forEach(move => {
        console.log(`  ${move.nodeId}: ${move.equilibrium.toFixed(1)}° → ${move.resolved.toFixed(1)}° (moved ${move.circularMove.toFixed(1)}°)`);
      });
      
      const avgMove = moveData.reduce((sum, m) => sum + m.circularMove, 0) / moveData.length;
      const largeMovesCount = moveData.filter(m => m.circularMove > 30).length;
      
      console.log(`Move statistics: avg=${avgMove.toFixed(1)}°, large moves (>30°): ${largeMovesCount}/${moveData.length}`);
    })();

    // Investigation 5: Success/Failure Summary
    console.log("\n📈 Investigation 5: Field Model Health Check");
    (() => {
      const multiParentCount = Array.from(visibleNodeIds).filter(nodeId => {
        const node = nodeMap.get(nodeId);
        return node && node.gravityPoints && node.gravityPoints.size > 1;
      }).length;
      
      console.log(`✅ Multi-parent nodes detected: ${multiParentCount}`);
      console.log(`✅ Visible nodes processed: ${visibleNodeIds.size}`);
      console.log(`✅ Field positions calculated: ${collisionResolvedPositions.size}`);
      
      // Check if any nodes are still at exactly 0°
      const at0Degrees = Array.from(collisionResolvedPositions.values()).filter(pos => 
        Math.abs(pos.angle) < 0.01 || Math.abs(pos.angle - 360) < 0.01
      ).length;
      
      console.log(`${at0Degrees > 0 ? '⚠️' : '✅'} Nodes at exactly 0°: ${at0Degrees}`);
    })();

    console.log("\n🔬 Investigation complete - check results above before making changes!");


    console.log("🔍 GRAVITY MODEL: Inspecting calculated values");
    console.log("Current pivot:", pivotId);

    // Show gravity distribution for visible nodes (using our early BFS calculation)
    // visibleNodeIds already calculated above via getVisibleNodeIds()
    const visibleNodeIdsArray = Array.from(visibleNodeIds); // Convert Set to Array for compatibility

    console.log("Visible nodes with gravity data:");
    visibleNodeIdsArray.forEach(nodeId => {
      const node = nodeMap.get(nodeId);
      if (node) {
        console.log(`${nodeId}:`, {
          totalGravity: node.totalGravity?.toFixed(3) || 0,
          authority: node.authorityLevel?.toFixed(3) || 0,
          gravityFromParents: node.gravityPoints ? Object.fromEntries(
            Array.from(node.gravityPoints.entries()).map(([parentId, gravity]) => [parentId, gravity.toFixed(3)])
          ) : {}
        });
      }
    });

    // Show multi-parent children specifically
    const multiParentChildren = visibleNodeIdsArray.filter(nodeId => {
      const node = nodeMap.get(nodeId);
      return node && node.gravityPoints && node.gravityPoints.size > 1;
    });

    if (multiParentChildren.length > 0) {
      console.log("🌟 Multi-parent children detected:", multiParentChildren);
      multiParentChildren.forEach(nodeId => {
        const node = nodeMap.get(nodeId);
        console.log(`${nodeId} gravity sources:`, Array.from(node.gravityPoints.entries()).map(([parentId, gravity]: [string, number]) => `${parentId}:${gravity.toFixed(3)}`));
      });
    }


    // Initialize current positions for transitions
    root.each((d: any) => (d.current = d));
    
    // Include depth 0 when we have pivoted; otherwise skip the synthetic "Root"
    const minDepth = pivotId ? 0 : 1;
    const allNodes = root.descendants().filter((d: any) => d.depth >= minDepth && d.depth <= layers);
    const visibleNodes = allNodes.filter((d, i, arr) =>
      arr.findIndex(
        x => x.data.id === d.data.id && x.depth === d.depth
      ) === i
    );
    
    console.log('Visible Nodes:', visibleNodes.map(d => ({ id: d.data.id, depth: d.depth })));
    // Notify parent of visible nodes change
    if (onVisibleNodesChange) {
      const mapped = visibleNodes.map(d => ({
        id: d.data.id,
        name: d.data.name,
        value: d.data.value,
        color: d.data.color,
        category: d.data.category
      }));
      console.log("STEP 1 ▶️ Sunburst emits visibleNodes:", mapped.map(n => n.id));
      const currentIds = mapped.map(n => n.id);
      // Only emit if IDs have changed
      if (JSON.stringify(currentIds) !== JSON.stringify(prevVisibleIds.current)) {
        prevVisibleIds.current = currentIds;
        onVisibleNodesChange(mapped);
      }
    }

    // // Define arc generator
    // const arc = d3.arc<any>()
    //   .startAngle(d => d.x0)
    //   .endAngle(d => d.x1)
    //   .innerRadius(d => d.y0 * ringWidth)
    //   .outerRadius(d => d.y1 * ringWidth * 1.01) // Slightly larger outer radius for better visibility
    //   .padAngle(0);
    

    // *** PHASE 4: FIELD MODEL ARC GENERATOR ***
    console.log("🎨 PHASE 4: Creating Field Model Arcs");

    // Calculate field-based arc data for each visible node
    const fieldArcData = visibleNodes.map(d => {
      const nodeId = d.data.id;
      const fieldPos = collisionResolvedPositions.get(nodeId);
      const hierarchyNode = root.descendants().find(h => h.data.id === nodeId);
      
      if (!fieldPos || !hierarchyNode) {
        // Fallback to D3 positioning if field position not available
        return {
          ...d,
          fieldX0: d.x0,
          fieldX1: d.x1,
          fieldY0: d.y0,
          fieldY1: d.y1,
          isFieldPositioned: false
        };
      }
      
      // Calculate angular width based on gravity (proportional territory)
      const generationNodes = visibleNodes.filter(n => {
        const nHierarchy = root.descendants().find(h => h.data.id === n.data.id);
        return nHierarchy && nHierarchy.depth === hierarchyNode.depth;
      });
      
      const nodeGravity = nodeMap.get(nodeId)?.totalGravity || 0;
      const totalGenerationGravity = generationNodes.reduce((sum, n) => {
        const nGravity = nodeMap.get(n.data.id)?.totalGravity || 0;
        return sum + nGravity;
      }, 0);
      
      // Calculate proportional width
      let angularWidth: number;
      if (totalGenerationGravity > 0 && nodeGravity > 0) {
        angularWidth = (360 * nodeGravity / totalGenerationGravity) * (Math.PI / 180); // Convert to radians
      } else {
        // Fallback: equal distribution
        angularWidth = (360 / generationNodes.length) * (Math.PI / 180);
      }
      
      // Maximum width constraint only (no minimum to prevent >360° totals)
      const maxWidth = (120 * Math.PI / 180); // 120 degrees maximum
      angularWidth = Math.min(maxWidth, angularWidth);
      
      // Convert field position to radians and create arc bounds
      const centerAngleRad = (fieldPos.angle * Math.PI) / 180;
      const halfWidth = angularWidth / 2;
      
      const fieldX0 = centerAngleRad - halfWidth;
      const fieldX1 = centerAngleRad + halfWidth;
      const fieldY0 = hierarchyNode.depth; // Keep depth-based radius
      const fieldY1 = hierarchyNode.depth + 1;
      
      // Precompute title while we still have the real hierarchy node
      const format = d3.format(",d");
      const names = d.ancestors()
        .map(node => node.data.name)
        .reverse()
        .filter((name, idx, arr) => name !== 'Root' && (idx === 0 || name !== arr[idx - 1]));
      const titleText = `${names.join(' > ')}\n${format(d.value)}`;

      // Preserve D3 hierarchy node prototype (keeps .ancestors() method)
      const item = Object.assign(Object.create(Object.getPrototypeOf(d)), d);
      item.fieldX0 = fieldX0;
      item.fieldX1 = fieldX1;
      item.fieldY0 = fieldY0;
      item.fieldY1 = fieldY1;
      item.isFieldPositioned = true;
      item.gravityMass = nodeGravity;
      item.fieldAngleDeg = fieldPos.angle;
      item.angularWidthDeg = angularWidth * 180 / Math.PI;
      item.titleText = titleText;
      return item;
    });

    console.log("🎨 Field arc data sample:", fieldArcData.slice(0, 5).map(d => ({
      id: d.data.id,
      fieldAngle: d.fieldAngleDeg?.toFixed(1),
      width: d.angularWidthDeg?.toFixed(1),
      isField: d.isFieldPositioned
    })));

    // Per-ring coverage analysis (more accurate than total)
    const byDepth = new Map<number, number>();
    fieldArcData.forEach(d => {
      const depth = d.fieldY0; // hierarchyNode.depth
      byDepth.set(depth, (byDepth.get(depth) ?? 0) + (d.angularWidthDeg ?? 0));
    });
    byDepth.forEach((sum, depth) => {
      console.log(`Ring ${depth} coverage: ${sum.toFixed(1)}° (${(sum/360*100).toFixed(1)}%)`);
    });

    // Field-aware arc generator
    const arc = d3.arc<any>()
      .startAngle(d => d.isFieldPositioned ? d.fieldX0 : d.x0)
      .endAngle(d => d.isFieldPositioned ? d.fieldX1 : d.x1)
      .innerRadius(d => (d.isFieldPositioned ? d.fieldY0 : d.y0) * ringWidth)
      .outerRadius(d => (d.isFieldPositioned ? d.fieldY1 : d.y1) * ringWidth * 1.01)
      .padAngle(0.002); // Small padding for visual separation


    
    // Create tooltip
    const tooltip = d3.select("body")
      .append("div")
      .style("position", "absolute")
      .style("z-index", "10")
      .style("visibility", "hidden")
      .style("background", "white")
      .style("border", "1px solid #ddd")
      .style("border-radius", "4px")
      .style("padding", "8px")
      .style("box-shadow", "0 2px 8px rgba(0,0,0,0.15)");
    
    const path = svg.selectAll("path")
      .data(fieldArcData, (d: any) => `${d.data.id}-${d.depth}`)
      .enter()
      .append("path")
      .attr("d", arc as any)
      .style("fill", (d: any) => d.data.color || "#ccc")
      .style("stroke", "white")
      .style("stroke-width", (d: any) =>
      selectedId && d.data.id === selectedId ? 3 : 1
      )
      .style("stroke", (d: any) =>
      selectedId && d.data.id === selectedId ? "#111" : "white"
      )
      .style("opacity", 0.9)
      .style("cursor", (d: any) => (d.children?.length ? "pointer" : "default"))
      .attr("pointer-events", "all")
      .on("click", function(event: any, d: any) {


            // remember which wedge was just clicked so we can highlight it
        setSelectedId(d.data.id);
        // Synthetic root click: just reset pivot, leave breadcrumbs intact
        if (d.data.id === 'root') {
          setPivotId(null);
          setPivotStack([]);                     // back to very top
          onCoreChange?.(null)
          console.log('STEP ③0 ▶️ Sunburst onCoreChange fired:', null);
          return;
        }
        // Build and emit breadcrumb trail for this node
        const trail = d.ancestors()
          .reverse()
          .filter(node => node.data.id !== 'root')
          .map(node => ({ id: node.data.id, name: node.data.name }));
        // Fallback: ensure trail is not empty for root node like Core/Wellbeing
        if (trail.length === 0 && d.data.id === '1a714141-915c-49f3-981b-9f02cc435be0') {
          trail.push({ id: d.data.id, name: d.data.name });
        }
        onBreadcrumbsChange?.(trail);

        if (d.children && d.children.length > 0) {
          if (pivotStackRef.current[pivotStackRef.current.length - 1] !== d.data.id) {
          // Drill in for parent nodes
            setPivotStack(prev => {
              const next = [...prev, d.data.id];
              pivotStackRef.current = next;  // update ref for click handler
              return next;
          });   // push this level
      }
          setPivotId(d.data.id);
          onCoreChange?.(d.data.id);
          console.log('STEP ③0 ▶️ Sunburst onCoreChange fired:', d.data.id);
        }
          else {
            // Leaf node ▼
            // Zoom so that the leaf’s *parent* is centred,
            // **but** tell the outside world that *this* leaf is the “selected core”
            // to drive the DescriptionPanel and TrendGraph.

            if (d.parent) {
              const parentId = d.parent.data.id;

              // Zoom logic (centre on parent)
              setPivotStack(prev =>
                prev.length && prev[prev.length - 1] === parentId ? prev : [...prev, parentId]
              );
              setPivotId(parentId);

              // UI logic
              setSelectedId(d.data.id);          // highlight the clicked leaf
              onCoreChange?.(d.data.id);         // panel now shows leaf details

              console.log('STEP ③0 ▶️ Sunburst leaf clicked - zoom →', parentId, ' core →', d.data.id);
            }
            // No navigation for leaf nodes
          }
      })
      .on("mouseover", function(event, d: any) {
        d3.select(this).style("opacity", 1);
        tooltip
          .style("visibility", "visible")
          .html(`
            <div class="font-medium">${d.data.name}</div>
            <div>Value: ${d.data.value.toFixed(1)}</div>
            ${d.data.category ? `<div>Category: ${d.data.category}</div>` : ''}
            ${d.data.weight !== undefined ? `<div>Influence: ${d.data.weight}</div>` : ''}
            ${d.data.correlation !== undefined ? `<div>Correlation: ${(d.data.correlation * 100).toFixed(1)}%</div>` : ''}
          `);
      })
      .on("mousemove", function(event) {
        tooltip
          .style("top", (event.pageY - 10) + "px")
          .style("left", (event.pageX + 10) + "px");
      })
      .on("mouseout", function() {
        d3.select(this).style("opacity", 0.9);
        tooltip.style("visibility", "hidden");
      });

    // Fade-in transition for arcs
    path
      .style("opacity", 0)
      .transition()
      .duration(500)
      .style("opacity", 0.9);

      // *** PHASE 4: Field Integration Complete ***
      console.log("🎨 PHASE 4: Field Model Visual Integration Complete!");

      // Field vs D3 visual comparison
      const fieldVisualStats = {
        totalArcs: fieldArcData.length,
        fieldPositioned: fieldArcData.filter(d => d.isFieldPositioned).length,
        d3Fallback: fieldArcData.filter(d => !d.isFieldPositioned).length
      };

      console.log("Visual integration stats:", fieldVisualStats);

      // Show angular distribution of field-positioned arcs
      const fieldAngles = fieldArcData
        .filter(d => d.isFieldPositioned && d.fieldAngleDeg !== undefined)
        .map(d => d.fieldAngleDeg!)
        .sort((a, b) => a - b);

      if (fieldAngles.length > 0) {
        console.log("Field angle distribution:", {
          min: fieldAngles[0].toFixed(1),
          max: fieldAngles[fieldAngles.length - 1].toFixed(1),
          count: fieldAngles.length,
          sample: fieldAngles.slice(0, 8).map(a => a.toFixed(1))
        });
        
        // Check for clustering (multiple nodes within 30° of each other)
        let clusters = 0;
        for (let i = 0; i < fieldAngles.length - 1; i++) {
          if (fieldAngles[i + 1] - fieldAngles[i] < 30) clusters++;
        }
        console.log(`Angular clustering: ${clusters} adjacent pairs within 30°`);
      }

      // Territory coverage analysis
      const totalAngularCoverage = fieldArcData
        .filter(d => d.isFieldPositioned && d.angularWidthDeg !== undefined)
        .reduce((sum, d) => sum + d.angularWidthDeg!, 0);

      console.log(`Total angular coverage: ${totalAngularCoverage.toFixed(1)}° (${(totalAngularCoverage/360*100).toFixed(1)}% of circle)`);


    // Add titles (using precomputed titleText)
    path.append("title").text((d: any) => d.titleText ?? d.data?.name ?? "");



    let label: any;
    if (showLabels) {
      label = svg.append("g")
        .attr("pointer-events", "none")
        .attr("text-anchor", "middle")
        .style("user-select", "none")
        .selectAll("text")
        .data(fieldArcData, (d: any) => `${d.data.id}-${d.depth}`)
        .enter()
        .append("text")
        .attr("dy", "0.35em")
        .attr("fill-opacity", d => +labelVisible(d.current))
        .attr("transform", d => labelTransform(d.current))
        .text(d => d.data.name);
      // Fade-in transition for labels
      label
        .style("opacity", 0)
        .transition()
        .duration(500)
        .style("opacity", 1);
    }

    function clicked(event, p) {
      console.log("↩️ centre clicked, pivotStack BEFORE:", pivotStackRef.current);
      // centre‑circle click ➜ pop one level off the stack
      if (pivotStackRef.current.length === 0) {
        console.log("🚫 nothing to pop—already at root");
        return;                       // already at global root
      }
      const newStack = [...pivotStack];
      newStack.pop();                 // step out one level
      const newPivot = newStack.length > 0 ? newStack[newStack.length - 1] : null;

      setPivotStack(newStack);
      setPivotId(newPivot);
      onCoreChange?.(newPivot);

      // rebind centre datum for next click
      svg.datum(newPivot ? nodeMap.get(newPivot) : root);

      // keep the existing nice transition (unchanged ↓)
      root.each(d => d.target = {
        x0: Math.max(0, Math.min(1, (d.x0 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
        x1: Math.max(0, Math.min(1, (d.x1 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
        y0: Math.max(0, d.y0 - p.depth),
        y1: Math.max(0, d.y1 - p.depth)
      });
      const t = svg.transition().duration(750);
      path.transition(t)
        .tween("data", d => {
          const i = d3.interpolate(d.current, d.target);
          return t => d.current = i(t);
        })
        .filter(function(d) {
          return +this.getAttribute("fill-opacity") || arcVisible(d.target);
        })
        .attr("fill-opacity", d => arcVisible(d.target) ? (d.children ? 0.6 : 0.4) : 0)
        .attr("pointer-events", d => arcVisible(d.target) ? "auto" : "none")
        .attrTween("d", d => () => arc(d.current));
      if (showLabels) {
        label.transition(t)
          .filter(function(d) {
            return +this.getAttribute("fill-opacity") || labelVisible(d.target);
          })
          .attr("fill-opacity", d => +labelVisible(d.target))
          .attrTween("transform", d => () => labelTransform(d.current));
      }
    }

    const container = svg
    .on("click", (event) => {
      console.log("🕵️‍♂️ click at", d3.pointer(event), "pivotStack:", pivotStack);
      // get mouse coords relative to center
      const [mx, my] = d3.pointer(event);
      // Only allow center click if we can step back (pivotStack not empty)
      if (pivotStackRef.current.length === 0) return;
      // only treat clicks within the inner radius as "center clicks"
      if (Math.hypot(mx, my) <= (Math.min(width, height) / 2) / maxLayers) {
        // simulate the center-circle click:
        clicked(event, { x0: 0, x1: 2 * Math.PI, depth: 0 });
      }
    });

    function arcVisible(d) {
      return d.y1 <= layers && d.y0 >= 0 && d.x1 > d.x0;
    }
    function labelVisible(d) {
      return d.y1 <= layers - 1 && d.y0 >= 0 && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.001;
    }
    function labelTransform(d) {
      const x = ((d.x0 + d.x1) / 2) * 180 / Math.PI;
      const y = ((d.y0 + d.y1) / 2) * ringWidth;
      return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
    }
    
    return () => {
      tooltip.remove();
    };
  }, [nodes, links, width, height, onSelect, maxLayers, pivotId, selectedId, showLabels, onBreadcrumbsChange]);
  
  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto">
      {pivotId && (
        <button
          className="mb-2 px-4 py-1 bg-gray-200 rounded hover:bg-gray-300 z-10"
          onClick={() => setPivotId(null)}
        >
          Reset
        </button>
      )}
      <div className="w-full h-[400px] flex items-center justify-center">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          width="200"
          height="200"
          className="max-w-full max-h-full"
          preserveAspectRatio="xMidYMid meet"
        />
      </div>
    </div>
  );
};

export default SunburstChart;
