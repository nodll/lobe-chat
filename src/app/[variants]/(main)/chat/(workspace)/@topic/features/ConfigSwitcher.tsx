'use client';

import { memo } from 'react';

import { useSessionStore } from '@/store/session';
import { sessionSelectors } from '@/store/session/selectors';

import GroupConfig from './GroupConfig';
import SystemRole from './SystemRole';

const SidebarSelector = memo(() => {
  const isGroupSession = useSessionStore(sessionSelectors.isCurrentSessionGroupSession);
  const ConfigRender = isGroupSession ? GroupConfig : SystemRole;

  return <ConfigRender />;
});

SidebarSelector.displayName = 'SidebarSelector';

export default SidebarSelector;
