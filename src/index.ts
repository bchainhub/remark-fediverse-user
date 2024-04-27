import { Link, Node, Parent, Root, RootContent, Text } from 'mdast';
import { visit } from 'unist-util-visit';

interface FediverseUserOptions {
  checkText?: boolean;
  protocol?: string;
}

interface Match {
  fullMatch: string;
  username: string;
  domain: string;
  start: number;
}

const extractMatches = (text: string, regex: RegExp): Match[] => {
  const matches: Match[] = [];
  for (const match of text.matchAll(regex)) {
    matches.push({
      fullMatch: match[0],
      username: match[1],
      domain: match[2],
      start: match.index || 0,
    });
  }
  return matches;
};

const makeLinkNode = (url: string, text: string, title?: string): Link => ({
  type: 'link',
  url,
  title: title || null,
  children: [{
    type: 'text',
    value: text,
  }],
});

const makeTextNode = (value: string): Text => ({
  type: 'text',
  value,
});

const isTextNode = (node: Node): node is Text => {
  return node.type === 'text';
}

const isLinkNode = (node: Node): node is Link => {
  return node.type === 'link';
}

export default function remarkFediverseUser(options: FediverseUserOptions = {}): (ast: Root) => void {
  const finalOptions = {
    checkText: true, // Check the text node
    protocol: 'https', // The protocol to use for the link
    ...options,
  };

  const transformer = (tree: Root): void => {
    if (finalOptions.checkText) {
      const replacements: { parent: Parent; index: number; newNodes: RootContent[] }[] = [];

      visit(tree, 'text', (node: Text, index: number | undefined, parent: Parent | undefined) => {
        if (!isTextNode(node) || !parent || typeof index !== 'number') return;

        const regex = /@([a-z0-9_-]+)@([\w.]+)/gi;
        const matches = extractMatches(node.value, regex);
        if (matches.length === 0) return;

        let newNodes: RootContent[] = [];
        let lastIndex = 0;

        // Iterate over the matches and create new nodes
        matches.forEach(({ fullMatch, username, domain, start }) => {
          // Add the text before the match
          if (start > lastIndex) {
            newNodes.push(makeTextNode(node.value.slice(lastIndex, start)));
          }
          const url = `${finalOptions.protocol}://${domain}/@${username}`;
          // Add the link node
          newNodes.push(makeLinkNode(url, `@${username}@${domain}`, `@${username}`));
          lastIndex = start + fullMatch.length;
        });

        // Add the text after the last match
        if (lastIndex < node.value.length) {
          newNodes.push(makeTextNode(node.value.slice(lastIndex)));
        }

        replacements.push({ parent, index, newNodes });
      });

      // Apply all replacements
      for (const { parent, index, newNodes } of replacements) {
        parent.children.splice(index, 1, ...newNodes);
      }
    }

    visit(tree, 'link', (node: Link, index: number | undefined, parent: Parent | undefined) => {
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
          node.url = `${finalOptions.protocol}://${domain}/@${username}`;
          node.title = `@${username}`;
          node.children = [{ type: 'text', value: `@${username}@${domain}` }];
        }
      }
    });
  };

  return transformer;
}
