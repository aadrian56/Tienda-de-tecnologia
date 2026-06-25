import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const productsFilePath = path.join(process.cwd(), "src/data", "products.json");
const ordersFilePath = path.join(process.cwd(), "src/data", "orders.json");

export async function POST(request) {
  const timestamp = new Date().toISOString();
  try {
    const body = await request.json();
    const { cart, customer, coupon } = body;

    // Validate inputs
    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      console.log(`[API SERVER LOG] [${timestamp}] POST /api/checkout 400 - Carrito vacío o inválido.`);
      return NextResponse.json(
        { error: "El carrito está vacío o no es válido." },
        { status: 400 }
      );
    }

    if (!customer || !customer.name || !customer.email || !customer.address || !customer.city || !customer.phone) {
      console.log(`[API SERVER LOG] [${timestamp}] POST /api/checkout 400 - Datos de envío incompletos.`);
      return NextResponse.json(
        { error: "Faltan datos de envío obligatorios." },
        { status: 400 }
      );
    }

    // Coupon validation
    let hasDiscount = false;
    let discountRate = 0;
    if (coupon && coupon.trim() !== "") {
      const normalizedCoupon = coupon.trim().toUpperCase();
      if (normalizedCoupon === "DESCUENTO10") {
        hasDiscount = true;
        discountRate = 0.10;
      } else if (normalizedCoupon === "CAM23") {
        hasDiscount = true;
        discountRate = 0.25;
      } else {
        console.log(`[API SERVER LOG] [${timestamp}] POST /api/checkout 400 - Cupón inválido: "${coupon}".`);
        return NextResponse.json(
          { error: "Cupón inválido o no reconocido." },
          { status: 400 }
        );
      }
    }

    // Read current products
    const productsData = fs.readFileSync(productsFilePath, "utf8");
    const products = JSON.parse(productsData);

    // Validate stock for all items
    for (const cartItem of cart) {
      const dbProduct = products.find(p => p.id === cartItem.id);
      if (!dbProduct) {
        console.log(`[API SERVER LOG] [${timestamp}] POST /api/checkout 400 - Producto no encontrado (ID: ${cartItem.id}).`);
        return NextResponse.json(
          { error: `El producto con ID ${cartItem.id} no existe.` },
          { status: 400 }
        );
      }

      if (dbProduct.stock < cartItem.quantity) {
        console.log(`[API SERVER LOG] [${timestamp}] POST /api/checkout 400 - Stock insuficiente para ${dbProduct.name} (Solicitado: ${cartItem.quantity}, Stock: ${dbProduct.stock}).`);
        return NextResponse.json(
          { error: `Stock insuficiente para ${dbProduct.name}. Solicitado: ${cartItem.quantity}, Disponible: ${dbProduct.stock}.` },
          { status: 400 }
        );
      }
    }

    // Process: subtract stock
    let subtotal = 0;
    const orderItems = [];
    
    for (const cartItem of cart) {
      const dbProduct = products.find(p => p.id === cartItem.id);
      dbProduct.stock -= cartItem.quantity;
      
      const itemSubtotal = dbProduct.price * cartItem.quantity;
      subtotal += itemSubtotal;
      
      orderItems.push({
        id: dbProduct.id,
        name: dbProduct.name,
        price: dbProduct.price,
        quantity: cartItem.quantity,
        subtotal: itemSubtotal
      });
    }

    // Calculate discount and total
    const discountAmount = hasDiscount ? parseFloat((subtotal * discountRate).toFixed(2)) : 0;
    const total = parseFloat((subtotal - discountAmount).toFixed(2));

    // Save updated stock back to products.json
    fs.writeFileSync(productsFilePath, JSON.stringify(products, null, 2), "utf8");

    // Generate order object
    const orderId = "ORD-" + Math.floor(100000 + Math.random() * 900000);
    const newOrder = {
      orderId,
      date: new Date().toISOString(),
      customer,
      items: orderItems,
      subtotal: parseFloat(subtotal.toFixed(2)),
      coupon: hasDiscount ? "DESCUENTO10" : null,
      discount: discountAmount,
      total: total
    };

    // Save order to orders.json
    let orders = [];
    try {
      if (fs.existsSync(ordersFilePath)) {
        const ordersData = fs.readFileSync(ordersFilePath, "utf8");
        orders = JSON.parse(ordersData);
      }
    } catch (e) {
      console.error("Error reading orders database:", e);
    }
    
    orders.push(newOrder);
    fs.writeFileSync(ordersFilePath, JSON.stringify(orders, null, 2), "utf8");

    console.log(`[API SERVER LOG] [${timestamp}] POST /api/checkout 200 - Pedido procesado exitosamente (ID: ${orderId}, Total: $${total}, Cupón: ${coupon || "ninguno"}).`);

    return NextResponse.json({
      success: true,
      message: "¡Compra procesada con éxito! Tu pedido ha sido registrado.",
      order: newOrder,
      updatedProducts: products
    });

  } catch (error) {
    console.error(`[API SERVER LOG] [${timestamp}] POST /api/checkout 500 - Error:`, error.message);
    return NextResponse.json(
      { error: "Error interno del servidor al procesar el pedido." },
      { status: 500 }
    );
  }
}
