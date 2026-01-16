import { Node, Edge } from '@xyflow/react';
import { TableNodeData, TableColumn } from '@/types/schema';
import { TABLE_COLORS } from '@/constants';

export interface SchemaData {
    tables: Array<{
        id: string;
        name: string;
        tableName?: string;
        position?: { x: number; y: number };
        columns: Array<{
            name: string;
            type: string;
            isPrimaryKey?: boolean;
            isForeignKey?: boolean;
            visible?: boolean;
            isVirtual?: boolean;
            isRef?: boolean;              // Field có reference đến bảng khác
            ref?: string;                  // Tên bảng được reference (nếu isRef = true)
            children?: Array<{             // Nested structure (object/array inline)
                name: string;
                type: string;
                isRef?: boolean;
                ref?: string;
                children?: Array<any>;      // Recursive nested
            }>;
        }>;
    }>;
    relationships: Array<{
        type: 'array' | 'object';
        relationshipType?: '1-1' | '1-n' | 'n-1';
        sourceNodeId: string;
        targetNodeId: string;
        sourceKey: string;
        targetKey: string;
        fieldName: string;
        sourceReplicaIndex?: number;
        targetReplicaIndex?: number;
    }>;
}

export function loadSchema(schemaData: SchemaData): { nodes: Node<TableNodeData>[]; edges: Edge[] } {
    const processedIds: Record<string, number> = {};
    const idMap: Record<string, string[]> = {};
    const nodes: Node<TableNodeData>[] = [];
    const edges: Edge[] = [];

    // 1. Process Tables (Detect Duplicates & Replicate)
    if (Array.isArray(schemaData.tables)) {
        schemaData.tables.forEach((table) => {
            const jmixId = table.id;
            let nodeId = table.id;

            // Check duplicate count to generate Replica ID
            if (processedIds[jmixId] === undefined) {
                processedIds[jmixId] = 0;
                nodeId = `node_${jmixId}`;
            } else {
                processedIds[jmixId]++;
                nodeId = `node_${jmixId}_replica_${processedIds[jmixId]}`;
            }

            // Map Logic
            if (jmixId) {
                if (!idMap[jmixId]) {
                    idMap[jmixId] = [];
                }
                idMap[jmixId].push(nodeId);
            }

            const defaultColor = TABLE_COLORS[nodes.length % TABLE_COLORS.length];
            const newNode: Node<TableNodeData> = {
                id: nodeId,
                type: 'table',
                position: table.position || { x: 0, y: 0 },
                data: {
                    tableName: table.tableName || table.name.toLowerCase().replace(/\s+/g, '_'),
                    label: table.name,
                    columns: table.columns.map((col): TableColumn => ({
                        name: col.name,
                        type: col.type,
                        visible: col.visible !== false,
                        isPrimaryKey: col.isPrimaryKey || false,
                        isForeignKey: col.isForeignKey || false,
                        isVirtual: col.isVirtual || false,
                        isRef: col.isRef || false,
                        // Nếu có ref, lưu vào description hoặc tạo metadata
                        description: col.ref ? `ref:${col.ref}` : undefined,
                        // Xử lý nested children nếu có
                        children: col.children?.map((child: any) => ({
                            name: child.name,
                            type: child.type,
                            isRef: child.isRef || false,
                            description: child.ref ? `ref:${child.ref}` : undefined,
                            children: child.children,
                        })),
                    })),
                    color: defaultColor,
                    isActive: true,
                    _version: Date.now()
                }
            };
            nodes.push(newNode);
        });
    }

    // 2. Process Relationships
    if (Array.isArray(schemaData.relationships)) {
        schemaData.relationships.forEach((rel) => {
            const sourceNodeIds = idMap[rel.sourceNodeId] || [rel.sourceNodeId];
            const targetNodeIds = idMap[rel.targetNodeId] || [rel.targetNodeId];

            const sourceIdx = rel.sourceReplicaIndex || 0;
            const targetIdx = rel.targetReplicaIndex || 0;

            const sourceId = sourceNodeIds[sourceIdx] || sourceNodeIds[0];
            const targetId = targetNodeIds[targetIdx] || targetNodeIds[0];

            if (sourceId && targetId) {
                const sourceNode = nodes.find(n => n.id === sourceId);
                const targetNode = nodes.find(n => n.id === targetId);

                if (sourceNode && targetNode) {
                    const type = rel.type.toLowerCase();

                    // Update source node columns if needed
                    if (type === 'array') {
                        // Add virtual field to source
                        const existingFieldIndex = sourceNode.data.columns.findIndex(c => c.name === rel.fieldName);
                        const newField: TableColumn = {
                            name: rel.fieldName,
                            type: 'array',
                            visible: true,
                            isVirtual: true,
                            isPrimaryKey: false,
                            linkedPrimaryKeyField: rel.sourceKey,
                            linkedForeignKeyField: rel.targetKey,
                        };

                        if (existingFieldIndex !== -1) {
                            sourceNode.data.columns[existingFieldIndex] = newField;
                        } else {
                            sourceNode.data.columns.push(newField);
                        }

                        // Mark target field as FK
                        const targetColumn = targetNode.data.columns.find(c => c.name === rel.targetKey);
                        if (targetColumn) {
                            targetColumn.isForeignKey = true;
                        }
                    } else if (type === 'object') {
                        // Add object field to source
                        const existingFieldIndex = sourceNode.data.columns.findIndex(c => c.name === rel.fieldName);
                        const newField: TableColumn = {
                            name: rel.fieldName,
                            type: 'object',
                            visible: true,
                            isVirtual: false,
                            isPrimaryKey: false,
                            linkedForeignKeyField: rel.sourceKey,
                            primaryKeyField: rel.targetKey,
                            relationshipType: rel.relationshipType as 'n-1' | '1-1',
                        };

                        if (existingFieldIndex !== -1) {
                            sourceNode.data.columns[existingFieldIndex] = newField;
                        } else {
                            sourceNode.data.columns.push(newField);
                        }

                        // Mark source FK field
                        const sourceFKColumn = sourceNode.data.columns.find(c => c.name === rel.sourceKey);
                        if (sourceFKColumn) {
                            sourceFKColumn.isForeignKey = true;
                        }
                    }

                    // Create Edge
                    const edgeId = `${sourceId}-${rel.fieldName}-to-${targetId}-${rel.targetKey}`;
                    edges.push({
                        id: edgeId,
                        source: sourceId,
                        target: targetId,
                        sourceHandle: rel.fieldName,
                        targetHandle: rel.targetKey,
                        type: 'relationship',
                        data: { 
                            relationshipType: rel.relationshipType || '1-n',
                            primaryKeyField: rel.targetKey
                        }
                    });
                }
            }
        });
    }

    return { nodes, edges };
}
