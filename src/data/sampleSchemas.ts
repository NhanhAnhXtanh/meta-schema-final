import { SchemaData } from '@/utils/schemaLoader';

export const sampleSchemas: Record<string, SchemaData> = {
    simple: {
        autoLayout: true,
        tables: [
            {
                id: 'tbl_user',
                name: 'User',
                tableName: 'sec_user',
                position: { x: 0, y: 0 },
                columns: [
                    { name: 'id', type: 'uuid', isPrimaryKey: true, visible: true },
                    { name: 'username', type: 'varchar', visible: true },
                    { name: 'password', type: 'varchar', visible: true },
                    { name: 'role', type: 'varchar', visible: true },
                    { name: 'orders', type: 'array', visible: true, isVirtual: true }
                ]
            },
            {
                id: 'tbl_order',
                name: 'Order',
                tableName: 'sales_order',
                position: { x: 0, y: 0 },
                columns: [
                    { name: 'id', type: 'uuid', isPrimaryKey: true, visible: true },
                    { name: 'order_no', type: 'varchar', visible: true },
                    { name: 'date', type: 'date', visible: true },
                    { name: 'amount', type: 'decimal', visible: true },
                    { name: 'user_id', type: 'uuid', isForeignKey: true, visible: true },
                    { name: 'user_ref', type: 'object', visible: true, isVirtual: false }
                ]
            },
            {
                id: 'tbl_user_replica',
                name: 'User (Replica)',
                tableName: 'sec_user',
                position: { x: 0, y: 0 },
                columns: [
                    { name: 'id', type: 'uuid', isPrimaryKey: true, visible: true },
                    { name: 'username', type: 'varchar', visible: true },
                    { name: 'password', type: 'varchar', visible: true },
                    { name: 'role', type: 'varchar', visible: true }
                ]
            }
        ],
        relationships: [
            { 
                type: 'array', 
                relationshipType: '1-n', 
                sourceNodeId: 'tbl_user', 
                targetNodeId: 'tbl_order', 
                sourceKey: 'id', 
                targetKey: 'user_id', 
                fieldName: 'orders' 
            },
            { 
                type: 'object', 
                relationshipType: 'n-1', 
                sourceNodeId: 'tbl_order', 
                targetNodeId: 'tbl_user_replica', 
                sourceKey: 'user_id', 
                targetKey: 'id', 
                fieldName: 'user_ref' 
            }
        ]
    },
    complex: {
        autoLayout: true,
        tables: [
            { 
                id: 'crm_customer', 
                name: 'Customer', 
                tableName: 'crm_customer', 
                position: { x: 0, y: 0 }, 
                columns: [
                    { name: 'id', type: 'uuid', isPrimaryKey: true, visible: true }, 
                    { name: 'name', type: 'varchar', visible: true }, 
                    { name: 'email', type: 'varchar', visible: true }, 
                    { name: 'invoices', type: 'array', visible: true, isVirtual: true }
                ] 
            },
            { 
                id: 'crm_customer', 
                name: 'Customer (VIP)', 
                tableName: 'crm_customer', 
                position: { x: 0, y: 0 }, 
                columns: [
                    { name: 'id', type: 'uuid', isPrimaryKey: true, visible: true }, 
                    { name: 'name', type: 'varchar', visible: true }, 
                    { name: 'email', type: 'varchar', visible: true }, 
                    { name: 'vip_product_ref', type: 'object', visible: true, isVirtual: false }
                ] 
            },
            { 
                id: 't_inv', 
                name: 'Invoice', 
                tableName: 'crm_invoice', 
                position: { x: 0, y: 0 }, 
                columns: [
                    { name: 'id', type: 'uuid', isPrimaryKey: true, visible: true }, 
                    { name: 'cust_id', type: 'uuid', isForeignKey: true, visible: true }, 
                    { name: 'total', type: 'decimal', visible: true }, 
                    { name: 'status', type: 'enum', visible: true }, 
                    { name: 'lines', type: 'array', visible: true, isVirtual: true }
                ] 
            },
            { 
                id: 't_line', 
                name: 'Line', 
                tableName: 'crm_invoice_line', 
                position: { x: 0, y: 0 }, 
                columns: [
                    { name: 'id', type: 'uuid', isPrimaryKey: true, visible: true }, 
                    { name: 'inv_id', type: 'uuid', isForeignKey: true, visible: true }, 
                    { name: 'qty', type: 'int', visible: true }
                ] 
            },
            { 
                id: 't_prod', 
                name: 'Product', 
                tableName: 'crm_product', 
                position: { x: 0, y: 0 }, 
                columns: [
                    { name: 'id', type: 'uuid', isPrimaryKey: true, visible: true }, 
                    { name: 'sku', type: 'varchar', visible: true }, 
                    { name: 'price', type: 'decimal', visible: true }, 
                    { name: 'lines_ref', type: 'array', visible: true, isVirtual: true }
                ] 
            }
        ],
        relationships: [
            { 
                type: 'array', 
                relationshipType: '1-n', 
                sourceNodeId: 'crm_customer', 
                targetNodeId: 't_inv', 
                sourceKey: 'id', 
                targetKey: 'cust_id', 
                fieldName: 'invoices' 
            },
            { 
                type: 'object', 
                relationshipType: '1-1', 
                sourceNodeId: 'crm_customer', 
                sourceReplicaIndex: 1, 
                targetNodeId: 't_prod', 
                sourceKey: 'id', 
                targetKey: 'id', 
                fieldName: 'vip_product_ref' 
            },
            { 
                type: 'array', 
                relationshipType: '1-n', 
                sourceNodeId: 't_inv', 
                targetNodeId: 't_line', 
                sourceKey: 'id', 
                targetKey: 'inv_id', 
                fieldName: 'lines' 
            },
            { 
                type: 'array', 
                relationshipType: '1-n', 
                sourceNodeId: 't_prod', 
                targetNodeId: 't_line', 
                sourceKey: 'id', 
                targetKey: 'prod_id', 
                fieldName: 'lines_ref' 
            }
        ]
    }
};
