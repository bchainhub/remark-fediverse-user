// Import the necessary types from 'unist' for Node
import { Node } from 'unist';

// Extend the module declaration for 'remark-fediverse-user'
declare module 'remark-fediverse-user' {
  // Declare the main function with options
  function fediverseUser(): (ast: Node) => void;

  // Export the function as the default export of the module
  export default fediverseUser;
}
