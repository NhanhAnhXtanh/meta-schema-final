import { configureStore, Reducer, UnknownAction } from '@reduxjs/toolkit';
import undoable, { excludeAction, StateWithHistory } from 'redux-undo';
import schemaReducer, { SchemaState } from './slices/schemaSlice';
import uiReducer from './slices/uiSlice';
import jmixReducer from '../bridge/jmixSlice';
import { jmixMiddlewares } from '../bridge/middleware';

export const store = configureStore({
    reducer: {
        jmix: jmixReducer,
        schema: undoable(schemaReducer, {
            limit: 50,
            filter: excludeAction([
                'schema/onNodesChange',
                'schema/onEdgesChange',
                'schema/setNodes',
                'schema/setEdges'
            ])
        }) as Reducer<StateWithHistory<SchemaState>, UnknownAction>,
        ui: uiReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['schema/onNodesChange', 'schema/onEdgesChange'],
            },
        }).concat(...jmixMiddlewares),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

declare module 'react-redux' {
    interface DefaultRootState extends RootState { }
}
