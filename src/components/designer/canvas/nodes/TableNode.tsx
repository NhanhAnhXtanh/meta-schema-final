import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';
import { TableColumn } from '@/types/schema';
import { useTableNode } from './useTableNode';
import { TableNodeHeader } from './TableNodeHeader';
import { TableNodeField } from './TableNodeField';

export type TableNodeProps = NodeProps<any>;

function TableNodeComponent({ data, selected, id }: TableNodeProps) {
  const post = data.post;
  if (!post) {
    console.warn('TableNode: post function is not available');
    return null;
  }
  const {
    isEditing, setIsEditing,
    editName, setEditName,
    headerColor,
    handleAddField, handleClone, handleSaveRename, handleDelete
  } = useTableNode(id, data, post);

  return (
    <>
      <div
        className={cn(
          'bg-white border-2 rounded-lg shadow-xl min-w-[240px] group/node',
          selected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
        )}
      >
        <TableNodeHeader
          data={data}
          id={id}
          isEditing={isEditing}
          editName={editName}
          headerColor={headerColor}
          setIsEditing={setIsEditing}
          setEditName={setEditName}
          handleSaveRename={handleSaveRename}
          handleClone={handleClone}
          handleDelete={handleDelete}
        />

        <div className="divide-y nodrag">
          {data.columns.map((column: TableColumn) => (
            <TableNodeField key={column.name} column={column} />
          ))}

          <div className="px-4 py-2 border-t border-gray-200 nodrag">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAddField();
              }}
              className="w-full flex items-center justify-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded transition-colors"
              title="Thêm field mới"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm field</span>
            </button>
          </div>
        </div>

        <div className="relative border-t border-gray-200 py-0 h-0">
          <Handle
            type="target"
            position={Position.Bottom}
            id="object-target"
            isConnectable={false}
            className="w-1 h-1 !bg-transparent !border-0 opacity-0 pointer-events-none absolute"
            style={{
              left: '50%',
              transform: 'translateX(-50%)',
            }}
          />
        </div>
      </div>
    </>
  );
}

export const TableNode = memo(TableNodeComponent);
