import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
// @ts-ignore
import fediverseUser from 'remark-fediverse-user';

const processMarkdown = async (markdown: string, options = {}) => {
  const result = await unified()
    .use(remarkParse)
    .use(fediverseUser, options)
    .use(remarkStringify)
    .process(markdown);
  return result.toString();
};

const FediversePodsHandlers = suite('Fediverse Pods handlers');

FediversePodsHandlers('Transforms pod handles', async () => {
  const input = '@rastislav@coretalk.space';
  const output = await processMarkdown(input, { checkPlain: true });
  assert.match(output, /\[@rastislav@coretalk\.space\]\(https:\/\/coretalk\.space\/@rastislav\ "@rastislav"\)/);
});

FediversePodsHandlers('Test combined handlers: Fediverse', async () => {
  const input = 'The quick brown fox @rastislav@coretalk.space jumps over the lazy dog.';
  const output = await processMarkdown(input, { checkPlain: true });
  assert.match(output, /The quick brown fox \[@rastislav@coretalk\.space\]\(https:\/\/coretalk\.space\/@rastislav\ "@rastislav"\) jumps over the lazy dog./);
});

FediversePodsHandlers.run();

// Tests for handling specific email links that resemble Fediverse handles
const EmailLinkHandlers = suite('Email Link Handlers');

EmailLinkHandlers('Transforms email links into Fediverse mentions', async () => {
  const inputMarkdown = 'Contact us at @<mailto:rastislav@coretalk.space>.';
  const output = await processMarkdown(inputMarkdown, { checkPlain: false }); // Implicitly or explicitly setting checkPlain to false
  assert.match(output, /Contact us at \[@rastislav@coretalk.space\]\(https:\/\/coretalk.space\/@rastislav "@rastislav"\)\./);
});

EmailLinkHandlers('Keeps email links unmodified without preceding @ symbol', async () => {
  const inputMarkdown = 'Send an email to <mailto:rastislav@coretalk.space> for more info.';
  const expectedOutput = 'Send an email to <mailto:rastislav@coretalk.space> for more info.';
  const output = await processMarkdown(inputMarkdown, { checkPlain: false });
  assert.is(output.trim(), expectedOutput.trim()); // Using trim() to ignore potential whitespace differences
});

EmailLinkHandlers.run();
