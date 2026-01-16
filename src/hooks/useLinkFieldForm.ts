import { useEffect, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import {
    setLinkFieldSelectedTargetNodeId,
    setLinkFieldSelectedSourceKey,
    setLinkFieldSelectedTargetKey,
    setLinkFieldNewFieldName,
    setLinkFieldLinkType,
    setLinkFieldSearchQuery,
    initializeLinkFieldState,
    resetLinkFieldState
} from '@/store/slices/linkFieldSlice';
import { closeLinkFieldDialog } from '@/store/slices/uiSlice';
import { ValidationUtils } from '@/utils/validation';
import { usePost } from '@/contexts/PostContext';

export function useLinkFieldForm() {
    const dispatch = useDispatch();
    const post = usePost(); // Sử dụng Context để lấy post function

    const nodes = useSelector((state: RootState) => state.schema.present.nodes);
    const { isOpen, sourceNodeId, isEditMode, fieldIndex, initialValues } = useSelector((state: RootState) => state.ui.linkFieldDialog);
    const {
        selectedTargetNodeId,
        selectedSourceKey,
        selectedTargetKey,
        newFieldName,
        linkType,
        searchQuery
    } = useSelector((state: RootState) => state.linkField);

    const sourceNode = useMemo(() => nodes.find(n => n.id === sourceNodeId), [nodes, sourceNodeId]);

    useEffect(() => {
        if (isOpen) {
            if (initialValues) {
                dispatch(initializeLinkFieldState({
                    selectedTargetNodeId: initialValues.targetNodeId,
                    selectedSourceKey: initialValues.sourceKey,
                    selectedTargetKey: initialValues.targetKey,
                    newFieldName: initialValues.fieldName,
                    linkType: initialValues.linkType,
                    searchQuery: ''
                }));
            } else {
                dispatch(resetLinkFieldState());
            }
        }
    }, [isOpen, initialValues, dispatch]);

    const availableTargetNodes = useMemo(() => {
        if (!sourceNode) return [];
        return nodes;
    }, [nodes, sourceNode]);

    const sourceFields = useMemo(() => {
        if (!sourceNode) return [];
        return sourceNode.data.columns.filter((col) => col.visible !== false);
    }, [sourceNode]);

    const targetFields = useMemo(() => {
        if (!selectedTargetNodeId) return [];
        const targetNode = availableTargetNodes.find((n) => n.id === selectedTargetNodeId);
        if (!targetNode) return [];
        return targetNode.data.columns.filter((col) => col.visible !== false);
    }, [selectedTargetNodeId, availableTargetNodes]);

    const selectedTargetName = useMemo(() => {
        return availableTargetNodes.find(n => n.id === selectedTargetNodeId)?.data.label;
    }, [selectedTargetNodeId, availableTargetNodes]);

    const validationError = useMemo(() => {
        if (!selectedSourceKey || !selectedTargetKey) return null;
        if (!selectedTargetNodeId) return null;

        const sourceCol = sourceNode?.data.columns.find(c => c.name === selectedSourceKey);
        const targetCol = targetFields.find(c => c.name === selectedTargetKey);

        if (sourceCol && targetCol) {
            const validation = ValidationUtils.validateRelationshipTypes(
                sourceCol.type,
                targetCol.type,
                sourceCol.name,
                targetCol.name
            );
            if (!validation.valid) return validation.error;
        }

        if (selectedSourceKey) {
            const sourceField = sourceFields.find(f => f.name === selectedSourceKey);
            if (sourceField && (sourceField.type === 'array' || sourceField.type === 'object')) {
                return `Không thể liên kết tới trường '${selectedSourceKey}' vì nó có kiểu '${sourceField.type}'`;
            }
        }

        if (selectedTargetKey) {
            const targetField = targetFields.find(f => f.name === selectedTargetKey);
            if (targetField && (targetField.type === 'array' || targetField.type === 'object')) {
                return `Không thể liên kết tới trường '${selectedTargetKey}' vì nó có kiểu '${targetField.type}'`;
            }
        }

        return null;
    }, [selectedSourceKey, selectedTargetKey, selectedTargetNodeId, sourceNode, targetFields, sourceFields]);

    const isFormValid =
        selectedTargetNodeId &&
        selectedSourceKey &&
        selectedTargetKey &&
        newFieldName.trim() &&
        !validationError;

    const handleConfirm = useCallback(() => {
        if (!sourceNodeId) return;

        if (selectedTargetNodeId && selectedSourceKey && selectedTargetKey && newFieldName.trim()) {
            // Gửi event lên Jmix
            post({
                v: 1,
                kind: "event",
                type: "SCHEMA_RELATIONSHIP_ADD",
                payload: {
                    sourceNodeId: sourceNodeId,
                    targetNodeId: selectedTargetNodeId,
                    sourceKey: selectedSourceKey,
                    targetKey: selectedTargetKey,
                    fieldName: newFieldName.trim(),
                    linkType: linkType,
                    relationshipType: linkType
                }
            });

            alert(`Đã gửi yêu cầu tạo quan hệ lên Jmix`);

            // 1. Delete old field if editing
            if (isEditMode && fieldIndex !== undefined) {
                // Dispatch Redux action để xóa field cũ (chỉ UI)
                // Note: Actual deletion sẽ được xử lý bởi Jmix
            }

            dispatch(closeLinkFieldDialog());
        }
    }, [sourceNodeId, selectedTargetNodeId, selectedSourceKey, selectedTargetKey, newFieldName, isEditMode, fieldIndex, linkType, dispatch, post]);

    const handleCancel = () => dispatch(closeLinkFieldDialog());

    return {
        isOpen,
        isEditMode,
        sourceNode,
        sourceFields,
        targetFields,
        validationError,
        isFormValid,
        selectedTargetNodeId,
        selectedSourceKey,
        selectedTargetKey,
        newFieldName,
        linkType,
        searchQuery,
        selectedTargetName,
        availableTargetNodes,
        handleConfirm,
        handleCancel,
        setLinkFieldSearchQuery: (q: string) => dispatch(setLinkFieldSearchQuery(q)),
        setLinkFieldNewFieldName: (n: string) => dispatch(setLinkFieldNewFieldName(n)),
        setLinkFieldLinkType: (t: any) => dispatch(setLinkFieldLinkType(t)),
        setLinkFieldSelectedTargetNodeId: (id: string) => dispatch(setLinkFieldSelectedTargetNodeId(id)),
        setLinkFieldSelectedSourceKey: (k: string) => dispatch(setLinkFieldSelectedSourceKey(k)),
        setLinkFieldSelectedTargetKey: (k: string) => dispatch(setLinkFieldSelectedTargetKey(k)),
    }
}
