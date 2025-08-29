'use client';

import { ActionIcon, ScrollShadow, Tabs } from '@lobehub/ui';
import isEqual from 'fast-deep-equal';
import { Edit, UserPlus } from 'lucide-react';
import { MouseEvent, memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import SidebarHeader from '@/components/SidebarHeader';
import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';
import { useSessionStore } from '@/store/session';
import { sessionSelectors } from '@/store/session/slices/session/selectors';

import GroupMember from './GroupMember';
import GroupRole from './GroupRole';
import { useStyles } from './style';

const GroupChatSidebar = memo(() => {
  const { styles, cx } = useStyles();
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editorModalOpen, setEditorModalOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('members');
  const { t } = useTranslation(['chat', 'common']);

  const [sessionId] = useSessionStore((s) => [s.activeId]);
  const currentSession = useSessionStore(sessionSelectors.currentSession, isEqual);

  const [expanded, toggleAgentSystemRoleExpand] = useGlobalStore((s) => [
    systemStatusSelectors.getAgentSystemRoleExpanded(sessionId)(s),
    s.toggleAgentSystemRoleExpand,
  ]);

  const toggleExpanded = () => {
    toggleAgentSystemRoleExpand(sessionId);
  };

  const handleAddMember = (e: MouseEvent) => {
    e.stopPropagation();
    setAddModalOpen(true);
  };

  const handleOpenWithEdit = (e: MouseEvent) => {
    e.stopPropagation();
    setEditing(true);
    setEditorModalOpen(true);
  };

  return (
    <Flexbox height={'fit-content'}>
      <SidebarHeader
        actions={
          activeTab === 'members' ? (
            <ActionIcon
              icon={UserPlus}
              onClick={handleAddMember}
              size={'small'}
              title={t('groupSidebar.members.addMember')}
            />
          ) : (
            <ActionIcon
              icon={Edit}
              onClick={handleOpenWithEdit}
              size={'small'}
              title={t('edit', { ns: 'common' })}
            />
          )
        }
        onClick={toggleExpanded}
        style={{ paddingBlock: 0, paddingLeft: 0 }}
        title={
          <Tabs
            activeKey={activeTab}
            compact
            items={[
              {
                key: 'members',
                label: t('groupSidebar.tabs.members'),
              },
              {
                key: 'role',
                label: t('groupSidebar.tabs.role'),
              },
            ]}
            onChange={(key) => setActiveTab(key)}
            onClick={(e) => {
              e.stopPropagation();
            }}
            size="small"
            variant="rounded"
          />
        }
      />
      <ScrollShadow
        className={cx(styles.promptBox, styles.animatedContainer)}
        size={12}
        style={{
          maxHeight: expanded ? (activeTab === 'members' ? '40vh' : 200) : 0,
          minHeight: expanded ? 232 : 0,
          opacity: expanded ? 1 : 0,
          paddingBottom: 16,
          transition: 'all 0.3s ease',
        }}
      >
        {activeTab === 'members' && (
          <GroupMember
            addModalOpen={addModalOpen}
            currentSession={currentSession}
            onAddModalOpenChange={setAddModalOpen}
            sessionId={sessionId}
          />
        )}
        {activeTab === 'role' && (
          <GroupRole
            currentSession={currentSession}
            editing={editing}
            editorModalOpen={editorModalOpen}
            setEditing={setEditing}
            setEditorModalOpen={setEditorModalOpen}
          />
        )}
      </ScrollShadow>
    </Flexbox>
  );
});

export default GroupChatSidebar;
