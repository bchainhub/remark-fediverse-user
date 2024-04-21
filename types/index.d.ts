// Import the necessary types from 'unist' for Node
import { Node } from 'unist';

declare module 'remark-fediverse-user' {
  // Export the function as the default export of the module
  export default function remarkFediverseUser(): (ast: Node) => void;
}
