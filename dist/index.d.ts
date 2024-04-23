import { type Node } from 'unist';
interface FediverseUserOptions {
    checkText?: boolean;
    protocol?: string;
}
export default function remarkFediverseUser(options?: FediverseUserOptions): (ast: Node) => void;
export {};
