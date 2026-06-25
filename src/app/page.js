"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import AdminDashboard from "./AdminDashboard";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState([]);
  const [toasts, setToasts] = useState([]);
  
  // Product Details View states
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedProductQuantity, setSelectedProductQuantity] = useState(1);
  
  // Phase 2 states
  const [activeTab, setActiveTab] = useState("home"); // home, catalog, wishlist, history, admin
  const [userRole, setUserRole] = useState("cliente"); // cliente, administrador
  const [wishlist, setWishlist] = useState([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("default"); // default, price-asc, price-desc
  const [ordersHistory, setOrdersHistory] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Coupon State
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [couponError, setCouponError] = useState("");

  // Checkout Form State (Fase 4 & 6: Steps, IHC Validations & Confirmations)
  const [checkoutStep, setCheckoutStep] = useState(1); // Step 1 (Personal) or Step 2 (Shipping)
  const [customer, setCustomer] = useState({
    name: "",
    email: "",
    address: "",
    city: "",
    phone: ""
  });
  const [formErrors, setFormErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderConfirmation, setOrderConfirmation] = useState(null);

  // IHC Custom States
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [animateBadge, setAnimateBadge] = useState(false);
  const [showClearCartConfirm, setShowClearCartConfirm] = useState(false);
  const [theme, setTheme] = useState("light");
  const [openFaq, setOpenFaq] = useState(null);

  // Scroll behavior states
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Scroll listener for sticky header
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < 10) {
        setIsHeaderVisible(true);
      } else if (currentScrollY > lastScrollY) {
        // scrolling down
        setIsHeaderVisible(false);
      } else {
        // scrolling up
        setIsHeaderVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);


  // Fetch products
  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch("/api/products");
        if (res.ok) {
          const data = await res.json();
          setProducts(data);
        } else {
          showToast("Error al cargar componentes", "error");
        }
      } catch (error) {
        showToast("Error de conexión al cargar componentes", "error");
      } finally {
        setLoading(false);
      }
    }
    loadProducts();

    // Load wishlist from localStorage
    try {
      const savedWishlist = localStorage.getItem("wishlist");
      if (savedWishlist) {
        setWishlist(JSON.parse(savedWishlist));
      }
    } catch (e) {
      console.error("Error reading wishlist from localStorage", e);
    }

    // Load cart from localStorage
    try {
      const savedCart = localStorage.getItem("cart");
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    } catch (e) {
      console.error("Error reading cart from localStorage", e);
    }

    // Load theme from localStorage
    try {
      const savedTheme = localStorage.getItem("theme");
      const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const initialTheme = savedTheme || (systemPrefersDark ? "dark" : "light");
      setTheme(initialTheme);
      document.documentElement.setAttribute("data-theme", initialTheme);
    } catch (e) {
      console.error("Error loading theme", e);
    }
  }, []);


  // Save wishlist changes
  useEffect(() => {
    try {
      localStorage.setItem("wishlist", JSON.stringify(wishlist));
    } catch (e) {
      console.error("Error saving wishlist to localStorage", e);
    }
  }, [wishlist]);

  // Save cart changes
  useEffect(() => {
    try {
      localStorage.setItem("cart", JSON.stringify(cart));
    } catch (e) {
      console.error("Error saving cart to localStorage", e);
    }
  }, [cart]);

  // Handle keydown for accessibility (Escape closes cart and modal confirmations)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsCartOpen(false);
        setShowClearCartConfirm(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Microinteraction: Animate badge when total items count in cart changes
  const cartTotalQty = cart.reduce((count, item) => count + item.quantity, 0);
  useEffect(() => {
    if (cartTotalQty > 0) {
      setAnimateBadge(true);
      const timer = setTimeout(() => setAnimateBadge(false), 300);
      return () => clearTimeout(timer);
    }
  }, [cartTotalQty]);

  // Load orders history when activeTab becomes "history"
  useEffect(() => {
    if (activeTab === "history") {
      loadOrdersHistory();
    }
  }, [activeTab]);

  async function loadOrdersHistory() {
    setLoadingOrders(true);
    try {
      const res = await fetch("/api/orders", {
        headers: { "x-user-role": userRole }
      });
      if (res.ok) {
        const data = await res.json();
        setOrdersHistory(data);
      } else {
        showToast("Error al cargar historial de pedidos", "error");
      }
    } catch (error) {
      showToast("Error de conexión al cargar historial", "error");
    } finally {
      setLoadingOrders(false);
    }
  }

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    showToast(`Modo ${newTheme === "light" ? "Claro" : "Oscuro"} activado`, "success");
  };

  const faqs = [
    {
      q: "¿Cómo funciona la reserva de componentes y el stock?",
      a: "Nuestro sistema valida el stock físico en tiempo real. Cuando añades un componente al carrito o realizas la compra, se verifica la disponibilidad directa en nuestro servidor para evitar sobreventas."
    },
    {
      q: "¿Cómo aplico un cupón de descuento?",
      a: "En el Paso 2 del Checkout, introduce el código de descuento (por ejemplo, 'DESCUENTO10') en el campo correspondiente y presiona 'Aplicar' para obtener una deducción inmediata del 10%."
    },
    {
      q: "¿Los favoritos se guardan permanentemente?",
      a: "Sí, todos los componentes marcados con el icono de corazón se guardan de forma local en tu navegador utilizando localStorage, por lo que persistirán incluso si recargas la página."
    },
    {
      q: "¿Cómo puedo imprimir un recibo de mi compra?",
      a: "Una vez completado con éxito el checkout, aparecerá un modal con los detalles de tu compra y un botón para 'Imprimir Recibo'. Esto dará formato A4 optimizado y ocultará elementos innecesarios."
    }
  ];

  // Show dynamic toast alerts

  const showToast = (message, type = "success") => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Add item to cart
  const addToCart = (product) => {
    const existingItem = cart.find((item) => item.id === product.id);
    const currentQty = existingItem ? existingItem.quantity : 0;

    // Strict Frontend Stock Validation
    if (currentQty >= product.stock) {
      showToast(`Has alcanzado el límite de stock disponible para este componente.`, "error");
      return;
    }

    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    // setIsCartOpen(true); // Removed auto-open for better UX with modal
    showToast(`¡${product.name} añadido al carrito!`, "success");
  };

  // Update item quantity in cart
  const updateQuantity = (productId, amount) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    setCart(
      cart
        .map((item) => {
          if (item.id === productId) {
            const newQty = item.quantity + amount;
            
            // Check boundaries
            if (newQty <= 0) return null;
            if (newQty > product.stock) {
              showToast("Has alcanzado el límite de stock disponible para este componente.", "error");
              return item;
            }
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  // Remove item from cart
  const removeFromCart = (productId) => {
    const item = cart.find((i) => i.id === productId);
    setCart(cart.filter((item) => item.id !== productId));
    if (item) {
      showToast(`Eliminado: ${item.name}`, "error");
    }
  };

  // Toggle Favorite in Wishlist
  const toggleWishlist = (productId) => {
    if (wishlist.includes(productId)) {
      setWishlist(wishlist.filter((id) => id !== productId));
      showToast("Eliminado de la lista de deseos.", "error");
    } else {
      setWishlist([...wishlist, productId]);
      showToast("Agregado a la lista de deseos ❤️", "success");
    }
  };

  // Apply Coupon Code
  const handleApplyCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    if (code === "") {
      setAppliedCoupon("");
      setCouponError("");
      return;
    }
    if (code === "DESCUENTO10") {
      setAppliedCoupon("DESCUENTO10");
      setCouponError("");
      showToast("Cupón DESCUENTO10 aplicado: 10% de descuento.", "success");
    } else if (code === "CAM23") {
      setAppliedCoupon("CAM23");
      setCouponError("");
      showToast("Cupón CAM23 aplicado: 25% de descuento.", "success");
    } else {
      setAppliedCoupon("");
      setCouponError("Cupón inválido o no reconocido.");
      showToast("El cupón ingresado no es válido.", "error");
    }
  };

  // Calculate Totals and Discounts
  const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = appliedCoupon === "DESCUENTO10" ? cartSubtotal * 0.10 : appliedCoupon === "CAM23" ? cartSubtotal * 0.25 : 0;
  const iva = (cartSubtotal - discount) * 0.15;
  const cartTotal = (cartSubtotal - discount) + iva;

  const validateField = (field, val) => {
    let error = "";
    if (field === "name") {
      if (val.trim().length === 0) error = "El nombre es obligatorio.";
      else if (val.trim().length < 3) error = "El nombre debe tener al menos 3 caracteres.";
    } else if (field === "email") {
      if (val.trim().length === 0) error = "El correo electrónico es obligatorio.";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) error = "Formato de correo electrónico inválido.";
    } else if (field === "address") {
      if (val.trim().length === 0) error = "La dirección es obligatoria.";
      else if (val.trim().length < 10) error = "La dirección debe tener al menos 10 caracteres.";
    } else if (field === "city") {
      if (val.trim().length === 0) error = "La ciudad es obligatoria.";
    } else if (field === "phone") {
      const digits = val.replace(/\D/g, "");
      if (val.trim().length === 0) error = "El número de teléfono es obligatorio.";
      else if (digits.length < 7 || digits.length > 10) error = "El teléfono debe tener entre 7 y 10 dígitos.";
    }
    return error;
  };

  const getFieldStatus = (field, value) => {
    if (!value || value.trim().length === 0) {
      return { status: "red", text: "Este campo es obligatorio" };
    }
    if (field === "name") {
      if (value.trim().length < 3) {
        return { status: "yellow", text: `Ingresando... faltan ${3 - value.trim().length} caracteres` };
      }
      return { status: "green", text: "✓ Nombre válido" };
    }
    if (field === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return { status: "yellow", text: "Ingresa un formato de correo electrónico válido" };
      }
      return { status: "green", text: "✓ Correo electrónico válido" };
    }
    if (field === "address") {
      if (value.trim().length < 10) {
        return { status: "yellow", text: `Ingresando... faltan ${10 - value.trim().length} caracteres` };
      }
      return { status: "green", text: "✓ Dirección válida" };
    }
    if (field === "city") {
      return { status: "green", text: "✓ Ciudad válida" };
    }
    if (field === "phone") {
      const digits = value.replace(/\D/g, "");
      if (digits.length < 7) {
        return { status: "yellow", text: `Ingresando... faltan ${7 - digits.length} dígitos` };
      }
      if (digits.length > 10) {
        return { status: "red", text: "El teléfono no debe superar los 10 dígitos" };
      }
      return { status: "green", text: "✓ Teléfono válido" };
    }
    return { status: "green", text: "Válido" };
  };

  const getInputBorderClass = (field) => {
    if (!touchedFields[field]) return "";
    const info = getFieldStatus(field, customer[field]);
    if (info.status === "red") return "is-invalid";
    if (info.status === "yellow") return "is-warning";
    if (info.status === "green") return "is-valid";
    return "";
  };

  const handleInputChange = (field, val) => {


    setCustomer(prev => ({ ...prev, [field]: val }));
    setTouchedFields(prev => ({ ...prev, [field]: true }));
    const error = validateField(field, val);
    setFormErrors(prev => ({ ...prev, [field]: error }));
  };

  // Active validation states for steps (UX prevention)
  const isStep1Valid = customer.name.trim().length >= 3 && 
                        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email);

  const phoneDigits = customer.phone.replace(/\D/g, "");
  const isStep2Valid = customer.address.trim().length >= 10 && 
                        customer.city.trim() !== "" && 
                        phoneDigits.length >= 7 && 
                        phoneDigits.length <= 10;

  // Handle Checkout submission
  const handleCheckout = async (e) => {
    e.preventDefault();
    
    if (!isStep1Valid || !isStep2Valid) {
      showToast("Por favor, completa los campos requeridos correctamente.", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cart: cart.map((item) => ({ id: item.id, quantity: item.quantity })),
          customer,
          coupon: appliedCoupon
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setOrderConfirmation(data.order);
        // Refresh products list with updated backend stock
        setProducts(data.updatedProducts);
        // Clear cart and customer info
        setCart([]);
        setCustomer({ name: "", email: "", address: "", city: "", phone: "" });
        setCouponInput("");
        setAppliedCoupon("");
        setCouponError("");
        setFormErrors({});
        setCheckoutStep(1); // Reset step back to 1
        showToast("¡Compra procesada con éxito!", "success");
      } else {
        showToast(data.error || "Ocurrió un error al procesar la compra.", "error");
      }
    } catch (error) {
      showToast("Error de conexión al procesar el pedido.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Compute dynamic max price from products
  const absoluteMaxPrice = products.length > 0 ? Math.ceil(Math.max(...products.map(p => p.price)) / 10) * 10 : 200;

  // Filter products on frontend with category, search query, and maxPrice concurrently
  let filteredProducts = products.filter((p) => {
    const matchesCategory = activeCategory === "all" || 
                            p.category === activeCategory ||
                            (activeCategory === "sensors" && p.category === "sensores") ||
                            (activeCategory === "routers" && p.category === "networks");
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const minVal = parseFloat(minPrice);
    const matchesMinPrice = isNaN(minVal) || p.price >= minVal;

    const maxVal = parseFloat(maxPrice);
    const matchesMaxPrice = isNaN(maxVal) || p.price <= maxVal;

    const isFavorite = activeTab === "wishlist" ? wishlist.includes(p.id) : true;

    return matchesCategory && matchesSearch && matchesMinPrice && matchesMaxPrice && isFavorite;
  });

  // Sort products
  if (sortBy === "price-asc") {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (sortBy === "price-desc") {
    filteredProducts.sort((a, b) => b.price - a.price);
  }

  const categories = [
    { id: "all", label: "Todos" },
    { id: "microcontrollers", label: "Microcontroladores" },
    { id: "sensors", label: "Sensores" },
    { id: "routers", label: "Redes" }
  ];

  const navigationTabs = (
    <>
      <button 
        className={`nav-tab-btn ${activeTab === "home" ? "active" : ""}`}
        onClick={() => { setActiveTab("home"); setSelectedProduct(null); }}
      >
        <span className="nav-icon">🏠</span>
        <span className="nav-text">Inicio</span>
      </button>
      <button 
        className={`nav-tab-btn ${activeTab === "catalog" ? "active" : ""}`}
        onClick={() => { setActiveTab("catalog"); setSelectedProduct(null); }}
      >
        <span className="nav-icon">📦</span>
        <span className="nav-text">Catálogo</span>
      </button>
      {userRole === "cliente" && (
        <>
          <button 
            className={`nav-tab-btn ${activeTab === "wishlist" ? "active" : ""}`}
            onClick={() => { setActiveTab("wishlist"); setSelectedProduct(null); }}
          >
            <span className="nav-icon">❤️</span>
            <span className="nav-text">Favoritos</span>
            {wishlist.length > 0 && <span className="nav-badge">{wishlist.length}</span>}
          </button>
          <button 
            className={`nav-tab-btn ${activeTab === "history" ? "active" : ""}`}
            onClick={() => { setActiveTab("history"); setSelectedProduct(null); }}
          >
            <span className="nav-icon">🕒</span>
            <span className="nav-text">Historial</span>
          </button>
        </>
      )}
      {userRole === "administrador" && (
        <button 
          className={`nav-tab-btn ${activeTab === "admin" ? "active" : ""}`}
          onClick={() => { setActiveTab("admin"); setSelectedProduct(null); }}
        >
          <span className="nav-icon">⚙️</span>
          <span className="nav-text">Administración</span>
        </button>
      )}
      <button 
        className="nav-tab-btn"
        onClick={() => showToast("Perfil próximamente", "success")}
      >
        <span className="nav-icon">👤</span>
        <span className="nav-text">Perfil</span>
      </button>
    </>
  );

  return (
    <div className="app-container">
      {/* Toast Alert Notifications */}
      <div className="toast-container hide-on-print">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast ${toast.type}`}>
            <span className="toast-icon">
              {toast.type === "success" ? "✓" : "⚠"}
            </span>
            <span>{toast.message}</span>
          </div>
        ))}
      </div>

      {/* Main Header */}
      <header className={`main-header hide-on-print ${isHeaderVisible ? 'header-visible' : 'header-hidden'}`}>
        <div className="header-content">
          <div className="logo" onClick={() => { setActiveTab("home"); setCheckoutStep(1); setSelectedProduct(null); }} style={{ cursor: "pointer" }}>
            <span className="logo-icon">⚡</span>
            <span>ElectroMart</span>
          </div>
          {/* Tab Navigation buttons */}
          <div className="header-nav-tabs desktop-only">
            {navigationTabs}
          </div>
            
          {/* Header Icons */}
          <div className="header-icons">
            {/* Role Switcher */}
            <select 
              value={userRole} 
              onChange={(e) => {
                setUserRole(e.target.value);
                if (e.target.value === "cliente" && activeTab === "admin") {
                  setActiveTab("home");
                }
              }}
              style={{
                padding: "0.4rem",
                borderRadius: "6px",
                border: "1px solid var(--border)",
                background: "var(--bg-card)",
                color: "var(--text-main)",
                marginRight: "0.5rem"
              }}
            >
              <option value="cliente">Cliente</option>
              <option value="administrador">Admin</option>
            </select>

            {/* Contrast Switcher Button (REQ-IHC-16) */}
            <button 
              className="theme-toggle-btn"
              onClick={toggleTheme}
              title={theme === "light" ? "Activar modo oscuro" : "Activar modo claro"}
              aria-label="Cambiar tema de contraste"
              style={{
                background: "transparent",
                border: "1px solid var(--border)",
                borderRadius: "50%",
                width: "36px",
                height: "36px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                fontSize: "1.1rem",
                color: "var(--header-text)"
              }}
            >
              {theme === "light" ? "🌙" : "☀️"}
            </button>

            {userRole === "cliente" && (
              <button 
                className="cart-icon-btn" 
                aria-label="Ver Carrito"
                onClick={() => setIsCartOpen(!isCartOpen)}
              >
                🛒
                {cart.length > 0 && (
                  <span className={`cart-badge ${animateBadge ? "animate" : ""}`}>
                    {cart.reduce((count, item) => count + item.quantity, 0)}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <div className="header-nav-tabs mobile-only hide-on-print">
        {navigationTabs}
      </div>

      {/* Hero Section */}
      <section className="hero hide-on-print">
        <div className="hero-content">
          <h2>Tecnología para Prototipado y Proyectos</h2>
          <p>La tienda ideal para estudiantes, ingenieros y aficionados a la electrónica.</p>
        </div>
      </section>

      {/* Main Container */}
      <main className="main-content hide-on-print">
        
        {/* Left Column: Tab Views */}
        <section className="catalog-section">

          {/* Breadcrumbs Navigation */}
          <nav className="breadcrumbs hide-on-print" aria-label="Navegación de migas de pan" style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1rem", display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
            <span onClick={() => { setActiveTab("home"); setActiveCategory("all"); }} style={{ cursor: "pointer", textDecoration: "underline" }} title="Ir al Inicio">Inicio</span>
            <span>/</span>
            {activeTab === "history" ? (
              <span style={{ fontWeight: "bold", color: "var(--text-main)" }}>Historial de Pedidos</span>
            ) : activeTab === "home" ? (
              <span style={{ fontWeight: "bold", color: "var(--text-main)" }}>Acerca de</span>
            ) : (
              <>
                <span onClick={() => { setActiveCategory("all"); }} style={{ cursor: "pointer", textDecoration: activeCategory !== "all" ? "underline" : "none", color: activeCategory === "all" ? "var(--text-main)" : "inherit", fontWeight: activeCategory === "all" ? "bold" : "normal" }} title={`Ver todo en ${activeTab === "wishlist" ? "Favoritos" : "Catálogo"}`}>
                  {activeTab === "wishlist" ? "Favoritos" : "Catálogo"}
                </span>
                {activeCategory !== "all" && (
                  <>
                    <span>/</span>
                    <span style={{ fontWeight: "bold", color: "var(--text-main)" }}>
                      {categories.find(c => c.id === activeCategory)?.label}
                    </span>
                  </>
                )}
              </>
            )}
          </nav>
          
          {activeTab === "admin" && userRole === "administrador" ? (
            <AdminDashboard showToast={showToast} />
          ) : activeTab === "home" ? (
            /* Home / Store Details View */
            <div style={{ backgroundColor: "var(--bg-card)", padding: "2rem", borderRadius: "var(--radius)", border: "1px solid var(--border)", boxShadow: "var(--shadow)" }}>
              <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
                <span style={{ fontSize: "3.5rem" }}>⚡</span>
                <h2 style={{ fontSize: "2rem", color: "var(--primary)", marginBottom: "1rem", marginTop: "0.5rem" }}>Bienvenido a ElectroMart</h2>
                <p style={{ fontSize: "1.1rem", color: "var(--text-muted)", maxWidth: "700px", margin: "0 auto", lineHeight: "1.6" }}>
                  Tu proveedor líder en componentes electrónicos de alta fidelidad. Somos una tienda especializada en herramientas de desarrollo, microcontroladores, sensores y equipos de red para estudiantes, ingenieros y makers que buscan hacer realidad sus prototipos.
                </p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem", marginBottom: "3rem" }}>
                <div style={{ padding: "1.5rem", backgroundColor: "rgba(98, 0, 238, 0.05)", borderRadius: "var(--radius)", border: "1px solid rgba(98, 0, 238, 0.1)" }}>
                  <h3 style={{ color: "var(--primary)", marginBottom: "0.75rem", fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span>🛠️</span> Calidad Garantizada
                  </h3>
                  <p style={{ fontSize: "0.95rem", color: "var(--text-muted)", lineHeight: "1.5" }}>
                    Todos nuestros componentes provienen de fabricantes certificados y pasan por estrictas pruebas para asegurar el máximo rendimiento en tus diseños.
                  </p>
                </div>
                <div style={{ padding: "1.5rem", backgroundColor: "rgba(3, 218, 198, 0.05)", borderRadius: "var(--radius)", border: "1px solid rgba(3, 218, 198, 0.1)" }}>
                  <h3 style={{ color: "var(--secondary)", marginBottom: "0.75rem", fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span>🚀</span> Stock en Tiempo Real
                  </h3>
                  <p style={{ fontSize: "0.95rem", color: "var(--text-muted)", lineHeight: "1.5" }}>
                    Contamos con un avanzado sistema de validación de existencias. Lo que ves disponible en la tienda es exactamente lo que tenemos listo para enviar.
                  </p>
                </div>
                <div style={{ padding: "1.5rem", backgroundColor: "rgba(255, 183, 77, 0.05)", borderRadius: "var(--radius)", border: "1px solid rgba(255, 183, 77, 0.1)" }}>
                  <h3 style={{ color: "var(--warning)", marginBottom: "0.75rem", fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span>💬</span> Soporte Especializado
                  </h3>
                  <p style={{ fontSize: "0.95rem", color: "var(--text-muted)", lineHeight: "1.5" }}>
                    ¿Dudas de compatibilidad? ¿No sabes qué placa elegir? Contamos con documentación y asistencia para ayudarte a concluir con éxito tu proyecto.
                  </p>
                </div>
              </div>

              <div style={{ textAlign: "center" }}>
                <button 
                  onClick={() => setActiveTab("catalog")}
                  style={{ backgroundColor: "var(--primary)", color: "white", border: "none", padding: "1rem 2.5rem", borderRadius: "30px", fontSize: "1.1rem", fontWeight: "bold", cursor: "pointer", boxShadow: "0 4px 15px rgba(98, 0, 238, 0.3)", transition: "transform 0.2s" }}
                  onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                  onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
                >
                  Explorar Catálogo 📦
                </button>
              </div>

              {/* Team Members Section */}
              <div style={{ marginTop: "4rem", paddingTop: "3rem", borderTop: "1px solid var(--border)", textAlign: "center" }}>
                <h2 style={{ fontSize: "2rem", color: "var(--primary)", marginBottom: "0.5rem" }}>Nuestro Equipo</h2>
                <p style={{ color: "var(--text-muted)", marginBottom: "3rem", fontSize: "1.05rem" }}>Conoce a las personas detrás de ElectroMart</p>
                
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "2rem" }}>
                  
                  {/* Member 1 */}
                  <div className="team-member-card" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "2.5rem 1.5rem", display: "flex", flexDirection: "column", alignItems: "center", transition: "transform 0.3s", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }} onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-5px)"} onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0)"}>
                    <div className="team-avatar-wrapper" style={{ width: "120px", height: "120px", backgroundColor: "var(--border)", marginBottom: "1.5rem", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                      <img className="team-avatar" src="/images/andres.jpg" alt="Andres Miranda" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }} />
                      <span className="team-avatar-fallback" style={{ fontSize: "3.5rem", display: "none" }}>🧑‍💻</span>
                    </div>
                    <h3 style={{ fontSize: "1.3rem", marginBottom: "0.2rem", color: "var(--text-main)" }}>Andres Miranda</h3>
                    <p style={{ fontSize: "0.85rem", color: "var(--primary)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "1rem", fontWeight: "700" }}>Lead Developer & UX/UI</p>
                    <p style={{ fontSize: "0.95rem", color: "var(--text-muted)", marginBottom: "0.4rem", display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: "500" }}><span>📱</span> 0987082565</p>
                    <p style={{ fontSize: "0.9rem", color: "var(--secondary)", display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: "600" }}><span>✉️</span> justin.miranda@espoch.edu.ec</p>
                  </div>

                  {/* Member 2 */}
                  <div className="team-member-card" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "2.5rem 1.5rem", display: "flex", flexDirection: "column", alignItems: "center", transition: "transform 0.3s", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }} onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-5px)"} onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0)"}>
                    <div className="team-avatar-wrapper" style={{ width: "120px", height: "120px", backgroundColor: "var(--border)", marginBottom: "1.5rem", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                      <img className="team-avatar" src="/images/anthony.jpg" alt="Anthony Martinez" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }} />
                      <span className="team-avatar-fallback" style={{ fontSize: "3.5rem", display: "none" }}>🧑‍💻</span>
                    </div>
                    <h3 style={{ fontSize: "1.3rem", marginBottom: "0.2rem", color: "var(--text-main)" }}>Anthony Martinez</h3>
                    <p style={{ fontSize: "0.85rem", color: "var(--primary)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "1rem", fontWeight: "700" }}>Backend Engineer</p>
                    <p style={{ fontSize: "0.95rem", color: "var(--text-muted)", marginBottom: "0.4rem", display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: "500" }}><span>📱</span> 0979857183</p>
                    <p style={{ fontSize: "0.9rem", color: "var(--secondary)", display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: "600" }}><span>✉️</span> adrian.martinez@espoch.edu.ec</p>
                  </div>

                  {/* Member 3 */}
                  <div className="team-member-card" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "2.5rem 1.5rem", display: "flex", flexDirection: "column", alignItems: "center", transition: "transform 0.3s", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }} onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-5px)"} onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0)"}>
                    <div className="team-avatar-wrapper" style={{ width: "120px", height: "120px", backgroundColor: "var(--border)", marginBottom: "1.5rem", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                      <img className="team-avatar" src="/images/brayan.jpg" alt="Brayan Guncay" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }} />
                      <span className="team-avatar-fallback" style={{ fontSize: "3.5rem", display: "none" }}>🧑‍💻</span>
                    </div>
                    <h3 style={{ fontSize: "1.3rem", marginBottom: "0.2rem", color: "var(--text-main)" }}>Brayan Guncay</h3>
                    <p style={{ fontSize: "0.85rem", color: "var(--primary)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "1rem", fontWeight: "700" }}>Frontend Developer</p>
                    <p style={{ fontSize: "0.95rem", color: "var(--text-muted)", marginBottom: "0.4rem", display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: "500" }}><span>📱</span> 0980475826</p>
                    <p style={{ fontSize: "0.9rem", color: "var(--secondary)", display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: "600" }}><span>✉️</span> brayan.guncay@espoch.edu.ec</p>
                  </div>
                  
                </div>
              </div>
            </div>
          ) : activeTab === "history" ? (
            /* Order History Tab View */
            <div style={{ backgroundColor: "var(--bg-card)", padding: "1.5rem", borderRadius: "var(--radius)", border: "1px solid var(--border)", boxShadow: "var(--shadow)" }}>
              <h3 style={{ marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span>📜 Historial de Pedidos</span>
              </h3>
              
              {loadingOrders ? (
                <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
                  <h4>Cargando historial de pedidos...</h4>
                </div>
              ) : ordersHistory.length === 0 ? (
                <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
                  <p>No se han registrado compras anteriores en este servidor.</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {ordersHistory.map((order) => (
                    <div key={order.orderId} style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", padding: "1rem", backgroundColor: "rgba(0,0,0,0.01)" }}>
                      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", marginBottom: "0.5rem", borderBottom: "1px solid var(--border)", paddingBottom: "0.5rem" }}>
                        <div>
                          <strong>Pedido: {order.orderId}</strong>
                          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                            Fecha: {new Date(order.date).toLocaleString()}
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <span style={{ fontWeight: "700", color: "var(--primary)" }}>Total: ${order.total.toFixed(2)}</span>
                          {order.discount > 0 && (
                            <div style={{ fontSize: "0.75rem", color: "var(--secondary)" }}>
                              Ahorro: -${order.discount.toFixed(2)} ({order.coupon})
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Products List in Order */}
                      <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                        {order.items.map((item) => (
                          <div key={item.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.2rem" }}>
                            <span>• {item.name} <strong>(x{item.quantity})</strong></span>
                            <span>${item.subtotal.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : selectedProduct ? (
            /* Product Details View */
            <div className="product-details-container" style={{ animation: "fadeIn 0.3s ease-in" }}>
              {/* Breadcrumb Navigation */}
              <nav className="breadcrumbs hide-on-print" style={{ marginBottom: "2rem", display: "flex", gap: "0.5rem", fontSize: "0.9rem", color: "var(--text-muted)", flexWrap: "wrap" }}>
                <span style={{ cursor: "pointer", color: "var(--primary)" }} onClick={() => { setActiveTab("home"); setSelectedProduct(null); }}>Inicio</span> /
                <span style={{ cursor: "pointer", color: "var(--primary)" }} onClick={() => setSelectedProduct(null)}>Catálogo</span> /
                <span style={{ cursor: "pointer", color: "var(--primary)" }} onClick={() => { setActiveCategory(selectedProduct.category); setSelectedProduct(null); }}>
                  {selectedProduct.category === "microcontrollers" ? "Microcontroladores" : selectedProduct.category === "sensors" ? "Sensores" : "Redes / Routers"}
                </span> /
                <strong style={{ color: "var(--text-main)" }}>{selectedProduct.name}</strong>
              </nav>

              <div className="product-details-layout" style={{ display: "grid", gap: "2rem", marginBottom: "4rem" }}>
                
                {/* Left Column: Gallery */}
                <div className="product-gallery">
                  <div className="main-image-container" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "2rem", display: "flex", justifyContent: "center", alignItems: "center", height: "400px", position: "relative" }}>
                    <Image
                      src={selectedProduct.imageUrl}
                      alt={selectedProduct.name}
                      fill
                      style={{ objectFit: "contain", padding: "2rem" }}
                      priority
                    />
                  </div>
                  {/* Thumbnails (Simulated) */}
                  <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                    {[1, 2, 3, 4].map(idx => (
                      <div key={idx} style={{ width: "80px", height: "80px", border: `2px solid ${idx === 1 ? "var(--primary)" : "var(--border)"}`, borderRadius: "var(--radius-sm)", backgroundColor: "var(--bg-card)", display: "flex", justifyContent: "center", alignItems: "center", cursor: "pointer", opacity: idx === 1 ? 1 : 0.6, position: "relative" }}>
                        <Image src={selectedProduct.imageUrl} alt="thumbnail" fill style={{ objectFit: "contain", padding: "10px" }} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Column: Info */}
                <div className="product-info-column" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                  <div>
                    <span style={{ textTransform: "uppercase", fontSize: "0.8rem", fontWeight: "700", color: "var(--secondary)", letterSpacing: "1px" }}>
                      {selectedProduct.category === "microcontrollers" ? "Microcontrolador" : selectedProduct.category === "sensors" ? "Sensor" : "Redes / Routers"}
                    </span>
                    <h1 style={{ fontSize: "2rem", marginTop: "0.5rem", marginBottom: "1rem", lineHeight: "1.2" }}>{selectedProduct.name}</h1>
                    <p style={{ fontSize: "1.05rem", color: "var(--text-muted)", lineHeight: "1.6" }}>{selectedProduct.description}</p>
                  </div>

                  <div className="product-details-specs" style={{ display: "grid", gap: "0.5rem", padding: "1.5rem 0", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
                    {Object.entries(selectedProduct.specs).map(([key, val]) => (
                      <div key={key} style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: "1rem", fontSize: "0.95rem" }}>
                        <span style={{ color: "var(--text-muted)" }}>{key}</span>
                        <span style={{ fontWeight: "500", color: "var(--text-main)" }}>{val}</span>
                      </div>
                    ))}
                  </div>

                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
                      <span style={{ fontSize: "2.5rem", fontWeight: "800", color: "var(--primary)" }}>${selectedProduct.price.toFixed(2)}</span>
                      {selectedProduct.stock > 0 ? (
                        <span className="stock-tag in-stock" style={{ padding: "0.3rem 0.8rem", fontSize: "0.9rem" }}>{selectedProduct.stock} disponibles</span>
                      ) : (
                        <span className="stock-tag out-of-stock" style={{ padding: "0.3rem 0.8rem", fontSize: "0.9rem" }}>Agotado</span>
                      )}
                    </div>

                    <div style={{ display: "flex", gap: "1rem", alignItems: "stretch", flexWrap: "wrap" }}>
                      <div style={{ display: "flex", alignItems: "center", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", backgroundColor: "var(--bg-card)", overflow: "hidden" }}>
                        <button 
                          style={{ padding: "0.8rem 1.2rem", background: "transparent", border: "none", color: "var(--text-main)", cursor: "pointer", fontSize: "1.2rem" }}
                          onClick={() => setSelectedProductQuantity(prev => Math.max(1, prev - 1))}
                          disabled={selectedProductQuantity <= 1 || selectedProduct.stock <= 0}
                        >-</button>
                        <span style={{ padding: "0 1rem", fontWeight: "600", fontSize: "1.1rem" }}>{selectedProductQuantity}</span>
                        <button 
                          style={{ padding: "0.8rem 1.2rem", background: "transparent", border: "none", color: "var(--text-main)", cursor: "pointer", fontSize: "1.2rem" }}
                          onClick={() => setSelectedProductQuantity(prev => Math.min(selectedProduct.stock, prev + 1))}
                          disabled={selectedProductQuantity >= selectedProduct.stock || selectedProduct.stock <= 0}
                        >+</button>
                      </div>
                      
                      <button 
                        className="action-btn"
                        style={{ flex: 1, padding: "1rem 2rem", fontSize: "1.1rem", justifyContent: "center" }}
                        disabled={selectedProduct.stock <= 0}
                        onClick={() => {
                          const cartItem = cart.find(i => i.id === selectedProduct.id);
                          const currentQty = cartItem ? cartItem.quantity : 0;
                          if (currentQty + selectedProductQuantity > selectedProduct.stock) {
                            showToast(`Límite superado. Solo puedes añadir ${selectedProduct.stock - currentQty} más.`, "error");
                            return;
                          }
                          
                          if (cartItem) {
                            setCart(cart.map(item => item.id === selectedProduct.id ? { ...item, quantity: item.quantity + selectedProductQuantity } : item));
                          } else {
                            setCart([...cart, { ...selectedProduct, quantity: selectedProductQuantity }]);
                          }
                          showToast(`${selectedProductQuantity}x ${selectedProduct.name} añadido al carrito`, "success");
                        }}
                      >
                        Añadir al carrito 🛒
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Related Products Section */}
              <div style={{ marginTop: "4rem", paddingTop: "2rem", borderTop: "1px solid var(--border)" }}>
                <h2 style={{ marginBottom: "1.5rem", fontSize: "1.4rem", color: "var(--text-main)" }}>También te puede interesar</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1rem" }}>
                  {products
                    .filter(p => p.category === selectedProduct.category && p.id !== selectedProduct.id)
                    .slice(0, 4)
                    .map(product => {
                      const cartItem = cart.find((item) => item.id === product.id);
                      const cartQty = cartItem ? cartItem.quantity : 0;
                      const isOutOfStock = product.stock <= 0;
                      const isLimitReached = cartQty >= product.stock;

                      return (
                        <div key={product.id} className="product-card" style={{ padding: "1rem", cursor: "pointer", display: "flex", flexDirection: "column", justifyContent: "space-between" }} onClick={() => { setSelectedProduct(product); setSelectedProductQuantity(1); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
                          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                            <div style={{ width: "60px", height: "60px", position: "relative", backgroundColor: "rgba(0,0,0,0.1)", borderRadius: "8px", flexShrink: 0 }}>
                              <Image src={product.imageUrl} alt={product.name} fill style={{ objectFit: "contain", padding: "5px" }} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <h4 style={{ fontSize: "0.9rem", marginBottom: "0.25rem", color: "var(--text-main)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{product.name}</h4>
                              <div style={{ color: "var(--primary)", fontWeight: "bold", fontSize: "0.9rem" }}>${product.price.toFixed(2)}</div>
                            </div>
                            <button 
                              className="action-btn"
                              style={{ padding: "0.4rem 0.6rem", fontSize: "1.1rem", minWidth: "auto", alignSelf: "center" }}
                              disabled={isOutOfStock || isLimitReached}
                              onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                              title="Añadir al carrito"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      );
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* Catalog / Wishlist View */
            <>
              {/* Controls Bar: Category Filters & Search Input */}
              <div className="controls-bar" style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1.5rem" }}>
                
                {/* Search & Category Filter Row */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "center", justifyContent: "space-between" }}>
                  <div className="filter-bar" style={{ margin: 0, padding: 0 }}>
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        className={`filter-btn ${activeCategory === cat.id ? "active" : ""}`}
                        onClick={() => setActiveCategory(cat.id)}
                        title={`Filtrar componentes por ${cat.label}`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  {/* Real-time Search Input */}
                  <div className="search-wrapper" style={{ position: "relative", flex: "1 1 240px", maxWidth: "320px" }}>
                    <input
                      type="text"
                      placeholder="Buscar componente..."
                      className="form-control"
                      style={{ width: "100%", paddingLeft: "2.2rem", borderRadius: "20px" }}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      title="Escribe para buscar componentes en tiempo real"
                    />
                    <span style={{ position: "absolute", left: "0.8rem", top: "50%", transform: "translateY(-50%)", opacity: 0.5 }}>🔍</span>
                    {searchQuery && (
                      <button 
                        onClick={() => setSearchQuery("")}
                        style={{ position: "absolute", right: "0.8rem", top: "50%", transform: "translateY(-50%)", border: "none", background: "transparent", cursor: "pointer", fontSize: "0.9rem", color: "var(--text-muted)" }}
                        title="Limpiar búsqueda actual"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>

                {/* Advanced Filters Row: Price Ranges & Sorting */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "center", backgroundColor: "var(--bg-card)", padding: "1rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
                  
                  {(() => {
                    const currentMin = minPrice === "" ? 0 : Number(minPrice);
                    const currentMax = maxPrice === "" ? absoluteMaxPrice : Number(maxPrice);
                    return (
                      <>
                        {/* Dynamic Dual Price Range Slider */}
                        <div style={{ display: "flex", alignItems: "center", gap: "1rem", flex: 1, minWidth: "300px" }}>
                          <label style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "500", whiteSpace: "nowrap" }}>
                            Rango:
                          </label>
                          <span style={{ fontSize: "0.85rem", color: "var(--text-main)", fontWeight: "600", whiteSpace: "nowrap", minWidth: "40px", textAlign: "right" }}>
                            ${currentMin}
                          </span>
                          
                          <div style={{ position: "relative", flex: 1, height: "6px", backgroundColor: "var(--border)", borderRadius: "3px" }}>
                            {/* Active Track */}
                            <div 
                              style={{
                                position: "absolute",
                                height: "100%",
                                backgroundColor: "var(--primary)",
                                borderRadius: "3px",
                                left: `${(currentMin / absoluteMaxPrice) * 100}%`,
                                right: `${100 - (currentMax / absoluteMaxPrice) * 100}%`,
                                zIndex: 1
                              }}
                            />
                            {/* Min Slider */}
                            <input
                              type="range"
                              min="0"
                              max={absoluteMaxPrice}
                              step="1"
                              value={currentMin}
                              onChange={(e) => {
                                const val = Math.min(Number(e.target.value), currentMax - 1);
                                setMinPrice(val.toString());
                              }}
                              className="dual-slider"
                            />
                            {/* Max Slider */}
                            <input
                              type="range"
                              min="0"
                              max={absoluteMaxPrice}
                              step="1"
                              value={currentMax}
                              onChange={(e) => {
                                const val = Math.max(Number(e.target.value), currentMin + 1);
                                setMaxPrice(val.toString());
                              }}
                              className="dual-slider"
                            />
                          </div>
                          
                          <span style={{ fontSize: "0.85rem", color: "var(--text-main)", fontWeight: "600", whiteSpace: "nowrap", minWidth: "40px" }}>
                            ${currentMax === absoluteMaxPrice ? `${absoluteMaxPrice}+` : currentMax}
                          </span>
                        </div>

                        {/* Clear Max Price button */}
                        {(minPrice !== "" || (maxPrice !== "" && parseInt(maxPrice) < absoluteMaxPrice)) && (
                          <button
                            className="filter-btn"
                            style={{ padding: "0.35rem 0.75rem", borderRadius: "8px", fontSize: "0.75rem", whiteSpace: "nowrap" }}
                            onClick={() => { setMinPrice(""); setMaxPrice(""); }}
                            title="Quitar filtro de precio"
                          >
                            Limpiar Precio
                          </button>
                        )}
                      </>
                    );
                  })()}

                  {/* Sorting dropdown */}
                  <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <label style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "500" }}>Ordenar por:</label>
                    <select
                      className="form-control"
                      style={{ padding: "0.35rem 0.5rem", borderRadius: "6px", cursor: "pointer" }}
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option value="default">Relevancia</option>
                      <option value="price-asc">Precio: Menor a Mayor</option>
                      <option value="price-desc">Precio: Mayor a Menor</option>
                    </select>
                  </div>
                </div>

              </div>

              {loading ? (
                <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
                  <h3>Cargando catálogo...</h3>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
                  <h3>No se encontraron componentes en esta vista.</h3>
                  <p style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>Intenta cambiar los filtros, precios o tu búsqueda.</p>
                </div>
              ) : (
                <div className="products-grid">
                  {filteredProducts.map((product) => {
                    const cartItem = cart.find((item) => item.id === product.id);
                    const cartQty = cartItem ? cartItem.quantity : 0;
                    const isOutOfStock = product.stock <= 0;
                    const isLimitReached = cartQty >= product.stock;
                    const isFavorited = wishlist.includes(product.id);

                    return (
                      <article 
                        key={product.id} 
                        className="product-card"
                        onClick={() => {
                          setSelectedProduct(product);
                          setSelectedProductQuantity(1);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        style={{ cursor: "pointer" }}
                      >
                        {/* Wishlist Heart Button */}
                        <button
                          className="wishlist-btn"
                          aria-label={isFavorited ? "Quitar de favoritos" : "Guardar en favoritos"}
                          title={isFavorited ? "Eliminar de favoritos" : "Agregar a favoritos"}
                          onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
                          style={{
                            position: "absolute",
                            top: "10px",
                            right: "10px",
                            zIndex: 10,
                            background: "var(--bg-card)",
                            border: "1px solid var(--border)",
                            borderRadius: "50%",
                            width: "36px",
                            height: "36px",
                            cursor: "pointer",
                            fontSize: "1.1rem",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                            transition: "transform 0.2s ease"
                          }}
                        >
                          {isFavorited ? "❤️" : "🤍"}
                        </button>

                        {/* SVG Image Container */}
                        <div className="product-image-container">
                          <div className="product-image-placeholder">
                            <Image
                              src={product.imageUrl}
                              alt={product.name}
                              width={120}
                              height={120}
                              style={{ objectFit: "contain" }}
                              priority={product.id === "prod-001"}
                            />
                          </div>
                        </div>

                        <div className="product-card-body">
                          <span className="product-category">
                            {product.category === "microcontrollers" ? "Microcontrolador" : product.category === "sensors" ? "Sensor" : "Redes / Routers"}
                          </span>
                          <h3 className="product-name">{product.name}</h3>
                          <p className="product-description">{product.description}</p>

                          {/* Technical Specs */}
                          <div className="product-specs">
                            {Object.entries(product.specs).slice(0, 4).map(([key, val]) => (
                              <div className="spec-item" key={key}>
                                <span className="spec-label">{key}</span>
                                <span className="spec-val" title={val}>{val}</span>
                              </div>
                            ))}
                          </div>

                          {/* Stock and Price Footer */}
                          <div className="product-footer">
                            <div>
                              <div className="product-price">${product.price.toFixed(2)}</div>
                              
                              {/* Stock and Critical Stock Warning Labels */}
                              {isOutOfStock ? (
                                <span className="stock-tag out-of-stock">Agotado</span>
                              ) : product.stock <= 3 ? (
                                <span className="stock-tag critical-stock" title="Pocas unidades en inventario">
                                  ⚠️ ¡Últimas unidades! (Quedan {product.stock})
                                </span>
                              ) : (
                                <span className="stock-tag in-stock">{product.stock} disponibles</span>
                              )}
                            </div>

                            {/* Add to Cart button disabled when stock is reached */}
                            <button
                              className="action-btn"
                              disabled={isOutOfStock || isLimitReached}
                              onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                            >
                              {isOutOfStock 
                                ? "Agotado" 
                                : isLimitReached 
                                  ? "Límite" 
                                  : "Añadir 🛒"
                              }
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
              {/* FAQ Accordion Section (REQ-IHC-15) */}
              <section className="faq-section" style={{ marginTop: "3rem", borderTop: "1px solid var(--border)", paddingTop: "2rem" }}>
                <h3 style={{ marginBottom: "1rem", color: "var(--text-main)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span>❓ Preguntas Frecuentes (FAQs)</span>
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {faqs.map((faq, index) => {
                    const isOpen = openFaq === index;
                    return (
                      <div 
                        key={index} 
                        style={{ 
                          border: "1px solid var(--border)", 
                          borderRadius: "var(--radius-sm)", 
                          backgroundColor: "var(--bg-card)", 
                          overflow: "hidden" 
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => setOpenFaq(isOpen ? null : index)}
                          style={{
                            width: "100%",
                            padding: "1rem",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            background: "transparent",
                            border: "none",
                            textAlign: "left",
                            cursor: "pointer",
                            fontWeight: "500",
                            color: "var(--text-main)",
                            fontSize: "0.95rem"
                          }}
                        >
                          <span>{faq.q}</span>
                          <span style={{ fontSize: "1.2rem", color: "var(--primary)", transition: "transform 0.2s", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}>
                            ▼
                          </span>
                        </button>
                        {isOpen && (
                          <div style={{ padding: "0 1rem 1rem 1rem", fontSize: "0.9rem", color: "var(--text-muted)", borderTop: "1px solid var(--border)", paddingTop: "0.5rem" }}>
                            {faq.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            </>
          )}


        </section>

        {/* Right Column: Cart and Checkout */}
        {/* Drawer Overlay */}
        <div 
          className={`cart-sidebar-overlay hide-on-print ${isCartOpen ? "open" : ""}`} 
          onClick={() => setIsCartOpen(false)} 
        />

        {/* Right Column: Cart and Checkout (Styled as Drawer) */}
        <section id="cart-section" className={`cart-sidebar hide-on-print ${isCartOpen ? "open" : ""}`}>
          <h3 className="cart-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>🛒 Tu Carrito</span>
            <button 
              type="button" 
              className="cart-close-btn"
              onClick={() => setIsCartOpen(false)}
              aria-label="Cerrar carrito"
              style={{ background: "transparent", border: "none", fontSize: "1.5rem", cursor: "pointer", color: "var(--text-main)", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              ✕
            </button>
          </h3>

          {cart.length === 0 ? (
            <div style={{ textAlign: "center", padding: "2rem 0", color: "var(--text-muted)" }}>
              <p>Tu carrito está vacío.</p>
              <p style={{ fontSize: "0.8rem", marginTop: "0.5rem" }}>¡Agrega componentes electrónicos para empezar!</p>
            </div>
          ) : (
            <>
              {/* Cart Actions */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem", paddingBottom: "0.5rem", borderBottom: "1px solid var(--border)" }}>
                <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{cart.length} componentes</span>
                <button
                  type="button"
                  className="filter-btn"
                  style={{ padding: "0.25rem 0.5rem", borderRadius: "8px", fontSize: "0.75rem", color: "var(--error)", borderColor: "var(--error)", margin: 0 }}
                  onClick={() => {
                    setIsCartOpen(false);
                    setShowClearCartConfirm(true);
                  }}
                  title="Vaciar todos los artículos del carrito"
                >
                  Vaciar Carrito 🗑️
                </button>
              </div>
              {/* Cart Items List */}
              <div className="cart-items-list">
                {cart.map((item) => {
                  const dbProduct = products.find((p) => p.id === item.id);
                  const maxStock = dbProduct ? dbProduct.stock : item.quantity;
                  const isPlusDisabled = item.quantity >= maxStock;

                  return (
                    <div key={item.id} className="cart-item">
                      <div className="cart-item-info">
                        <div className="cart-item-name">{item.name}</div>
                        <div className="cart-item-price">
                          ${item.price.toFixed(2)} c/u • Subtotal: ${(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                      
                      {/* Plus and Minus Controls with Live Stock Block */}
                      <div className="cart-item-controls">
                        <button
                          className="quantity-btn"
                          aria-label="Disminuir cantidad"
                          title="Disminuir cantidad"
                          onClick={() => updateQuantity(item.id, -1)}
                        >
                          -
                        </button>
                        <span className="cart-item-qty">{item.quantity}</span>
                        <button
                          className="quantity-btn"
                          aria-label="Incrementar cantidad"
                          title="Incrementar cantidad"
                          disabled={isPlusDisabled}
                          onClick={() => updateQuantity(item.id, 1)}
                        >
                          +
                        </button>
                        <button
                          className="cart-item-remove"
                          aria-label="Quitar artículo"
                          title="Eliminar este artículo del carrito"
                          onClick={() => removeFromCart(item.id)}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Cart Summary */}
              <div className="cart-summary">
                <div className="summary-row">
                  <span>Subtotal:</span>
                  <span>${cartSubtotal.toFixed(2)}</span>
                </div>
                
                {/* Coupon Discount Details */}
                {appliedCoupon && (
                  <div className="summary-row" style={{ color: "var(--secondary)", fontWeight: "500" }}>
                    <span>Descuento ({appliedCoupon}):</span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="summary-row">
                  <span>IVA (15%):</span>
                  <span>${iva.toFixed(2)}</span>
                </div>
                
                <div className="summary-row total">
                  <span>Total:</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Checkout Form (Fase 4: steps checkout layout) */}
              <form className="checkout-form" onSubmit={handleCheckout} noValidate>
                <h4 style={{ marginBottom: "1rem" }}>Proceso de Compra</h4>

                {/* Progress bar visual indicator */}
                <div className="steps-indicator">
                  <div className={`step-node ${checkoutStep >= 1 ? (checkoutStep > 1 ? "completed" : "active") : ""}`}>
                    {checkoutStep > 1 ? "✓" : "1"}
                    <span className="step-label" style={{ left: 0 }}>1. Datos</span>
                  </div>
                  <div className={`step-node ${checkoutStep === 2 ? "active" : ""}`}>
                    2
                    <span className="step-label" style={{ right: 0 }}>2. Envío</span>
                  </div>
                </div>

                {/* STEP 1: Personal Details */}
                {checkoutStep === 1 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "1rem" }}>
                    {/* Name field */}
                    <div className="form-group">
                      <label htmlFor="checkout-name">Nombre Completo *</label>
                      <input
                        type="text"
                        id="checkout-name"
                        className={`form-control ${getInputBorderClass("name")}`}
                        placeholder="Juan Pérez"
                        value={customer.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        onBlur={(e) => handleInputChange("name", e.target.value)}
                      />
                      {touchedFields.name && (() => {
                        const info = getFieldStatus("name", customer.name);
                        const statusColor = info.status === "red" ? "var(--error)" : info.status === "yellow" ? "var(--warning)" : "var(--success)";
                        return (
                          <span style={{ color: statusColor, fontSize: "0.8rem", marginTop: "0.2rem", display: "block", fontWeight: "500" }}>
                            {info.text}
                          </span>
                        );
                      })()}
                    </div>

                    {/* Email field */}
                    <div className="form-group">
                      <label htmlFor="checkout-email">Correo Electrónico *</label>
                      <input
                        type="email"
                        id="checkout-email"
                        className={`form-control ${getInputBorderClass("email")}`}
                        placeholder="juan@email.com"
                        value={customer.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        onBlur={(e) => handleInputChange("email", e.target.value)}
                      />
                      {touchedFields.email && (() => {
                        const info = getFieldStatus("email", customer.email);
                        const statusColor = info.status === "red" ? "var(--error)" : info.status === "yellow" ? "var(--warning)" : "var(--success)";
                        return (
                          <span style={{ color: statusColor, fontSize: "0.8rem", marginTop: "0.2rem", display: "block", fontWeight: "500" }}>
                            {info.text}
                          </span>
                        );
                      })()}
                    </div>

                    {/* Next step button (disabled if personal info invalid) */}
                    <button
                      type="button"
                      className="checkout-submit-btn"
                      style={{ marginTop: "0.5rem" }}
                      disabled={!isStep1Valid}
                      onClick={() => setCheckoutStep(2)}
                    >
                      Siguiente Paso ➡️
                    </button>
                  </div>
                )}

                {/* STEP 2: Shipping details and Checkout button */}
                {checkoutStep === 2 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "1rem" }}>
                    {/* Address field */}
                    <div className="form-group">
                      <label htmlFor="checkout-address">Dirección *</label>
                      <input
                        type="text"
                        id="checkout-address"
                        className={`form-control ${getInputBorderClass("address")}`}
                        placeholder="Calle Falsa 123, Dpto 4B"
                        value={customer.address}
                        onChange={(e) => handleInputChange("address", e.target.value)}
                        onBlur={(e) => handleInputChange("address", e.target.value)}
                      />
                      {touchedFields.address && (() => {
                        const info = getFieldStatus("address", customer.address);
                        const statusColor = info.status === "red" ? "var(--error)" : info.status === "yellow" ? "var(--warning)" : "var(--success)";
                        return (
                          <span style={{ color: statusColor, fontSize: "0.8rem", marginTop: "0.2rem", display: "block", fontWeight: "500" }}>
                            {info.text}
                          </span>
                        );
                      })()}
                    </div>

                    {/* City field */}
                    <div className="form-group">
                      <label htmlFor="checkout-city">Ciudad *</label>
                      <input
                        type="text"
                        id="checkout-city"
                        className={`form-control ${getInputBorderClass("city")}`}
                        placeholder="Santiago"
                        value={customer.city}
                        onChange={(e) => handleInputChange("city", e.target.value)}
                        onBlur={(e) => handleInputChange("city", e.target.value)}
                      />
                      {touchedFields.city && (() => {
                        const info = getFieldStatus("city", customer.city);
                        const statusColor = info.status === "red" ? "var(--error)" : info.status === "yellow" ? "var(--warning)" : "var(--success)";
                        return (
                          <span style={{ color: statusColor, fontSize: "0.8rem", marginTop: "0.2rem", display: "block", fontWeight: "500" }}>
                            {info.text}
                          </span>
                        );
                      })()}
                    </div>

                    {/* Phone field */}
                    <div className="form-group">
                      <label htmlFor="checkout-phone">Número de Teléfono *</label>
                      <input
                        type="tel"
                        id="checkout-phone"
                        className={`form-control ${getInputBorderClass("phone")}`}
                        placeholder="987654321"
                        value={customer.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        onBlur={(e) => handleInputChange("phone", e.target.value)}
                      />
                      {touchedFields.phone && (() => {
                        const info = getFieldStatus("phone", customer.phone);
                        const statusColor = info.status === "red" ? "var(--error)" : info.status === "yellow" ? "var(--warning)" : "var(--success)";
                        return (
                          <span style={{ color: statusColor, fontSize: "0.8rem", marginTop: "0.2rem", display: "block", fontWeight: "500" }}>
                            {info.text}
                          </span>
                        );
                      })()}
                    </div>


                    {/* Coupon Code Input Field */}
                    <div className="form-group">
                      <label htmlFor="checkout-coupon">Cupón de Descuento</label>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <input
                          type="text"
                          id="checkout-coupon"
                          className="form-control"
                          placeholder="Ej: DESCUENTO10"
                          style={{ flex: 1, textTransform: "uppercase" }}
                          value={couponInput}
                          onChange={(e) => setCouponInput(e.target.value)}
                        />
                        <button
                          type="button"
                          className="filter-btn"
                          style={{ padding: "0 1rem", borderRadius: "var(--radius-sm)", margin: 0 }}
                          onClick={handleApplyCoupon}
                        >
                          Aplicar
                        </button>
                      </div>
                      {appliedCoupon && (
                        <span style={{ color: "var(--secondary)", fontSize: "0.8rem", marginTop: "0.2rem", display: "block" }}>
                          ✓ Cupón activo: 10% de descuento.
                        </span>
                      )}
                      {couponError && (
                        <span className="form-error-msg" style={{ display: "block" }}>
                          {couponError}
                        </span>
                      )}
                    </div>

                    {/* Back & Submit Row */}
                    <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
                      <button
                        type="button"
                        className="filter-btn"
                        style={{ padding: "0.85rem 1rem", borderRadius: "var(--radius-sm)", margin: 0 }}
                        onClick={() => setCheckoutStep(1)}
                      >
                        ⬅️ Atrás
                      </button>
                      <button
                        type="submit"
                        className="checkout-submit-btn"
                        style={{ margin: 0, flex: 1 }}
                        disabled={!isStep2Valid || isSubmitting}
                      >
                        {isSubmitting ? (
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                            <span className="spinner"></span>
                            <span>Procesando...</span>
                          </div>
                        ) : (
                          "Realizar Compra 🚀"
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </form>
            </>
          )}
        </section>
      </main>

      {/* Confirmation Modal for Clear Cart */}
      {showClearCartConfirm && (
        <div className="modal-overlay hide-on-print" onClick={() => setShowClearCartConfirm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "400px" }}>
            <div className="modal-header">
              <div className="modal-icon-success" style={{ backgroundColor: "rgba(207, 102, 121, 0.15)", color: "var(--error)", margin: "0 auto 1rem" }}>⚠️</div>
              <h2 style={{ textAlign: "center" }}>¿Vaciar Carrito?</h2>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "0.25rem", textAlign: "center" }}>
                Esta acción eliminará todos los componentes que has seleccionado de tu pedido. ¿Estás seguro?
              </p>
            </div>
            <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
              <button 
                className="close-modal-btn" 
                style={{ flex: 1, backgroundColor: "var(--error)", color: "white", fontWeight: "700" }}
                onClick={() => {
                  setCart([]);
                  setShowClearCartConfirm(false);
                  showToast("Carrito vaciado correctamente.", "error");
                }}
              >
                Sí, vaciar
              </button>
              <button 
                className="close-modal-btn" 
                style={{ flex: 1, backgroundColor: "var(--border)", color: "var(--text-main)" }}
                onClick={() => setShowClearCartConfirm(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Order Confirmation Dialog */}
      {orderConfirmation && (
        <div className="modal-overlay hide-on-print">
          <div className="modal-content">
            <div className="modal-header">
              <div className="modal-icon-success">✓</div>
              <h2>¡Compra Confirmada!</h2>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "0.25rem" }}>
                Pedido registrado con ID: <strong>{orderConfirmation.orderId}</strong>
              </p>
            </div>

            <div className="modal-details">
              <h4>Resumen del Envío</h4>
              <div className="modal-details-row">
                <span>Cliente:</span>
                <strong>{orderConfirmation.customer.name}</strong>
              </div>
              <div className="modal-details-row">
                <span>Dirección:</span>
                <span>{orderConfirmation.customer.address}, {orderConfirmation.customer.city}</span>
              </div>
              <div className="modal-details-row">
                <span>Teléfono:</span>
                <span>{orderConfirmation.customer.phone}</span>
              </div>
            </div>

            <div className="modal-details">
              <h4>Artículos</h4>
              {orderConfirmation.items.map((item) => (
                <div key={item.id} className="modal-details-row" style={{ fontSize: "0.85rem", marginBottom: "0.25rem" }}>
                  <span>{item.name} (x{item.quantity})</span>
                  <span>${item.subtotal.toFixed(2)}</span>
                </div>
              ))}
              
              <div className="modal-details-row" style={{ borderTop: "1px solid var(--border)", paddingTop: "0.5rem", marginTop: "0.5rem" }}>
                <span>Subtotal:</span>
                <span>${orderConfirmation.subtotal.toFixed(2)}</span>
              </div>
              
              {orderConfirmation.coupon && (
                <div className="modal-details-row" style={{ color: "var(--secondary)" }}>
                  <span>Cupón ({orderConfirmation.coupon}):</span>
                  <span>-${orderConfirmation.discount.toFixed(2)}</span>
                </div>
              )}
              
              <div className="modal-details-row">
                <span>IVA (15%):</span>
                <span>${orderConfirmation.iva?.toFixed(2) || (orderConfirmation.total - (orderConfirmation.subtotal - orderConfirmation.discount)).toFixed(2)}</span>
              </div>
              
              <div className="modal-details-row" style={{ fontWeight: "700", fontSize: "1.05rem" }}>
                <span>Total pagado:</span>
                <span style={{ color: "var(--primary)" }}>${orderConfirmation.total.toFixed(2)}</span>
              </div>
            </div>

            <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
              <button 
                className="close-modal-btn" 
                style={{ flex: 1, backgroundColor: "var(--secondary)", color: "#000000", fontWeight: "700" }}
                onClick={() => window.print()}
              >
                Imprimir Recibo 🖨️
              </button>
              <button 
                className="close-modal-btn" 
                style={{ flex: 1 }}
                onClick={() => {
                  setOrderConfirmation(null);
                  loadOrdersHistory();
                }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Printable Invoice Section for @media print */}
      {orderConfirmation && (
        <div className="print-invoice-container print-only">
          <div className="print-header" style={{ borderBottom: "2px solid #333", paddingBottom: "1rem", marginBottom: "1.5rem" }}>
            <h1 style={{ color: "#6200EE", fontSize: "2rem", margin: 0 }}>ELECTROMART</h1>
            <p style={{ margin: "0.2rem 0", fontSize: "0.9rem" }}>Tienda de Componentes Electrónicos y Tecnológicos</p>
            <div style={{ marginTop: "1rem", display: "flex", justifyContent: "space-between", fontSize: "0.9rem" }}>
              <span><strong>ID de Orden:</strong> {orderConfirmation.orderId}</span>
              <span><strong>Fecha:</strong> {new Date(orderConfirmation.date).toLocaleString()}</span>
            </div>
          </div>
          
          <div className="print-section" style={{ marginBottom: "1.5rem" }}>
            <h3 style={{ borderBottom: "1px solid #ddd", paddingBottom: "0.25rem", marginBottom: "0.5rem" }}>Datos de Envío del Cliente</h3>
            <p style={{ margin: "0.2rem 0" }}><strong>Nombre Completo:</strong> {orderConfirmation.customer.name}</p>
            <p style={{ margin: "0.2rem 0" }}><strong>Correo Electrónico:</strong> {orderConfirmation.customer.email}</p>
            <p style={{ margin: "0.2rem 0" }}><strong>Dirección Destino:</strong> {orderConfirmation.customer.address}, {orderConfirmation.customer.city}</p>
            <p style={{ margin: "0.2rem 0" }}><strong>Teléfono de Contacto:</strong> {orderConfirmation.customer.phone}</p>
          </div>
          
          <div className="print-section" style={{ marginBottom: "1.5rem" }}>
            <h3 style={{ borderBottom: "1px solid #ddd", paddingBottom: "0.25rem", marginBottom: "0.5rem" }}>Desglose de Productos</h3>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.95rem" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #333" }}>
                  <th style={{ padding: "0.5rem 0" }}>Descripción del Componente</th>
                  <th style={{ padding: "0.5rem 0", textAlign: "center" }}>Cantidad</th>
                  <th style={{ padding: "0.5rem 0", textAlign: "right" }}>Precio Unitario</th>
                  <th style={{ padding: "0.5rem 0", textAlign: "right" }}>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {orderConfirmation.items.map((item) => (
                  <tr key={item.id} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: "0.5rem 0" }}>{item.name}</td>
                    <td style={{ padding: "0.5rem 0", textAlign: "center" }}>{item.quantity}</td>
                    <td style={{ padding: "0.5rem 0", textAlign: "right" }}>${item.price.toFixed(2)}</td>
                    <td style={{ padding: "0.5rem 0", textAlign: "right" }}>${item.subtotal.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="print-totals" style={{ marginLeft: "auto", width: "250px", borderTop: "2px solid #333", paddingTop: "0.5rem", fontSize: "0.95rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", margin: "0.25rem 0" }}>
              <span>Subtotal:</span>
              <span>${orderConfirmation.subtotal.toFixed(2)}</span>
            </div>
            {orderConfirmation.discount > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", margin: "0.25rem 0", color: "#000" }}>
                <span>Descuento ({orderConfirmation.coupon}):</span>
                <span>-${orderConfirmation.discount.toFixed(2)}</span>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", margin: "0.25rem 0" }}>
              <span>IVA (15%):</span>
              <span>${orderConfirmation.iva?.toFixed(2) || (orderConfirmation.total - (orderConfirmation.subtotal - orderConfirmation.discount)).toFixed(2)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", margin: "0.5rem 0 0 0", paddingTop: "0.5rem", borderTop: "1px solid #ddd", fontWeight: "700", fontSize: "1.1rem" }}>
              <span>Total Pagado:</span>
              <span>${orderConfirmation.total.toFixed(2)}</span>
            </div>
          </div>
          
          <div className="print-footer" style={{ marginTop: "4rem", textAlign: "center", fontSize: "0.8rem", borderTop: "1px solid #eee", paddingTop: "1rem", color: "#666" }}>
            <p>Gracias por su compra en ElectroMart Componentes Electrónicos.</p>
            <p>Este documento sirve como comprobante de pago oficial y constancia para efectos de garantía.</p>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="main-footer hide-on-print">
        <p>© 2026 ElectroMart Componentes Tecnológicos. Diseñado con enfoque Mobile-First y CSS puro.</p>
        <p style={{ fontSize: "0.75rem", marginTop: "0.5rem" }}>Sistema de validación de stock física activa.</p>
      </footer>
    </div>
  );
}
