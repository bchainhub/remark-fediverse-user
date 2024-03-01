# Remark Fediverse User

This Remark plugin, "remark-fediverse-user," is designed to transform Fediverse user notations into markdown links. It's a handy tool for processing markdown content that includes Fediverse handles, automatically converting them into clickable links.

## Installation

You can install the plugin using npm or yarn:

```bash
npm install remark-fediverse-user
```

Or:

```bash
yarn add remark-fediverse-user
```

## Usage

To use this plugin in your Remark processor, import it and add it to your processing pipeline:

```typescript
import remark from 'remark';
import fediverseUser from 'remark-fediverse-user';

(async () => {
  try {
    const output = await remark()
      .use(fediverseUser)
      .process('Your markdown text here');
    console.log(output.contents);
  } catch (error) {
    console.error(error);
  }
})();
```

The plugin scans for Fediverse user notations (e.g., `@username@domain`) in your markdown content and transforms them into markdown links.

It is transforming the e-mail links with prefix `@` then any e-mail link with the prefix will be transformed to a fediverse link.

## Features

- **Easy Integration:** Works seamlessly with Remark processing pipelines.
- **Fediverse Handle Transformation:** Automatically converts Fediverse handles into markdown links.

## Contributing

We welcome contributions to this project. Please feel free to submit pull requests or raise issues on the project repository.

## License

This project is licensed under the CORE License - see the [LICENSE](LICENSE) file for details.
