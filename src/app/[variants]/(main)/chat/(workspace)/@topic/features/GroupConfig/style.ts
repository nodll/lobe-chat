import { createStyles } from 'antd-style';

export const useStyles = createStyles(({ css, token }) => ({
  animatedContainer: css`
    transition:
      height 0.3s ease,
      opacity 0.3s ease;
  `,
  memberItem: css`
    cursor: pointer;

    display: flex;
    flex-direction: row;
    gap: 4px;
    align-items: center;

    width: 100%;
    padding: 8px;
    border-radius: ${token.borderRadius}px;

    transition: all 0.2s ease;

    .show-on-hover {
      opacity: 0;
    }

    &:hover {
      background: ${token.colorFillSecondary};

      .show-on-hover {
        opacity: 1;
      }
    }
  `,
  prompt: css`
    opacity: 0.75;
    transition: opacity 200ms ${token.motionEaseOut};

    &:hover {
      opacity: 1;
    }
  `,
  promptBox: css`
    position: relative;
    border-block-end: 1px solid ${token.colorBorderSecondary};
  `,
}));
