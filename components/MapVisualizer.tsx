import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface MapVisualizerProps {
  status: string;
  isDriver?: boolean;
}

const MapVisualizer: React.FC<MapVisualizerProps> = ({ status, isDriver }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    // Clear previous
    svg.selectAll("*").remove();

    // Create a group for map elements
    const mapGroup = svg.append("g");

    // Generate random "streets" (lines)
    const numStreets = 20;
    const streetData = Array.from({ length: numStreets }).map(() => ({
      x1: Math.random() * width,
      y1: Math.random() * height,
      x2: Math.random() * width,
      y2: Math.random() * height,
    }));

    // Draw background streets
    mapGroup.selectAll("line")
      .data(streetData)
      .enter()
      .append("line")
      .attr("x1", (d) => d.x1)
      .attr("y1", (d) => d.y1)
      .attr("x2", (d) => d.x2)
      .attr("y2", (d) => d.y2)
      .attr("stroke", "#e2e8f0")
      .attr("stroke-width", 2);

    // Add some "parks" (polygons)
    mapGroup.append("circle")
        .attr("cx", width * 0.2)
        .attr("cy", height * 0.3)
        .attr("r", 50)
        .attr("fill", "#dcfce7")
        .attr("opacity", 0.5);

     mapGroup.append("rect")
        .attr("x", width * 0.6)
        .attr("y", height * 0.6)
        .attr("width", 100)
        .attr("height", 80)
        .attr("fill", "#e0e7ff")
        .attr("opacity", 0.5);


    // If a ride is active, draw a route path
    if (status !== 'IDLE' && status !== 'SEARCHING') {
      const routePath = d3.path();
      const startX = width / 2;
      const startY = height / 2;
      const endX = isDriver ? width * 0.8 : width * 0.2;
      const endY = isDriver ? height * 0.2 : height * 0.8;

      routePath.moveTo(startX, startY);
      // Bezier curve for organic route feel
      routePath.bezierCurveTo(startX + 50, startY - 50, endX - 50, endY + 50, endX, endY);

      const path = mapGroup.append("path")
        .attr("d", routePath.toString())
        .attr("fill", "none")
        .attr("stroke", "#f97316")
        .attr("stroke-width", 4)
        .attr("stroke-linecap", "round")
        .attr("stroke-dasharray", "1000")
        .attr("stroke-dashoffset", "1000");
      
      // Animate the path drawing
      path.transition()
        .duration(2000)
        .ease(d3.easeCubicOut)
        .attr("stroke-dashoffset", "0");

      // Origin Marker
      mapGroup.append("circle")
        .attr("cx", startX)
        .attr("cy", startY)
        .attr("r", 6)
        .attr("fill", "#3b82f6");

      // Destination Marker
      mapGroup.append("circle")
        .attr("cx", endX)
        .attr("cy", endY)
        .attr("r", 6)
        .attr("fill", "#ef4444");
        
      // Car Icon (Moving)
      if (status === 'IN_PROGRESS' || status === 'ACCEPTED') {
         mapGroup.append("circle")
          .attr("r", 8)
          .attr("fill", "#000")
          .transition()
          .duration(5000)
          .attrTween("transform", function() {
              const node = path.node();
              if(!node) return () => "";
              const len = (node as SVGPathElement).getTotalLength();
              return function(t) {
                const p = (node as SVGPathElement).getPointAtLength(t * len);
                return `translate(${p.x},${p.y})`;
              };
          });
      }
    }

  }, [status, isDriver]);

  return (
    <div className="absolute inset-0 z-0 bg-slate-50 overflow-hidden">
        <svg ref={svgRef} className="w-full h-full" />
        <div className="absolute bottom-4 right-4 bg-white/80 p-1 text-xs text-gray-400 rounded">
            Mapa Visualização (Simulado)
        </div>
    </div>
  );
};

export default MapVisualizer;