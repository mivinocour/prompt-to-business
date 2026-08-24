"use client";

import {
  Zap,
} from "lucide-react";
import { getAgentIcon } from "@/components/agent-icon";
import type { Agent, WorkflowStep, WorkflowNodeType } from "@/types/agent";

// ── Color scheme per node type ──

const NODE_COLORS: Record<WorkflowNodeType, string> = {
  trigger: "#f59e0b",    // amber
  agent: "#3b82f6",      // blue
  sub_agent: "#6366f1",  // indigo
  tool: "#22c55e",       // green
  condition: "#f97316",  // orange
  output: "#8b5cf6",     // purple
};

const NODE_TYPE_LABELS: Record<WorkflowNodeType, string> = {
  trigger: "TRIGGER",
  agent: "AGENT",
  sub_agent: "SUB-AGENT",
  tool: "TOOL",
  condition: "CONDITION",
  output: "OUTPUT",
};

// ── Layout engine ──

interface LayoutNode {
  step: WorkflowStep;
  x: number;
  y: number;
  width: number;
  height: number;
}

function layoutWorkflow(steps: WorkflowStep[], svgWidth: number): { nodes: LayoutNode[]; totalHeight: number } {
  if (steps.length === 0) return { nodes: [], totalHeight: 0 };

  const nodeWidth = Math.min(svgWidth - 16, 260);
  const nodeGapY = 16;
  const startX = (svgWidth - nodeWidth) / 2;

  // Build adjacency to find root nodes and levels
  const inDegree = new Map<string, number>();
  const stepMap = new Map<string, WorkflowStep>();
  for (const s of steps) {
    stepMap.set(s.id, s);
    if (!inDegree.has(s.id)) inDegree.set(s.id, 0);
    for (const target of s.connectsTo) {
      inDegree.set(target, (inDegree.get(target) || 0) + 1);
    }
  }

  // Topological sort (BFS) for ordering
  const queue: string[] = [];
  inDegree.forEach((deg, id) => {
    if (deg === 0) queue.push(id);
  });

  const ordered: WorkflowStep[] = [];
  const visited = new Set<string>();
  while (queue.length > 0) {
    const id = queue.shift()!;
    if (visited.has(id)) continue;
    visited.add(id);
    const step = stepMap.get(id);
    if (step) {
      ordered.push(step);
      for (const next of step.connectsTo) {
        const newDeg = (inDegree.get(next) || 1) - 1;
        inDegree.set(next, newDeg);
        if (newDeg <= 0 && !visited.has(next)) queue.push(next);
      }
    }
  }

  // Add any remaining steps not in the DAG (disconnected)
  for (const s of steps) {
    if (!visited.has(s.id)) ordered.push(s);
  }

  // Check for parallel branches (multiple nodes sharing an input)
  // For now, keep it linear vertical — lay out each node top to bottom
  const nodes: LayoutNode[] = [];
  let currentY = 8;

  for (const step of ordered) {
    const hasDetails = (step.tools && step.tools.length > 0) || (step.sources && step.sources.length > 0);
    const descriptionLines = step.description ? Math.ceil(step.description.length / 36) : 0;
    const nodeHeight = 32 + // header
      (descriptionLines > 0 ? Math.max(descriptionLines * 14, 14) + 8 : 0) + // description
      (hasDetails ? 20 : 0) + // detail pills
      8; // padding

    nodes.push({
      step,
      x: startX,
      y: currentY,
      width: nodeWidth,
      height: nodeHeight,
    });

    currentY += nodeHeight + nodeGapY;
  }

  return { nodes, totalHeight: currentY };
}

// ── Workflow Node ──

