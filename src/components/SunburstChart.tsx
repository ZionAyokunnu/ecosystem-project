
import React, { useMemo, useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { Indicator, Relationship, SunburstNode } from '@/types';
import { buildIndicatorTree } from '@/utils/indicatorUtils';

interface SunburstChartProps {
  indicators: Indicator[];
  relationships: Relationship[];
  onNodeClick?: (node: SunburstNode) => void;
  onSelect?: (indicatorId: string) => void;
  selectedId?: string;
  centerNodeId?: string;
  fixedNodes?: string[];
  width?: number;
  height?: number;
}

const SunburstChart: React.FC<SunburstChartProps> = ({
  indicators,
  relationships,
  onNodeClick,
  onSelect,
  selectedId,
  centerNodeId,
  fixedNodes = [],
  width = 800,
  height = 600,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  const sunburstData = useMemo(() => {
    if (!indicators.length) return null;
    return buildIndicatorTree(indicators, relationships, centerNodeId);
  }, [indicators, relationships, centerNodeId]);

  useEffect(() => {
    if (!sunburstData || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const radius = Math.min(width, height) / 2;
    const g = svg
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);

    const partition = d3.partition<SunburstNode>()
      .size([2 * Math.PI, radius]);

    const root = d3.hierarchy(sunburstData)
      .sum(d => d.value || 1)
      .sort((a, b) => (b.value || 0) - (a.value || 0));

    partition(root);

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const arc = d3.arc<d3.HierarchyRectangularNode<SunburstNode>>()
      .startAngle(d => d.x0)
      .endAngle(d => d.x1)
      .innerRadius(d => d.y0)
      .outerRadius(d => d.y1);

    const nodes = g.selectAll("path")
      .data(root.descendants().filter(d => d.depth > 0))
      .enter()
      .append("path")
      .attr("d", arc)
      .style("fill", d => color(d.data.category || 'default'))
      .style("stroke", d => {
        // Apply selected style if this node is selected
        return d.data.indicator_id === selectedId ? "#fbbf24" : "#fff";
      })
      .style("stroke-width", d => {
        return d.data.indicator_id === selectedId ? "4px" : "2px";
      })
      .style("filter", d => {
        return d.data.indicator_id === selectedId ? "drop-shadow(0 0 8px rgba(251, 191, 36, 0.6))" : "none";
      })
      .style("cursor", "pointer")
      .on("click", function(event, d) {
        event.stopPropagation();
        
        // Handle selection
        if (onSelect) {
          onSelect(d.data.indicator_id);
        }
        
        // Handle node click (pivot functionality)
        if (onNodeClick) {
          onNodeClick(d.data);
        }
        
        // Update visual selection
        g.selectAll("path")
          .style("stroke", node => node.data.indicator_id === d.data.indicator_id ? "#fbbf24" : "#fff")
          .style("stroke-width", node => node.data.indicator_id === d.data.indicator_id ? "4px" : "2px")
          .style("filter", node => node.data.indicator_id === d.data.indicator_id ? "drop-shadow(0 0 8px rgba(251, 191, 36, 0.6))" : "none");
      })
      .on("mouseover", function(event, d) {
        d3.select(this)
          .style("opacity", 0.8)
          .style("stroke-width", d.data.indicator_id === selectedId ? "4px" : "3px");
      })
      .on("mouseout", function(event, d) {
        d3.select(this)
          .style("opacity", 1)
          .style("stroke-width", d.data.indicator_id === selectedId ? "4px" : "2px");
      });

    // Add text labels
    g.selectAll("text")
      .data(root.descendants().filter(d => d.depth > 0 && d.x1 - d.x0 > 0.1))
      .enter()
      .append("text")
      .attr("transform", d => {
        const angle = (d.x0 + d.x1) / 2;
        const radius = (d.y0 + d.y1) / 2;
        return `rotate(${angle * 180 / Math.PI - 90}) translate(${radius}) rotate(${angle > Math.PI ? 180 : 0})`;
      })
      .attr("dy", "0.35em")
      .attr("text-anchor", d => (d.x0 + d.x1) / 2 > Math.PI ? "end" : "start")
      .style("font-size", "12px")
      .style("fill", "#333")
      .style("pointer-events", "none")
      .text(d => {
        const name = d.data.name;
        const maxLength = Math.floor((d.x1 - d.x0) * 50);
        return name.length > maxLength ? name.substring(0, maxLength) + "..." : name;
      });

    // Add center circle
    const centerCircle = g.append("circle")
      .attr("r", 40)
      .style("fill", "#f8f9fa")
      .style("stroke", "#dee2e6")
      .style("stroke-width", "2px")
      .style("cursor", "pointer");

    // Add center text
    const centerText = g.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .style("fill", "#495057")
      .style("pointer-events", "none")
      .text(sunburstData.name.length > 10 ? sunburstData.name.substring(0, 10) + "..." : sunburstData.name);

  }, [sunburstData, width, height, selectedId, onNodeClick, onSelect]);

  if (!sunburstData) {
    return (
      <div className="flex items-center justify-center h-96">
        <p>No data available for visualization</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="w-full h-auto"
        role="img"
        aria-label="Sunburst chart showing indicator relationships"
      />
    </div>
  );
};

export default SunburstChart;
