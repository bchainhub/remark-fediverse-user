import { Root } from 'mdast';
interface FediverseUserOptions {
    checkText?: boolean;
    protocol?: string;
}
export default function remarkFediverseUser(options?: FediverseUserOptions): (ast: Root) => void;
export {};
