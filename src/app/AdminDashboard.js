"use client";

import { useState, useEffect } from "react";

export default function AdminDashboard({ showToast }) {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("inventory"); // inventory, orders
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: "", category: "", price: "", stock: "", description: ""
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [resProd, resOrd] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/orders", { headers: { "x-user-role": "administrador" } })
      ]);
      
      if (resProd.ok) setProducts(await resProd.json());
      if (resOrd.ok) setOrders(await resOrd.json());
    } catch (err) {
      showToast("Error al cargar datos administrativos", "error");
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (id) => {
    if (!confirm("¿Estás seguro de eliminar este producto?")) return;
    try {
      const res = await fetch(`/api/products?id=${id}`, {
        method: "DELETE",
        headers: { "x-user-role": "administrador" }
      });
      if (res.ok) {
        showToast("Producto eliminado", "success");
        loadData();
      } else {
        showToast("Error al eliminar", "error");
      }
    } catch (err) {
      showToast("Error de conexión", "error");
    }
  };

  const openModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        category: product.category,
        price: product.price,
        stock: product.stock,
        description: product.description || ""
      });
    } else {
      setEditingProduct(null);
      setFormData({ name: "", category: "", price: "", stock: "", description: "" });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isUpdate = !!editingProduct;
    const url = "/api/products";
    const method = isUpdate ? "PUT" : "POST";
    const payload = {
      ...formData,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock, 10),
      id: isUpdate ? editingProduct.id : undefined,
      specs: isUpdate ? editingProduct.specs : {},
      imageUrl: isUpdate ? editingProduct.imageUrl : "/images/placeholder.jpg"
    };

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "x-user-role": "administrador"
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        showToast(isUpdate ? "Producto actualizado" : "Producto creado", "success");
        setIsModalOpen(false);
        loadData();
      } else {
        showToast("Error al guardar producto", "error");
      }
    } catch (err) {
      showToast("Error de conexión", "error");
    }
  };

  if (loading) return <div className="admin-loading" style={{textAlign: "center", padding: "3rem"}}>Cargando datos administrativos...</div>;

  return (
    <div className="admin-dashboard">
      <div className="admin-header" style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem"}}>
        <h2 style={{fontSize: "1.8rem", color: "var(--primary)"}}>Panel de Administración</h2>
        <div className="admin-tabs" style={{display: "flex", gap: "0.5rem"}}>
          <button className={`nav-tab-btn ${view === "inventory" ? "active" : ""}`} onClick={() => setView("inventory")} style={{padding: "0.5rem 1rem", borderRadius: "8px", border: "1px solid var(--primary)", background: view === "inventory" ? "var(--primary)" : "transparent", color: view === "inventory" ? "white" : "var(--primary)", cursor: "pointer"}}>Inventario</button>
          <button className={`nav-tab-btn ${view === "orders" ? "active" : ""}`} onClick={() => setView("orders")} style={{padding: "0.5rem 1rem", borderRadius: "8px", border: "1px solid var(--primary)", background: view === "orders" ? "var(--primary)" : "transparent", color: view === "orders" ? "white" : "var(--primary)", cursor: "pointer"}}>Todos los Pedidos</button>
        </div>
      </div>

      {view === "inventory" && (
        <div className="admin-inventory">
          <div className="admin-toolbar" style={{display: "flex", justifyContent: "space-between", marginBottom: "1rem"}}>
            <h3>Gestión de Inventario</h3>
            <button className="btn-primary" onClick={() => openModal()} style={{padding: "0.5rem 1rem", borderRadius: "8px", background: "var(--secondary)", color: "#000", border: "none", fontWeight: "bold", cursor: "pointer"}}>+ Nuevo Producto</button>
          </div>
          <div className="table-responsive" style={{overflowX: "auto"}}>
            <table className="admin-table" style={{width: "100%", borderCollapse: "collapse", background: "var(--bg-card)", borderRadius: "12px", overflow: "hidden", boxShadow: "var(--shadow-sm)"}}>
              <thead style={{background: "var(--primary)", color: "white"}}>
                <tr>
                  <th style={{padding: "1rem", textAlign: "left"}}>ID</th>
                  <th style={{padding: "1rem", textAlign: "left"}}>Nombre</th>
                  <th style={{padding: "1rem", textAlign: "left"}}>Categoría</th>
                  <th style={{padding: "1rem", textAlign: "left"}}>Precio</th>
                  <th style={{padding: "1rem", textAlign: "left"}}>Stock</th>
                  <th style={{padding: "1rem", textAlign: "left"}}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id} style={{borderBottom: "1px solid var(--border)", transition: "background 0.2s"}}>
                    <td style={{padding: "1rem"}}>{p.id}</td>
                    <td style={{padding: "1rem"}}>{p.name}</td>
                    <td style={{padding: "1rem"}}>{p.category}</td>
                    <td style={{padding: "1rem"}}>${p.price.toFixed(2)}</td>
                    <td style={{padding: "1rem"}}>
                      <span className={`stock-badge ${p.stock === 0 ? "out" : p.stock < 5 ? "low" : "ok"}`} style={{padding: "0.3rem 0.6rem", borderRadius: "20px", fontSize: "0.85rem", fontWeight: "bold", background: p.stock === 0 ? "#ffebee" : p.stock < 5 ? "#fff8e1" : "#e8f5e9", color: p.stock === 0 ? "#d32f2f" : p.stock < 5 ? "#f57f17" : "#2e7d32"}}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="actions-cell" style={{padding: "1rem", display: "flex", gap: "0.5rem"}}>
                      <button onClick={() => openModal(p)} style={{padding: "0.4rem 0.8rem", borderRadius: "6px", background: "var(--primary)", color: "white", border: "none", cursor: "pointer"}}>Editar</button>
                      <button onClick={() => handleDelete(p.id)} style={{padding: "0.4rem 0.8rem", borderRadius: "6px", background: "#d32f2f", color: "white", border: "none", cursor: "pointer"}}>Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {view === "orders" && (
        <div className="admin-orders">
          <h3 style={{marginBottom: "1rem"}}>Todos los Pedidos</h3>
          <div className="table-responsive" style={{overflowX: "auto"}}>
            <table className="admin-table" style={{width: "100%", borderCollapse: "collapse", background: "var(--bg-card)", borderRadius: "12px", overflow: "hidden", boxShadow: "var(--shadow-sm)"}}>
              <thead style={{background: "var(--primary)", color: "white"}}>
                <tr>
                  <th style={{padding: "1rem", textAlign: "left"}}>ID Pedido</th>
                  <th style={{padding: "1rem", textAlign: "left"}}>Fecha</th>
                  <th style={{padding: "1rem", textAlign: "left"}}>Cliente</th>
                  <th style={{padding: "1rem", textAlign: "left"}}>Total</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.orderId} style={{borderBottom: "1px solid var(--border)"}}>
                    <td style={{padding: "1rem"}}>{o.orderId}</td>
                    <td style={{padding: "1rem"}}>{new Date(o.date).toLocaleString()}</td>
                    <td style={{padding: "1rem"}}>{o.customer.name} ({o.customer.email})</td>
                    <td style={{padding: "1rem", fontWeight: "bold"}}>${o.total.toFixed(2)}</td>
                  </tr>
                ))}
                {orders.length === 0 && <tr><td colSpan="4" style={{padding: "2rem", textAlign: "center"}}>No hay pedidos registrados.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="modal-overlay" style={{position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(4px)"}}>
          <div className="modal-content admin-modal" style={{background: "var(--bg-main)", padding: "2rem", borderRadius: "16px", width: "90%", maxWidth: "500px", boxShadow: "var(--shadow-lg)"}}>
            <h3 style={{marginBottom: "1.5rem", fontSize: "1.5rem", color: "var(--primary)"}}>{editingProduct ? "Editar Producto" : "Nuevo Producto"}</h3>
            <form onSubmit={handleSubmit} className="admin-form" style={{display: "flex", flexDirection: "column", gap: "1rem"}}>
              <div className="form-group" style={{display: "flex", flexDirection: "column", gap: "0.5rem"}}>
                <label style={{fontWeight: "bold", fontSize: "0.9rem"}}>Nombre del Producto</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{padding: "0.8rem", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--bg-card)", color: "var(--text-main)"}} />
              </div>
              <div className="form-group" style={{display: "flex", flexDirection: "column", gap: "0.5rem"}}>
                <label style={{fontWeight: "bold", fontSize: "0.9rem"}}>Categoría</label>
                <select required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} style={{padding: "0.8rem", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--bg-card)", color: "var(--text-main)"}}>
                  <option value="">Seleccione...</option>
                  <option value="microcontrollers">Microcontroladores</option>
                  <option value="sensors">Sensores</option>
                  <option value="networking">Redes</option>
                  <option value="accessories">Accesorios</option>
                </select>
              </div>
              <div className="form-row" style={{display: "flex", gap: "1rem"}}>
                <div className="form-group" style={{flex: 1, display: "flex", flexDirection: "column", gap: "0.5rem"}}>
                  <label style={{fontWeight: "bold", fontSize: "0.9rem"}}>Precio ($)</label>
                  <input required type="number" step="0.01" min="0" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} style={{padding: "0.8rem", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--bg-card)", color: "var(--text-main)"}} />
                </div>
                <div className="form-group" style={{flex: 1, display: "flex", flexDirection: "column", gap: "0.5rem"}}>
                  <label style={{fontWeight: "bold", fontSize: "0.9rem"}}>Stock</label>
                  <input required type="number" min="0" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} style={{padding: "0.8rem", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--bg-card)", color: "var(--text-main)"}} />
                </div>
              </div>
              <div className="form-group" style={{display: "flex", flexDirection: "column", gap: "0.5rem"}}>
                <label style={{fontWeight: "bold", fontSize: "0.9rem"}}>Descripción corta</label>
                <textarea required rows="2" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} style={{padding: "0.8rem", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--bg-card)", color: "var(--text-main)", resize: "vertical"}}></textarea>
              </div>
              <div className="modal-actions" style={{display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "1rem"}}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{padding: "0.8rem 1.5rem", borderRadius: "8px", background: "transparent", border: "1px solid var(--border)", color: "var(--text-muted)", cursor: "pointer", fontWeight: "bold"}}>Cancelar</button>
                <button type="submit" style={{padding: "0.8rem 1.5rem", borderRadius: "8px", background: "var(--primary)", border: "none", color: "white", cursor: "pointer", fontWeight: "bold"}}>Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
