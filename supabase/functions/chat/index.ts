import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, action, payload } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Action: search products directly
    if (action === "search_products") {
      const { query, maxPrice, minPrice, category } = payload || {};
      let q = supabase.from("products").select("id, name, price, image_url, description, stock");
      if (maxPrice) q = q.lte("price", maxPrice);
      if (minPrice) q = q.gte("price", minPrice);
      if (query) q = q.ilike("name", `%${query}%`);
      q = q.gt("stock", 0).limit(8);
      const { data, error } = await q;
      if (error) throw error;
      return new Response(JSON.stringify({ products: data || [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Action: place order from chat
    if (action === "place_order") {
      const { userId, items, paymentMethod, shippingAddress, total } = payload;
      if (!userId || !items?.length) throw new Error("Missing order data");

      const { data: order, error: orderErr } = await supabase
        .from("orders")
        .insert({
          user_id: userId,
          total,
          payment_method: paymentMethod || "cod",
          shipping_address: shippingAddress || null,
        })
        .select()
        .single();
      if (orderErr) throw orderErr;

      const orderItems = items.map((item: any) => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
        product_name: item.product_name,
      }));
      await supabase.from("order_items").insert(orderItems);

      await supabase.from("notifications").insert({
        user_id: userId,
        title: "Order Confirmed! 🎉",
        message: `Order #${order.id.slice(0, 8)} placed. Total: ₹${total}. Payment: ${paymentMethod === "cod" ? "Cash on Delivery" : "Online Payment"}`,
      });

      return new Response(JSON.stringify({ success: true, orderId: order.id }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Default: AI chat with product search tool
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const tools = [
      {
        type: "function",
        function: {
          name: "search_products",
          description: "Search products in the LUXE store database. Use when user asks about products, wants to buy something, or asks for recommendations.",
          parameters: {
            type: "object",
            properties: {
              query: { type: "string", description: "Product name or keyword to search" },
              maxPrice: { type: "number", description: "Maximum price filter" },
              minPrice: { type: "number", description: "Minimum price filter" },
            },
            required: [],
            additionalProperties: false,
          },
        },
      },
    ];

    const systemPrompt = `You are LUXE Smart Shopping Assistant. You help customers search, select, and purchase products — all within this chat.

Your capabilities:
1. Search products using the search_products tool when users ask about products, prices, or categories
2. Help users add items to cart
3. Guide users through checkout with payment options (Cash on Delivery or Online Payment)
4. Answer questions about orders, shipping, returns

IMPORTANT BEHAVIOR:
- When a user asks to see products or mentions any product type/category, ALWAYS use the search_products tool
- For price filters like "under ₹500", use maxPrice parameter
- For price filters like "above ₹1000", use minPrice parameter  
- Keep responses concise and helpful
- Use ₹ for prices (Indian Rupees)
- After showing products, ask if they want to add any to cart
- After adding to cart, ask "Do you want to place the order now?"
- If yes, ask about payment preference: Cash on Delivery or Online Payment
- Be friendly, professional, and proactive

Store policies:
- Free shipping on orders over ₹999
- 30-day return policy
- Secure payments (COD & Online)
- 24/7 support via this chat`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        tools,
        stream: false,
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (status === 402) return new Response(JSON.stringify({ error: "Service temporarily unavailable." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const t = await response.text();
      console.error("AI gateway error:", status, t);
      return new Response(JSON.stringify({ error: "AI service error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const aiResult = await response.json();
    const choice = aiResult.choices?.[0];

    // Handle tool calls
    if (choice?.message?.tool_calls?.length) {
      const toolCall = choice.message.tool_calls[0];
      if (toolCall.function.name === "search_products") {
        const args = JSON.parse(toolCall.function.arguments);
        let q = supabase.from("products").select("id, name, price, image_url, description, stock");
        if (args.maxPrice) q = q.lte("price", args.maxPrice);
        if (args.minPrice) q = q.gte("price", args.minPrice);
        if (args.query) q = q.ilike("name", `%${args.query}%`);
        q = q.gt("stock", 0).limit(8);
        const { data: products } = await q;

        // Get a follow-up response with the product data
        const followUp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages: [
              { role: "system", content: systemPrompt },
              ...messages,
              choice.message,
              {
                role: "tool",
                tool_call_id: toolCall.id,
                content: JSON.stringify(products || []),
              },
            ],
            stream: false,
          }),
        });

        const followUpResult = await followUp.json();
        const assistantText = followUpResult.choices?.[0]?.message?.content || "Here are some products I found:";

        return new Response(JSON.stringify({
          reply: assistantText,
          products: products || [],
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Normal text response
    return new Response(JSON.stringify({
      reply: choice?.message?.content || "I'm here to help! Ask me about our products.",
      products: [],
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
