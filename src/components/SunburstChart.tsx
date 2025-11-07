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

    // ADDED DEBUG: Hierarchy integrity check
    console.log("🔍 HIERARCHY INTEGRITY CHECK:");
    console.log("Expected nodes from input:", nodes.map(n => n.id));
    console.log("Nodes in nodeMap:", Array.from(nodeMap.keys()));
    console.log("Root candidates:", rootNodes.map(r => r.id));
    console.log("Nodes with children:", Array.from(nodeMap.values()).filter(n => n.children?.length > 0).map(n => ({ id: n.id, childCount: n.children.length })));

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
        
        // ADDED DEBUG: Authority calculation tracking
        console.log(`🧭 Authority: ${nodeId} depth=${depth} authority=${authority.toFixed(4)} visibleChildren=${node.children?.filter((c: any) => visibleNodeIds.has(c.id)).length || 0}`);
        
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
    
    // ADD RIGHT AFTER: addGravityMetadata();
    console.log("🔍 INVESTIGATING B & C - Gravity Values:");
    ['B', 'C'].forEach(search => {
      const node = Array.from(nodeMap.values()).find(n => n.name?.includes(search));
      if (node) {
        console.log(`${search} (${node.id}):`);
        console.log(`  totalGravity: ${node.totalGravity}`);
        console.log(`  authorityLevel: ${node.authorityLevel}`);
        console.log(`  gravityPoints:`, Object.fromEntries(node.gravityPoints || new Map()));
      }
    });
    
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
    
    // // *** AUTO-SEED PIVOT TO FIRST REAL CORE ***
    // if (!pivotId) {
    //   // In the non-pivoted view, depth 0 is the synthetic root; the first real cores are at depth 1.
    //   const firstCore = root.descendants().find(d => d.depth === 1);
    //   if (firstCore) {
    //     console.log(`🎯 Auto-seeding pivot to first core: ${firstCore.data.id}`);
    //     setPivotId(firstCore.data.id);
    //     setPivotStack([firstCore.data.id]);
    //     onCoreChange?.(firstCore.data.id);
    //   }
    // }
    
    // RIGHT AFTER the auto-seeding if (!pivotId) block:
    console.log("🎯 PIVOT DEBUG:");
    console.log("  Current pivotId:", pivotId);
    console.log("  Current pivotStack:", pivotStack);
    console.log("  Root hierarchy structure:", root.descendants().map(d => ({ 
        id: d.data.id, 
        depth: d.depth, 
        parent: d.parent?.data.id 
      })));
    console.log("  hierarchyData:", hierarchyData);

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

    function microJitterDeg(id: string, magDeg = 1.0): number {
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
      
      console.log("🔍 COLLISION RESOLUTION GENERATIONS:");
      console.log("  Ring 0:", generations.get(0) || []);
      console.log("  Ring 1:", generations.get(1) || []);
      console.log("  Ring 2:", generations.get(2) || []);
      console.log("  Ring 3:", generations.get(3) || []);
      console.log("  Total rings:", generations.size);

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
      // const gen1 = generations.get(1) || [];
      // if (gen1.length > 0) {
      //   console.log(`\n⚖️ Gen-1 Mass-Proportional Placement (${gen1.length} nodes):`);
        
      //   // Calculate mass shares for each child
      //   const massShares = gen1.map(nodeId => {
      //     const node = nodeMap.get(nodeId);
      //     const mass = node?.totalGravity || 0;
      //     return { nodeId, mass };
      //   });
        
      //   const totalMass = massShares.reduce((sum, item) => sum + item.mass, 0);
        
        // ADDED DEBUG: Gen-1 Mass Calculation Details
        // console.log("🔢 Gen-1 Mass Calculation Details:");
        // massShares.forEach(item => {
        //   const node = nodeMap.get(item.nodeId);
        //   console.log(`  ${item.nodeId}: gravity=${item.mass.toFixed(4)}, gravityPoints=`, 
        //     node?.gravityPoints ? Object.fromEntries(node.gravityPoints) : 'none');
        // });
        // console.log(`  Total mass: ${totalMass.toFixed(4)}`);
        
        // if (totalMass > 0) {
        //   let cumulativeMass = 0;
        //   massShares.forEach(item => {
        //     const massShare = item.mass / totalMass;
        //     const sectorCenter = 360 * (cumulativeMass + massShare / 2);
        //     const jitter = microJitterDeg(item.nodeId, 0.3);
        //     const finalAngle = (sectorCenter + jitter) % 360;
            
        //     equilibriumPositions.set(item.nodeId, { 
        //       angle: finalAngle, 
        //       radius: 1 * ringWidth 
        //     });
            
      //       // ADDED DEBUG: Position set tracking
      //       const hierarchyNode = root?.descendants()?.find((d: any) => d.data.id === item.nodeId);
      //       console.log(`📍 Position Set: ${item.nodeId} depth=${hierarchyNode?.depth ?? 'unknown'} angle=${finalAngle.toFixed(2)}° radius=${(1 * ringWidth).toFixed(1)}`);
            
      //       console.log(`  ${item.nodeId}: mass=${item.mass.toFixed(3)} (${(massShare*100).toFixed(1)}%) → ${sectorCenter.toFixed(1)}° + jitter=${jitter.toFixed(2)}° → ${finalAngle.toFixed(1)}°`);
            
      //       cumulativeMass += massShare;
      //     });
      //   } else {
      //     // Fallback for zero-mass case - equal spacing with jitter
      //     gen1.forEach((nodeId, index) => {
      //       const baseAngle = (index / gen1.length) * 360;
      //       const jitter = microJitterDeg(nodeId, 0.5);
      //       const finalAngle = (baseAngle + jitter) % 360;
            
      //       equilibriumPositions.set(nodeId, { 
      //         angle: finalAngle, 
      //         radius: 1 * ringWidth 
      //       });
            
      //       console.log(`  ${nodeId}: zero-mass fallback → ${finalAngle.toFixed(1)}°`);
      //     });
      //   }
      // }
      
      // Generation 2+ - Mass-weighted circular mean from parents
      for (let depth = 1; depth <= Math.max(...generations.keys()); depth++) {
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
            // ADDED DEBUG: Position set tracking
            const hierarchyNode2 = root?.descendants()?.find((d: any) => d.data.id === nodeId);
            console.log(`📍 Position Set: ${nodeId} depth=${hierarchyNode2?.depth ?? 'unknown'} angle=${(jitter < 0 ? jitter + 360 : jitter).toFixed(2)}° radius=${(depth * ringWidth).toFixed(1)}`);
            console.log(`  ${nodeId}: no gravity sources → jitter-only ${jitter.toFixed(1)}°`);
            return;
          }
          
          // Build parent angle/mass pairs
          const parentSources: Array<{angleDeg: number, mass: number}> = [];
          node.gravityPoints.forEach((gravityValue: number, parentId: string) => {
            const parentPos = equilibriumPositions.get(parentId);
            if (parentPos && gravityValue > 0) {
              parentSources.push({ angleDeg: parentPos.angle, mass: gravityValue });
            }
          });
          
          // ADD THIS DEBUG:
          console.log(`🔍 ⛔️ DEBUG ${nodeId} parent positioning:`);
          console.log(`  gravityPoints:`, Object.fromEntries(node.gravityPoints || new Map()));
          console.log(`  parentSources:`, parentSources.map(p => `${p.angleDeg.toFixed(2)}°(${p.mass.toFixed(2)})`));
          console.log(`  equilibriumPositions has:`, Array.from(equilibriumPositions.keys()));


          console.log(`  ${nodeId} parents:`, parentSources.map(p => `${p.angleDeg.toFixed(1)}°(${p.mass.toFixed(2)})`));
          
          let finalAngle: number;
          let jitterValue = 0;
          let weightedMeanResult: number | null = null;
          
          if (parentSources.length === 0) {
            // No valid parents
            const jitter = microJitterDeg(nodeId, 1.0);
            jitterValue = jitter;
            finalAngle = jitter;
            console.log(`    → No valid parents, jitter-only: ${finalAngle.toFixed(1)}°`);
          } else {
            // Try mass-weighted circular mean
            const weightedMean = massWeightedCircularMean(parentSources);
            weightedMeanResult = weightedMean;
            
            if (weightedMean !== null) {
              // Normal case - weighted direction exists
              const jitter = microJitterDeg(nodeId, 0.15);
              jitterValue = jitter;
              finalAngle = (weightedMean + jitter) % 360;
              console.log(`    → Weighted mean: ${weightedMean.toFixed(1)}° + jitter: ${jitter.toFixed(2)}° = ${finalAngle.toFixed(1)}°`);
            } else {
              // Perfect cancellation - use simple mean of parent angles
              const simpleMean = parentSources.reduce((sum, p) => sum + p.angleDeg, 0) / parentSources.length;
              const jitter = microJitterDeg(nodeId, 0.3);
              jitterValue = jitter;
              finalAngle = (simpleMean + jitter) % 360;
              console.log(`    → Perfect cancellation, simple mean: ${simpleMean.toFixed(1)}° + jitter: ${jitter.toFixed(2)}° = ${finalAngle.toFixed(1)}°`);
            }
          }
          
          if (depth === 1) {
            console.log(`🔍 Gen-1 DEBUG for ${nodeId}:`);
            console.log(`  gravityPoints:`, Array.from(node.gravityPoints.entries()));
            console.log(`  parentSources:`, parentSources);
            console.log(`  weightedMean result:`, weightedMeanResult);
            console.log(`  jitter:`, jitterValue);
            console.log(`  finalAngle:`, finalAngle);
          }
          
          if (finalAngle < 0) finalAngle += 360;
          
          equilibriumPositions.set(nodeId, { 
            angle: finalAngle, 
            radius: depth * ringWidth 
          });
          
          // ADDED DEBUG: Position set tracking
          const hierarchyNode3 = root?.descendants()?.find((d: any) => d.data.id === nodeId);
          console.log(`📍 Position Set: ${nodeId} depth=${hierarchyNode3?.depth ?? 'unknown'} angle=${finalAngle.toFixed(2)}° radius=${(depth * ringWidth).toFixed(1)}`);
        });
      console.log(`🎯 Gen-${depth} EQUILIBRIUM POSITIONS:`,
        genNodes.map(nodeId => {
          const pos = equilibriumPositions.get(nodeId);
          return `${nodeId}@${pos?.angle.toFixed(2)}°`;
        }).join(', '));
      }
      
      return equilibriumPositions;
    }

    const equilibriumPositions = calculateEquilibriumPositions();
    
    // ADD RIGHT AFTER: const equilibriumPositions = calculateEquilibriumPositions();
    console.log("🎯 INVESTIGATING B & C - Equilibrium Positions:");
    ['B', 'C'].forEach(search => {
      const node = Array.from(nodeMap.values()).find(n => n.name?.includes(search));
      if (node) {
        const eqPos = equilibriumPositions.get(node.id);
        console.log(`${search} (${node.id}): equilibrium angle = ${eqPos?.angle.toFixed(3)}°`);
      }
    });

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
      const DEBUG_NODES = new Set(['A','B','C','D','E']); // limit prints to ring-2
      const DEBUG_MAX_ITERS = 500;
      let lastUsedClusterIndex = -1;
      const oscillationTracker = new Map<string, number>(); // nodeA_nodeB -> lastIteration

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
        
        // RECALCULATE EQUILIBRIUM FOR THIS GENERATION USING UPDATED PARENT POSITIONS
        if (depth > 1) {
          console.log(`\n🔄 Recalculating Gen-${depth} equilibrium with updated parents:`);
          nodes.forEach(nodeId => {
            const node = nodeMap.get(nodeId);
            if (!node || !node.gravityPoints || node.gravityPoints.size === 0) return;
            
            // Use CURRENT positions from finalPositions
            const parentSources: Array<{angleDeg: number, mass: number}> = [];
            node.gravityPoints.forEach((gravityValue: number, parentId: string) => {
              const parentPos = finalPositions.get(parentId);  // ✅ UPDATED PARENT POSITIONS
              if (parentPos && gravityValue > 0) {
                parentSources.push({ angleDeg: parentPos.angle, mass: gravityValue });
              }
            });
            
            if (parentSources.length > 0) {
              const weightedMean = massWeightedCircularMean(parentSources);
              if (weightedMean !== null) {
                const jitter = microJitterDeg(nodeId, 0.15);
                let finalAngle = (weightedMean + jitter) % 360;
                if (finalAngle < 0) finalAngle += 360;
                
                finalPositions.set(nodeId, { angle: finalAngle, radius: depth * ringWidth });
                console.log(`  ${nodeId}: repositioned to ${finalAngle.toFixed(2)}° based on updated parents`);
              }
            }
          });
        }
        
        console.log(`\n🔧 Resolving Generation ${depth} collisions (${nodes.length} nodes):`);
        
        const MAX_ITERATIONS = 87;
        const PUSH_DAMPENING = 1; // Prevent oscillation
        
        for (let iteration = 0; iteration < MAX_ITERATIONS; iteration++) {
          let hasCollisions = false;
          const pushForces = new Map<string, number>();
          
          // Step 1: Find all overlapping pairs
          const allOverlaps: Array<{
            nodeA: string, nodeB: string, 
            overlapAmount: number, 
            gravityA: number, gravityB: number,
            pushDistance: number, pushSign: number
          }> = [];
          
          let overlapPairsCount = 0;
          let maxOverlap = 0;
          
          for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
              const nodeA = nodes[i];
              const nodeB = nodes[j];
              
              const posA = finalPositions.get(nodeA)!;
              const posB = finalPositions.get(nodeB)!;
              const territoryA = territories.get(nodeA)!;
              const territoryB = territories.get(nodeB)!;
              
              const requiredSeparation = (territoryA.width + territoryB.width) / 2;
              // Handle circular distance properly
              const angleDiff = Math.abs(posB.angle - posA.angle);
              const circularSeparation = Math.min(angleDiff, 360 - angleDiff);
              const overlapAmount = Math.max(0, requiredSeparation - circularSeparation);

              console.log(`🔄 CIRCULAR OVERLAP DEBUG: ${nodeA}-${nodeB}`);
              console.log(`  Angles: ${posA.angle.toFixed(2)}° vs ${posB.angle.toFixed(2)}°`);
              console.log(`  Raw diff: ${angleDiff.toFixed(2)}°, Circular: ${circularSeparation.toFixed(2)}°`);
              console.log(`  Required: ${requiredSeparation.toFixed(2)}°, Overlap: ${overlapAmount.toFixed(2)}°`);
              
              
              
              if (overlapAmount > 0.1) {
                hasCollisions = true;
                overlapPairsCount++;
                maxOverlap = Math.max(maxOverlap, overlapAmount);
                
                const gravityA = nodeMap.get(nodeA)!.totalGravity;
                const gravityB = nodeMap.get(nodeB)!.totalGravity;
                
                let pushDirection = posB.angle - posA.angle;
                if (pushDirection > 180) pushDirection -= 360;
                if (pushDirection < -180) pushDirection += 360;
                const pushSign = pushDirection >= 0 ? 1 : -1;
                
                allOverlaps.push({
                  nodeA, nodeB, overlapAmount, gravityA, gravityB,
                  pushDistance: overlapAmount * PUSH_DAMPENING,
                  pushSign
                });
              }
            }
          }
          
          // Step 2: Connected Components Analysis (Cluster Detection)
          console.log(`🐛 DEBUG: hasCollisions = ${hasCollisions}, allOverlaps.length = ${allOverlaps.length}`);

          if (hasCollisions) {
            console.log(`🐛 DEBUG: Inside hasCollisions block`);
            
            // Build adjacency map for connected components
            const adjacencyMap = new Map<string, Set<string>>();
            nodes.forEach(nodeId => adjacencyMap.set(nodeId, new Set()));
            
            allOverlaps.forEach(overlap => {
              adjacencyMap.get(overlap.nodeA)!.add(overlap.nodeB);
              adjacencyMap.get(overlap.nodeB)!.add(overlap.nodeA);
            });
            
            // Find connected components (clusters)
            const visited = new Set<string>();
            const clusters: Array<{nodes: string[], overlaps: typeof allOverlaps}> = [];
            
            function dfs(nodeId: string, currentCluster: string[]) {
              if (visited.has(nodeId)) return;
              visited.add(nodeId);
              currentCluster.push(nodeId);
              
              adjacencyMap.get(nodeId)!.forEach(neighbor => {
                dfs(neighbor, currentCluster);
              });
            }
            
            // Find all clusters
            nodes.forEach(nodeId => {
              if (!visited.has(nodeId) && adjacencyMap.get(nodeId)!.size > 0) {
                const clusterNodes: string[] = [];
                dfs(nodeId, clusterNodes);
                
                // Get overlaps within this cluster
                const clusterOverlaps = allOverlaps.filter(overlap =>
                  clusterNodes.includes(overlap.nodeA) && clusterNodes.includes(overlap.nodeB)
                );
                
                clusters.push({ nodes: clusterNodes, overlaps: clusterOverlaps });

                console.log(`🐛 DEBUG: Cluster ${clusters.length} found:`, clusterNodes, `overlaps:`, clusterOverlaps.length);
              }
            });
            
            console.log(`🔧 Found ${clusters.length} collision clusters:`, 
              clusters.map(c => `{${c.nodes.join(',')}}`).join(', '));
            
            // Step 3: Collect all selected operations from all clusters
            console.log(`🐛 DEBUG: Processing ${clusters.length} clusters`);

            const allSelectedOperations: Array<{
              operation: any,
              cluster: any,
              primaryPusher: string
            }> = [];

            // ADDED: Sort clusters by severity then mass
            clusters.sort((a, b) => {
              // 1. Severity-Based Ordering (Primary)
              const maxOverlapA = a.overlaps.length > 0 ? Math.max(...a.overlaps.map(o => o.overlapAmount || 0)) : 0;
              const maxOverlapB = b.overlaps.length > 0 ? Math.max(...b.overlaps.map(o => o.overlapAmount || 0)) : 0;
              
              if (Math.abs(maxOverlapA - maxOverlapB) > 0.1) {
                return maxOverlapB - maxOverlapA; // Larger overlaps first
              }
              
              // 2. Total Mass Ordering (Tie-breaker)
              const massA = a.nodes.reduce((sum, nodeId) => sum + (nodeMap.get(nodeId)?.totalGravity || 0), 0);
              const massB = b.nodes.reduce((sum, nodeId) => sum + (nodeMap.get(nodeId)?.totalGravity || 0), 0);
              
              return massB - massA; // Heavier clusters first
            });

            console.log(`🐛 DEBUG: Processing ${clusters.length} clusters (sorted by severity then mass)`);

            // Process each cluster
            clusters.forEach((cluster, clusterIndex) => {
              // Find primary pusher within this cluster
              let primaryPusher = '';
              let maxGravity = 0;
              cluster.nodes.forEach(nodeId => {
                const gravity = nodeMap.get(nodeId)!.totalGravity;
                if (gravity > maxGravity) {
                  maxGravity = gravity;
                  primaryPusher = nodeId;
                }
              });
              
              console.log(`  Cluster ${clusterIndex + 1}: Primary pusher = ${primaryPusher} (gravity: ${maxGravity.toFixed(3)})`);
              
              // Collect operations from this cluster
              const selectedOperations = cluster.overlaps.filter(overlap => 
                overlap.nodeA === primaryPusher || overlap.nodeB === primaryPusher
              );
              
              selectedOperations.forEach(operation => {
                allSelectedOperations.push({
                  operation,
                  cluster,
                  primaryPusher
                });
              });
            });
            
            // Step 4: Process operations with cluster rotation to prevent oscillation
            console.log(`🐛 DEBUG: Total selectedOperations across all clusters: ${allSelectedOperations.length}`);

            // Track which cluster was used (add this outside the iteration loop)
            let lastUsedClusterIndex = -1;

            if (allSelectedOperations.length > 0) {
              // Group operations by cluster
              const operationsByCluster = new Map();
              allSelectedOperations.forEach(({ operation, cluster, primaryPusher }) => {
                if (!operationsByCluster.has(cluster)) {
                  operationsByCluster.set(cluster, []);
                }
                operationsByCluster.get(cluster).push({ operation, cluster, primaryPusher });
              });
              
              const uniqueClusters = Array.from(operationsByCluster.keys());
              console.log(`🔄 DEBUG: ${uniqueClusters.length} unique clusters available for rotation`);
              
              // Track recent operations to detect oscillating pairs
              // Clean old entries (only keep last 5 iterations)
              const currentIter = iteration;
              for (const [pair, lastSeen] of oscillationTracker.entries()) {
                if (currentIter - lastSeen > 3) { //overlap last seen here
                  oscillationTracker.delete(pair);
                }
              }

              // Deadlock-aware cluster selection
              let selectedClusterIndex = -1;
              let selectedCluster = null;
              let clusterOperations = [];

              console.log(`🔄 DEADLOCK-AWARE: Selecting from ${uniqueClusters.length} clusters, avoiding recent pairs:`, 
                Array.from(oscillationTracker.keys()));

              // Priority 1: Clusters without ANY problematic node pairs
              for (let i = 0; i < uniqueClusters.length; i++) {
                const cluster = uniqueClusters[i];
                const operations = operationsByCluster.get(cluster);
                
                const hasProblematicPair = operations.some(op => {
                  const pairKey = [op.operation.nodeA, op.operation.nodeB].sort().join('_');
                  return oscillationTracker.has(pairKey);
                });
                
                if (!hasProblematicPair) {
                  selectedClusterIndex = i;
                  selectedCluster = cluster;
                  clusterOperations = operations;
                  console.log(`🔄 PRIORITY 1: Selected clean cluster ${i + 1} (no problematic pairs)`);
                  break;
                }
              }

              // Priority 2: Clusters with only ONE node from problematic pairs
              if (selectedClusterIndex === -1) {
                for (let i = 0; i < uniqueClusters.length; i++) {
                  const cluster = uniqueClusters[i];
                  const operations = operationsByCluster.get(cluster);
                  
                  const hasPartialOverlap = operations.some(op => {
                    const problematicNodes = new Set<string>();
                    oscillationTracker.forEach((_, pairKey) => {
                      const [nodeA, nodeB] = pairKey.split('_');
                      problematicNodes.add(nodeA);
                      problematicNodes.add(nodeB);
                    });
                    
                    const opNodes = [op.operation.nodeA, op.operation.nodeB];
                    const overlapCount = opNodes.filter(node => problematicNodes.has(node)).length;
                    return overlapCount === 1; // Only one node overlaps
                  });
                  
                  if (hasPartialOverlap) {
                    selectedClusterIndex = i;
                    selectedCluster = cluster;
                    clusterOperations = operations;
                    console.log(`🔄 PRIORITY 2: Selected partial cluster ${i + 1} (one problematic node)`);
                    break;
                  }
                }
              }

              // Priority 3: Fallback - rotate through remaining clusters
              if (selectedClusterIndex === -1) {
                if (uniqueClusters.length === 1) {
                  selectedClusterIndex = 0;
                  console.log(`🔄 PRIORITY 3: Only 1 cluster available, using cluster ${selectedClusterIndex + 1}`);
                } else {
                  selectedClusterIndex = (lastUsedClusterIndex + 1) % uniqueClusters.length;
                  console.log(`🔄 PRIORITY 3: Rotating from cluster ${lastUsedClusterIndex + 1} to cluster ${selectedClusterIndex + 1}`);
                }
                
                selectedCluster = uniqueClusters[selectedClusterIndex];
                clusterOperations = operationsByCluster.get(selectedCluster);
              }

              lastUsedClusterIndex = selectedClusterIndex;

              // Take first operation from selected cluster
              const { operation, cluster, primaryPusher } = clusterOperations[0];

              // Record this operation for oscillation tracking
              const pairKey = [operation.nodeA, operation.nodeB].sort().join('_');
              oscillationTracker.set(pairKey, currentIter);
              console.log(`🔄 TRACKING: Recorded ${pairKey} at iteration ${currentIter}`);
              console.log(`🔄 DEBUG: Processing operation from cluster ${selectedClusterIndex + 1}:`, operation.nodeA, '→', operation.nodeB);
              
              const { nodeA, nodeB, gravityA, gravityB, pushDistance } = operation;
              
              // APPLY CONDITIONAL MOVEMENT CALCULATION HERE
              const stronger = gravityA > gravityB ? nodeA : nodeB;
              const weaker = gravityA > gravityB ? nodeB : nodeA;
              
              const strongerPos = finalPositions.get(stronger)!;
              const weakerPos = finalPositions.get(weaker)!;
              const currentSeparation = Math.abs(strongerPos.angle - weakerPos.angle);
              
              
              // Get the current generation depth
              const hierarchyNode = root.descendants().find(d => d.data.id === stronger);
              const depth = hierarchyNode ? hierarchyNode.depth : 2;
              
              // Recalculate masses with current positions
              console.log(`🐛 MASS DEBUG: --- Starting mass calculation for ${stronger}→${weaker} ---`);
              console.log(`🐛 MASS DEBUG: Current finalPositions:`, 
                Array.from(finalPositions.entries()).map(([id, pos]) => `${id}@${pos.angle.toFixed(2)}°`));


              // ADD THIS DEBUG BLOCK:
              console.log(`🐛 POSITION DEBUG:`);
              console.log(`  stronger: "${stronger}" at ${strongerPos.angle.toFixed(2)}°`);
              console.log(`  weaker: "${weaker}" at ${weakerPos.angle.toFixed(2)}°`);
              console.log(`  Expected overlap center: ${((strongerPos.angle + weakerPos.angle) / 2).toFixed(2)}°`);

              // Handle wraparound for overlap center calculation
              let overlapCenter: number;
              const angleDiff = Math.abs(strongerPos.angle - weakerPos.angle);

              if (angleDiff <= 180) {
                // Normal case - direct average
                overlapCenter = (strongerPos.angle + weakerPos.angle) / 2;
              } else {
                // Wraparound case - they're closer going through 0°
                const avg = (strongerPos.angle + weakerPos.angle + 360) / 2;
                overlapCenter = avg > 360 ? avg - 360 : avg;
              }

              console.log(`🔄 OVERLAP CENTER DEBUG: ${stronger}@${strongerPos.angle.toFixed(2)}° vs ${weaker}@${weakerPos.angle.toFixed(2)}°`);
              console.log(`  AngleDiff: ${angleDiff.toFixed(2)}°, Wraparound: ${angleDiff > 180}`);
              console.log(`  OverlapCenter: ${overlapCenter.toFixed(2)}°`);
              console.log(`🐛 MASS DEBUG: Overlap center: ${overlapCenter.toFixed(2)}°`);

              const leftSector = [overlapCenter - 180, overlapCenter];
              const rightSector = [overlapCenter, overlapCenter + 180];

              // Normalize sectors to [0, 360°] range
              leftSector[0] = ((leftSector[0] % 360) + 360) % 360;
              leftSector[1] = ((leftSector[1] % 360) + 360) % 360;
              rightSector[0] = ((rightSector[0] % 360) + 360) % 360;
              rightSector[1] = ((rightSector[1] % 360) + 360) % 360;

              console.log(`🔄 NORMALIZED SECTORS:`);
              console.log(`  Left: [${leftSector[0].toFixed(2)}°, ${leftSector[1].toFixed(2)}°]`);
              console.log(`  Right: [${rightSector[0].toFixed(2)}°, ${rightSector[1].toFixed(2)}°]`);
              console.log(`🐛 MASS DEBUG: Left sector: [${leftSector[0].toFixed(2)}°, ${leftSector[1].toFixed(2)}°]`);
              console.log(`🐛 MASS DEBUG: Right sector: [${rightSector[0].toFixed(2)}°, ${rightSector[1].toFixed(2)}°]`);
              
              function calculateSectorMass(sector: number[]) {
                const [start, end] = sector;
                let totalMass = 0;
                
                console.log(`🐛 MASS DEBUG: Calculating sector [${start.toFixed(2)}° to ${end.toFixed(2)}°]`);
                
                // Get all nodes in the same ring/depth as the overlapping pair
                const ringNodes = generations.get(depth) || [];
                ringNodes.forEach(nodeId => {
                  const nodeAngle = finalPositions.get(nodeId)!.angle;
                  const mass = nodeMap.get(nodeId)!.totalGravity;
                  
                  const currentAngle = finalPositions.get(nodeId)!.angle;
                  const territoryWidth = territories.get(nodeId)!.width; 

                  console.log(`🐛 MASS DEBUG: Node ${nodeId} at ${nodeAngle.toFixed(2)}° with mass ${mass.toFixed(2)}`);

                  // Calculate territory bounds using CURRENT position
                  const territoryStart = ((currentAngle - territoryWidth/2) % 360 + 360) % 360;
                  const territoryEnd = ((currentAngle + territoryWidth/2) % 360 + 360) % 360;
                  
                  console.log(`🐛 TERRITORY DEBUG: ${nodeId} center=${currentAngle.toFixed(2)}° width=${territoryWidth.toFixed(2)}° bounds=[${territoryStart.toFixed(2)}°, ${territoryEnd.toFixed(2)}°]`);
                  console.log(`🐛 SECTOR DEBUG: Left=[${start.toFixed(2)}°, ${end.toFixed(2)}°], Right=[${start.toFixed(2)}°, ${end.toFixed(2)}°]`);

                  // Normalize sector bounds
                  const sectorStart = ((start % 360) + 360) % 360;
                  const sectorEnd = ((end % 360) + 360) % 360;
                
                  // Helper function: check if territory is fully within sector
                  function isFullyWithinSector(terrStart: number, terrEnd: number, sectStart: number, sectEnd: number): boolean {
                    if (sectStart <= sectEnd) {
                      // Normal sector (no wraparound)
                      if (terrStart <= terrEnd) {
                        // Normal territory (no wraparound)
                        return terrStart >= sectStart && terrEnd <= sectEnd;
                      } else {
                        // Territory wraps, sector doesn't - cannot be fully within
                        return false;
                      }
                    } else {
                      // Sector wraps around 0°
                      if (terrStart <= terrEnd) {
                        // Normal territory, sector wraps
                        return terrStart >= sectStart || terrEnd <= sectEnd;
                      } else {
                        // Both wrap - more robust containment check
                        // Territory is fully within sector if BOTH parts are contained
                        const terrFirstPart = terrStart >= sectStart;
                        const terrSecondPart = terrEnd <= sectEnd;
                        
                        // Add tolerance for floating point precision
                        const tolerance = 0.01;
                        return (terrFirstPart || Math.abs(terrStart - sectStart) < tolerance) && 
                               (terrSecondPart || Math.abs(terrEnd - sectEnd) < tolerance);
                      }
                    }
                  }
                  
                  // Helper function: calculate angular overlap between ranges
                  function calculateAngularOverlap(terrStart: number, terrEnd: number, sectStart: number, sectEnd: number): number {
                    let overlap = 0;
                    
                    if (sectStart <= sectEnd) {
                      // Normal sector (no wraparound)
                      if (terrStart <= terrEnd) {
                        // Normal territory (no wraparound)
                        overlap = Math.max(0, Math.min(terrEnd, sectEnd) - Math.max(terrStart, sectStart));
                      } else {
                        // Territory wraps, sector doesn't
                        // Territory: [terrStart, 360°] + [0°, terrEnd]
                        overlap += Math.max(0, Math.min(360, sectEnd) - Math.max(terrStart, sectStart)); // First part
                        overlap += Math.max(0, Math.min(terrEnd, sectEnd) - Math.max(0, sectStart));     // Second part
                      }
                    } else {
                      // Sector wraps around 0°
                      // Sector: [sectStart, 360°] + [0°, sectEnd]
                      if (terrStart <= terrEnd) {
                        // Normal territory, sector wraps
                        overlap += Math.max(0, Math.min(terrEnd, 360) - Math.max(terrStart, sectStart)); // First part
                        overlap += Math.max(0, Math.min(terrEnd, sectEnd) - Math.max(terrStart, 0));     // Second part
                      } else {
                        // Both wrap
                        overlap += Math.max(0, Math.min(360, 360) - Math.max(terrStart, sectStart));     // [terrStart, 360°] ∩ [sectStart, 360°]
                        overlap += Math.max(0, Math.min(terrEnd, sectEnd) - Math.max(0, 0));             // [0°, terrEnd] ∩ [0°, sectEnd]
                      }
                    }
                    
                    return overlap;
                  }
                  
                  // Hybrid mass distribution
                  if (isFullyWithinSector(territoryStart, territoryEnd, sectorStart, sectorEnd)) {
                    // Fast path: territory fully within sector
                    totalMass += mass;
                    console.log(`🐛 MASS DEBUG: Node ${nodeId} fully in sector, added full mass ${mass.toFixed(2)}, total now: ${totalMass.toFixed(2)}`);
                  } else {
                    // Accurate path: calculate proportional overlap
                    const overlapAmount = calculateAngularOverlap(territoryStart, territoryEnd, sectorStart, sectorEnd);
                    const proportionalMass = mass * (overlapAmount / territoryWidth);
                    
                    if (overlapAmount > 0) {
                      totalMass += proportionalMass;
                      console.log(`🐛 MASS DEBUG: Node ${nodeId} partial overlap ${overlapAmount.toFixed(2)}°/${territoryWidth.toFixed(2)}°, added ${proportionalMass.toFixed(2)}, total now: ${totalMass.toFixed(2)}`);
                    } else {
                      console.log(`🐛 MASS DEBUG: Node ${nodeId} no overlap with sector`);
                    }
                  }
                });
                
                console.log(`🐛 MASS DEBUG: Final sector mass: ${totalMass.toFixed(2)}`);
                return totalMass;
              }
              
              const leftMass = calculateSectorMass(leftSector);
              const rightMass = calculateSectorMass(rightSector);
              
              // CORRECTED: Heavy left pushes clockwise
              const jitterForce = microJitterDeg(weaker, 0.0000001);
              const massImbalance = leftMass - rightMass;
              const massForce = massImbalance * 1.0;
              
              const totalForce = jitterForce + massForce;
              const pushSign = totalForce >= 0 ? 1 : -1;
              
              // NOW INSERT THE MOVEMENT CALCULATION HERE
              const requiredSeparation = (territories.get(stronger)!.width + territories.get(weaker)!.width) / 2;
              
              // Use existing massForce to determine direction
              const moveClockwise = massForce >= 0;

              // Calculate movement based on overlap resolution, not final positioning
              const totalOverlapToResolve = operation.overlapAmount;

              // Simple movement: just resolve the overlap
              const actualMovementDistance = totalOverlapToResolve;

              console.log(`🔧 MOVEMENT DEBUG: Resolving ${totalOverlapToResolve.toFixed(2)}° overlap`);
              console.log(`  Direction: ${moveClockwise ? 'clockwise' : 'counterclockwise'}`);
              console.log(`  Movement needed: ${actualMovementDistance.toFixed(2)}°`);
              
              // Apply direction sign
              const signedMovementDistance = moveClockwise ? actualMovementDistance : -actualMovementDistance;
              
              // *** BIDIRECTIONAL PHYSICS WITH SPACE CONSTRAINT ***
              function getAvailableFreeSpace(nodeId: string, direction: number): number {
                const currentPos = finalPositions.get(nodeId)!;
                const nodeTerritory = territories.get(nodeId)!;
                let freeSpace = 0;
                let scanAngle = currentPos.angle;
                const scanStep = direction > 0 ? 1 : -1; // 1° increments
                
                for (let i = 0; i < 180; i++) { // Max scan 180°
                  scanAngle += scanStep;
                  if (scanAngle < 0) scanAngle += 360;
                  if (scanAngle >= 360) scanAngle -= 360;
                  
                  // Check if this angle hits any other node's territory in same generation
                  const blocked = nodes.some(otherId => {
                    if (otherId === nodeId) return false;
                    const otherPos = finalPositions.get(otherId)!;
                    const otherTerritory = territories.get(otherId)!;
                    const otherStart = otherPos.angle - (otherTerritory.width / 2);
                    const otherEnd = otherPos.angle + (otherTerritory.width / 2);
                    
                    // Check if scanAngle falls within other node's territory
                    if (otherStart <= otherEnd) {
                      return scanAngle >= otherStart && scanAngle <= otherEnd;
                    } else {
                      // Territory wraps around 0°
                      return scanAngle >= otherStart || scanAngle <= otherEnd;
                    }
                  });
                  
                  if (blocked) break;
                  freeSpace += 1;
                }
                
                return freeSpace;
              }

              // Calculate physics-based movements
              const totalMovement = Math.abs(signedMovementDistance);
              const massA = nodeMap.get(stronger)!.totalGravity;
              const massB = nodeMap.get(weaker)!.totalGravity;
              const totalMass = massA + massB;

              // Physics: movement inversely proportional to mass
              const intendedStrongerMovement = totalMass > 0 ? totalMovement * (massB / totalMass) : totalMovement * 0.3;
              const intendedWeakerMovement = totalMass > 0 ? totalMovement * (massA / totalMass) : totalMovement * 0.7;

              // Determine movement directions (opposite to each other)
              const pushDirection = signedMovementDistance > 0 ? 1 : -1;
              const strongerMoveDirection = -pushDirection; // Opposite to push
              const weakerMoveDirection = pushDirection;

              // Check available space for stronger node
              const availableSpace = getAvailableFreeSpace(stronger, strongerMoveDirection);
              const actualStrongerMovement = Math.min(intendedStrongerMovement, availableSpace);

              // Redistribute blocked movement to weaker node
              const redistributed = intendedStrongerMovement - actualStrongerMovement;
              const actualWeakerMovement = intendedWeakerMovement + redistributed;

              console.log(`🔧 PHYSICS DEBUG: ${stronger} → ${weaker}`);
              console.log(`  Total movement: ${totalMovement.toFixed(2)}°`);
              console.log(`  Masses: ${massA.toFixed(2)} vs ${massB.toFixed(2)}, total: ${totalMass.toFixed(2)}`);
              console.log(`  Intended movements: stronger=${intendedStrongerMovement.toFixed(2)}°, weaker=${intendedWeakerMovement.toFixed(2)}°`);
              console.log(`  Available space for ${stronger}: ${availableSpace.toFixed(1)}°`);
              console.log(`  Actual movements: stronger=${actualStrongerMovement.toFixed(2)}°, weaker=${actualWeakerMovement.toFixed(2)}°`);
              console.log(`  Movement directions: stronger=${strongerMoveDirection}, weaker=${weakerMoveDirection}`);
              console.log(`  Primary pusher: ${primaryPusher}, stronger=${stronger}, weaker=${weaker}`);

              // // Apply movements to both nodes (if they're not primary pushers)
              // if (actualStrongerMovement > 0.1) { // Remove primary pusher restriction
              //   pushForces.set(stronger, strongerMoveDirection * actualStrongerMovement);
              //   console.log(`  ✅ ${stronger}: physics move ${actualStrongerMovement.toFixed(2)}° applied (${strongerMoveDirection > 0 ? 'clockwise' : 'counterclockwise'})`);
              // } else {
              //   console.log(`  ❌ ${stronger}: movement blocked - isPrimaryPusher=${stronger === primaryPusher}, movement=${actualStrongerMovement.toFixed(2)}°`);
              // }

              // if (weaker !== primaryPusher) {
              //   pushForces.set(weaker, weakerMoveDirection * actualWeakerMovement);
              //   console.log(`  ✅ ${weaker}: physics move ${actualWeakerMovement.toFixed(2)}° applied (${weakerMoveDirection > 0 ? 'clockwise' : 'counterclockwise'})`);
                
              //   if (iteration < DEBUG_MAX_ITERS) {
              //     console.log(`🐛 DEBUG: iteration = ${iteration}, showing detailed logs`);
              //     console.log(`    ${stronger}→${weaker}: ${operation.overlapAmount.toFixed(1)}° overlap`);
              //     console.log(`    Physics: stronger=${actualStrongerMovement.toFixed(2)}°, weaker=${actualWeakerMovement.toFixed(2)}°`);
              //     console.log(`    Masses: ${massA.toFixed(2)} vs ${massB.toFixed(2)}, available space: ${availableSpace.toFixed(1)}°`);
              //   }
              // } else {
              //   console.log(`  ❌ ${weaker}: movement blocked - isPrimaryPusher=${weaker === primaryPusher}`);
              // }

              // Apply movements to both nodes (space permitting)
              if (actualStrongerMovement > 0.01) {
                pushForces.set(stronger, strongerMoveDirection * actualStrongerMovement);
                console.log(`  ✅ ${stronger}: physics move ${actualStrongerMovement.toFixed(2)}° applied (${strongerMoveDirection > 0 ? 'clockwise' : 'counterclockwise'})`);
              } else {
                console.log(`  ❌ ${stronger}: blocked by space constraint, movement=${actualStrongerMovement.toFixed(2)}°`);
              }

              if (actualWeakerMovement > 0.01) {
                pushForces.set(weaker, weakerMoveDirection * actualWeakerMovement);
                console.log(`  ✅ ${weaker}: physics move ${actualWeakerMovement.toFixed(2)}° applied (${weakerMoveDirection > 0 ? 'clockwise' : 'counterclockwise'})`);
                
              } else {
                console.log(`  ❌ ${weaker}: blocked by space constraint, movement=${actualWeakerMovement.toFixed(2)}°`);
              }
            }
          }
          
          // Per-iteration logging
          if (iteration < DEBUG_MAX_ITERS) {
            console.log(`🐛 DEBUG: pushForces map size: ${pushForces.size}`);
            console.log(`🐛 DEBUG: pushForces entries:`, Array.from(pushForces.entries()));
            console.log(`Iter ${iteration+1} pushForces:`, Array.from(pushForces.entries())
              .map(([id, p]) => `${id}:${p.toFixed(3)}°`).join(', '));
            
            const before = nodes.map(id => `${id}@${finalPositions.get(id)!.angle.toFixed(2)}°`).join(', ');
            console.log(`Iter ${iteration+1} before: ${before}`);
            
            console.log(`Iter ${iteration+1} stats: overlaps=${overlapPairsCount}, maxOverlap=${maxOverlap.toFixed(2)}°`);
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
          
          // Log after applying pushes
          if (iteration < DEBUG_MAX_ITERS) {
            const after = nodes.map(id => `${id}@${finalPositions.get(id)!.angle.toFixed(2)}°`).join(', ');
            console.log(`Iter ${iteration+1}  after: ${after}`);
            
            const bounds = nodes.map(id => {
              const p = finalPositions.get(id)!; 
              const w = territories.get(id)!.width;
              return `${id}[${(p.angle - w/2).toFixed(2)} → ${(p.angle + w/2).toFixed(2)}]`;
            }).join(', ');
            console.log(`Iter ${iteration+1} bounds: ${bounds}`);
          }
          
          if (iteration === MAX_ITERATIONS - 1) {
            console.log(`  ⚠️ Reached max iterations with remaining collisions`);
          }
        }
      });
      
      // Post-solve adjacency & gap check
      generations.forEach((nodes, depth) => {
        if (depth === 0 || nodes.length <= 1) return;
        
        const ringNodes = nodes
          .map(id => ({ id, ang: finalPositions.get(id)!.angle, w: territories.get(id)!.width }))
          .sort((a,b) => a.ang - b.ang);
        const wrap = [...ringNodes, {...ringNodes[0], ang: ringNodes[0].ang + 360}];
        const gaps = [];
        for (let i=0;i<ringNodes.length;i++){
          const cur = wrap[i], nxt = wrap[i+1];
          const curEnd = cur.ang + cur.w/2;
          const nxtStart = nxt.ang - nxt.w/2;
          gaps.push({pair:`${cur.id}→${nxt.id}`, gap:(nxtStart - curEnd).toFixed(3)});
        }
        console.log(`🔎 Ring ${depth} post-solve gaps:`, gaps);
      });
      
      return finalPositions;
    }

    const collisionResolvedPositions = resolveCollisions(equilibriumPositions);
    
    // Verify the collision resolution results are being stored
    console.log("🐛 COLLISION RESOLVED POSITIONS:");
    Array.from(collisionResolvedPositions.entries()).forEach(([id, pos]) => {
      console.log(`  ${id}: ${pos.angle.toFixed(2)}°`);
    });
    
    // *** PHASE 3.5: RECALCULATE CHILD POSITIONS ***
    function recalculateChildPositions(finalPositions: Map<string, {angle: number, radius: number}>) {
      console.log("🔄 PHASE 3.5: Recalculating child positions with final parent positions");
      
      const generations = new Map<number, string[]>();
      
      // Reorganize by generation
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
      
      // Recalculate positions for generations 2+
      for (let depth = 2; depth <= Math.max(...generations.keys()); depth++) {
        const genNodes = generations.get(depth) || [];
        if (genNodes.length === 0) continue;
        
        console.log(`🔄 Recalculating Gen-${depth} positions (${genNodes.length} nodes):`);
        
        genNodes.forEach(nodeId => {
          const node = nodeMap.get(nodeId);
          if (!node || !node.gravityPoints || node.gravityPoints.size === 0) {
            // No gravity sources - keep existing position
            console.log(`  ${nodeId}: no gravity sources, keeping existing position`);
            return;
          }
          
          // Build parent angle/mass pairs using FINAL positions
          const parentSources: Array<{angleDeg: number, mass: number}> = [];
          node.gravityPoints.forEach((gravityValue: number, parentId: string) => {
            const parentPos = finalPositions.get(parentId);  // ✅ USE FINAL POSITIONS
            if (parentPos && gravityValue > 0) {
              parentSources.push({
                angleDeg: parentPos.angle,
                mass: gravityValue
              });
            }
          });
          
          if (parentSources.length === 0) {
            console.log(`  ${nodeId}: no valid parents, keeping existing position`);
            return;
          }
          
          // Calculate new weighted mean with final parent positions
          const weightedMean = massWeightedCircularMean(parentSources);
          
          if (weightedMean !== null) {
            const jitter = microJitterDeg(nodeId, 0.15);
            let finalAngle = (weightedMean + jitter) % 360;
            if (finalAngle < 0) finalAngle += 360;
            
            const oldPos = finalPositions.get(nodeId);
            finalPositions.set(nodeId, { 
              angle: finalAngle, 
              radius: depth * ringWidth 
            });
            
            console.log(`  ${nodeId}: ${oldPos?.angle.toFixed(2)}° → ${finalAngle.toFixed(2)}° (parents: ${parentSources.map(p => `${p.angleDeg.toFixed(1)}°(${p.mass.toFixed(1)})`).join(', ')})`);
          }
        });
      }
      
      console.log("🔄 PHASE 3.5 Complete - Child positions recalculated with final parent positions");
      return finalPositions;
    }
    
    // Skip child recalculation since all generations were processed together
    const finalPositionsWithUpdatedChildren = collisionResolvedPositions;
    
    // Check what finalPositionsWithUpdatedChildren contains
    console.log("🐛 VISUAL DEBUG: finalPositionsWithUpdatedChildren:");
    Array.from(finalPositionsWithUpdatedChildren.entries()).forEach(([id, pos]) => {
      console.log(`  ${id}: ${pos.angle.toFixed(2)}°`);
    });
    
    // ADD RIGHT AFTER: const collisionResolvedPositions = resolveCollisions(equilibriumPositions);
    console.log("💥 INVESTIGATING B & C - Post-Collision Positions:");
    ['B', 'C'].forEach(search => {
      const node = Array.from(nodeMap.values()).find(n => n.name?.includes(search));
      if (node) {
        const eqPos = equilibriumPositions.get(node.id);
        const resolvedPos = collisionResolvedPositions.get(node.id);
        console.log(`${search} (${node.id}):`);
        console.log(`  equilibrium: ${eqPos?.angle.toFixed(3)}°`);
        console.log(`  resolved: ${resolvedPos?.angle.toFixed(3)}° (moved ${Math.abs((resolvedPos?.angle || 0) - (eqPos?.angle || 0)).toFixed(3)}°)`);
      }
    });

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
    (window as any).__fieldPositions__ = finalPositionsWithUpdatedChildren;
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
    
    // Include depth 0 when we have pivoted; otherwise skip the synthetic "Root"
    const minDepth = pivotId ? 0 : 1;
    const allNodes = root.descendants().filter((d: any) => d.depth >= minDepth && d.depth <= layers);
    const visibleNodes = allNodes.filter((d, i, arr) =>
      arr.findIndex(
        x => x.data.id === d.data.id && x.depth === d.depth
      ) === i
    );
    
    // ADDED DEBUG: Visibility filter
    console.log("👁️ VISIBILITY FILTER:");
    console.log("All nodes from hierarchy:", allNodes.map(d => ({ id: d.data.id, depth: d.depth })));
    console.log("Visible after dedup:", visibleNodes.map(d => ({ id: d.data.id, depth: d.depth })));
    console.log("Nodes lost in filtering:", allNodes.filter(a => !visibleNodes.some(v => v.data.id === a.data.id && v.depth === a.depth)).map(d => ({ id: d.data.id, depth: d.depth, reason: 'duplicate_or_filtered' })));
    
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
    

    // *** PHASE 4: FIELD MODEL ARC GENERATOR ***
    console.log("🎨 PHASE 4: Creating Field Model Arcs");

    // Calculate field-based arc data for each visible node
    const fieldArcData = visibleNodes.map(d => {
      const nodeId = d.data.id;
      const fieldPos = finalPositionsWithUpdatedChildren.get(nodeId);
      
      // Check what fieldPos is getting in the fieldArcData mapping
      console.log(`🐛 FIELD POS for ${nodeId}: ${fieldPos?.angle.toFixed(2)}°`);
      
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
      
      // Convert field position to radians and create arc bounds
      const centerAngleRad = (fieldPos.angle * Math.PI) / 180;
      const halfWidth = angularWidth / 2;
      
      const fieldX0 = centerAngleRad - halfWidth;
      const fieldX1 = centerAngleRad + halfWidth;
      
      // ADD INSIDE the fieldArcData.map(), right after calculating angularWidth:
      if (d.data.name?.includes('A') || d.data.name?.includes('E')) {
        console.log(`🎨 INVESTIGATING ${d.data.name} - Arc Calculation:`);
        console.log(`  nodeGravity: ${nodeGravity}`);
        console.log(`  totalGenerationGravity: ${totalGenerationGravity}`);
        console.log(`  angularWidth: ${angularWidth * 180 / Math.PI}° (before max constraint)`);
        console.log(`  fieldPos.angle: ${fieldPos.angle}°`);
        console.log(`  centerAngleRad: ${centerAngleRad}`);
        console.log(`  halfWidth: ${halfWidth * 180 / Math.PI}°`);
        console.log(`  fieldX0: ${fieldX0} (${fieldX0 * 180 / Math.PI}°)`);
        console.log(`  fieldX1: ${fieldX1} (${fieldX1 * 180 / Math.PI}°)`);
      }
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

    // ADDED DEBUG: Arc data creation
    console.log("🎨 ARC DATA CREATION:");
    console.log("Visible nodes input:", visibleNodes.length);
    console.log("Field arc data output:", fieldArcData.length);
    fieldArcData.forEach(d => {
      console.log(`  ${d.data.id}: field=${d.isFieldPositioned} angle=${d.fieldAngleDeg?.toFixed(1)}° width=${d.angularWidthDeg?.toFixed(1)}° gravity=${d.gravityMass?.toFixed(3)}`);
    });
    
    // Check if we're missing any nodes in the arc data vs visible nodes
    const renderedNodeIds = fieldArcData.map(d => d.data.id);
    const missingFromRender = visibleNodes.filter(v => !renderedNodeIds.includes(v.data.id));
    console.log("🚨 Missing from render:", missingFromRender.map(m => m.data.id));
    
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
    
    // ADDED DEBUG: Coverage gap analysis
    console.log("🚫 COVERAGE GAP ANALYSIS:");
    byDepth.forEach((sum, depth) => {
      const gapPercentage = Math.max(0, 360 - sum) / 360 * 100;
      if (gapPercentage > 10) {
        console.log(`⚠️ Ring ${depth} has ${gapPercentage.toFixed(1)}% uncovered space (${(360-sum).toFixed(1)}° gap)`);
      }
    });

    // Field-aware arc generator
    const arc = d3.arc<any>()
      .startAngle(d => d.isFieldPositioned ? d.fieldX0 : d.x0)
      .endAngle(d => d.isFieldPositioned ? d.fieldX1 : d.x1)
      .innerRadius(d => (d.isFieldPositioned ? d.fieldY0 : d.y0) * ringWidth)
      .outerRadius(d => (d.isFieldPositioned ? d.fieldY1 : d.y1) * ringWidth * 1.01)
      .padAngle(d => {
        // Zero padding for arcs that cross the 0/2π seam
        const start = d.isFieldPositioned ? d.fieldX0 : d.x0;
        const end = d.isFieldPositioned ? d.fieldX1 : d.x1;
        return (start < 0 || end > 2 * Math.PI) ? 0 : 0.002;
      });


    
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
    
    // ADDED DEBUG: D3 path binding
    console.log("🖼️ D3 PATH BINDING:");
    console.log("Data being bound to paths:", fieldArcData.map(d => ({ 
      id: d.data.id, 
      depth: d.depth,
      hasFieldPosition: !!d.fieldAngleDeg,
      arcBounds: d.isFieldPositioned ? `${d.fieldX0?.toFixed(3)} to ${d.fieldX1?.toFixed(3)}` : `${d.x0?.toFixed(3)} to ${d.x1?.toFixed(3)}`
    })));
    
    const path = svg.selectAll("path")
      .data(fieldArcData, (d: any) => `${d.data.id}-${d.depth}`)
      .enter()
      .append("path")
      .attr("d", arc as any)
      .each(function(d: any) {
        // ADD RIGHT AFTER: .attr("d", arc as any)
        if (d.data.name?.includes('A') || d.data.name?.includes('E')) {
          const arcPath = arc(d);
          console.log(`🖼️ FINAL ARC ${d.data.name}:`);
          console.log(`  fieldX0: ${d.fieldX0} (${d.fieldX0 * 180 / Math.PI}°)`);
          console.log(`  fieldX1: ${d.fieldX1} (${d.fieldX1 * 180 / Math.PI}°)`);
          console.log(`  arc path: ${arcPath}`);
        }
      })
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
            // Zoom so that the leaf's *parent* is centred,
            // **but** tell the outside world that *this* leaf is the "selected core"
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
