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
function isTextNode(node) {
    return node.type === 'text';
}
export default function fediverseUser() {
    const transformer = (ast) => {
        visit(ast, 'text', (node, index, parent) => {
            if (!isTextNode(node) || !parent || typeof index !== 'number')
                return;
            const parentNode = parent;
            let prevNode = index > 0 && isTextNode(parentNode.children[index - 1]) ? parentNode.children[index - 1] : undefined;
            let nextNode = index + 1 < parentNode.children.length && isTextNode(parentNode.children[index + 1]) ? parentNode.children[index + 1] : undefined;
            if (prevNode && prevNode.value.endsWith('[@') && nextNode && nextNode.value.startsWith(']')) {
                let nodeValue = node.value;
                if (node.type === 'link' && node.children.length > 0 && isTextNode(node.children[0])) {
                    nodeValue = node.children[0].value;
                }
                const match = nodeValue.match(/([a-z0-9_-]+)@([\w.]+)/i);
                if (match) {
                    const [username, domain] = match;
                    parentNode.children[index] = makeLinkNode(`https://${domain}/@${username}`, `@${username}@${domain}`);
                    prevNode.value = prevNode.value.slice(0, -2);
                    nextNode.value = nextNode.value.substring(1);
                    if (nextNode.value === '') {
                        parentNode.children.splice(index + 1, 1);
                    }
                }
            }
            else {
                const podPattern = /\[@([a-z0-9_-]+)@([\w.]+)\]/gi;
                const matches = [...node.value.matchAll(podPattern)];
                let newNodes = [];
                let lastIndex = 0;
                matches.forEach((match) => {
                    const [fullMatch, username, domain] = match;
                    const matchIndex = match.index ?? 0;
                    if (matchIndex > lastIndex) {
                        newNodes.push(makeTextNode(node.value.slice(lastIndex, matchIndex)));
                    }
                    newNodes.push(makeLinkNode(`https://${domain}/@${username}`, `@${username}@${domain}`));
                    lastIndex = matchIndex + fullMatch.length;
                });
                if (lastIndex < node.value.length) {
                    newNodes.push(makeTextNode(node.value.slice(lastIndex)));
                }
                if (newNodes.length > 0) {
                    parentNode.children.splice(index, 1, ...newNodes);
                }
            }
        });
    };
    return transformer;
}
