import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
// @ts-ignore
import fediverseUser from 'remark-fediverse-user';

const processMarkdown = async (markdown: string) => {
  const result = await unified()
    .use(remarkParse)
    .use(fediverseUser)
    .use(remarkStringify)
    .process(markdown);
  return result.toString();
};

const FediversePodsHandlers = suite('Fediverse Pods handlers');

FediversePodsHandlers('Transforms pod handles', async () => {
  const input = '<@rastislav@coretalk.space>';
  const output = await processMarkdown(input);
  assert.match(output, /\[@rastislav@coretalk\.space\]\(https:\/\/coretalk\.space\/@rastislav\ "@rastislav"\)/);
});

FediversePodsHandlers('Test combined handlers: Fediverse, CorePass, Blockchain', async () => {
  const input = 'The quick brown fox <@rastislav@coretalk.space> jumps over the lazy dog.';
  console.log('Input: ', input);
  const output = await processMarkdown(input);
  console.log('Output: ', output);
  assert.match(output, /The quick brown fox \[@rastislav@coretalk\.space\]\(https:\/\/coretalk\.space\/@rastislav\ "@rastislav"\) jumps over the lazy dog./);
});

FediversePodsHandlers.run();
