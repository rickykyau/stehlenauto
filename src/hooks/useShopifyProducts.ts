import { useQuery } from '@tanstack/react-query';
import { storefrontApiRequest, PRODUCTS_QUERY, PRODUCT_BY_HANDLE_QUERY, COLLECTIONS_QUERY, COLLECTION_PRODUCTS_QUERY, type ShopifyProduct, type ShopifyCollection } from '@/lib/shopify';

type SortKey = 'BEST_SELLING' | 'PRICE' | 'TITLE' | 'CREATED_AT';

interface UseShopifyProductsOptions {
  first?: number;
  query?: string;
  sortKey?: SortKey;
  reverse?: boolean;
  after?: string;
}

export function useShopifyProducts(options: UseShopifyProductsOptions = {}) {
  const { first = 24, query, sortKey = 'BEST_SELLING', reverse = false, after } = options;

  return useQuery({
    queryKey: ['shopify-products', first, query, sortKey, reverse, after],
    queryFn: async () => {
      const data = await storefrontApiRequest(PRODUCTS_QUERY, {
        first,
        query: query || null,
        sortKey,
        reverse,
        after: after || null,
      });
      return {
        products: (data?.data?.products?.edges || []) as ShopifyProduct[],
        pageInfo: data?.data?.products?.pageInfo as { hasNextPage: boolean; endCursor: string } | undefined,
      };
    },
    staleTime: 60_000,
  });
}

/** Fetch products from a specific collection by handle */
export function useCollectionProducts(options: {
  collectionHandle: string | null;
  first?: number;
  sortKey?: SortKey;
  reverse?: boolean;
}) {
  const { collectionHandle, first = 48, sortKey = 'BEST_SELLING', reverse = false } = options;

  // Map ProductSortKeys to ProductCollectionSortKeys
  const collectionSortKey = sortKey === 'BEST_SELLING' ? 'BEST_SELLING'
    : sortKey === 'PRICE' ? 'PRICE'
    : sortKey === 'TITLE' ? 'TITLE'
    : 'BEST_SELLING';

  return useQuery({
    queryKey: ['shopify-collection-products', collectionHandle, first, collectionSortKey, reverse],
    queryFn: async () => {
      const data = await storefrontApiRequest(COLLECTION_PRODUCTS_QUERY, {
        handle: collectionHandle,
        first,
        after: null,
        sortKey: collectionSortKey,
        reverse,
      });
      const collection = data?.data?.collectionByHandle;
      if (!collection) return { products: [] as ShopifyProduct[], pageInfo: undefined, collectionTitle: null };
      return {
        products: (collection.products?.edges || []) as ShopifyProduct[],
        pageInfo: collection.products?.pageInfo as { hasNextPage: boolean; endCursor: string } | undefined,
        collectionTitle: collection.title as string,
      };
    },
    enabled: !!collectionHandle,
    staleTime: 60_000,
  });
}

export function useShopifyProduct(handle: string) {
  return useQuery({
    queryKey: ['shopify-product', handle],
    queryFn: async () => {
      const data = await storefrontApiRequest(PRODUCT_BY_HANDLE_QUERY, { handle });
      return data?.data?.productByHandle || null;
    },
    enabled: !!handle,
    staleTime: 60_000,
  });
}

export function useShopifyCollections(first = 20) {
  return useQuery({
    queryKey: ['shopify-collections', first],
    queryFn: async () => {
      const data = await storefrontApiRequest(COLLECTIONS_QUERY, { first });
      return (data?.data?.collections?.edges || []) as ShopifyCollection[];
    },
    staleTime: 60_000,
  });
}
