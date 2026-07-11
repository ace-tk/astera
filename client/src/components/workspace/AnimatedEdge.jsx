import { memo } from 'react'
import { getBezierPath } from 'reactflow'

/**
 * Custom edge: a soft base line, a slowly flowing dashed overlay, and a small
 * particle that travels source → target along the path — so data visibly
 * "moves" through the pipeline. No default React Flow edge styling.
 */
function AnimatedEdgeBase({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data }) {
  const [path] = getBezierPath({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, curvature: 0.35 })
  const active = data?.active !== false
  const color = data?.color || 'rgb(17 24 39 / 0.18)'

  return (
    <>
      <path d={path} fill="none" stroke="rgb(17 24 39 / 0.1)" strokeWidth={2} />
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeDasharray="1 10"
        strokeLinecap="round"
        opacity={active ? 0.9 : 0.25}
      >
        {active && <animate attributeName="stroke-dashoffset" from="22" to="0" dur="1.1s" repeatCount="indefinite" />}
      </path>
      {active && (
        <circle r="3" fill={color}>
          <animateMotion dur="2.4s" repeatCount="indefinite" path={path} keyPoints="0;1" keyTimes="0;1" calcMode="linear" />
        </circle>
      )}
    </>
  )
}

export default memo(AnimatedEdgeBase)