function WorkflowNode({ node }: { node: LayoutNode }) {
  const { step, x, y, width, height } = node;
  const color = NODE_COLORS[step.type] || "#6b7280";
  const Icon = getAgentIcon(step.icon);
  const typeLabel = NODE_TYPE_LABELS[step.type] || "STEP";

  const hasDetails = (step.tools && step.tools.length > 0) || (step.sources && step.sources.length > 0);

  return (
    <foreignObject x={x} y={y} width={width} height={height}>
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "var(--color-v3-surface-container, hsl(var(--card)))",
          border: `1.5px solid ${color}40`,
          borderLeft: `3px solid ${color}`,
          borderRadius: 8,
          fontFamily: "var(--font-inter), system-ui, sans-serif",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 10px",
          }}
        >
          <div
            style={{
              width: 22,
              height: 22,
              borderRadius: 6,
              backgroundColor: `${color}18`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Icon
              style={{
                width: 12,
                height: 12,
                color: color,
              }}
            />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--color-v3-text, hsl(var(--foreground)))",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {step.label}
              </span>
              <span
                style={{
                  fontSize: 8,
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  padding: "1px 5px",
                  borderRadius: 3,
                  backgroundColor: `${color}18`,
                  color: color,
                  whiteSpace: "nowrap",
                  textTransform: "uppercase",
                }}
              >
                {typeLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        {step.description && (
          <div
            style={{
              padding: "0 10px 4px 40px",
              fontSize: 10,
              lineHeight: "14px",
              color: "var(--color-v3-text-var, hsl(var(--muted-foreground)))",
            }}
          >
            {step.description}
          </div>
        )}

        {/* Detail pills: tools and sources */}
        {hasDetails && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 4,
              padding: "2px 10px 6px 40px",
            }}
          >
            {step.tools?.map((tool, i) => (
              <span
                key={`t-${i}`}
                style={{
                  fontSize: 9,
                  padding: "1px 6px",
                  borderRadius: 4,
                  backgroundColor: `${NODE_COLORS.tool}15`,
                  color: NODE_COLORS.tool,
                  fontWeight: 500,
                  whiteSpace: "nowrap",
                }}
              >
                {tool}
              </span>
            ))}
            {step.sources?.map((src, i) => (
              <span
                key={`s-${i}`}
                style={{
                  fontSize: 9,
                  padding: "1px 6px",
                  borderRadius: 4,
                  backgroundColor: "var(--color-v3-surface-container-high, hsl(var(--accent)))",
                  color: "var(--color-v3-text-var, hsl(var(--muted-foreground)))",
                  fontWeight: 400,
                  whiteSpace: "nowrap",
                }}
              >
                {src}
              </span>
            ))}
          </div>
        )}
      </div>
    </foreignObject>
  );
}

// ── Connection Arrow ──

function WorkflowEdge({
  fromNode,
  toNode,
  color,
}: {
  fromNode: LayoutNode;
  toNode: LayoutNode;
  color: string;
}) {
  const x1 = fromNode.x + fromNode.width / 2;
  const y1 = fromNode.y + fromNode.height;
  const x2 = toNode.x + toNode.width / 2;
  const y2 = toNode.y;

  // Vertical bezier
  const midY = (y1 + y2) / 2;
  const d = `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`;

  // Arrowhead position
  const arrowY = y2 - 1;

  return (
    <g>
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        opacity={0.35}
      />
      {/* Small arrow dot at target */}
      <circle cx={x2} cy={arrowY} r={2.5} fill={color} opacity={0.5} />
    </g>
  );
}

// ── Main Component ──

interface AgentDAGViewProps {
  agent: Partial<Agent>;
}

export function AgentDAGView({ agent }: AgentDAGViewProps) {
  const steps = agent.workflowSteps;

  if (!steps || steps.length === 0) {
    return null;
  }

  const svgWidth = 300;
  const { nodes, totalHeight } = layoutWorkflow(steps, svgWidth);

  // Build node map for edge lookups
  const nodeMap = new Map<string, LayoutNode>();
  for (const n of nodes) nodeMap.set(n.step.id, n);

  // Collect edges
  const edges: Array<{ from: LayoutNode; to: LayoutNode; color: string }> = [];
  for (const node of nodes) {
    for (const targetId of node.step.connectsTo) {
      const target = nodeMap.get(targetId);
      if (target) {
        const color = NODE_COLORS[node.step.type] || "#6b7280";
        edges.push({ from: node, to: target, color });
      }
    }
  }

  return (
    <div
      style={{
        width: "100%",
        borderRadius: 12,
        border: "1px solid var(--color-v3-outline-var, hsl(var(--border)))",
        background: "var(--color-v3-surface, hsl(var(--background)))",
        padding: "12px 4px",
        overflow: "hidden",
      }}
    >
      {/* Title */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginBottom: 8,
          paddingLeft: 8,
        }}
      >
        <Zap
          style={{
            width: 13,
            height: 13,
            color: "var(--color-v3-text-var, hsl(var(--muted-foreground)))",
          }}
        />
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.03em",
            textTransform: "uppercase",
            color: "var(--color-v3-text-var, hsl(var(--muted-foreground)))",
            fontFamily: "var(--font-inter), system-ui, sans-serif",
          }}
        >
          Execution Plan
        </span>
        <span
          style={{
            fontSize: 10,
            color: "var(--color-v3-text-var, hsl(var(--muted-foreground)))",
            fontFamily: "var(--font-inter), system-ui, sans-serif",
            opacity: 0.6,
          }}
        >
          {steps.length} steps
        </span>
      </div>

      <svg
        width="100%"
        height={totalHeight}
        viewBox={`0 0 ${svgWidth} ${totalHeight}`}
        style={{ display: "block" }}
      >
        {/* Edges (behind nodes) */}
        {edges.map((e, i) => (
          <WorkflowEdge
            key={`edge-${i}`}
            fromNode={e.from}
            toNode={e.to}
            color={e.color}
          />
        ))}

        {/* Nodes */}
        {nodes.map((node) => (
          <WorkflowNode key={node.step.id} node={node} />
        ))}
      </svg>
    </div>
  );
}
