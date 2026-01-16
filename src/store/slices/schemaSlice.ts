import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Node, Edge, Connection, applyNodeChanges, applyEdgeChanges, NodeChange, EdgeChange } from '@xyflow/react';
import { TableNodeData, TableColumn } from '@/types/schema';
import { TABLE_COLORS } from '@/constants';
import {
    removeTableAndDescendants,
    deleteFieldAndCleanEdges,
    updateFieldCascading,
    toggleFieldVisibilityCascading
} from '../utils/schemaHelpers';

export interface SchemaState {
    nodes: Node<TableNodeData>[];
    edges: Edge[];
}

const initialState: SchemaState = {
    nodes: [],
    edges: [],
};

const schemaSlice = createSlice({
    name: 'schema',
    initialState,
    reducers: {
        setNodes: (state, action: PayloadAction<Node<TableNodeData>[]>) => {
            state.nodes = action.payload;
        },
        setEdges: (state, action: PayloadAction<Edge[]>) => {
            state.edges = action.payload;
        },
        addEdge: (state, action: PayloadAction<Edge>) => {
            state.edges.push(action.payload);
        },
        onNodesChange: (state, action: PayloadAction<NodeChange[]>) => {
            state.nodes = applyNodeChanges(action.payload, state.nodes) as Node<TableNodeData>[];
        },
        onEdgesChange: (state, action: PayloadAction<EdgeChange[]>) => {
            state.edges = applyEdgeChanges(action.payload, state.edges) as Edge[];
        },
        onConnect: (state, action: PayloadAction<Connection>) => {
            const { source, target, sourceHandle, targetHandle } = action.payload;
            if (source === target) return;
            if (source && target && sourceHandle && targetHandle) {
                const edgeId = `${source}-${sourceHandle}-to-${target}-${targetHandle}`;
                const exists = state.edges.some(e =>
                    e.source === source && e.target === target &&
                    e.sourceHandle === sourceHandle && e.targetHandle === targetHandle
                );
                if (!exists) {
                    const newEdge: Edge = {
                        id: edgeId,
                        source,
                        target,
                        sourceHandle,
                        targetHandle,
                        type: 'relationship',
                        data: { relationshipType: '1-n' }
                    };
                    state.edges.push(newEdge);
                }
            }
        },
        updateEdge: (state, action: PayloadAction<{ id: string; data: any }>) => {
            const { id, data } = action.payload;
            const edge = state.edges.find(e => e.id === id);
            if (edge) {
                edge.data = { ...edge.data, ...data };
            }
        },
        addTable: (state, action: PayloadAction<{ id?: string; name: string; tableName?: string; columns: TableColumn[]; position?: { x: number; y: number } }>) => {
            const { id, name, tableName, columns, position } = action.payload;
            const newId = id || `table-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            const defaultColor = TABLE_COLORS[state.nodes.length % TABLE_COLORS.length];
            const newTable: Node<TableNodeData> = {
                id: newId,
                type: 'table',
                position: position || {
                    x: Math.random() * 500 + 100,
                    y: Math.random() * 400 + 100,
                },
                data: {
                    tableName: tableName || name.toLowerCase().replace(/\s+/g, '_'),
                    label: name,
                    columns: columns.map(c => ({ ...c, visible: true })),
                    color: defaultColor,
                    isActive: true,
                    _version: Date.now()
                }
            };
            state.nodes.push(newTable);
        },
        updateTable: (state, action: PayloadAction<{ id: string; updates: Partial<TableNodeData> }>) => {
            const { id, updates } = action.payload;
            const node = state.nodes.find(n => n.id === id);
            if (node) {
                node.data = { ...node.data, ...updates };
            }
        },
        deleteElements: (state, action: PayloadAction<{ nodeIds: string[], edgeIds: string[] }>) => {
            const { nodeIds, edgeIds } = action.payload;
            const nodeSet = new Set(nodeIds);
            const edgeSet = new Set(edgeIds);
            state.nodes = state.nodes.filter(n => !nodeSet.has(n.id));
            state.edges = state.edges.filter(e => !edgeSet.has(e.id));
        },
        deleteTable: (state, action: PayloadAction<string>) => {
            const rootId = action.payload;
            const idsToDelete = removeTableAndDescendants(state.nodes, state.edges, rootId);
            state.nodes = state.nodes.filter(n => !idsToDelete.has(n.id));
            state.edges = state.edges.filter(e => !idsToDelete.has(e.source) && !idsToDelete.has(e.target));
        },
        addField: (state, action: PayloadAction<{ nodeId: string; field: TableColumn }>) => {
            const { nodeId, field } = action.payload;
            const node = state.nodes.find(n => n.id === nodeId);
            if (node) {
                node.data.columns.push(field);
            }
        },
        updateField: (state, action: PayloadAction<{ nodeId: string; fieldIndex: number; updates: Partial<TableColumn> }>) => {
            const { nodeId, fieldIndex, updates } = action.payload;
            updateFieldCascading(state.nodes, state.edges, nodeId, fieldIndex, updates);
        },
        toggleFieldVisibility: (state, action: PayloadAction<{ nodeId: string; fieldIndex: number }>) => {
            const { nodeId, fieldIndex } = action.payload;
            toggleFieldVisibilityCascading(state.nodes, state.edges, nodeId, fieldIndex);
        },
        deleteField: (state, action: PayloadAction<{ nodeId: string; fieldIndex: number; skipRecursive?: boolean }>) => {
            const { nodeId, fieldIndex, skipRecursive } = action.payload;
            deleteFieldAndCleanEdges(state.nodes, state.edges, nodeId, fieldIndex, skipRecursive);
        },
    },
});

export const {
    setNodes, setEdges, addEdge, onNodesChange, onEdgesChange, onConnect, updateEdge,
    addTable, updateTable, deleteTable, deleteElements,
    addField, updateField, deleteField, toggleFieldVisibility
} = schemaSlice.actions;

export default schemaSlice.reducer;
