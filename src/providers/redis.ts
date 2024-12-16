import { Redis, Cluster } from "ioredis";
import { parseURL } from "ioredis/built/utils";

export async function create(nodes: string[]) {
  // use standalone mode
  if (nodes.length === 1) {
    return new Redis({ ...parseURL(nodes[0]), lazyConnect: true });
  }

  // use clsuter mode
  const cluster = new Cluster(nodes.map(parseURL), {
    lazyConnect: true,
    //  Send write queries to masters and read queries to slaves.
    scaleReads: "slave",
    // Eliminate the infinite loop of MOVED redirects.
    retryDelayOnMoved: 1000,
  });

  await cluster.connect();
  const slaves = cluster.nodes("slave");
  await Promise.all(slaves.map((node) => node.readonly()));

  return cluster;
}
