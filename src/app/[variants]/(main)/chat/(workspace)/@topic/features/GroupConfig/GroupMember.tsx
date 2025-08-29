'use client';

import { ActionIcon, Avatar, SortableList, Text, Tooltip } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { LoaderCircle, MessageSquare, UserMinus } from 'lucide-react';
import { memo, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { MemberSelectionModal } from '@/components/MemberSelectionModal';
import { DEFAULT_AVATAR } from '@/const/meta';
import { useChatStore } from '@/store/chat';
import { chatSelectors } from '@/store/chat/selectors';
import { useChatGroupStore } from '@/store/chatGroup';
import { useUserStore } from '@/store/user';
import { userProfileSelectors } from '@/store/user/selectors';
import { LobeSession } from '@/types/session';

import AgentSettings from '../../../features/AgentSettings';

const useStyles = createStyles(({ css, token }) => ({
  memberItem: css`
    cursor: pointer;

    width: 100%;
    padding: 8px;
    border-radius: ${token.borderRadius}px;

    transition: all 0.2s ease;

    &:hover {
      background: ${token.colorFillSecondary};
    }
  `,
}));

interface GroupMemberProps {
  addModalOpen: boolean;
  currentSession?: LobeSession;
  onAddModalOpenChange: (open: boolean) => void;
  sessionId?: string;
}

const GroupMember = memo<GroupMemberProps>(
  ({ currentSession, addModalOpen, onAddModalOpenChange, sessionId }) => {
    const { styles } = useStyles();
    const { t } = useTranslation('chat');

    const addAgentsToGroup = useChatGroupStore((s) => s.addAgentsToGroup);
    const removeAgentFromGroup = useChatGroupStore((s) => s.removeAgentFromGroup);
    const persistReorder = useChatGroupStore((s) => s.reorderGroupMembers);
    const toggleThread = useChatGroupStore((s) => s.toggleThread);
    const togglePortal = useChatStore((s) => s.togglePortal);

    const isSupervisorLoading = useChatStore(chatSelectors.isSupervisorLoading(sessionId || ''));

    const currentUser = useUserStore((s) => ({
      avatar: userProfileSelectors.userAvatar(s),
      name: userProfileSelectors.nickName(s),
    }));

    const [agentSettingsOpen, setAgentSettingsOpen] = useState(false);
    const [selectedAgentId, setSelectedAgentId] = useState<string | undefined>();

    const handleAddMembers = async (selectedAgents: string[]) => {
      if (!sessionId) {
        console.error('No active group to add members to');
        return;
      }
      await addAgentsToGroup(sessionId, selectedAgents);
      onAddModalOpenChange(false);
    };

    // TODO: fix type
    // @ts-ignore
    const initialMembers = useMemo(() => currentSession?.members ?? [], [currentSession?.members]);
    const [members, setMembers] = useState<any[]>(initialMembers);

    const [removingMemberIds, setRemovingMemberIds] = useState<string[]>([]);
    const [hoveredMemberId, setHoveredMemberId] = useState<string | null>(null);

    useEffect(() => {
      setMembers(initialMembers);
    }, [initialMembers]);

    const handleRemoveMember = async (memberId: string) => {
      if (!sessionId) return;

      setRemovingMemberIds((prev) => [...prev, memberId]);
      try {
        await removeAgentFromGroup(sessionId, memberId);
      } finally {
        setRemovingMemberIds((prev) => prev.filter((id) => id !== memberId));
      }
    };

    const handleMemberClick = (agentId: string) => {
      setSelectedAgentId(agentId);
      setAgentSettingsOpen(true);
    };

    const handleAgentSettingsClose = () => {
      setAgentSettingsOpen(false);
      setSelectedAgentId(undefined);
    };

    return (
      <>
        <Flexbox padding={6}>
          {/* Orchestrator */}
          <div className={styles.memberItem}>
            <Flexbox align={'center'} gap={8} horizontal>
              <div style={{ opacity: 0.3, pointerEvents: 'none' }}>
                <SortableList.DragHandle />
              </div>
              <Avatar avatar={'🎙️'} size={24} />
              <Flexbox flex={1}>
                <div
                  style={{
                    fontSize: '14px',
                    fontWeight: 500,
                  }}
                >
                  {t('groupSidebar.members.orchestrator')}
                </div>
              </Flexbox>
              {isSupervisorLoading && (
                <Flexbox gap={4} horizontal>
                  <Tooltip title={t('groupSidebar.members.orchestratorThinking')}>
                    <ActionIcon icon={LoaderCircle} size={14} spin />
                  </Tooltip>
                </Flexbox>
              )}
            </Flexbox>
          </div>

          {/* Current User */}
          <div className={styles.memberItem}>
            <Flexbox align={'center'} gap={8} horizontal>
              <div style={{ opacity: 0.3, pointerEvents: 'none' }}>
                <SortableList.DragHandle />
              </div>
              <Avatar avatar={currentUser.avatar} size={24} />
              <Flexbox flex={1}>
                <div>{currentUser.name}</div>
              </Flexbox>
            </Flexbox>
          </div>

          {members && members.length > 0 ? (
            <SortableList
              items={members}
              onChange={async (items: any[]) => {
                setMembers(items);
                if (!sessionId) return;
                const orderedIds = items.map((m) => m.id);
                persistReorder(sessionId, orderedIds).catch(() => {
                  console.error('Failed to persist reorder');
                });
              }}
              renderItem={(item: any) => (
                <SortableList.Item className={styles.memberItem} id={item.id}>
                  <Flexbox
                    align={'center'}
                    gap={8}
                    horizontal
                    justify={'space-between'}
                    onMouseEnter={() => setHoveredMemberId(item.id)}
                    onMouseLeave={() => setHoveredMemberId(null)}
                  >
                    <Flexbox
                      align={'center'}
                      gap={8}
                      horizontal
                      onClick={() => handleMemberClick(item.id)}
                      style={{ cursor: 'pointer', flex: '1 1 0', minWidth: 0 }}
                    >
                      <SortableList.DragHandle />
                      <Avatar
                        avatar={item.avatar || DEFAULT_AVATAR}
                        background={item.backgroundColor!}
                        size={24}
                      />
                      <div style={{ flex: '1 1 0', minWidth: 0, overflow: 'hidden' }}>
                        <Text ellipsis style={{ display: 'block' }}>
                          {item.title || t('defaultSession', { ns: 'common' })}
                        </Text>
                      </div>
                    </Flexbox>
                    {hoveredMemberId === item.id && (
                      <Flexbox gap={4} horizontal>
                        <ActionIcon
                          icon={MessageSquare}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleThread(item.id);
                            togglePortal(true);
                          }}
                          size={'small'}
                          title={t('dm.tooltip')}
                        />
                        <ActionIcon
                          danger
                          icon={UserMinus}
                          loading={removingMemberIds.includes(item.id)}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveMember(item.id);
                          }}
                          size={'small'}
                          title={t('groupSidebar.members.removeMember')}
                        />
                      </Flexbox>
                    )}
                  </Flexbox>
                </SortableList.Item>
              )}
              style={{ margin: 0 }}
            />
          ) : null}
        </Flexbox>

        <MemberSelectionModal
          // @ts-ignore
          // TODO: fix type
          existingMembers={currentSession?.members?.map((member: any) => member.id) || []}
          groupId={sessionId}
          mode="add"
          onCancel={() => onAddModalOpenChange(false)}
          onConfirm={handleAddMembers}
          open={addModalOpen}
        />

        <AgentSettings
          agentId={selectedAgentId}
          onClose={handleAgentSettingsClose}
          open={agentSettingsOpen}
        />
      </>
    );
  },
);

export default GroupMember;
