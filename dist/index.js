import { visit } from 'unist-util-visit';
const extractMatches = (text, regex) => {
    const matches = [];
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
const makeLinkNode = (url, text, title) => ({
    type: 'link',
    url,
    title: title || null,
    children: [{
            type: 'text',
            value: text,
        }],
});
const makeTextNode = (value) => ({
    type: 'text',
    value,
});
const isTextNode = (node) => {
    return node.type === 'text';
};
const isLinkNode = (node) => {
    return node.type === 'link';
};
export default function remarkFediverseUser(options = {}) {
    const finalOptions = {
        checkText: true,
        protocol: 'https',
        ...options,
    };
    const transformer = (tree) => {
        if (finalOptions.checkText) {
            const replacements = [];
            visit(tree, 'text', (node, index, parent) => {
                if (!isTextNode(node) || !parent || typeof index !== 'number')
                    return;
                const regex = /@([a-z0-9_-]+)@([\w.]+)/gi;
                const matches = extractMatches(node.value, regex);
                if (matches.length === 0)
                    return;
                let newNodes = [];
                let lastIndex = 0;
                matches.forEach(({ fullMatch, username, domain, start }) => {
                    if (start > lastIndex) {
                        newNodes.push(makeTextNode(node.value.slice(lastIndex, start)));
                    }
                    const url = `${finalOptions.protocol}://${domain}/@${username}`;
                    newNodes.push(makeLinkNode(url, `@${username}@${domain}`, `@${username}`));
                    lastIndex = start + fullMatch.length;
                });
                if (lastIndex < node.value.length) {
                    newNodes.push(makeTextNode(node.value.slice(lastIndex)));
                }
                replacements.push({ parent, index, newNodes });
            });
            for (const { parent, index, newNodes } of replacements) {
                parent.children.splice(index, 1, ...newNodes);
            }
        }
        visit(tree, 'link', (node, index, parent) => {
            if (!isLinkNode(node) || !parent || typeof index !== 'number' || !node.url.startsWith('mailto:'))
                return;
            const prevNode = index > 0 ? parent.children[index - 1] : null;
            if (prevNode && isTextNode(prevNode) && prevNode.value.endsWith('@') &&
                node.children.length > 0 && isTextNode(node.children[0])) {
                const emailMatch = node.children[0].value.match(/([a-z0-9_-]+)@([\w.]+)/i);
                if (emailMatch) {
                    const username = emailMatch[1];
                    const domain = emailMatch[2];
                    prevNode.value = prevNode.value.slice(0, -1);
                    if (prevNode.value === '') {
                        parent.children.splice(index - 1, 1);
                    }
                    node.url = `${finalOptions.protocol}://${domain}/@${username}`;
                    node.title = `@${username}`;
                    node.children = [{ type: 'text', value: `@${username}@${domain}` }];
                }
            }
        });
    };
    return transformer;
}
