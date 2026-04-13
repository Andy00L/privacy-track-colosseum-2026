/**
 * x402 Integration Test
 *
 * Tests the x402 payment gateway API routes.
 * Requires: npm run dev (server running on localhost:3000)
 * Run: npx tsx tests/x402-flow.test.ts
 */

const BASE_URL = process.env.GATEWAY_URL || "http://localhost:3000";

interface TestResult {
  name: string;
  passed: boolean;
  detail: string;
}

const results: TestResult[] = [];

function assert(condition: boolean, name: string, detail: string): void {
  results.push({ name, passed: condition, detail });
  const icon = condition ? "\x1b[32mPASS\x1b[0m" : "\x1b[31mFAIL\x1b[0m";
  console.log(`  [${icon}] ${name}: ${detail}`);
}

async function testServicesList(): Promise<void> {
  console.log("\n--- Services List (GET /api/services) ---");
  const res = await fetch(`${BASE_URL}/api/services`, {
    signal: AbortSignal.timeout(5000),
  });
  assert(res.status === 200, "Status 200", `Got ${res.status}`);
  const data = (await res.json()) as { services: unknown[] };
  assert(Array.isArray(data.services), "Returns array", `Type: ${typeof data.services}`);
  assert(data.services.length > 0, "Has services", `Count: ${data.services.length}`);
}

async function test402Response(): Promise<void> {
  console.log("\n--- x402 Flow: Weather (GET /api/services/weather) ---");
  const res = await fetch(`${BASE_URL}/api/services/weather`, {
    signal: AbortSignal.timeout(5000),
  });
  assert(res.status === 402 || res.status === 503, "Status 402 or 503", `Got ${res.status}`);

  if (res.status === 402) {
    const data = (await res.json()) as {
      x402Version: number;
      payment: { amount: number; mint: string; recipientWallet: string };
    };
    assert(data.x402Version === 1, "x402 version 1", `Got v${data.x402Version}`);
    assert(typeof data.payment === "object", "Has payment terms", "payment object present");
    assert(data.payment.amount === 100, "Weather price is 100", `Got ${data.payment.amount}`);
    assert(typeof data.payment.mint === "string", "Has mint", `Mint: ${data.payment.mint.slice(0, 8)}...`);
    assert(typeof data.payment.recipientWallet === "string", "Has recipient", `Recipient: ${data.payment.recipientWallet.slice(0, 8)}...`);
  } else {
    console.log("  (Treasury wallet not configured - 503 expected in test environment)");
  }
}

async function test402Timestamp(): Promise<void> {
  console.log("\n--- x402 Flow: Timestamp (GET /api/services/timestamp) ---");
  const res = await fetch(`${BASE_URL}/api/services/timestamp`, {
    signal: AbortSignal.timeout(5000),
  });
  assert(res.status === 402 || res.status === 503, "Status 402 or 503", `Got ${res.status}`);

  if (res.status === 402) {
    const data = (await res.json()) as { payment: { amount: number } };
    assert(data.payment.amount === 25, "Timestamp price is 25", `Got ${data.payment.amount}`);
  }
}

async function test404NotFound(): Promise<void> {
  console.log("\n--- Not Found (GET /api/services/nonexistent) ---");
  const res = await fetch(`${BASE_URL}/api/services/nonexistent`, {
    signal: AbortSignal.timeout(5000),
  });
  assert(res.status === 404, "Status 404", `Got ${res.status}`);
  const data = (await res.json()) as { error: string };
  assert(typeof data.error === "string", "Has error message", data.error);
}

async function testInvalidPayment(): Promise<void> {
  console.log("\n--- Invalid Payment (GET /api/services/weather with bad X-Payment) ---");
  const res = await fetch(`${BASE_URL}/api/services/weather`, {
    headers: { "X-Payment": "not-valid-base64" },
    signal: AbortSignal.timeout(5000),
  });
  assert(res.status === 402, "Rejects invalid payment", `Got ${res.status}`);
}

async function testPaymentsValidation(): Promise<void> {
  console.log("\n--- Payments Validation (POST /api/payments) ---");

  const emptyBody = await fetch(`${BASE_URL}/api/payments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
    signal: AbortSignal.timeout(5000),
  });
  assert(emptyBody.status === 400, "Empty body -> 400", `Got ${emptyBody.status}`);

  const badAction = await fetch(`${BASE_URL}/api/payments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "invalid" }),
    signal: AbortSignal.timeout(5000),
  });
  assert(badAction.status === 400, "Unknown action -> 400", `Got ${badAction.status}`);
}

async function main(): Promise<void> {
  console.log(`\nx402 Integration Tests (${BASE_URL})\n${"=".repeat(50)}`);

  try {
    await fetch(`${BASE_URL}/api/services`, { signal: AbortSignal.timeout(3000) });
  } catch {
    console.error(`\nServer not reachable at ${BASE_URL}`);
    console.error("Start the dev server first: npm run dev\n");
    process.exit(1);
  }

  await testServicesList();
  await test402Response();
  await test402Timestamp();
  await test404NotFound();
  await testInvalidPayment();
  await testPaymentsValidation();

  const passed = results.filter((r) => r.passed).length;
  const total = results.length;
  console.log(`\n${"=".repeat(50)}`);
  console.log(`Results: ${passed}/${total} passed`);

  if (passed < total) {
    console.log("\x1b[31mSome tests failed.\x1b[0m");
    process.exit(1);
  } else {
    console.log("\x1b[32mAll tests passed.\x1b[0m");
  }
}

main();
