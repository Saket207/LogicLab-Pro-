import React from 'react';
import { getBezierPath } from 'reactflow';
import signalAnimationManager from '../utils/signalAnimationManager';

const AnimatedEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}) => {
  const [animationState, setAnimationState] = React.useState(null);

  // Subscribe to animation updates
  React.useEffect(() => {
    const updateAnimation = () => {
      const state = signalAnimationManager.getAnimationState(id);
      setAnimationState(state);
    };

    signalAnimationManager.onAnimationUpdate(updateAnimation);
    
    return () => {
      signalAnimationManager.offAnimationUpdate(updateAnimation);
    };
  }, [id]);

  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  // Calculate signal position along the path
  const getSignalPosition = (progress) => {
    const totalLength = edgePath.length || 1;
    const position = progress * totalLength;
    return position;
  };

  const edgeStyle = {
    ...style,
    strokeWidth: 2,
    stroke: '#555',
  };

  // Add signal visualization if animation is active
  if (animationState?.isActive) {
    edgeStyle.stroke = animationState.signalValue ? '#4ade80' : '#64748b';
    edgeStyle.strokeWidth = 3;
    edgeStyle.filter = 'drop-shadow(0 0 6px currentColor)';
  }

  return (
    <>
      <path
        id={id}
        style={edgeStyle}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
      />
      
      {/* Signal pulse/bubble traveling along the edge */}
      {animationState?.isActive && (
        <circle
          r="4"
          fill={animationState.signalValue ? '#22c55e' : '#94a3b8'}
          stroke="#fff"
          strokeWidth="1"
          style={{
            filter: 'drop-shadow(0 0 8px currentColor)',
          }}
        >
          <animateMotion
            dur={`${animationState.duration}ms`}
            repeatCount="1"
            path={edgePath}
            begin="0s"
          />
        </circle>
      )}
      
      {/* Completed signal state indicator */}
      {animationState?.progress === 1 && !animationState.isActive && (
        <path
          style={{
            ...edgeStyle,
            stroke: animationState.signalValue ? '#16a34a' : '#475569',
            strokeWidth: 2,
            opacity: 0.8,
          }}
          d={edgePath}
        />
      )}
    </>
  );
};

export default AnimatedEdge;
