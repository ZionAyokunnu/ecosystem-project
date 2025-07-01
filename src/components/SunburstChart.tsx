
import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { Indicator, Relationship, SunburstNode } from '@/types';
import { transformToSunburstData } from '@/utils/indicatorUtils';

export interface SunburstChartProps {
  indicators: Indicator[];
  relationships: Relationship[];
  onSelect?: (indicatorId: string) => void;
  onVisibleNodesChange?: (nodes: SunburstNode[]) => void;
  selectedId?: string;
}

const SunburstChart: React.FC<SunburstChartProps> = ({
  indicators,
  relationships,
  onSelect,
  onVisibleNodesChange,
  selectedId
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [visibleNodes, setVisibleNodes] = useState<SunburstNode[]>([]);

  const sunburstData = useMemo(() => {
    if (indicators.length > 0 && relationships.length > 0) {
      return transformToSunburstData(indicators, relationships);
    }
    return { nodes: [], links: [] };
  }, [indicators, relationships]);

  useEffect(() => {
    if (!svgRef.current || !sunburstData.nodes.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 600;
    const height = 600;
    const radius = Math.min(width, height) / 2;

    svg.attr("width", width).attr("height", height);

    const g = svg.append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);

    // Convert nodes to hierarchy data
    const root = d3.hierarchy({ 
      id: 'root', 
      name: 'Root', 
      value: 1,
      children: sunburstData.nodes.map(node => ({
        id: node.id,
        name: node.name || 'Unknown',
        value: node.value || 1
      }))
    } as any)
      .sum(d => d.value || 1)
      .sort((a, b) => (b.value || 0) - (a.value || 0));

    const partition = d3.partition<any>()
      .size([2 * Math.PI, radius]);

    partition(root);

    const arc = d3.arc<any>()
      .startAngle(d => d.x0)
      .endAngle(d => d.x1)
      .innerRadius(d => d.y0)
      .outerRadius(d => d.y1);

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const paths = g.selectAll("path")
      .data(root.descendants().filter(d => d.depth))
      .enter().append("path")
      .attr("d", arc)
      .style("fill", d => color(d.data.id))
      .style("stroke", d => d.data.id === selectedId ? "#000" : "#fff")
      .style("stroke-width", d => d.data.id === selectedId ? 3 : 1)
      .style("cursor", "pointer")
      .on("click", function(event, d) {
        if (onSelect && d.data.id !== 'root') {
          onSelect(d.data.id);
        }
      });

    // Add labels
    g.selectAll("text")
      .data(root.descendants().filter(d => d.depth && (d.y1 - d.y0) > 20))
      .enter().append("text")
      .attr("transform", d => {
        const angle = (d.x0 + d.x1) / 2 - Math.PI / 2;
        const radius = (d.y0 + d.y1) / 2;
        return `rotate(${angle * 180 / Math.PI - 90}) translate(${radius},0) rotate(${angle > Math.PI / 2 ? 180 : 0})`;
      })
      .attr("dy", "0.35em")
      .style("text-anchor", d => (d.x0 + d.x1) / 2 > Math.PI ? "end" : "start")
      .style("font-size", "12px")
      .style("fill", "white")
      .text(d => d.data.name.length > 15 ? d.data.name.substring(0, 12) + "..." : d.data.name);

    // Update visible nodes
    const currentVisibleNodes: SunburstNode[] = root.descendants()
      .filter(d => d.depth > 0)
      .map(d => ({
        id: d.data.id,
        name: d.data.name,
        value: d.value || 0,
        depth: d.depth
      }));

    setVisibleNodes(currentVisibleNodes);
    if (onVisibleNodesChange) {
      onVisibleNodesChange(currentVisibleNodes);
    }

  }, [sunburstData, selectedId, onSelect, onVisibleNodesChange]);

  return (
    <div className="flex justify-center">
      <svg ref={svgRef} className="max-w-full h-auto"></svg>
    </div>
  );
};

export default SunburstChart;
