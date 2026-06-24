import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const productsFilePath = path.join(process.cwd(), "src/data", "products.json");

export async function GET(request) {
  const timestamp = new Date().toISOString();
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    const fileData = fs.readFileSync(productsFilePath, "utf8");
    let products = JSON.parse(fileData);

    if (category && category !== "all") {
      products = products.filter(p => p.category === category);
    }

    console.log(`[API SERVER LOG] [${timestamp}] GET /api/products 200 - Carga exitosa de catálogo (Filtro: ${category || "todos"}).`);
    return NextResponse.json(products);
  } catch (error) {
    console.error(`[API SERVER LOG] [${timestamp}] GET /api/products 500 - Error:`, error.message);
    return NextResponse.json(
      { error: "Error interno al cargar los productos." },
      { status: 500 }
    );
  }
}
