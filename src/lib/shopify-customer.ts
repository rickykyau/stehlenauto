import { storefrontApiRequest } from "./shopify";

// ── Customer Mutations & Queries ──────────────────────

const CUSTOMER_CREATE_MUTATION = `
  mutation customerCreate($input: CustomerCreateInput!) {
    customerCreate(input: $input) {
      customer { id firstName lastName email }
      customerUserErrors { field message }
    }
  }
`;

const CUSTOMER_ACCESS_TOKEN_CREATE = `
  mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
    customerAccessTokenCreate(input: $input) {
      customerAccessToken { accessToken expiresAt }
      customerUserErrors { field message }
    }
  }
`;

const CUSTOMER_RECOVER_MUTATION = `
  mutation customerRecover($email: String!) {
    customerRecover(email: $email) {
      customerUserErrors { field message }
    }
  }
`;

const CUSTOMER_QUERY = `
  query customer($customerAccessToken: String!) {
    customer(customerAccessToken: $customerAccessToken) {
      firstName
      lastName
      email
      orders(first: 20, sortKey: PROCESSED_AT, reverse: true) {
        edges {
          node {
            id
            orderNumber
            name
            processedAt
            totalPrice { amount currencyCode }
            fulfillmentStatus
            statusUrl
            lineItems(first: 10) {
              edges {
                node {
                  title
                  quantity
                  variant {
                    image { url altText }
                    price { amount currencyCode }
                  }
                }
              }
            }
            shippingAddress {
              address1
              address2
              city
              province
              zip
              country
            }
            subtotalPrice { amount currencyCode }
            totalShippingPrice { amount currencyCode }
            totalTax { amount currencyCode }
          }
        }
      }
      addresses(first: 10) {
        edges {
          node {
            id
            address1
            address2
            city
            province
            zip
            country
            firstName
            lastName
            phone
          }
        }
      }
    }
  }
`;

const CUSTOMER_ADDRESS_CREATE = `
  mutation customerAddressCreate($customerAccessToken: String!, $address: MailingAddressInput!) {
    customerAddressCreate(customerAccessToken: $customerAccessToken, address: $address) {
      customerAddress { id }
      customerUserErrors { field message }
    }
  }
`;

const CUSTOMER_ADDRESS_DELETE = `
  mutation customerAddressDelete($customerAccessToken: String!, $id: ID!) {
    customerAddressDelete(customerAccessToken: $customerAccessToken, id: $id) {
      deletedCustomerAddressId
      customerUserErrors { field message }
    }
  }
`;

const CUSTOMER_UPDATE = `
  mutation customerUpdate($customerAccessToken: String!, $customer: CustomerUpdateInput!) {
    customerUpdate(customerAccessToken: $customerAccessToken, customer: $customer) {
      customer { id firstName lastName email }
      customerUserErrors { field message }
    }
  }
`;

// ── Token Management ──────────────────────────────────

const TOKEN_KEY = "shopify_customer_token";
const TOKEN_EXPIRY_KEY = "shopify_customer_token_expiry";

export function getStoredToken(): string | null {
  const token = localStorage.getItem(TOKEN_KEY);
  const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
  if (!token || !expiry) return null;
  if (new Date(expiry) <= new Date()) {
    clearStoredToken();
    return null;
  }
  return token;
}

export function storeToken(token: string, expiresAt: string) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(TOKEN_EXPIRY_KEY, expiresAt);
}

export function clearStoredToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(TOKEN_EXPIRY_KEY);
}

// ── API Functions ─────────────────────────────────────

export interface CustomerUserError {
  field: string[] | null;
  message: string;
}

export async function createCustomer(input: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}): Promise<{ success: boolean; errors?: CustomerUserError[] }> {
  const data = await storefrontApiRequest(CUSTOMER_CREATE_MUTATION, { input });
  const errors = data?.data?.customerCreate?.customerUserErrors || [];
  if (errors.length > 0) return { success: false, errors };
  return { success: true };
}

