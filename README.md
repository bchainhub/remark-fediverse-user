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

The plugin scans for Fediverse user notations (e.g., `@username@domain` or `@<mailto:username@domain>`) in your markdown content and transforms them into markdown links.

It is transforming the e-mail links and text identifiers with prefix `@` then any e-mail and text link with the prefix will be transformed to a fediverse link.

## Options

The plugin accepts an optional configuration object with the following properties:

- `checkText`: (boolean): If set to `true`, the plugin will check the text content and transform the Fediverse handle if the text content matches the Fediverse handle format. Default is `true`.
- **`protocol`** (string): The protocol to use for the Fediverse links. Default is `https`.

## Features

- **Easy Integration:** Works seamlessly with Remark processing pipelines.
- **Fediverse Handle Transformation:** Automatically converts Fediverse handles into markdown links.

## Contributing

We welcome contributions to this project. Please feel free to submit pull requests or raise issues on the project repository.

## License

This project is licensed under the CORE License - see the [LICENSE](LICENSE) file for details.
