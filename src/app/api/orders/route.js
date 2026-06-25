import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const ordersFilePath = path.join(process.cwd(), "src/data", "orders.json");

export async function GET(request) {
  const timestamp = new Date().toISOString();
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    const role = request.headers.get("x-user-role") || "cliente";

    let orders = [];
    if (fs.existsSync(ordersFilePath)) {
      const fileData = fs.readFileSync(ordersFilePath, "utf8");
      orders = JSON.parse(fileData);
    }

    // Filter if role is cliente and email is provided
    if (role !== "administrador" && email) {
      orders = orders.filter(o => o.customer.email === email);
    }
    
    // Return orders sorted by date descending (most recent first)
    orders.sort((a, b) => new Date(b.date) - new Date(a.date));

    console.log(`[API SERVER LOG] [${timestamp}] GET /api/orders 200 - Historial consultado exitosamente (${orders.length} pedidos encontrados).`);
    return NextResponse.json(orders);
  } catch (error) {
    console.error(`[API SERVER LOG] [${timestamp}] GET /api/orders 500 - Error:`, error.message);
    return NextResponse.json(
      { error: "Error interno al cargar el historial de pedidos." },
      { status: 500 }
    );
  }
}
