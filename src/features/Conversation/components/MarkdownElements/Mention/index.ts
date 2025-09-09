import Render from './Render';
import { createRemarkCustomTagPlugin } from '../remarkPlugins/createRemarkCustomTagPlugin';
import { MarkdownElement } from '../type';

const Mention: MarkdownElement = {
  Component: Render,
  remarkPlugin: createRemarkCustomTagPlugin('mention'),
  tag: 'mention',
};

export default Mention;