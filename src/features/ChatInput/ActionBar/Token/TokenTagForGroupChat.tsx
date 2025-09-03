import { groupSupervisorPrompts } from '@lobechat/prompts';
import { Tooltip } from '@lobehub/ui';
import { TokenTag } from '@lobehub/ui/chat';
import { useTheme } from 'antd-style';
import numeral from 'numeral';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Center, Flexbox } from 'react-layout-kit';

import { useModelContextWindowTokens } from '@/hooks/useModelContextWindowTokens';
import { useModelSupportToolUse } from '@/hooks/useModelSupportToolUse';
import { useTokenCount } from '@/hooks/useTokenCount';
import { groupChatPrompts } from '@/prompts/groupChat';
import { useAgentStore } from '@/store/agent';
import { agentChatConfigSelectors, agentSelectors } from '@/store/agent/selectors';
import { useChatStore } from '@/store/chat';
import { chatSelectors } from '@/store/chat/selectors';
import { chatGroupSelectors } from '@/store/chatGroup/selectors';
import { useChatGroupStore } from '@/store/chatGroup/store';
import { useSessionStore } from '@/store/session';
import { sessionSelectors } from '@/store/session/selectors';
import { useToolStore } from '@/store/tool';
import { toolSelectors } from '@/store/tool/selectors';
import { userProfileSelectors } from '@/store/user/selectors';
import { getUserStoreState } from '@/store/user/store';

import ActionPopover from '../components/ActionPopover';
import TokenProgress from './TokenProgress';

interface TokenTagForGroupChatProps {
  total: string;
}

const TokenTagForGroupChat = memo<TokenTagForGroupChatProps>(({ total: messageString }) => {
  const { t } = useTranslation(['chat', 'components']);
  const theme = useTheme();

  const input = useChatStore((s) => s.inputMessage);

  const [systemRole, model, provider] = useAgentStore((s) => {
    return [
      agentSelectors.currentAgentSystemRole(s),
      agentSelectors.currentAgentModel(s) as string,
      agentSelectors.currentAgentModelProvider(s) as string,
      // add these two params to enable the component to re-render
      agentChatConfigSelectors.historyCount(s),
      agentChatConfigSelectors.enableHistoryCount(s),
    ];
  });

  // Group chat specific data
  const groupAgents = useSessionStore(sessionSelectors.currentGroupAgents);
  const groupConfig = useChatGroupStore(chatGroupSelectors.currentGroupConfig);

  const [historyCount, enableHistoryCount] = useAgentStore((s) => [
    agentChatConfigSelectors.historyCount(s),
    agentChatConfigSelectors.enableHistoryCount(s),
  ]);

  const maxTokens = useModelContextWindowTokens(model, provider);

  // Tool usage token
  const canUseTool = useModelSupportToolUse(model, provider);
  const plugins = useAgentStore(agentSelectors.currentAgentPlugins);
  const toolsString = useToolStore((s) => {
    const pluginSystemRoles = toolSelectors.enabledSystemRoles(plugins)(s);
    const schemaNumber = toolSelectors
      .enabledSchema(plugins)(s)
      .map((i) => JSON.stringify(i))
      .join('');

    return pluginSystemRoles + schemaNumber;
  });
  const toolsToken = useTokenCount(canUseTool ? toolsString : '');

  // Supervisor token calculation for group chat
  const supervisorPrompt = useMemo(() => {
    if (!groupAgents || groupAgents.length === 0) {
      return '';
    }

    try {
      const chats = chatSelectors.mainAIChatsWithHistoryConfig(useChatStore.getState());

      // Only calculate supervisor tokens if there are actual messages in the conversation
      if (!chats || chats.length === 0) {
        return '';
      }

      const conversationHistory = groupSupervisorPrompts(chats);

      // Get real user name from user store
      const userStoreState = getUserStoreState();
      const realUserName = userProfileSelectors.nickName(userStoreState) || 'User';

      return groupChatPrompts.buildSupervisorPrompt({
        availableAgents: groupAgents
          .filter((agent) => agent.id)
          .map((agent) => ({ id: agent.id!, title: agent.title })),
        conversationHistory,
        systemPrompt: groupConfig.systemPrompt,
        userName: realUserName,
      });
    } catch (error) {
      console.warn('Failed to calculate supervisor tokens:', error);
      return '';
    }
  }, [groupAgents, groupConfig.systemPrompt, messageString, historyCount, enableHistoryCount]);

  const supervisorToken = useTokenCount(supervisorPrompt);

  // Chat usage token
  const inputTokenCount = useTokenCount(input);

  const chatsString = useMemo(() => {
    const chats = chatSelectors.mainAIChatsWithHistoryConfig(useChatStore.getState());
    return chats.map((chat) => chat.content).join('');
  }, [messageString, historyCount, enableHistoryCount]);

  const chatsToken = useTokenCount(chatsString) + inputTokenCount;

  // SystemRole token
  const systemRoleToken = useTokenCount(systemRole);

  // Total token (include supervisor tokens for group chat)
  const totalToken = systemRoleToken + toolsToken + chatsToken + supervisorToken;

  const content = (
    <Flexbox gap={12} style={{ minWidth: 200 }}>
      <Flexbox align={'center'} gap={4} horizontal justify={'space-between'} width={'100%'}>
        <div style={{ color: theme.colorTextDescription }}>{t('tokenDetails.title')}</div>
        <Tooltip
          styles={{ root: { maxWidth: 'unset', pointerEvents: 'none' } }}
          title={t('ModelSelect.featureTag.tokens', {
            ns: 'components',
            tokens: numeral(maxTokens).format('0,0'),
          })}
        >
          <Center
            height={20}
            paddingInline={4}
            style={{
              background: theme.colorFillTertiary,
              borderRadius: 4,
              color: theme.colorTextSecondary,
              fontFamily: theme.fontFamilyCode,
              fontSize: 11,
            }}
          >
            TOKEN
          </Center>
        </Tooltip>
      </Flexbox>
      <TokenProgress
        data={[
          {
            color: theme.magenta,
            id: 'systemRole',
            title: t('tokenDetails.systemRole'),
            value: systemRoleToken,
          },
          {
            color: theme.geekblue,
            id: 'tools',
            title: t('tokenDetails.tools'),
            value: toolsToken,
          },
          ...(supervisorToken > 0
            ? [
                {
                  color: theme.purple,
                  id: 'supervisor',
                  title: t('tokenDetails.supervisor'),
                  value: supervisorToken,
                },
              ]
            : []),
          {
            color: theme.gold,
            id: 'chats',
            title: t('tokenDetails.chats'),
            value: chatsToken,
          },
        ]}
        showIcon
      />
      <TokenProgress
        data={[
          {
            color: theme.colorSuccess,
            id: 'used',
            title: t('tokenDetails.used'),
            value: totalToken,
          },
          {
            color: theme.colorFill,
            id: 'rest',
            title: t('tokenDetails.rest'),
            value: maxTokens - totalToken,
          },
        ]}
        showIcon
        showTotal={t('tokenDetails.total')}
      />
    </Flexbox>
  );

  return (
    <ActionPopover content={content}>
      <TokenTag
        maxValue={maxTokens}
        mode={'used'}
        style={{ marginLeft: 8 }}
        text={{
          overload: t('tokenTag.overload'),
          remained: t('tokenTag.remained'),
          used: t('tokenTag.used'),
        }}
        value={totalToken}
      />
    </ActionPopover>
  );
});

TokenTagForGroupChat.displayName = 'TokenTagForGroupChat';

export default TokenTagForGroupChat;
