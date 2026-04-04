import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * YMM Tree: Year → Make → Model[], precomputed from product fitment tags.
 * Ensures dropdowns never show dead-end combinations.
 */
export interface YMMTree {
  /** All years that have at least one product */
  years: string[];
  /** Given a year, returns makes with products */
  makesForYear: (year: string) => string[];
  /** Given a year + make, returns models with products */
  modelsForYearMake: (year: string, make: string) => string[];
  isLoading: boolean;
}

// year -> make -> model[]
type TreeData = Record<string, Record<string, string[]>>;

let cachedTree: TreeData | null = null;
let treePromise: Promise<TreeData> | null = null;

async function fetchTree(): Promise<TreeData> {
  if (cachedTree) return cachedTree;
  if (treePromise) return treePromise;

  treePromise = (async () => {
    try {
      const { data, error } = await supabase.rpc("get_ymm_tree" as any);
      if (error || !data) throw new Error("RPC failed");

      const tree: TreeData = {};
      for (const row of data as any[]) {
        const { year, make, models } = row;
        if (!year || !make) continue;
        if (!tree[year]) tree[year] = {};
        tree[year][make] = Array.isArray(models) ? models : [];
      }
      cachedTree = tree;
      return tree;
    } catch {
      // Fallback: query products_cache directly
      try {
        const { data: products } = await supabase
          .from("products_cache")
          .select("tags")
          .eq("status", "active")
          .not("tags", "is", null);

        const tree: TreeData = {};
        for (const p of products || []) {
          const tags: string[] = (p as any).tags || [];
          const years = tags.filter(t => t.startsWith("year:")).map(t => t.slice(5));
          const makes = tags.filter(t => t.startsWith("make:")).map(t => t.slice(5));
          const models = tags.filter(t => t.startsWith("model:")).map(t => t.slice(6));
          for (const y of years) {
            for (const mk of makes) {
              for (const mo of models) {
                if (!tree[y]) tree[y] = {};
                if (!tree[y][mk]) tree[y][mk] = [];
                if (!tree[y][mk].includes(mo)) tree[y][mk].push(mo);
              }
            }
          }
        }
        // Sort models
        for (const y of Object.keys(tree)) {
          for (const mk of Object.keys(tree[y])) {
            tree[y][mk].sort();
          }
        }
        cachedTree = tree;
        return tree;
      } catch {
        cachedTree = {};
        return {};
      }
    } finally {
      treePromise = null;
    }
  })();

  return treePromise;
}

export function useYMMTree(): YMMTree {
  const [tree, setTree] = useState<TreeData | null>(cachedTree);
  const [isLoading, setIsLoading] = useState(!cachedTree);

  useEffect(() => {
    if (cachedTree) {
      setTree(cachedTree);
      setIsLoading(false);
      return;
    }
    fetchTree().then((t) => {
      setTree(t);
      setIsLoading(false);
    });
  }, []);

  const years = tree
    ? Object.keys(tree).sort((a, b) => Number(b) - Number(a))
    : [];

  const makesForYear = (year: string): string[] => {
    if (!tree || !tree[year]) return [];
    return Object.keys(tree[year]).sort();
  };

  const modelsForYearMake = (year: string, make: string): string[] => {
    if (!tree || !tree[year] || !tree[year][make]) return [];
    return tree[year][make];
  };

  return { years, makesForYear, modelsForYearMake, isLoading };
}
