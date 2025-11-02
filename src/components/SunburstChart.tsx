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
  maxLayers = 2,
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


    //location 2
    // *** INSERT GRAVITY INSPECTION HERE *** (see console.log below)
    // *** GRAVITY MODEL INSPECTION ***
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

    // Define arc generator
    const arc = d3.arc<any>()
      .startAngle(d => d.x0)
      .endAngle(d => d.x1)
      .innerRadius(d => d.y0 * ringWidth)
      .outerRadius(d => d.y1 * ringWidth * 1.01) // Slightly larger outer radius for better visibility
      .padAngle(0);
    
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
      .data(visibleNodes, (d: any) => `${d.data.id}-${d.depth}`)
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

    // Add titles (deduped, without synthetic root)
    const format = d3.format(",d");
    path.append("title").text(d => {
      // Build ancestor name list, reverse to root-first
      const names = d.ancestors()
        .map(node => node.data.name)
        .reverse()
        // Exclude the synthetic 'Root' and dedupe consecutive duplicates
        .filter((name, idx, arr) =>
          name !== 'Root' && (idx === 0 || name !== arr[idx - 1])
        );
      return `${names.join(' > ')}\n${format(d.value)}`;
    });

    // removed since WE’ve moved the centre‐click logic onto the main <g> container
    // const parent = svg.append("circle")
    //   .datum(root)
    //   .attr("r", ringWidth)
    //   .attr("fill", "none")
    //   .attr("pointer-events", "none")
    //   .on("click", clicked);

    let label: any;
    if (showLabels) {
      label = svg.append("g")
        .attr("pointer-events", "none")
        .attr("text-anchor", "middle")
        .style("user-select", "none")
        .selectAll("text")
        .data(visibleNodes, (d: any) => `${d.data.id}-${d.depth}`)
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
    <div className="flex flex-col items-center">
      {pivotId && (
        <button
          className="mb-2 px-4 py-1 bg-gray-200 rounded hover:bg-gray-300"
          onClick={() => setPivotId(null)}
        >
          Reset
        </button>
      )}
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid meet"
      />
    </div>
  );
};

export default SunburstChart;
