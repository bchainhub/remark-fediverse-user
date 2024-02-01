import { Node } from 'unist';

declare module 'remark-fediverse-user' {
  function fediverseUser(): (ast: Node) => void;

  export = fediverseUser;
}
