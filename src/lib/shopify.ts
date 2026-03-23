import { toast } from "sonner";

// Shopify Storefront API Configuration
const SHOPIFY_API_VERSION = '2025-07';
const SHOPIFY_STORE_PERMANENT_DOMAIN = 'yrmsvk-4k.myshopify.com';
const SHOPIFY_STOREFRONT_URL = `https://${SHOPIFY_STORE_PERMANENT_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;
const SHOPIFY_STOREFRONT_TOKEN = '361b5e3e94ab0cf75496641e0168aed0';

// ── Types ──────────────────────────────────────────────

export interface FitmentSubAttributes {
  bed_length?: string;
  cab_size?: string;
  body_style?: string;
  trim?: string;
  seat_config?: string;
  bed_style?: string;
}

export interface ShopifyProduct {
  node: {
    id: string;
    title: string;
    description: string;
    handle: string;
    priceRange: {
      minVariantPrice: {
        amount: string;
        currencyCode: string;
      };
    };
    compareAtPriceRange?: {
      minVariantPrice: {
        amount: string;
        currencyCode: string;
      };
    };
    images: {
      edges: Array<{
        node: {
          url: string;
          altText: string | null;
        };
      }>;
    };
    variants: {
      edges: Array<{
        node: {
          id: string;
          title: string;
          price: {
            amount: string;
            currencyCode: string;
          };
          compareAtPrice?: {
            amount: string;
            currencyCode: string;
          } | null;
          availableForSale: boolean;
          selectedOptions: Array<{
            name: string;
            value: string;
          }>;
        };
      }>;
    };
    productType: string;
    tags: string[];
    options: Array<{
      name: string;
      values: string[];
    }>;
    fitmentSubAttributes?: FitmentSubAttributes | null;
    fitmentNotes?: string | null;
  };
}

// ── Universal Product Detection ────────────────────────

export function isUniversalProduct(product: ShopifyProduct): boolean {
  const tags = product.node.tags || [];
  return tags.some(tag => tag.toLowerCase() === 'universal fit');
}

// ── YMM Tag Query Builder ──────────────────────────────

/**
 * Build a Shopify Storefront API query string using tag: filters
 * for Year/Make/Model. Each tag is ANDed together.
 * Handles model variants like "F-150" / "F150".
 */
export function buildYMMTagQuery(options: {
  year?: string | null;
  make?: string | null;
  model?: string | null;
  categoryQuery?: string;
}): string {
  const parts: string[] = [];

  if (options.year) parts.push(`tag:"${options.year}"`);
  if (options.make) parts.push(`tag:"${options.make}"`);

  if (options.model) {
    const model = options.model;
    const modelNoHyphen = model.replace(/-/g, '');
    const modelWithHyphen = model.includes('-') ? null : model.replace(/(\D)(\d)/g, '$1-$2');

    // Build OR variants for the model
    const modelVariants = [model];
    if (modelNoHyphen !== model) modelVariants.push(modelNoHyphen);
    if (modelWithHyphen && modelWithHyphen !== model) modelVariants.push(modelWithHyphen);

    if (modelVariants.length === 1) {
      parts.push(`tag:"${model}"`);
    } else {
      // Shopify supports OR in query syntax
      parts.push(`(${modelVariants.map(v => `tag:"${v}"`).join(' OR ')})`);
    }
  }

  if (options.categoryQuery) parts.push(options.categoryQuery);

  return parts.join(' ');
}

// ── API Helper ─────────────────────────────────────────

export async function storefrontApiRequest(query: string, variables: Record<string, unknown> = {}) {
  const response = await fetch(SHOPIFY_STOREFRONT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (response.status === 402) {
    toast.error("Shopify: Payment required", {
      description: "Shopify API access requires an active billing plan. Visit https://admin.shopify.com to upgrade.",
    });
    return;
  }

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();

  if (data.errors) {
    throw new Error(`Error calling Shopify: ${data.errors.map((e: { message: string }) => e.message).join(', ')}`);
  }

  return data;
}

// ── Product Queries ────────────────────────────────────

export const PRODUCTS_QUERY = `
  query GetProducts($first: Int!, $after: String, $query: String, $sortKey: ProductSortKeys, $reverse: Boolean) {
    products(first: $first, after: $after, query: $query, sortKey: $sortKey, reverse: $reverse) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          id
          title
          description
          handle
          productType
          tags
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          compareAtPriceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          images(first: 5) {
            edges {
              node {
                url
                altText
              }
            }
          }
          variants(first: 10) {
            edges {
              node {
                id
                title
                price {
                  amount
                  currencyCode
                }
                compareAtPrice {
                  amount
                  currencyCode
                }
                availableForSale
                selectedOptions {
                  name
                  value
                }
              }
            }
          }
          options {
            name
            values
          }
          fitmentSubattributes: metafield(namespace: "custom", key: "fitment_subattributes") {
            value
          }
          fitmentNotes: metafield(namespace: "custom", key: "fitment_notes") {
            value
          }
        }
      }
    }
  }
