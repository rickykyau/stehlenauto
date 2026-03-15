import { useQuery } from '@tanstack/react-query';
import { storefrontApiRequest, PRODUCTS_QUERY, PRODUCT_BY_HANDLE_QUERY, type ShopifyProduct } from '@/lib/shopify';

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
