
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEcosystem } from '@/context/EcosystemContext';
import * as d3 from 'd3';

const TreeMapPage: React.FC = () => {
  const navigate = useNavigate();
  const { indicators, relationships, loading } = useEcosystem();
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  useEffect(() => {
    if (!svgRef.current || loading || indicators.length === 0) return;

    // Clear previous chart
    d3.select(svgRef.current).selectAll("*").remove();

    const width = 1200;
    const height = 800;

    const svg = d3.select(svgRef.current)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("width", "100%")
      .attr("height", "100%");

    const container = svg.append("g");

    // Build hierarchy data
    const nodeMap = new Map();
    indicators.forEach(indicator => {
      nodeMap.set(indicator.indicator_id, {
        id: indicator.indicator_id,
        name: indicator.name,
        value: indicator.current_value,
        category: indicator.category,
        children: []
      });
    });

    // Build parent-child relationships
    relationships.forEach(rel => {
      const parent = nodeMap.get(rel.parent_id);
      const child = nodeMap.get(rel.child_id);
      if (parent && child && parent !== child) {
        parent.children.push(child);
      }
    });

    // Find root nodes (nodes with no parents)
    const childIds = new Set(relationships.map(r => r.child_id));
    const rootNodes = Array.from(nodeMap.values()).filter(node => 
      !childIds.has(node.id)
    );

    if (rootNodes.length === 0) return;

    const root = d3.hierarchy({
      id: 'root',
      name: 'Ecosystem',
      children: rootNodes
    })
    .sum(d => d.value || 1)
    .sort((a, b) => (b.value || 0) - (a.value || 0));

    const treemapLayout = d3.treemap()
      .size([width, height])
      .padding(2)
      .round(true);

    treemapLayout(root);

    const color = d3.scaleOrdinal()
      .domain(indicators.map(d => d.category))
      .range(d3.schemeSet3);

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

    const cell = container.selectAll("g")
      .data(root.leaves())
      .enter().append("g")
      .attr("transform", d => `translate(${d.x0},${d.y0})`);

    cell.append("rect")
      .attr("width", d => d.x1 - d.x0)
      .attr("height", d => d.y1 - d.y0)
      .attr("fill", d => color(d.data.category))
      .attr("stroke", "white")
      .attr("stroke-width", 2)
      .style("cursor", "pointer")
      .style("opacity", 0.8)
      .on("mouseover", function(event, d) {
        d3.select(this).style("opacity", 1);
        tooltip
          .style("visibility", "visible")
          .html(`
            <div class="font-semibold">${d.data.name}</div>
            <div>Category: ${d.data.category}</div>
            <div>Value: ${d.data.value.toFixed(1)}</div>
            <div>Children: ${d.data.children?.length || 0}</div>
          `);
      })
      .on("mousemove", function(event) {
        tooltip
          .style("top", (event.pageY - 10) + "px")
          .style("left", (event.pageX + 10) + "px");
      })
      .on("mouseout", function() {
        d3.select(this).style("opacity", 0.8);
        tooltip.style("visibility", "hidden");
      })
      .on("click", function(event, d) {
        setSelectedNode(d.data.id);
        navigate(`/detail/${d.data.id}`);
      });

    cell.append("text")
      .attr("x", 4)
      .attr("y", 14)
      .attr("font-size", d => Math.min(12, (d.x1 - d.x0) / 8, (d.y1 - d.y0) / 4))
      .attr("fill", "black")
      .attr("font-weight", "bold")
      .style("pointer-events", "none")
      .text(d => {
        const width = d.x1 - d.x0;
        const maxChars = Math.floor(width / 6);
        return d.data.name.length > maxChars 
          ? d.data.name.slice(0, maxChars) + '...'
          : d.data.name;
      });

    cell.append("text")
      .attr("x", 4)
      .attr("y", 28)
      .attr("font-size", d => Math.min(10, (d.x1 - d.x0) / 10, (d.y1 - d.y0) / 6))
      .attr("fill", "gray")
      .style("pointer-events", "none")
      .text(d => d.data.value.toFixed(1));

    return () => {
      tooltip.remove();
    };
  }, [indicators, relationships, loading, navigate]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={() => navigate('/')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Overview
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">Indicator Tree Map</h1>
          <p className="text-gray-600 mt-1">
            Hierarchical view of all indicators sized by their current values
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm">
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm">
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ecosystem Tree Map</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full overflow-hidden rounded-lg border">
            <svg
              ref={svgRef}
              className="w-full h-auto"
              style={{ minHeight: '600px' }}
            />
          </div>
          <div className="mt-4 text-sm text-gray-600">
            <p>Each rectangle represents an indicator, sized by its current value. Click any rectangle to view detailed information.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TreeMapPage;