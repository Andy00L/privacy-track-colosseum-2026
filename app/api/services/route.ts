import { NextResponse } from "next/server";

// List all available services
const DEMO_SERVICES = [
  {
    id: "weather",
    endpoint: "/api/services/weather",
    price: 100,
    priceUSDC: 0.0001,
    description: "Real-time weather data for any location",
    active: true,
  },
  {
    id: "ip-info",
    endpoint: "/api/services/ip-info",
    price: 50,
    priceUSDC: 0.00005,
    description: "IP geolocation information",
    active: true,
  },
  {
    id: "timestamp",
    endpoint: "/api/services/timestamp",
    price: 25,
    priceUSDC: 0.000025,
    description: "Accurate UTC timestamp from atomic clock",
    active: true,
  },
];

export async function GET() {
  return NextResponse.json({ services: DEMO_SERVICES });
}
