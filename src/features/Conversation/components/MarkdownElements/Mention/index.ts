import { MENTION_TAG } from '@/const/plugin';

import { createRemarkCustomTagPlugin } from '../remarkPlugins/createRemarkCustomTagPlugin';
import { MarkdownElement } from '../type';
import Component from './Render';

const Mention: MarkdownElement = {
  Component,
  remarkPlugin: createRemarkCustomTagPlugin(MENTION_TAG),
  scope: 'all',
  tag: MENTION_TAG,
};

export default Mention;
