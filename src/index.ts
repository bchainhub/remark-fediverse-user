import { Node, Literal } from 'unist';
import { visit } from 'unist-util-visit';

interface LinkNode extends Node {
  type: 'link';
  url: string;
  title: string | undefined;
  children: Array<Literal>;
}

export default function fediverseUser(): (ast: Node) => void {
  const transformer = async (ast: Node) => {
    visit(ast, 'text', (node: any, index: number | undefined, parent: any) => {
      if (!parent || typeof index !== 'number') return;
      const podPattern = /<@([a-z0-9_-]+)@([\w.]+)>/gi;

      let prevNode = index > 0 ? parent.children[index - 1] : null;
      let fullText = (prevNode && prevNode.type === 'text' && prevNode.value.endsWith('<@'))
          ? prevNode.value + node.value
          : node.value;

      let newNodes: Node[] = [];
      let lastIndex = 0;

      fullText.replace(podPattern, (
        match: string,
        username: string,
        domain: string,
        offset: number
      ) => {
        if (offset > lastIndex) {
          newNodes.push(makeTextNode(fullText.slice(lastIndex, offset)));
        }
        newNodes.push(makeLinkNode(`https://${domain}/@${username}`, `@${username}@${domain}`, `@${username}`));
        lastIndex = offset + match.length;
      });

      if (lastIndex < fullText.length) {
        newNodes.push(makeTextNode(fullText.slice(lastIndex)));
      }

      if (prevNode && prevNode.type === 'text' && prevNode.value.endsWith('@')) {
        parent.children.splice(index - 1, 2, ...newNodes);
      } else {
        parent.children.splice(index, 1, ...newNodes);
      }
    });
  };

  const makeLinkNode = (url: string, text: string, title?: string): LinkNode => {
    return {
      type: 'link',
      url: url,
      title: title || undefined,
      children: [{ type: 'text', value: text }],
    };
  }

  const makeTextNode = (text: string): Literal => {
    return {
      type: 'text',
      value: text,
    };
  }

  return transformer;
}
