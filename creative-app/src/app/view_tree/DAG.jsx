"use client";

import { useRef, useEffect, useState, useContext } from "react";
import * as d3 from "d3";
import { TakenCoursesContext, WantedCoursesContext } from "../page";
import {
  graphStratify,
  sugiyama,
  layeringLongestPath,
  decrossTwoLayer,
  coordGreedy
} from "d3-dag";


export default function DagView({ dagData, rootNodeId = null }) {
  // get these global sets for coloring nodes
  const takenCourses = useContext(TakenCoursesContext);
  const wantedCourses = useContext(WantedCoursesContext);

  const svgRef = useRef(null);
  const zoomRef = useRef(null);
  const initialTransformRef = useRef(d3.zoomIdentity);
  const [containerWidth, setContainerWidth] = useState(800); // default width
  const height = 400; // fixed height

  // resize observer to track container width
  useEffect(() => {
    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });

    if (svgRef.current) resizeObserver.observe(svgRef.current);

    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (!dagData || dagData.length === 0) return;

    const dag = graphStratify()(dagData);

    const layout = sugiyama()
      .layering(layeringLongestPath())
      .decross(decrossTwoLayer()) // non-optimal (but still good) decrossing so 131 postreqs don't crash it
      .coord(coordGreedy())
      .nodeSize([100, 60]);
    layout(dag);

    const nodes = [...dag.nodes()];
    const links = [...dag.links()];

    // compute bounds
    const xs = nodes.map(n => n.x);
    const ys = nodes.map(n => n.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    const padding = 60;
    const graphWidth = maxX - minX || 1;
    const graphHeight = maxY - minY || 1;
    const fitScale = Math.min(
      (containerWidth - 2 * padding) / graphWidth,
      (height - 2 * padding) / graphHeight
    );
    const initialScale = Math.max(0.65, Math.min(1, fitScale));
    const offsetX = containerWidth / 2 - ((minX + maxX) / 2) * initialScale;
    const offsetY = height / 2 - ((minY + maxY) / 2) * initialScale;
    const nodeWidth = 70;
    const nodeHeight = 34;
    const labelFontSize = 10;

    //for light/dark mode
    const textColor = getComputedStyle(document.body).getPropertyValue("--text").trim();
    const borderColor = getComputedStyle(document.body).getPropertyValue("--border").trim();

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const g = svg.append("g");

    const zoom = d3.zoom()
      .scaleExtent([0.35, 4])
      .on("zoom", event => g.attr("transform", event.transform));
    zoomRef.current = zoom;
    initialTransformRef.current = d3.zoomIdentity.translate(offsetX, offsetY).scale(initialScale);
    svg.call(zoom);
    svg.call(zoom.transform, initialTransformRef.current);

    // draw lines
    g.append("g")
      .selectAll("path")
      .data(links)
      .enter()
      .append("path")
      .attr("stroke", borderColor)
      .attr("stroke-width", 1.5)
      .attr("fill", "none")
      .attr("d", l => `M${l.source.x},${l.source.y}L${l.target.x},${l.target.y}`);

    // draw nodes
    g.append("g")
      .selectAll("rect")
      .data(nodes)
      .enter()
      .append("rect")
      // center
      .attr("x", d => d.x - nodeWidth / 2)
      .attr("y", d => d.y - nodeHeight / 2)
      .attr("width", nodeWidth)
      .attr("height", nodeHeight)
      // rounded corners
      .attr("rx", nodeHeight / 2)
      .attr("ry", nodeHeight / 2)
      .attr("fill", d => {
        const isTaken = takenCourses.has(d.data.id);
        const isWanted = wantedCourses.has(d.data.id);
        if (isTaken) return "green";
        if (isWanted) return "orange";
        return "steelblue";
      })
      .attr("stroke", d => {
        const isRoot = d.data.id === rootNodeId;
        return isRoot ? "hotpink" : borderColor;
      })
      .attr("stroke-width", d => {
        const isRoot = d.data.id === rootNodeId;
        return isRoot ? 3 : 1;
      });

    // draw labels
    g.append("g")
      .selectAll("text")
      .data(nodes)
      .enter()
      .append("text")
      // set location to center of node
      .attr("x", d => d.x)
      .attr("y", d => d.y)
      .text(d => d.data.id)
      .style("font-size", `${labelFontSize}px`)
      .style("fill", textColor)
      // center text
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle");


  }, [dagData, containerWidth, rootNodeId, takenCourses, wantedCourses]);

  const zoomBy = (factor) => {
    if (!zoomRef.current || !svgRef.current) return;
    d3.select(svgRef.current).transition().duration(180).call(zoomRef.current.scaleBy, factor);
  };

  const resetZoom = () => {
    if (!zoomRef.current || !svgRef.current) return;
    d3.select(svgRef.current)
      .transition()
      .duration(180)
      .call(zoomRef.current.transform, initialTransformRef.current);
  };

  return (
    <div style={{ position: "relative" }}>
      <div style={{ position: "absolute", top: 8, right: 8, zIndex: 1, display: "flex", gap: 4 }}>
        <button type="button" onClick={() => zoomBy(1.4)} aria-label="Zoom in" title="Zoom in">+</button>
        <button type="button" onClick={() => zoomBy(0.7)} aria-label="Zoom out" title="Zoom out">-</button>
        <button type="button" onClick={resetZoom} aria-label="Reset graph view" title="Reset graph view">Reset</button>
      </div>
      <svg
        ref={svgRef}
        width="100%"
        height={height}
        style={{ border: "1px solid var(--border)", display: "block", touchAction: "none" }}
      />
    </div>
  );
}

// TODO make this look better in browser
export function DagViewAllCourses({ dagData }) {
  return <DagView dagData={dagData} />;
}