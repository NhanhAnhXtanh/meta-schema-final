import { memo, useState, useEffect } from 'react';
import { EdgeProps, getBezierPath, Position, getSmoothStepPath, Edge } from '@xyflow/react';
import { Button } from '@/components/ui/button';
import { MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { THEME } from '@/constants/theme';

export type RelationshipType = '1-1' | '1-n' | 'n-1';
export type EdgePathType = 'bezier' | 'smoothstep' | 'straight';

export interface RelationshipEdgeData {
  relationshipType?: RelationshipType;
  pathType?: EdgePathType;
  controlPoint?: { x: number; y: number };
  primaryKeyField?: string;
  objectFieldName?: string;
  sourceFK?: string;
  [key: string]: unknown;
}

export function RelationshipEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
  selected,
  source,
  target,
  sourceHandleId: sourceHandle,
  targetHandleId: targetHandle,
}: EdgeProps<Edge<RelationshipEdgeData & { post?: (msg: any) => void }>>) {

  const post = data?.post;

  const [relationshipType] = useState<RelationshipType>(
    data?.relationshipType || '1-n'
  );

  const [isHovered, setIsHovered] = useState(false);
  const [pathType] = useState<EdgePathType>(data?.pathType || 'bezier');


  const getEdgePath = () => {
    if (pathType === 'straight') {
      return `M ${sourceX},${sourceY} L ${targetX},${targetY}`;
    } else if (pathType === 'smoothstep') {
      const [path] = getSmoothStepPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
      });
      return path;
    } else {
      const [path] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
      });
      return path;
    }
  };

  const edgePath = getEdgePath();
  const labelX = (sourceX + targetX) / 2;
  const labelY = (sourceY + targetY) / 2;


  useEffect(() => {
    if (!source || !target || !sourceHandle || !targetHandle) return;

    const edgeColor = getRelationshipColor(relationshipType);

    const sourceHandleEl = document.querySelector(
      `.react-flow__handle[data-handleid="${sourceHandle}"][data-nodeid="${source}"]`
    ) as HTMLElement;

    const targetHandleEl = document.querySelector(
      `.react-flow__handle[data-handleid="${targetHandle}"][data-nodeid="${target}"]`
    ) as HTMLElement;

    if (isHovered || selected) {
      if (sourceHandleEl) {
        sourceHandleEl.style.backgroundColor = edgeColor;
        sourceHandleEl.style.borderColor = edgeColor;
        sourceHandleEl.style.boxShadow = `0 0 0 2px ${edgeColor}40`;
      }
      if (targetHandleEl) {
        targetHandleEl.style.backgroundColor = edgeColor;
        targetHandleEl.style.borderColor = edgeColor;
        targetHandleEl.style.boxShadow = `0 0 0 2px ${edgeColor}40`;
      }
    } else {
      if (sourceHandleEl) {
        sourceHandleEl.style.backgroundColor = '';
        sourceHandleEl.style.borderColor = '';
        sourceHandleEl.style.boxShadow = '';
      }
      if (targetHandleEl) {
        targetHandleEl.style.backgroundColor = '';
        targetHandleEl.style.borderColor = '';
        targetHandleEl.style.boxShadow = '';
      }
    }

    return () => {
      if (sourceHandleEl) {
        sourceHandleEl.style.backgroundColor = '';
        sourceHandleEl.style.borderColor = '';
        sourceHandleEl.style.boxShadow = '';
      }
      if (targetHandleEl) {
        targetHandleEl.style.backgroundColor = '';
        targetHandleEl.style.borderColor = '';
        targetHandleEl.style.boxShadow = '';
      }
    };
  }, [isHovered, selected, relationshipType, source, target, sourceHandle, targetHandle]);

  const getSourceLabel = (type: RelationshipType) => {
    switch (type) {
      case '1-1':
        return '1';
      case '1-n':
        return '1';
      case 'n-1':
        return 'N';
      default:
        return '1';
    }
  };

  const getTargetLabel = (type: RelationshipType) => {
    switch (type) {
      case '1-1':
        return '1';
      case '1-n':
        return 'N';
      case 'n-1':
        return '1';
      default:
        return 'N';
    }
  };

  const getRelationshipColor = (type: RelationshipType) => {
    switch (type) {
      case '1-1':
        return THEME.RELATIONSHIP.COLORS.ONE_TO_ONE;
      case '1-n':
        return THEME.RELATIONSHIP.COLORS.ONE_TO_MANY;
      case 'n-1':
        return THEME.RELATIONSHIP.COLORS.MANY_TO_ONE;
      default:
        return THEME.RELATIONSHIP.COLORS.ONE_TO_MANY;
    }
  };

  const getSourceLabelPosition = () => {
    const offset = 20;
    let x = sourceX;
    let y = sourceY;

    if (sourcePosition === Position.Left) {
      x = sourceX - offset;
    } else if (sourcePosition === Position.Right) {
      x = sourceX + offset;
    } else if (sourcePosition === Position.Top) {
      y = sourceY - offset;
    } else if (sourcePosition === Position.Bottom) {
      y = sourceY + offset;
    }

    return { x, y };
  };

  const getTargetLabelPosition = () => {
    const offset = 20;
    let x = targetX;
    let y = targetY;

    if (targetPosition === Position.Left) {
      x = targetX - offset;
    } else if (targetPosition === Position.Right) {
      x = targetX + offset;
    } else if (targetPosition === Position.Top) {
      y = targetY - offset;
    } else if (targetPosition === Position.Bottom) {
      y = targetY + offset;
    }

    return { x, y };
  };

  const sourceLabelPos = getSourceLabelPosition();
  const targetLabelPos = getTargetLabelPosition();

  const edgeColor = getRelationshipColor(relationshipType);
  const defaultColor = THEME.RELATIONSHIP.COLORS.DEFAULT;
  const currentColor = selected ? edgeColor : (isHovered ? edgeColor : defaultColor);

  return (
    <g
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <path
        id={`${id}-hitarea`}
        style={{
          ...style,
          stroke: 'transparent',
          strokeWidth: 20,
          fill: 'none',
          pointerEvents: 'stroke',
        }}
        className="react-flow__edge-path cursor-pointer"
        d={edgePath}
        onClick={(e) => {
          e.stopPropagation();
          
          // Gửi event lên Jmix khi click vào edge
          if (!post) return;
          post({
            v: 1,
            kind: "event",
            type: "SCHEMA_RELATIONSHIP_EDIT_REQUEST",
            payload: {
              edgeId: id,
              sourceNodeId: source,
              targetNodeId: target,
              relationshipType: relationshipType
            }
          });
          
          alert(`Đã gửi yêu cầu mở dialog chỉnh sửa quan hệ lên Jmix`);
        }}
      />
      <path
        id={id}
        style={{
          ...style,
          stroke: currentColor,
          strokeWidth: selected ? 3 : 2,
          strokeDasharray: '5,5',
          transition: 'stroke 0.2s ease, stroke-width 0.2s ease',
          pointerEvents: 'none',
        }}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
      />

      <foreignObject
        width={30}
        height={30}
        x={sourceLabelPos.x - 15}
        y={sourceLabelPos.y - 15}
        className="overflow-visible pointer-events-none"
        requiredExtensions="http://www.w3.org/1999/xhtml"
      >
        <div className="flex items-center justify-center w-full h-full">
          <span
            className="text-sm font-bold w-6 h-6 rounded-full flex items-center justify-center text-white shadow-md transition-colors duration-200"
            style={{
              backgroundColor: currentColor,
            }}
          >
            {getSourceLabel(relationshipType)}
          </span>
        </div>
      </foreignObject>

      <foreignObject
        width={30}
        height={30}
        x={targetLabelPos.x - 15}
        y={targetLabelPos.y - 15}
        className="overflow-visible pointer-events-none"
        requiredExtensions="http://www.w3.org/1999/xhtml"
      >
        <div className="flex items-center justify-center w-full h-full">
          <span
            className="text-sm font-bold w-6 h-6 rounded-full flex items-center justify-center text-white shadow-md transition-colors duration-200"
            style={{
              backgroundColor: currentColor,
            }}
          >
            {getTargetLabel(relationshipType)}
          </span>
        </div>
      </foreignObject>

      {data?.primaryKeyField && (
        <foreignObject
          width={200}
          height={40}
          x={targetLabelPos.x + 25}
          y={targetLabelPos.y - 20}
          className="overflow-visible pointer-events-none"
          requiredExtensions="http://www.w3.org/1999/xhtml"
        >
          <div className="flex items-center gap-1">
            <span className="text-xs font-semibold text-gray-700 bg-white px-2 py-1 rounded shadow-sm border border-gray-200">
              PK: {data.primaryKeyField}
            </span>
          </div>
        </foreignObject>
      )}

      <foreignObject
        width={60}
        height={60}
        x={labelX - 30}
        y={labelY - 30}
        className="overflow-visible"
        requiredExtensions="http://www.w3.org/1999/xhtml"
      >
        <div className="flex items-center justify-center w-full h-full">
          <Button
            size="icon"
            variant="secondary"
            onClick={(e) => {
              e.stopPropagation();
              
              // Gửi event lên Jmix khi click vào nút 3 chấm
              if (!post) return;
              post({
                v: 1,
                kind: "event",
                type: "SCHEMA_RELATIONSHIP_EDIT_REQUEST",
                payload: {
                  edgeId: id,
                  sourceNodeId: source,
                  targetNodeId: target,
                  relationshipType: relationshipType
                }
              });
              
              alert(`Đã gửi yêu cầu mở dialog chỉnh sửa quan hệ lên Jmix`);
            }}
            className={cn(
              'h-10 w-10 rounded-full shadow-lg hover:shadow-xl transition-all cursor-pointer',
              'bg-white border-2 hover:scale-110'
            )}
            style={{
              borderColor: edgeColor,
            }}
          >
            <MoreVertical
              size={20}
              style={{ color: edgeColor }}
            />
          </Button>
        </div>
      </foreignObject>
    </g >
  );
}

export default memo(RelationshipEdge);
