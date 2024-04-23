// Import the necessary types from 'unist' for Node
import { Node } from 'unist';

declare module 'remark-fediverse-user' {
  interface FediverseUserOptions {
    checkText?: boolean;
    protocol?: string;
  }
  // Export the function as the default export of the module
  export default function remarkFediverseUser(options?: FediverseUserOptions): (ast: Node) => void;
}
