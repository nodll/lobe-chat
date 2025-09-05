'use client';

import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import ChatItem from '@/components/ChatItem/ChatItem';
import { LOADING_FLAT } from '@/const/message';
import { DEFAULT_ORCHESTRATOR_AVATAR } from '@/const/meta';
import { ChatMessage } from '@/types/message';

export interface SupervisorMessageProps {
  message: ChatMessage;
}

const SupervisorMessage = memo<SupervisorMessageProps>(({ message }) => {
  const { t } = useTranslation('chat');

  return (
    <ChatItem
      avatar={{
        avatar: DEFAULT_ORCHESTRATOR_AVATAR,
        title: t('groupSidebar.members.orchestrator'),
      }}
      error={{
        message: 'Host Error: ' + message.error?.message,
        type: 'error',
      }}
      loading={false}
      message={LOADING_FLAT}
      placement="left"
      primary={false}
      showTitle={true}
      time={message.updatedAt || message.createdAt}
      variant="bubble"
    />
  );
});

SupervisorMessage.displayName = 'SupervisorMessage';

export default SupervisorMessage;
