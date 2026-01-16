import { useEffect, useMemo, useCallback } from 'react';
import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    NodeTypes,
    EdgeTypes,
    useUpdateNodeInternals,
    useNodes,
    Connection,
    OnNodesDelete,
    Edge,
} from '@xyflow/react';
import { CanvasVisualHandler } from '@/components/designer/canvas/CanvasVisualHandler';
import '@xyflow/react/dist/style.css';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { onNodesChange, onEdgesChange } from '@/store/slices/schemaSlice';
import { TableNodeData } from '@/types/schema';
import { TableNode } from '@/components/designer/canvas/nodes/TableNode';
import { RelationshipEdge } from '@/components/RelationshipEdge';
import type { BridgeMsg } from '@/bridge/bridge-core';
import { PostContext } from '@/contexts/PostContext';

const nodeTypes: NodeTypes = {
    table: TableNode as any,
};

const edgeTypes: EdgeTypes = {
    relationship: RelationshipEdge,
};

const defaultEdgeOptions: Omit<Edge, 'id' | 'source' | 'target'> = {
    type: 'relationship',
    animated: true,
};

function NodeUpdater() {
    const updateNodeInternals = useUpdateNodeInternals();
    const nodes = useNodes();

    const nodesVersion = useMemo(() =>
        nodes.reduce((sum, node) => sum + ((node.data as TableNodeData)._version || 0), 0),
        [nodes]
    );

    useEffect(() => {
        const nodesToUpdate = nodes.filter(n => n.data._version);
        nodesToUpdate.forEach(node => {
            updateNodeInternals(node.id);
        });
    }, [nodesVersion, updateNodeInternals]);

    return null;
}

export type FlowCanvasProps = {
    post: (msg: BridgeMsg) => void;
};

export function FlowCanvas({ post }: FlowCanvasProps) {
    const dispatch = useDispatch();
    const nodes = useSelector((state: RootState) => state.schema.present.nodes);
    const edges = useSelector((state: RootState) => state.schema.present.edges);

    const visibleNodes = useMemo(() => {
        return nodes.filter(node => node.data?.isActive !== false);
    }, [nodes]);

    const onNodesChangeHandler = useCallback((changes: any[]) => {
        const relevantChanges = changes.filter(c => c.type !== 'remove');
        if (relevantChanges.length > 0) {
            dispatch(onNodesChange(relevantChanges));
        }
    }, [dispatch]);

    const onNodesDelete: OnNodesDelete = useCallback((deletedNodes) => {
        deletedNodes.forEach(node => {
            // Gửi event lên Jmix
            post({ 
                v: 1, 
                kind: "event", 
                type: "SCHEMA_TABLE_DELETE", 
                payload: { id: node.id } 
            });
            
            alert(`Đã gửi yêu cầu xóa bảng "${node.data.label}" lên Jmix`);
        });
    }, [post]);

    const isValidConnection = useCallback((connection: Connection | Edge) => {
        if ('source' in connection && 'target' in connection) {
            return connection.source !== connection.target;
        }
        return false;
    }, []);

    const onConnectHandler = useCallback((connection: any) => {
        const { source, target, sourceHandle, targetHandle } = connection;
        if (source && target && sourceHandle && targetHandle) {
            // Gửi event lên Jmix để xử lý tạo relationship
            post({
                v: 1,
                kind: "event",
                type: "SCHEMA_RELATIONSHIP_ADD_REQUEST",
                payload: {
                    sourceNodeId: source,
                    targetNodeId: target,
                    sourceKey: sourceHandle,
                    targetKey: targetHandle,
                    linkType: '1-n'
                }
            });
        }
    }, [post]);

    return (
        <PostContext.Provider value={post}>
            <div className="flex-1 h-full w-full">
                <ReactFlow
                    nodes={visibleNodes}
                    edges={edges}
                    onNodesChange={onNodesChangeHandler}
                    onEdgesChange={(changes) => dispatch(onEdgesChange(changes))}
                    onNodesDelete={onNodesDelete}
                    onConnect={onConnectHandler}
                    isValidConnection={isValidConnection}
                    nodeTypes={nodeTypes}
                    edgeTypes={edgeTypes}
                    defaultEdgeOptions={defaultEdgeOptions}
                    fitView
                    className="bg-gray-50"
                    minZoom={0.1}
                    maxZoom={4}
                    snapToGrid={true}
                    snapGrid={[16, 16]}
                    proOptions={{ hideAttribution: true }}
                >
                    <CanvasVisualHandler />
                    <NodeUpdater />
                    <Background color="#ccc" gap={16} />
                    <Controls className="bg-white text-black border-gray-200 shadow-sm" />
                    <MiniMap
                        nodeColor={(node) => (node.data as any).color || '#ccc'}
                        maskColor="rgba(240, 240, 240, 0.6)"
                        className="bg-white border border-gray-200 rounded shadow-md"
                    />
                </ReactFlow>
            </div>
        </PostContext.Provider>
    );
}
