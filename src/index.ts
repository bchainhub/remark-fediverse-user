import { type Node } from 'unist';
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

function isLinkNode(node: Node): node is LinkNode {
  return node.type === 'link';
}

function isTextNode(node: Node): node is TextNode {
  return node.type === 'text';
}

/**
 * A remark plugin to parse the email links prefixed with `@` and transform them to fediverse link.
 * @param options - Options for the Fediverse plugin.
 * @returns A transformer for the AST.
 */
export default function remarkFediverseUser(options: FediverseUserOptions = {}): (ast: Node) => void {
  return function transformer(ast: Node): void {
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
  };
}
