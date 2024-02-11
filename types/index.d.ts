// Import the necessary types from 'unist' for Node
import { Node } from 'unist';

interface FediverseUserOptions {
  checkPlain?: boolean;
}

// Extend the module declaration for 'remark-fediverse-user'
declare module 'remark-fediverse-user' {
  // Declare the main function with options
  function fediverseUser(options?: FediverseUserOptions): (ast: Node) => void;

  // Export the interface to be accessible if needed elsewhere
  export { FediverseUserOptions };

  // Export the function as the default export of the module
  export default fediverseUser;
}
