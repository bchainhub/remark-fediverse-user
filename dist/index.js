import { visit } from 'unist-util-visit';
const makeLinkNode = (url, text, title) => ({
    type: 'link',
    url,
    title: title || null,
    children: [{ type: 'text', value: text }],
});
const makeTextNode = (text) => ({
    type: 'text',
    value: text,
});
function isLinkNode(node) {
    return node.type === 'link';
}
function isTextNode(node) {
    return node.type === 'text';
}
export default function fediverseUser(options = {}) {
    return function transformer(ast) {
        if (options.checkPlain) {
            visit(ast, 'text', (node, index, parent) => {
                if (!parent || typeof index !== 'number')
                    return;
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
        }
        else {
            visit(ast, 'link', (node, index, parent) => {
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
                        node.url = `https://${domain}/@${username}`;
                        node.title = `@${username}`;
                        node.children = [{ type: 'text', value: `@${username}@${domain}` }];
                    }
                }
            });
        }
    };
}