`;

export const PRODUCT_BY_HANDLE_QUERY = `
  query GetProductByHandle($handle: String!) {
    productByHandle(handle: $handle) {
      id
      title
      description
      descriptionHtml
      handle
      productType
      tags
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }
      compareAtPriceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }
      images(first: 10) {
        edges {
          node {
            url
            altText
          }
        }
      }
      variants(first: 30) {
        edges {
          node {
            id
            title
            price {
              amount
              currencyCode
            }
            compareAtPrice {
              amount
              currencyCode
            }
            availableForSale
            selectedOptions {
              name
              value
            }
          }
        }
      }
      options {
        name
        values
      }
      fitmentSubattributes: metafield(namespace: "custom", key: "fitment_subattributes") {
        value
      }
      fitmentNotes: metafield(namespace: "custom", key: "fitment_notes") {
        value
      }
    }
  }
`;

// ── Collections Query ──────────────────────────────────

export const COLLECTIONS_QUERY = `
  query GetCollections($first: Int!) {
    collections(first: $first) {
      edges {
        node {
          id
          title
          handle
          description
          image {
            url
            altText
          }
          products(first: 250) {
            edges {
              node {
                id
              }
            }
            filters {
              label
              values {
                label
                count
              }
            }
          }
        }
      }
    }
  }
`;

// ── Collection Products Query (fetch products from a specific collection) ──

export const COLLECTION_PRODUCTS_QUERY = `
  query GetCollectionProducts($handle: String!, $first: Int!, $after: String, $sortKey: ProductCollectionSortKeys, $reverse: Boolean) {
    collectionByHandle(handle: $handle) {
      id
      title
      products(first: $first, after: $after, sortKey: $sortKey, reverse: $reverse) {
        pageInfo {
          hasNextPage
          endCursor
        }
        edges {
          node {
            id
            title
            description
            handle
            productType
            tags
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            compareAtPriceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            images(first: 5) {
              edges {
                node {
                  url
                  altText
                }
              }
            }
            variants(first: 10) {
              edges {
                node {
                  id
                  title
                  price {
                    amount
                    currencyCode
                  }
                  compareAtPrice {
                    amount
                    currencyCode
                  }
                  availableForSale
                  selectedOptions {
                    name
                    value
                  }
                }
              }
            }
            options {
              name
              values
            }
            fitmentSubattributes: metafield(namespace: "custom", key: "fitment_subattributes") {
              value
            }
            fitmentNotes: metafield(namespace: "custom", key: "fitment_notes") {
              value
            }
          }
        }
      }
    }
  }
`;

// ── Make/Category → Collection Handle Maps ─────────────

export const MAKE_COLLECTION_MAP: Record<string, string> = {
  'Acura': 'acura-parts',
  'Audi': 'audi-parts',
  'Buick': 'buick-parts',
  'Cadillac': 'cadillac-parts',
  'Chevrolet': 'chevy-parts',
  'Chevy': 'chevy-parts',
  'Chrysler': 'chrysler-parts',
  'Dodge': 'dodge-parts',
  'Ford': 'ford-parts',
  'GMC': 'gmc-parts',
  'Honda': 'honda-parts',
  'Hummer': 'hummer-parts',
  'Hyundai': 'hyundai-parts',
  'Infiniti': 'infiniti-parts',
  'Jeep': 'jeep-parts',
  'Kia': 'kia-parts',
  'Land Rover': 'land-rover-parts',
  'Lexus': 'lexus-parts',
  'Lincoln': 'lincoln-parts',
  'Mazda': 'mazda-parts',
  'Mercedes': 'mercedes-benz-parts',
  'Mercedes-Benz': 'mercedes-benz-parts',
  'Mercury': 'mercury-parts',
  'Mini': 'mini-parts',
  'Mitsubishi': 'mitsubishi-parts',
  'Nissan': 'nissan-parts',
  'Pontiac': 'pontiac-parts',
  'Ram': 'dodge-parts',
  'Scion': 'scion-parts',
  'Saturn': 'saturn-parts',
  'Subaru': 'subaru-parts',
  'Suzuki': 'suzuki-parts',
  'Tesla': 'tesla-parts',
  'Toyota': 'toyota-parts',
  'Volkswagen': 'volkswagen-parts',
  'Volvo': 'volvo-parts',
};

export interface ShopifyCollection {
  node: {
    id: string;
    title: string;
    handle: string;
    description: string;
    image: {
      url: string;
      altText: string | null;
    } | null;
    products?: {
      edges: Array<{
        node: {
          id: string;
        };
      }>;
      filters?: Array<{
        label: string;
        values: Array<{ label: string; count: number }>;
      }>;
    };
  };
}

// ── Cart Mutations ─────────────────────────────────────

export const CART_QUERY = `
  query cart($id: ID!) {
    cart(id: $id) { id totalQuantity }
  }
