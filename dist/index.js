import { visit } from 'unist-util-visit';
export default function fediverseUser() {
    const transformer = async (ast) => {
        visit(ast, 'text', (node, index, parent) => {
            if (!parent || typeof index !== 'number')
                return;
            const podPattern = /@([a-z0-9_-]+)@([\w.]+)/gi;
            const endsWithPattern = /(\s@|^@)$/;
            let prevNode = index > 0 ? parent.children[index - 1] : null;
            let prevNodeEnding = endsWithPattern.test(prevNode.value);
            let fullText = (prevNode && prevNode.type === 'text' && prevNodeEnding)
                ? prevNode.value + node.value
                : node.value;
            let newNodes = [];
            let lastIndex = 0;
            fullText.replace(podPattern, (match, username, domain, offset) => {
                if (offset > lastIndex) {
                    newNodes.push(makeTextNode(fullText.slice(lastIndex, offset)));
                }
                newNodes.push(makeLinkNode(`https://${domain}/@${username}`, `@${username}@${domain}`, `@${username}`));
                lastIndex = offset + match.length;
            });
            if (lastIndex < fullText.length) {
                newNodes.push(makeTextNode(fullText.slice(lastIndex)));
            }
            if (prevNode && prevNode.type === 'text' && prevNodeEnding) {
                parent.children.splice(index - 1, 2, ...newNodes);
            }
            else {
                parent.children.splice(index, 1, ...newNodes);
            }
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
