import { Redis } from "ioredis";
import { parseURL } from "ioredis/built/utils";

export async function create(nodes: string[]) {
  return new Redis({ ...parseURL(nodes[0]), lazyConnect: true });
}
