
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
}

const SunburstChart: React.FC<SunburstChartProps> = ({
  nodes,
  links,
  width = 600,
  height = 600,
  onSelect,
  maxLayers = 3,
  showLabels = false
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [pivotId, setPivotId] = useState<string | null>(null);
  
  
  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return;
    
    // Clear previous chart
    d3.select(svgRef.current).selectAll("*").remove();
    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
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
    
    // Build connections
    links.forEach(link => {
      const parent = nodeMap.get(link.parent_id);
      const child = nodeMap.get(link.child_id);
      
      if (parent && child) {
        // Add to children array if not already present
        if (!parent.children.some((c: any) => c.id === child.id)) {
          // Store the relationship info in the child for later reference
          const childWithRelationship = {
            ...child,
            weight: link.weight,
            correlation: link.correlation || 0.1 // Default to 0.1 if not provided
          };
          parent.children.push(childWithRelationship);
        }
        
        // Track parent relationships for multi-parent handling
        child.parents.add(link.parent_id);
      }
    });
    
    // Find root nodes (nodes with no parents)
    const rootNodes = Array.from(nodeMap.values()).filter(node => node.parents.size === 0);
    
    if (rootNodes.length === 0) {
      console.error("No root nodes found in the data");
      return;
    }
    
    // Determine root data: pivoted or full forest
    const hierarchyData = pivotId
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
    
    // Filter to nodes in the desired depth range, then dedupe by id@depth
    const allNodes = root.descendants().filter((d: any) => d.depth > 0 && d.depth <= layers);
    const visibleNodes = allNodes.filter((d, i, arr) =>
      arr.findIndex(
        x => x.data.id === d.data.id && x.depth === d.depth
      ) === i
    );
    console.log('Visible Nodes:', visibleNodes.map(d => ({ id: d.data.id, depth: d.depth })));

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
      .style("stroke-width", 1)
      .style("opacity", 0.9)
      .style("cursor", (d: any) => (d.children?.length ? "pointer" : "default"))
      .attr("pointer-events", "all")
      .on("click", function(event: any, d: any) {
        if (d.children?.length) {
          onSelect?.(d.data.id);
          setPivotId(d.data.id);
        }
      })
      .on("mouseover", function(event, d: any) {
        d3.select(this).style("opacity", 1);
        
        // Get the relationship data if it exists
        const weight = d.data.weight !== undefined ? d.data.weight : 'N/A';
        const correlation = d.data.correlation !== undefined 
          ? (d.data.correlation * 100).toFixed(1) + '%' 
          : 'N/A';
        
        tooltip
          .style("visibility", "visible")
          .html(`
            <div class="font-medium">${d.data.name}</div>
            <div>Value: ${d.data.value.toFixed(1)}</div>
            ${d.data.category ? `<div>Category: ${d.data.category}</div>` : ''}
            ${weight !== 'N/A' ? `<div>Influence: ${weight}</div>` : ''}
            ${correlation !== 'N/A' ? `<div>Correlation: ${correlation}</div>` : ''}
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
    }

    function clicked(event, p) {
      console.log('Clicked node:', p.data.id, 'depth:', p.depth);
      parent.datum(p.parent || root);
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
  }, [nodes, links, width, height, onSelect,  maxLayers, pivotId, showLabels]);
  
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
      <svg ref={svgRef} width={width} height={height} />
    </div>
  );
};

export default SunburstChart;
