import { Redis, Cluster } from "ioredis";
import { parseURL } from "ioredis/built/utils";

export function create(nodes: string[]) {
  // use standalone mode
  if (nodes.length === 1) return new Redis(parseURL(nodes[0]));

  // use clsuter mode
  return new Cluster(nodes.map(parseURL), { lazyConnect: true });
}
