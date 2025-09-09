'use client';

import { Avatar } from '@lobehub/ui';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import isEqual from 'fast-deep-equal';

import { DEFAULT_AVATAR } from '@/const/meta';
import { useSessionStore } from '@/store/session';
import { sessionSelectors } from '@/store/session/selectors';
import { MarkdownElementProps } from '../type';
import { createStyles } from 'antd-style';

const useStyles = createStyles(({ css, token }) => ({
  mention: css`
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 6px;
    background: ${token.colorFillSecondary};
    border-radius: ${token.borderRadiusSM}px;
    font-size: ${token.fontSizeSM}px;
    color: ${token.colorTextSecondary};
    text-decoration: none;
    vertical-align: middle;
    
    &:hover {
      background: ${token.colorFillTertiary};
    }
  `,
}));

interface MentionProps extends MarkdownElementProps {
  node: {
    properties: {
      id?: string;
    };
  };
}

const Render = memo<MentionProps>(({ children, node }) => {
  const { t } = useTranslation('chat');
  const { styles } = useStyles();
  const mentionId = node.properties.id;
  
  const currentGroupMembers = useSessionStore(sessionSelectors.currentGroupAgents, isEqual);

  // Handle "ALL_MEMBERS" special case
  if (mentionId === 'ALL_MEMBERS') {
    return (
      <span className={styles.mention}>
        <Avatar size={16} />
        {t('memberSelection.allMembers')}
      </span>
    );
  }

  // Find the specific member
  const member = currentGroupMembers?.find((m) => m.id === mentionId);
  
  if (!member) {
    // Fallback for unknown member
    return (
      <span className={styles.mention}>
        <Avatar size={16} />
        {children || '@unknown'}
      </span>
    );
  }

  return (
    <span className={styles.mention}>
      <Avatar 
        avatar={member.avatar || DEFAULT_AVATAR}
        background={member.backgroundColor ?? undefined}
        size={16}
      />
      {member.title || children}
    </span>
  );
});

Render.displayName = 'MentionRender';

export default Render;