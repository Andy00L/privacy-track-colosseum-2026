export interface ServiceInfo {
  id: string;
  endpoint: string;
  price: number;
  priceUSDC: number;
  description: string;
  active: boolean;
}

export async function discoverServices(
  gatewayUrl: string
): Promise<ServiceInfo[]> {
  const response = await fetch(`${gatewayUrl}/api/services`, {
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) {
    throw new Error(`Service discovery failed: ${response.status}`);
  }

  const data = (await response.json()) as { services: ServiceInfo[] };
  return data.services.filter((s) => s.active);
}

export function selectService(
  services: ServiceInfo[],
  maxPrice?: number
): ServiceInfo | null {
  const affordable = maxPrice
    ? services.filter((s) => s.price <= maxPrice)
    : services;

  if (affordable.length === 0) return null;

  // Pick cheapest available service
  return affordable.reduce((cheapest, service) =>
    service.price < cheapest.price ? service : cheapest
  );
}
