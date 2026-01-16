import type { Middleware, PayloadAction } from "@reduxjs/toolkit";
import { eventReceived } from "../jmixSlice";
import type { EnvelopeV1 } from "../types";
import {
    addTable,
    updateTable,
    deleteTable,
    addField,
    updateField,
    deleteField,
    addEdge,
    updateEdge,
    setNodes,
    setEdges,
    deleteElements,
} from "../../store/slices/schemaSlice";
import { loadSchema, type SchemaData } from "../../utils/schemaLoader";

/**
 * Schema Middleware
 * Xử lý các events từ Jmix và dispatch vào Redux store
 * Jmix sẽ gửi events xuống, middleware này sẽ tự động dispatch actions tương ứng
 */
export const schemaMiddleware: Middleware = (store) => (next) => (action) => {
    if (typeof action !== "object" || action === null || !("type" in action)) {
        return next(action);
    }
    if (action.type !== eventReceived.type) return next(action);

    const msg = (action as PayloadAction<EnvelopeV1>).payload;

    switch (msg.type) {
        // ===== TABLE ACTIONS =====
        case "SCHEMA_TABLE_ADD": {
            // Jmix gửi: { type: "SCHEMA_TABLE_ADD", payload: { id, name, tableName, columns, position } }
            store.dispatch(addTable(msg.payload));
            break;
        }

        case "SCHEMA_TABLE_UPDATE": {
            // Jmix gửi: { type: "SCHEMA_TABLE_UPDATE", payload: { id, updates: { label, ... } } }
            store.dispatch(updateTable(msg.payload));
            break;
        }

        case "SCHEMA_TABLE_DELETE": {
            // Jmix gửi: { type: "SCHEMA_TABLE_DELETE", payload: { id } }
            store.dispatch(deleteTable(msg.payload.id));
            break;
        }

        // ===== FIELD ACTIONS =====
        case "SCHEMA_FIELD_ADD": {
            // Jmix gửi: { type: "SCHEMA_FIELD_ADD", payload: { nodeId, field: { name, type, ... } } }
            store.dispatch(addField(msg.payload));
            break;
        }

        case "SCHEMA_FIELD_UPDATE": {
            // Jmix gửi: { type: "SCHEMA_FIELD_UPDATE", payload: { nodeId, fieldIndex, updates: { ... } } }
            store.dispatch(updateField(msg.payload));
            break;
        }

        case "SCHEMA_FIELD_DELETE": {
            // Jmix gửi: { type: "SCHEMA_FIELD_DELETE", payload: { nodeId, fieldIndex } }
            store.dispatch(deleteField(msg.payload));
            break;
        }

        // ===== RELATIONSHIP/EDGE ACTIONS =====
        case "SCHEMA_RELATIONSHIP_ADD": {
            // Jmix gửi: { type: "SCHEMA_RELATIONSHIP_ADD", payload: { sourceNodeId, targetNodeId, sourceKey, targetKey, fieldName, relationshipType } }
            // Tạo edge từ relationship data
            const { sourceNodeId, targetNodeId, sourceKey, targetKey, fieldName, relationshipType } = msg.payload;
            const edgeId = `${sourceNodeId}-${fieldName}-to-${targetNodeId}-${targetKey}`;
            store.dispatch(addEdge({
                id: edgeId,
                source: sourceNodeId,
                target: targetNodeId,
                sourceHandle: fieldName,
                targetHandle: targetKey,
                type: 'relationship',
                data: { 
                    relationshipType: relationshipType || '1-n',
                    sourceFK: sourceKey,
                    targetFK: targetKey,
                    objectFieldName: fieldName
                }
            }));
            break;
        }

        case "SCHEMA_RELATIONSHIP_UPDATE": {
            // Jmix gửi: { type: "SCHEMA_RELATIONSHIP_UPDATE", payload: { edgeId, data: { relationshipType, ... } } }
            store.dispatch(updateEdge(msg.payload));
            break;
        }

        case "SCHEMA_RELATIONSHIP_DELETE": {
            // Jmix gửi: { type: "SCHEMA_RELATIONSHIP_DELETE", payload: { edgeId } }
            store.dispatch(deleteElements({ nodeIds: [], edgeIds: [msg.payload.edgeId] }));
            break;
        }

        // ===== BULK ACTIONS =====
        case "SCHEMA_LOAD": {
            /**
             * Jmix gửi schema data ngay từ đầu với format SchemaData
             * 
             * Format dữ liệu từ Jmix:
             * {
             *   autoLayout?: boolean,
             *   tables: [
             *     {
             *       id: string,
             *       name: string,
             *       tableName?: string,
             *       position?: { x, y },
             *       columns: [
             *         {
             *           name: string,
             *           type: string,  // "array", "object", "varchar", "uuid", etc.
             *           isPrimaryKey?: boolean,
             *           isForeignKey?: boolean,
             *           isRef?: boolean,      // Field có reference đến bảng khác
             *           ref?: string,          // Tên bảng được reference (nếu isRef = true)
             *           children?: [...]       // Nested structure (object/array inline)
             *         }
             *       ]
             *     }
             *   ],
             *   relationships: [
             *     {
             *       type: "array" | "object",
             *       relationshipType?: "1-1" | "1-n" | "n-1",
             *       sourceNodeId: string,
             *       targetNodeId: string,
             *       sourceKey: string,
             *       targetKey: string,
             *       fieldName: string
             *     }
             *   ]
             * }
             * 
             * Ví dụ từ Jmix:
             * {
             *   "HoVaTen": "Nguyễn Văn An",
             *   "DiaChi": { type: "object", children: [...] },
             *   "GiayToTuyThan": { type: "array", isRef: false, children: [...] },
             *   "ho_khau": { type: "object", isRef: true, ref: "BẢng" }
             * }
             */
            const schemaData = msg.payload as SchemaData;
            const { nodes, edges } = loadSchema(schemaData);
            store.dispatch(setNodes(nodes));
            store.dispatch(setEdges(edges));
            break;
        }

        case "SCHEMA_SET_NODES": {
            // Jmix gửi nodes trực tiếp (ReactFlow format)
            // Format: { type: "SCHEMA_SET_NODES", payload: { nodes: Node[] } }
            store.dispatch(setNodes(msg.payload.nodes));
            break;
        }

        case "SCHEMA_SET_EDGES": {
            // Jmix gửi edges trực tiếp (ReactFlow format)
            // Format: { type: "SCHEMA_SET_EDGES", payload: { edges: Edge[] } }
            store.dispatch(setEdges(msg.payload.edges));
            break;
        }

        default:
            // Không xử lý, để các middleware khác xử lý
            break;
    }

    return next(action);
};
