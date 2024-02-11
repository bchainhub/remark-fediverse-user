import { Node } from 'unist';
import { visit } from 'unist-util-visit';

interface LinkNode extends Node {
  type: 'link';
  url: string;
  title: string | null;
  children: Array<TextNode>;
}

interface TextNode extends Node {
  type: 'text';
  value: string;
}

interface ParentNode extends Node {
  children: Array<Node>;
}

interface FediverseUserOptions {
  checkPlain?: boolean;
}

const makeLinkNode = (url: string, text: string, title?: string): LinkNode => ({
  type: 'link',
  url,
  title: title || null,
  children: [{ type: 'text', value: text }],
});

const makeTextNode = (text: string): TextNode => ({
  type: 'text',
  value: text,
});

function isLinkNode(node: Node): node is LinkNode {
  return node.type === 'link';
}

function isTextNode(node: Node): node is TextNode {
  return node.type === 'text';
}

export default function fediverseUser(options: FediverseUserOptions = {}): (ast: Node) => void {
  return function transformer(ast: Node): void {
    if (options.checkPlain) {
      visit<Node, 'text'>(ast, 'text', (node: TextNode, index: number, parent: ParentNode | undefined) => {
        if (!parent || typeof index !== 'number') return;

        const podPattern = /@([a-z0-9_-]+)@([\w.]+)/gi;
        const matches = [...node.value.matchAll(podPattern)];
        let newNodes = [];
        let lastIndex = 0;

        matches.forEach((match) => {
          const [fullMatch, username, domain] = match;
          const matchIndex = match.index ?? 0;

          if (matchIndex > lastIndex) {
            newNodes.push(makeTextNode(node.value.slice(lastIndex, matchIndex)));
          }

          newNodes.push(makeLinkNode(`https://${domain}/@${username}`, `@${username}@${domain}`, `@${username}`));
          lastIndex = matchIndex + fullMatch.length;
        });

        if (lastIndex < node.value.length) {
          newNodes.push(makeTextNode(node.value.slice(lastIndex)));
        }

        if (newNodes.length > 0) {
          parent.children.splice(index, 1, ...newNodes);
        }
      });
    } else {
      visit<Node, 'link'>(ast, 'link', (node: Node, index: number, parent: ParentNode | undefined) => {
        if (!isLinkNode(node) || !parent || typeof index !== 'number' || !node.url.startsWith('mailto:')) return;

        const prevNode = index > 0 ? parent.children[index - 1] : null;

        // Check if the link node has text children and the previous node ends with '@'
        if (prevNode && isTextNode(prevNode) && prevNode.value.endsWith('@') &&
            node.children.length > 0 && isTextNode(node.children[0])) {

          const emailMatch = node.children[0].value.match(/([a-z0-9_-]+)@([\w.]+)/i);
          if (emailMatch) {
            const username = emailMatch[1];
            const domain = emailMatch[2];

            // Remove the "@" from the end of the previous node's value
            prevNode.value = prevNode.value.slice(0, -1);

            // Remove the previous node if it's now empty
            if (prevNode.value === '') {
              parent.children.splice(index - 1, 1);
              // No need to adjust the index since we're not iterating in a loop here
            }

            // Transform the current node
            node.url = `https://${domain}/@${username}`;
            node.title = `@${username}`;
            node.children = [{ type: 'text', value: `@${username}@${domain}` }];
          }
        }
      });
    }
  };
}
