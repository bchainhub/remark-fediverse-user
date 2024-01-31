import { Node, Literal } from 'unist';
import { visit } from 'unist-util-visit';

interface LinkNode extends Node {
  type: 'link';
  url: string;
  title: string | undefined;
  children: Array<Literal>;
}

export default function fediverseHandles(): (ast: Node) => void {

  const transformer = async (ast: Node) => {
    visit(ast, 'text', (node: any, index: number | undefined, parent: any) => {

      if (!parent || typeof index !== 'number') return;
      const podPattern = /\(@([a-z0-9_-]+)@([\w.]+)\)/gi;

      // Function to make link node
      const makeLinkNode = (url: string, text: string, title?: string): LinkNode => {
        return {
          type: 'link',
          url: url,
          title: title || undefined,
          children: [{ type: 'text', value: text }],
        };
      };

      // Function to make text node
      const makeTextNode = (text: string): Literal => {
        return {
          type: 'text',
          value: text,
        };
      };

      // Define new Node
      let newNodes: Node[] = [];
      let lastIndex = 0;

      // Replace Fediverse Pod pattern
      node.value.replace(podPattern, (
        match: string,
        username: string,
        domain: string,
        offset: number
      ) => {
        // Add text before the match
        if (offset > lastIndex) {
          newNodes.push(makeTextNode(node.value.slice(lastIndex, offset)));
        }

        // Add the link node for the match
        newNodes.push(makeLinkNode(`https://${domain}/@${username}`, `@${username}@${domain}`, `@${username}`));
        lastIndex = offset + match.length;
      });

      // After processing all matches, check if there is remaining text to add
      if (lastIndex < node.value.length) {
        newNodes.push(makeTextNode(node.value.slice(lastIndex)));
      }

      // Replace the original node with the new nodes
      parent.children.splice(index, 1, ...newNodes);
      return;

    });
  }
  return transformer;
}