`;

const CART_CREATE_MUTATION = `
  mutation cartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        id
        checkoutUrl
        lines(first: 100) { edges { node { id merchandise { ... on ProductVariant { id } } } } }
      }
      userErrors { field message }
    }
  }
`;

const CART_LINES_ADD_MUTATION = `
  mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        id
        lines(first: 100) { edges { node { id merchandise { ... on ProductVariant { id } } } } }
      }
      userErrors { field message }
    }
  }
`;

const CART_LINES_UPDATE_MUTATION = `
  mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart { id }
      userErrors { field message }
    }
  }
`;

const CART_LINES_REMOVE_MUTATION = `
  mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart { id }
      userErrors { field message }
    }
  }
`;

// ── Cart Helpers ───────────────────────────────────────

interface CartItem {
  variantId: string;
  quantity: number;
}

function formatCheckoutUrl(checkoutUrl: string): string {
  try {
    const url = new URL(checkoutUrl);
    url.searchParams.set('channel', 'online_store');
    return url.toString();
  } catch {
    return checkoutUrl;
  }
}

function isCartNotFoundError(userErrors: Array<{ field: string[] | null; message: string }>): boolean {
  return userErrors.some(e =>
    e.message.toLowerCase().includes('cart not found') ||
    e.message.toLowerCase().includes('does not exist')
  );
}

export async function createShopifyCart(item: CartItem): Promise<{ cartId: string; checkoutUrl: string; lineId: string } | null> {
  const data = await storefrontApiRequest(CART_CREATE_MUTATION, {
    input: { lines: [{ quantity: item.quantity, merchandiseId: item.variantId }] },
  });

  if (data?.data?.cartCreate?.userErrors?.length > 0) {
    console.error('Cart creation failed:', data.data.cartCreate.userErrors);
    return null;
  }

  const cart = data?.data?.cartCreate?.cart;
  if (!cart?.checkoutUrl) return null;

  const lineId = cart.lines.edges[0]?.node?.id;
  if (!lineId) return null;

  return { cartId: cart.id, checkoutUrl: formatCheckoutUrl(cart.checkoutUrl), lineId };
}

export async function addLineToShopifyCart(cartId: string, item: CartItem): Promise<{ success: boolean; lineId?: string; cartNotFound?: boolean }> {
  const data = await storefrontApiRequest(CART_LINES_ADD_MUTATION, {
    cartId,
    lines: [{ quantity: item.quantity, merchandiseId: item.variantId }],
  });

  const userErrors = data?.data?.cartLinesAdd?.userErrors || [];
  if (isCartNotFoundError(userErrors)) return { success: false, cartNotFound: true };
  if (userErrors.length > 0) {
    console.error('Add line failed:', userErrors);
    return { success: false };
  }

  const lines = data?.data?.cartLinesAdd?.cart?.lines?.edges || [];
  const newLine = lines.find((l: { node: { id: string; merchandise: { id: string } } }) => l.node.merchandise.id === item.variantId);
  return { success: true, lineId: newLine?.node?.id };
}

export async function updateShopifyCartLine(cartId: string, lineId: string, quantity: number): Promise<{ success: boolean; cartNotFound?: boolean }> {
  const data = await storefrontApiRequest(CART_LINES_UPDATE_MUTATION, {
    cartId,
    lines: [{ id: lineId, quantity }],
  });

  const userErrors = data?.data?.cartLinesUpdate?.userErrors || [];
  if (isCartNotFoundError(userErrors)) return { success: false, cartNotFound: true };
  if (userErrors.length > 0) {
    console.error('Update line failed:', userErrors);
    return { success: false };
  }
  return { success: true };
}

export async function removeLineFromShopifyCart(cartId: string, lineId: string): Promise<{ success: boolean; cartNotFound?: boolean }> {
  const data = await storefrontApiRequest(CART_LINES_REMOVE_MUTATION, {
    cartId,
    lineIds: [lineId],
  });

  const userErrors = data?.data?.cartLinesRemove?.userErrors || [];
  if (isCartNotFoundError(userErrors)) return { success: false, cartNotFound: true };
  if (userErrors.length > 0) {
    console.error('Remove line failed:', userErrors);
    return { success: false };
  }
  return { success: true };
}

// ── Legal / Policy Pages ───────────────────────────────

export type ShopifyPolicyField = 'privacyPolicy' | 'termsOfService' | 'refundPolicy' | 'shippingPolicy';

export interface ShopifyPolicy {
  title: string;
  body: string;
  url: string;
}

export async function fetchShopifyPolicy(field: ShopifyPolicyField): Promise<ShopifyPolicy | null> {
  const query = `{ shop { ${field} { title body url } } }`;
  const data = await storefrontApiRequest(query);
  return data?.data?.shop?.[field] ?? null;
}
