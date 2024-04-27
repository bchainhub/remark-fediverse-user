import { Root } from 'mdast';

declare module 'remark-fediverse-user' {
  interface FediverseUserOptions {
    checkText?: boolean;
    protocol?: string;
  }
  // Export the function as the default export of the module
  export default function remarkFediverseUser(options?: FediverseUserOptions): (ast: Root) => void;
}
