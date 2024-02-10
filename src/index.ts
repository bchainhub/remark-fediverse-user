import { Node } from 'unist';
import { visit } from 'unist-util-visit';

interface ParentNode extends Node {
  children: Node[];
}

interface LinkNode extends Node {
  type: 'link';
  url: string;
  title: string | null;
  children: Array<{ type: 'text'; value: string }>;
}

interface TextNode extends Node {
  type: 'text';
  value: string;
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

function isTextNode(node: Node): node is TextNode {
  return node.type === 'text';
}

export default function fediverseUser(): (ast: Node) => void {
  const transformer = (ast: Node): void => {
    visit(ast, 'text', (node, index, parent) => {
      // Assuming node is of type Node, but we specifically work with TextNode in this context
      if (!isTextNode(node) || !parent || typeof index !== 'number') return;
      const parentNode: ParentNode = parent as ParentNode;
      let prevNode: TextNode | undefined = index > 0 && isTextNode(parentNode.children[index - 1]) ? (parentNode.children[index - 1] as TextNode) : undefined;
      let nextNode: TextNode | undefined = index + 1 < parentNode.children.length && isTextNode(parentNode.children[index + 1]) ? (parentNode.children[index + 1] as TextNode) : undefined;

      if (prevNode && prevNode.value.endsWith('[@') && nextNode && nextNode.value.startsWith(']')) {
        // Extract username and domain from the current node's value
        let nodeValue = (node as TextNode).value;
        if ((node as LinkNode).type === 'link' && (node as LinkNode).children.length > 0 && isTextNode((node as LinkNode).children[0])) {
          nodeValue = ((node as LinkNode).children[0] as TextNode).value;
        }
        const match = nodeValue.match(/([a-z0-9_-]+)@([\w.]+)/i);
        if (match) {
          const [username, domain] = match;
          // Create a new link node replacing the current node
          parentNode.children[index] = makeLinkNode(`https://${domain}/@${username}`, `@${username}@${domain}`);
          // Adjust surrounding nodes as necessary
          prevNode.value = prevNode.value.slice(0, -2);
          nextNode.value = nextNode.value.substring(1);
          if (nextNode.value === '') {
            parentNode.children.splice(index + 1, 1); // Remove the next node if it's empty
          }
        }
      } else {
        // Handle mention contained within a single node
        const podPattern = /\[@([a-z0-9_-]+)@([\w.]+)\]/gi;
        const matches = [...(node as TextNode).value.matchAll(podPattern)];
        let newNodes = [];
        let lastIndex = 0;
        matches.forEach((match) => {
            const [fullMatch, username, domain] = match;
            const matchIndex = match.index ?? 0;
            if (matchIndex > lastIndex) {
              newNodes.push(makeTextNode((node as TextNode).value.slice(lastIndex, matchIndex)));
            }
            newNodes.push(makeLinkNode(`https://${domain}/@${username}`, `@${username}@${domain}`));
            lastIndex = matchIndex + fullMatch.length;
        });
        if (lastIndex < (node as TextNode).value.length) {
          newNodes.push(makeTextNode((node as TextNode).value.slice(lastIndex)));
        }
        if (newNodes.length > 0) {
          parentNode.children.splice(index, 1, ...newNodes);
        }
      }
    });
  };
  return transformer;
}
