'use client';

import { memo } from 'react';

import { useSessionStore } from '@/store/session';
import { sessionSelectors } from '@/store/session/selectors';

import ClassicChatInput from './ClassicChat';
import GroupChatInput from './GroupChat';

const Desktop = memo(() => {
  const isGroupSession = useSessionStore(sessionSelectors.isCurrentSessionGroupSession);

  return isGroupSession ? <GroupChatInput /> : <ClassicChatInput />;
});

export default Desktop;
