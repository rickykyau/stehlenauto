import { useEffect, useState } from "react";
import { storefrontApiRequest } from "@/lib/shopify";

export interface YMMTree {
  years: string[];
  makesForYear: (year: string) => string[];
  modelsForYearMake: (year: string, make: string) => string[];
  isLoading: boolean;
}

type TreeData = Record<string, Record<string, string[]>>;

const STORAGE_KEY = "stehlen_ymm_tree_v1";
const STORAGE_TTL_MS = 6 * 60 * 60 * 1000;
const TAGS_QUERY = `
  query GetProductTags($first: Int!, $after: String) {
    products(first: $first, after: $after) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          id
          tags
        }
      }
    }
  }
`;

let cachedTree: TreeData | null = null;
let fetchPromise: Promise<TreeData> | null = null;

function sortTree(tree: TreeData): TreeData {
  const sortedYears = Object.keys(tree).sort((a, b) => Number(b) - Number(a));
  const result: TreeData = {};

  for (const year of sortedYears) {
    const makes = Object.keys(tree[year]).sort((a, b) => a.localeCompare(b));
    result[year] = {};

    for (const make of makes) {
      result[year][make] = [...tree[year][make]].sort((a, b) => a.localeCompare(b));
    }
  }

  return result;
}

function readCachedTree(): TreeData | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as { savedAt?: number; tree?: TreeData };
    if (!parsed?.savedAt || !parsed?.tree) return null;
    if (Date.now() - parsed.savedAt > STORAGE_TTL_MS) return null;

    return parsed.tree;
  } catch {
    return null;
  }
}

function writeCachedTree(tree: TreeData) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        savedAt: Date.now(),
        tree,
      })
    );
  } catch {
    // ignore storage failures
  }
}

function extractTagValues(tags: string[], prefix: "year:" | "make:" | "model:") {
  return tags
    .filter((tag) => tag.startsWith(prefix))
    .map((tag) => tag.slice(prefix.length).trim())
    .filter(Boolean);
}

async function fetchAllProductTags(): Promise<string[][]> {
  const allTags: string[][] = [];
  let after: string | null = null;
  let hasNextPage = true;

  while (hasNextPage) {
    const data = await storefrontApiRequest(TAGS_QUERY, {
      first: 250,
      after,
    });

    const connection = data?.data?.products;
    const edges = connection?.edges ?? [];

    for (const edge of edges) {
      allTags.push(edge?.node?.tags ?? []);
    }

    hasNextPage = Boolean(connection?.pageInfo?.hasNextPage);
    after = connection?.pageInfo?.endCursor ?? null;
  }

  return allTags;
}

function buildTreeFromProductTags(productsTags: string[][]): TreeData {
  const tree: TreeData = {};

  for (const tags of productsTags) {
    const years = extractTagValues(tags, "year:");
    const makes = extractTagValues(tags, "make:");
    const models = extractTagValues(tags, "model:");

    if (years.length === 0 || makes.length === 0) continue;

    for (const year of years) {
      if (!tree[year]) tree[year] = {};

      for (const make of makes) {
        if (!tree[year][make]) tree[year][make] = [];

        for (const model of models) {
          if (!tree[year][make].includes(model)) {
            tree[year][make].push(model);
          }
        }
      }
    }
  }

  return sortTree(tree);
}

async function fetchYMMTree(): Promise<TreeData> {
  if (cachedTree) return cachedTree;

  const stored = readCachedTree();
  if (stored) {
    cachedTree = stored;
    return stored;
  }

  if (fetchPromise) return fetchPromise;

  fetchPromise = (async () => {
    const productsTags = await fetchAllProductTags();
    const tree = buildTreeFromProductTags(productsTags);
    cachedTree = tree;
    writeCachedTree(tree);
    return tree;
  })();

  try {
    return await fetchPromise;
  } finally {
    fetchPromise = null;
  }
}

export function useYMMTree(): YMMTree {
  const [tree, setTree] = useState<TreeData | null>(() => cachedTree ?? readCachedTree());
  const [isLoading, setIsLoading] = useState(!cachedTree && !readCachedTree());

  useEffect(() => {
    let isMounted = true;

    fetchYMMTree()
      .then((nextTree) => {
        if (!isMounted) return;
        setTree(nextTree);
        setIsLoading(false);
      })
      .catch(() => {
        if (!isMounted) return;
        setTree({});
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const currentTree = tree ?? {};

  return {
    years: Object.keys(currentTree).sort((a, b) => Number(b) - Number(a)),
    makesForYear: (year: string) => Object.keys(currentTree[year] ?? {}).sort((a, b) => a.localeCompare(b)),
    modelsForYearMake: (year: string, make: string) => [...(currentTree[year]?.[make] ?? [])].sort((a, b) => a.localeCompare(b)),
    isLoading,
  };
}
