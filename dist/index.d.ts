import { type Node } from 'unist';
interface FediverseUserOptions {
    checkPlain?: boolean;
}
export default function remarkFediverseUser(options?: FediverseUserOptions): (ast: Node) => void;
export {};