export async function loginCustomer(email: string, password: string): Promise<{
  success: boolean;
  token?: string;
  expiresAt?: string;
  errors?: CustomerUserError[];
}> {
  const data = await storefrontApiRequest(CUSTOMER_ACCESS_TOKEN_CREATE, {
    input: { email, password },
  });
  const errors = data?.data?.customerAccessTokenCreate?.customerUserErrors || [];
  if (errors.length > 0) return { success: false, errors };
  const tokenData = data?.data?.customerAccessTokenCreate?.customerAccessToken;
  if (!tokenData) return { success: false, errors: [{ field: null, message: "Login failed" }] };
  storeToken(tokenData.accessToken, tokenData.expiresAt);
  return { success: true, token: tokenData.accessToken, expiresAt: tokenData.expiresAt };
}

export async function recoverPassword(email: string): Promise<{
  success: boolean;
  errors?: CustomerUserError[];
}> {
  const data = await storefrontApiRequest(CUSTOMER_RECOVER_MUTATION, { email });
  const errors = data?.data?.customerRecover?.customerUserErrors || [];
  if (errors.length > 0) return { success: false, errors };
  return { success: true };
}

export interface ShopifyCustomer {
  firstName: string | null;
  lastName: string | null;
  email: string;
  orders: {
    edges: Array<{
      node: {
        id: string;
        orderNumber: number;
        name: string;
        processedAt: string;
        totalPrice: { amount: string; currencyCode: string };
        fulfillmentStatus: string;
        statusUrl: string;
        lineItems: {
          edges: Array<{
            node: {
              title: string;
              quantity: number;
              variant: {
                image: { url: string; altText: string | null } | null;
                price: { amount: string; currencyCode: string };
              } | null;
            };
          }>;
        };
        shippingAddress: {
          address1: string;
          address2: string | null;
          city: string;
          province: string;
          zip: string;
          country: string;
        } | null;
        subtotalPrice: { amount: string; currencyCode: string };
        totalShippingPrice: { amount: string; currencyCode: string };
        totalTax: { amount: string; currencyCode: string };
      };
    }>;
  };
  addresses: {
    edges: Array<{
      node: {
        id: string;
        address1: string;
        address2: string | null;
        city: string;
        province: string;
        zip: string;
        country: string;
        firstName: string | null;
        lastName: string | null;
        phone: string | null;
      };
    }>;
  };
}

export async function fetchCustomer(token: string): Promise<ShopifyCustomer | null> {
  try {
    const data = await storefrontApiRequest(CUSTOMER_QUERY, { customerAccessToken: token });
    return data?.data?.customer || null;
  } catch {
    return null;
  }
}

export async function updateCustomer(
  token: string,
  input: { firstName?: string; lastName?: string; email?: string }
): Promise<{ success: boolean; errors?: CustomerUserError[] }> {
  const data = await storefrontApiRequest(CUSTOMER_UPDATE, {
    customerAccessToken: token,
    customer: input,
  });
  const errors = data?.data?.customerUpdate?.customerUserErrors || [];
  if (errors.length > 0) return { success: false, errors };
  return { success: true };
}

export async function createAddress(
  token: string,
  address: { address1: string; address2?: string; city: string; province: string; zip: string; country: string }
): Promise<{ success: boolean; errors?: CustomerUserError[] }> {
  const data = await storefrontApiRequest(CUSTOMER_ADDRESS_CREATE, {
    customerAccessToken: token,
    address,
  });
  const errors = data?.data?.customerAddressCreate?.customerUserErrors || [];
  if (errors.length > 0) return { success: false, errors };
  return { success: true };
}

export async function deleteAddress(
  token: string,
  addressId: string
): Promise<{ success: boolean; errors?: CustomerUserError[] }> {
  const data = await storefrontApiRequest(CUSTOMER_ADDRESS_DELETE, {
    customerAccessToken: token,
    id: addressId,
  });
  const errors = data?.data?.customerAddressDelete?.customerUserErrors || [];
  if (errors.length > 0) return { success: false, errors };
  return { success: true };
}
