import React, { useEffect, useRef, useState } from 'react';
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
  maxDrillDepth?: number;
  onBreadcrumbsChange?: (items: Array<{ id: string; name: string }>) => void;
  onVisibleNodesChange?: (visible: SunburstNode[]) => void;
  onCoreChange?: (id: string | null) => void;
}

const SunburstChart: React.FC<SunburstChartProps> = ({
  nodes,
  links,
  width = 600,
  height = 600,
  onSelect, 
  maxLayers = 4,
  maxDrillDepth = 4,
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

  /**
   * We only want to reset the pivot when the *topology* of the graph changes,
   * not every time a new `nodes` / `links` array instance is passed in.
   * Compute a simple string hash of all node & link IDs and compare it with
   * the previous render.
   */
  const hashTopology = (ns: SunburstNode[], ls: SunburstLink[]) =>
    ns.map(n => n.id).join('|') +
    '//' +
    ls.map(l => `${l.parent_id}->${l.child_id}`).join('|');

  const prevTopology = useRef<string>('');

  useEffect(() => {
    const hash = hashTopology(nodes, links);
    if (hash !== prevTopology.current) {
      // the structure truly changed → reset the zoom/pivot
      setPivotId(null);
      setPivotStack([]);
      onCoreChange?.(null);
      prevTopology.current = hash;
    }
  }, [nodes, links]);
  
  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return;
    console.clear();
    
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
    links.forEach(link => {
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
    links.forEach(link => {
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
            weight: link.influence_weight,
            correlation: link.correlation_score ?? 0.1  // Default to 0.1 if not provided
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
    const hierarchyData = pivotId !== null && pivotId !== 'root'
      ? nodeMap.get(pivotId)!
      : { id: 'root', name: 'Root', children: rootNodes };
    
    console.log('PivotId:', pivotId);
    console.log('Hierarchy Data:', hierarchyData);

    // Create hierarchy
    const root = d3.hierarchy(hierarchyData as any)
    
    // Calculate node values for sizing
    root.sum((d: any) => d.value);
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
      .outerRadius(d => d.y1 * ringWidth);
    
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
          // Stop drilling if we've reached the user-defined ceiling
        if (pivotStack.length >= maxDrillDepth) return;
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
          // Drill in for parent nodes
          setPivotStack(prev => [...prev, d.data.id]);   // push this level
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

    const parent = svg.append("circle")
      .datum(root)
      .attr("r", ringWidth)
      .attr("fill", "none")
      .attr("pointer-events", "all")
      .on("click", clicked);

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
      // centre‑circle click ➜ pop one level off the stack
      if (pivotStack.length === 0) {
        return;                       // already at global root
      }
      const newStack = [...pivotStack];
      newStack.pop();                 // step out one level
      const newPivot = newStack.length > 0 ? newStack[newStack.length - 1] : null;

      setPivotStack(newStack);
      setPivotId(newPivot);
      onCoreChange?.(newPivot);

      // rebind centre datum for next click
      parent.datum(newPivot ? nodeMap.get(newPivot) : root);

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
