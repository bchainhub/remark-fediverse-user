import { visit } from 'unist-util-visit';
export default function fediverseUser() {
    const transformer = async (ast) => {
        visit(ast, 'text', (node, index, parent) => {
            if (!parent || typeof index !== 'number')
                return;
            const podPattern = /<@([a-z0-9_-]+)@([\w.]+)>/gi;
            let prevNode = index > 0 ? parent.children[index - 1] : null;
            let fullText = (prevNode && prevNode.type === 'text' && prevNode.value.endsWith('<@'))
                ? prevNode.value + node.value
                : node.value;
            let newNodes = [];
            let lastIndex = 0;
            fullText.replace(podPattern, (match, username, domain, offset) => {
                if (offset > lastIndex) { // Add text before the match
                    newNodes.push(makeTextNode(fullText.slice(lastIndex, offset)));
                }
                newNodes.push(makeLinkNode(`https://${domain}/@${username}`, `@${username}@${domain}`, `@${username}`)); // Add link
                lastIndex = offset + match.length; // Update last index
            });
            if (lastIndex < fullText.length) {
                newNodes.push(makeTextNode(fullText.slice(lastIndex))); // Add text after the last match
            }
            if (prevNode && prevNode.type === 'text' && prevNode.value.endsWith('<@')) {
                parent.children.splice(index - 1, 2, ...newNodes);
            }
            else {
                parent.children.splice(index, 1, ...newNodes);
            }
            return;
        });
    };
    const makeLinkNode = (url, text, title) => {
        return {
            type: 'link',
            url: url,
            title: title || undefined,
            children: [{ type: 'text', value: text }],
        };
    };
    const makeTextNode = (text) => {
        return {
            type: 'text',
            value: text,
        };
    };
    return transformer;
}
