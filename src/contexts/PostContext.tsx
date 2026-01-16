import { createContext, useContext } from 'react';
import type { BridgeMsg } from '@/bridge/bridge-core';

export const PostContext = createContext<((msg: BridgeMsg) => void) | null>(null);

export const usePost = () => {
  const post = useContext(PostContext);
  if (!post) {
    throw new Error('usePost must be used within PostContext.Provider');
  }
  return post;
};
