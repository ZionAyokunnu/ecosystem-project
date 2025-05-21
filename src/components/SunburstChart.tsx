
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { SunburstNode, SunburstLink } from '@/types';

interface SunburstChartProps {
  nodes: SunburstNode[];
  links: SunburstLink[];
  width?: number;
  height?: number;
  onSelect?: (indicatorId: string) => void;
}

const SunburstChart: React.FC<SunburstChartProps> = ({
  nodes,
  links,
  width = 600,
  height = 600,
  onSelect
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  
  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return;
    
    // Clear previous chart
    d3.select(svgRef.current).selectAll("*").remove();
    
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
          parent.children.push(child);
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
    
    // Create hierarchy
    const root = d3.hierarchy({
      id: 'root',
      name: 'Root',
      children: rootNodes
    });
    
    // Calculate node values for sizing
    root.sum((d: any) => d.value);
    
    const radius = Math.min(width, height) / 2;
    
    // Create partition layout
    const partition = d3.partition()
      .size([2 * Math.PI, radius]);
    
    // Compute the partition layout
    partition(root);
    
    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);
    
    // Define arc generator
    const arc = d3.arc<any>()
      .startAngle(d => d.x0)
      .endAngle(d => d.x1)
      .innerRadius(d => d.y0)
      .outerRadius(d => d.y1);
    
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
    
    // Draw arcs
    svg.selectAll("path")
      .data(root.descendants().slice(1)) // Skip the synthetic root
      .enter()
      .append("path")
      .attr("d", arc as any)
      .style("fill", (d: any) => d.data.color || "#ccc")
      .style("stroke", "white")
      .style("stroke-width", 1)
      .style("opacity", 0.9)
      .on("mouseover", function(event, d: any) {
        d3.select(this).style("opacity", 1);
        tooltip
          .style("visibility", "visible")
          .html(`
            <div class="font-medium">${d.data.name}</div>
            <div>Value: ${d.data.value.toFixed(1)}</div>
            ${d.data.category ? `<div>Category: ${d.data.category}</div>` : ''}
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
      })
      .on("click", function(event, d: any) {
        if (onSelect && d.data.id) {
          onSelect(d.data.id);
        }
      });
    
    // Add labels for larger segments
    svg.selectAll("text")
      .data(root.descendants().slice(1).filter((d: any) => (d.x1 - d.x0) > 0.15)) // Only add labels to segments that are large enough
      .enter()
      .append("text")
      .attr("transform", function(d: any) {
        const x = (d.x0 + d.x1) / 2;
        const y = (d.y0 + d.y1) / 2;
        const angle = x - Math.PI / 2;
        const radius = y;
        return `rotate(${(angle * 180) / Math.PI}) translate(${radius},0) rotate(${angle >= Math.PI ? 180 : 0})`;
      })
      .style("text-anchor", "middle")
      .style("font-size", "10px")
      .style("fill", "#fff")
      .style("pointer-events", "none")
      .text((d: any) => d.data.name);
    
    return () => {
      tooltip.remove();
    };
  }, [nodes, links, width, height, onSelect]);
  
  return (
    <div className="flex justify-center items-center">
      <svg ref={svgRef} width={width} height={height} />
    </div>
  );
};

export default SunburstChart;
