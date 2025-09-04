'use client';

import { Alert } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { memo } from 'react';

import ChatItem from '@/components/ChatItem/ChatItem';
import { ChatMessage } from '@/types/message';

const useStyles = createStyles(({ css, token }) => ({
  alertContent: css`
    .ant-alert {
      border: 1px solid ${token.colorErrorBorder};
      border-radius: ${token.borderRadiusLG}px;
      background: ${token.colorErrorBg};

      .ant-alert-icon {
        font-size: 18px;
        color: ${token.colorError};
      }

      .ant-alert-message {
        margin-block-end: ${token.marginXS}px;
        font-weight: ${token.fontWeightStrong};
        color: ${token.colorErrorText};
      }

      .ant-alert-description {
        color: ${token.colorErrorText};

        // Style markdown content
        strong {
          font-weight: ${token.fontWeightStrong};
        }

        em {
          font-style: italic;
        }
      }
    }
  `,
}));

export interface SupervisorMessageProps {
  message: ChatMessage;
}

const SupervisorMessage = memo<SupervisorMessageProps>(({ message }) => {
  const { styles } = useStyles();

  // Extract title and content from supervisor message
  const title = message.meta?.title || 'Supervisor';
  const avatar = message.meta?.avatar || '🎤'; // Use microphone emoji as default
  const content = message.content;

  // Simple markdown parsing for display
  const formattedContent = content
    .replaceAll(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold text
    .replaceAll('\n\n', '<br/><br/>') // Double line breaks
    .replaceAll('\n', '<br/>'); // Single line breaks

  // Create custom message content using Alert component
  const supervisorMessageContent = (
    <div className={styles.alertContent}>
      <Alert
        closable={false}
        description={<div dangerouslySetInnerHTML={{ __html: formattedContent }} />}
        showIcon
        type="error"
      />
    </div>
  );

  return (
    <ChatItem
      avatar={{
        avatar: avatar,
        title: title,
      }}
      loading={false}
      message={content}
      placement="left"
      primary={false}
      renderMessage={() => supervisorMessageContent}
      showTitle={true}
      time={message.updatedAt || message.createdAt}
      variant="bubble"
    />
  );
});

SupervisorMessage.displayName = 'SupervisorMessage';

export default SupervisorMessage;
