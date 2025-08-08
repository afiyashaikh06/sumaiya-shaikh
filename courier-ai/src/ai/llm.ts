import { Courier, Order } from '../models';

export type PlanRequest = {
  couriers: Courier[];
  orders: Order[];
};

export type PlanResponse = {
  summary: string;
  suggestedAssignments: Array<{ orderId: string; courierId: string | null; reason: string }>;
};

function simpleHeuristicAssign(couriers: Courier[], orders: Order[]): PlanResponse {
  const available = couriers.map(c => ({ ...c, remaining: c.capacity }));
  const assignments: Array<{ orderId: string; courierId: string | null; reason: string }> = [];

  for (const order of orders) {
    const courier = available.find(c => c.remaining >= order.size);
    if (courier) {
      courier.remaining -= order.size;
      assignments.push({ orderId: order.id, courierId: courier.id, reason: 'Fits capacity by first-available heuristic' });
    } else {
      assignments.push({ orderId: order.id, courierId: null, reason: 'No courier with available capacity' });
    }
  }

  const assigned = assignments.filter(a => a.courierId !== null).length;
  const summary = `Assigned ${assigned}/${orders.length} orders using a greedy capacity heuristic.`;
  return { summary, suggestedAssignments: assignments };
}

export async function planWithLLM(input: PlanRequest): Promise<PlanResponse> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return simpleHeuristicAssign(input.couriers, input.orders);
  }

  // Lightweight LLM call; if it fails, fall back to heuristic
  try {
    const prompt = `You are a logistics planner. Given couriers with capacities and orders with sizes, suggest assignments. Prefer balancing load. Return JSON array of {orderId, courierId, reason}.\n\nCouriers: ${JSON.stringify(input.couriers)}\nOrders: ${JSON.stringify(input.orders)}`;
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a helpful logistics planning assistant.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.2,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      return simpleHeuristicAssign(input.couriers, input.orders);
    }

    const data = await response.json();
    // Try to parse; if unexpected, fall back
    const content: string | undefined = data.choices?.[0]?.message?.content;
    if (!content) return simpleHeuristicAssign(input.couriers, input.orders);

    let parsed: any;
    try {
      parsed = JSON.parse(content);
    } catch {
      return simpleHeuristicAssign(input.couriers, input.orders);
    }

    const suggestedAssignments = Array.isArray(parsed)
      ? parsed
      : parsed.suggestedAssignments ?? [];

    return {
      summary: 'LLM-assisted plan generated.',
      suggestedAssignments
    };
  } catch {
    return simpleHeuristicAssign(input.couriers, input.orders);
  }
}