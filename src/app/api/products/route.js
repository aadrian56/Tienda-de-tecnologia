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

// Pseudo-auth check
const checkAdmin = (request) => {
  const role = request.headers.get("x-user-role");
  return role === "administrador";
};

export async function POST(request) {
  const timestamp = new Date().toISOString();
  if (!checkAdmin(request)) {
    return NextResponse.json({ error: "Acceso denegado." }, { status: 403 });
  }

  try {
    const newProduct = await request.json();
    const fileData = fs.readFileSync(productsFilePath, "utf8");
    const products = JSON.parse(fileData);

    // Generar ID simple si no existe
    if (!newProduct.id) {
      newProduct.id = "prod-" + Math.floor(1000 + Math.random() * 9000);
    }

    products.push(newProduct);
    fs.writeFileSync(productsFilePath, JSON.stringify(products, null, 2), "utf8");

    console.log(`[API SERVER LOG] [${timestamp}] POST /api/products 200 - Producto creado exitosamente (${newProduct.id}).`);
    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error(`[API SERVER LOG] [${timestamp}] POST /api/products 500 - Error:`, error.message);
    return NextResponse.json({ error: "Error interno al crear producto." }, { status: 500 });
  }
}

export async function PUT(request) {
  const timestamp = new Date().toISOString();
  if (!checkAdmin(request)) {
    return NextResponse.json({ error: "Acceso denegado." }, { status: 403 });
  }

  try {
    const updatedProduct = await request.json();
    const fileData = fs.readFileSync(productsFilePath, "utf8");
    let products = JSON.parse(fileData);

    const index = products.findIndex(p => p.id === updatedProduct.id);
    if (index === -1) {
      return NextResponse.json({ error: "Producto no encontrado." }, { status: 404 });
    }

    products[index] = { ...products[index], ...updatedProduct };
    fs.writeFileSync(productsFilePath, JSON.stringify(products, null, 2), "utf8");

    console.log(`[API SERVER LOG] [${timestamp}] PUT /api/products 200 - Producto actualizado exitosamente (${updatedProduct.id}).`);
    return NextResponse.json(products[index]);
  } catch (error) {
    console.error(`[API SERVER LOG] [${timestamp}] PUT /api/products 500 - Error:`, error.message);
    return NextResponse.json({ error: "Error interno al actualizar producto." }, { status: 500 });
  }
}

export async function DELETE(request) {
  const timestamp = new Date().toISOString();
  if (!checkAdmin(request)) {
    return NextResponse.json({ error: "Acceso denegado." }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    const fileData = fs.readFileSync(productsFilePath, "utf8");
    let products = JSON.parse(fileData);

    const filtered = products.filter(p => p.id !== id);
    if (products.length === filtered.length) {
      return NextResponse.json({ error: "Producto no encontrado." }, { status: 404 });
    }

    fs.writeFileSync(productsFilePath, JSON.stringify(filtered, null, 2), "utf8");

    console.log(`[API SERVER LOG] [${timestamp}] DELETE /api/products 200 - Producto eliminado exitosamente (${id}).`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`[API SERVER LOG] [${timestamp}] DELETE /api/products 500 - Error:`, error.message);
    return NextResponse.json({ error: "Error interno al eliminar producto." }, { status: 500 });
  }
}
