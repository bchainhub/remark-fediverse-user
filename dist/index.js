import { visit } from 'unist-util-visit';
function isLinkNode(node) {
    return node.type === 'link';
}
function isTextNode(node) {
    return node.type === 'text';
}
export default function remarkFediverseUser(options = {}) {
    return function transformer(ast) {
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
    };
}
