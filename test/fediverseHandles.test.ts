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

const normalizeString = (str: string) => str.trimEnd();

const FediversePodsHandlers = suite('Fediverse Pods handlers');

FediversePodsHandlers('Transforms email links into Fediverse mentions', async () => {
  const inputMarkdown = 'Contact us at @<mailto:rastislav@coretalk.space>.';
  const output = normalizeString(await processMarkdown(inputMarkdown));
  const expected = 'Contact us at [@rastislav@coretalk.space](https://coretalk.space/@rastislav "@rastislav").';
  assert.is(output, expected);
});

FediversePodsHandlers('Keeps email links unmodified without preceding @ symbol', async () => {
  const inputMarkdown = 'Send an email to <mailto:rastislav@coretalk.space> for more info.';
  const output = normalizeString(await processMarkdown(inputMarkdown));
  const expected = 'Send an email to <mailto:rastislav@coretalk.space> for more info.';
  assert.is(output, expected);
});

FediversePodsHandlers('Transforms plain text identifier', async () => {
  const inputMarkdown = 'Send an email to @rastislav@coretalk.space for more info.';
  const output = normalizeString(await processMarkdown(inputMarkdown));
  const expected = 'Send an email to [@rastislav@coretalk.space](https://coretalk.space/@rastislav "@rastislav") for more info.';
  assert.is(output, expected);
});

FediversePodsHandlers.run();
