# Plan de Implementación: Tienda de Componentes Tecnológicos

## 1. Arquitectura Técnica y Stack

- **Framework**: **Next.js (App Router)** utilizando React en el frontend y API Routes en Node.js para el backend.
- **Persistencia**: Persistencia basada en archivos locales JSON (`products.json` para catálogo y `orders.json` para pedidos).
- **Diseño Visual**: Estilos basados en **CSS puro (Vanilla CSS)** con enfoque Mobile-First y variables CSS.
- **Paleta de Colores**:
  - Color Primario (Purple): `#6200EE` (usado para cabeceras, botones principales, énfasis y contorno de inputs).
  - Color Secundario (Teal): `#03DAC6` (usado para acentos y estados de éxito. Requiere texto negro `#000000` para cumplir con el contraste WCAG AA).
- **Tipografía**: Fuente **Roboto** importada e integrada desde Google Fonts.
- **Logging del Servidor**: Registro detallado en la consola de Node.js de todas las peticiones con método HTTP, URI, timestamp y código de estado.

### Estructura de Archivos del Plan (Proposed Changes)

#### [MODIFY] [page.js](file:///c:/Users/User/Documents/Pao%205/Dise%C3%B1o%20y%20experiencia%20de%20usuario/Trabajo%20final/Tienda%20de%20tecnologia/src/app/page.js)
- Implementar flujo de checkout dividido en Pasos 1 y 2 con su indicador de progreso.
- Agregar validaciones contextuales en tiempo real y bloqueo preventivo de botones.
- Implementar persistencia en `localStorage` para carrito y favoritos.
- Integrar buscador con botón interactivo de limpieza rápida ("X").
- Agregar lógica para el modal personalizado de confirmación de vaciado de carrito.

#### [MODIFY] [globals.css](file:///c:/Users/User/Documents/Pao%205/Dise%C3%B1o%20y%20experiencia%20de%20usuario/Trabajo%20final/Tienda%20de%20tecnologia/src/app/globals.css)
- Definir las transiciones dinámicas (hover, active click a 0.96, disabled).
- Crear las animaciones del carrito lateral (`slide-in`) y contador del badge (`scale`).
- Definir el spinner circular de 14px y clases de feedback de error (`is-invalid`).
- Ajustar contornos brillantes `#03DAC6` para `:focus-visible`.
- Implementar soporte de impresión `@media print` para facturas A4.

---

## 2. Catálogo de Productos y Base de Datos (JSON)

- **Persistencia del Catálogo**: Archivo [products.json](file:///c:/Users/User/Documents/Pao%205/Dise%C3%B1o%20y%20experiencia%20de%20usuario/Trabajo%20final/Tienda%20de%20tecnologia/src/data/products.json).
- **Esquema de Datos de Componentes**:
```json
[
  {
    "id": "prod-001",
    "name": "Microcontrolador ESP32-WROOM-32D",
    "category": "microcontrollers",
    "price": 8.50,
    "stock": 12,
    "description": "Módulo Wi-Fi y Bluetooth de bajo consumo, ideal para proyectos IoT.",
    "specs": {
      "Voltaje": "3.3V",
      "Núcleos": "Dual-Core 240MHz",
      "Flash": "4MB"
    },
    "imageUrl": "/images/esp32.jpg"
  }
]
```
- **Lista de Componentes**: Catálogo ampliado a 22 componentes tecnológicos reales con archivos SVG correspondientes en `public/images/` para evitar enlaces rotos y representar adecuadamente cada artículo.

---

## 3. Especificaciones del Carrito y Formulario

- **Límites y Reglas del Carrito**:
  - Cantidad limitada estrictamente por el stock físico disponible en el servidor.
  - Alerta de Stock Crítico: Muestra `"¡Últimas unidades!"` en amarillo cuando el stock esté entre 1 y 3 unidades.
- **Mensajes de Feedback y Toasts**:
  - Añadir producto: *"¡Componente añadido al carrito!"* (Toast de éxito teal/verde).
  - Límite de stock: *"Has alcanzado el límite de stock disponible para este componente."*
  - Checkout Exitoso: *"¡Compra procesada con éxito! Tu pedido ha sido registrado."*
  - Error de stock (Backend): *"Error: El producto [Nombre] ya no tiene suficiente stock disponible. Por favor, revisa tu carrito."*
- **Sistema de Cupones**:
  - Código `"DESCUENTO10"` otorga un 10% de descuento. Validado en cliente y servidor. Códigos erróneos no vacíos retornan error `400 Bad Request`.
- **Reglas de Validación de Formulario (Checkout en Pasos)**:
  - **Paso 1: Datos Personales** (Nombre mínimo 3 letras y Correo Válido). Botón "Siguiente" inactivo si falla.
  - **Paso 2: Detalles de Envío y Pago** (Dirección mínimo 10 letras, Ciudad obligatoria, Teléfono 7-10 dígitos). Botón "Realizar Compra" inactivo si falla.
  - Los botones inactivos muestran `cursor: not-allowed` y opacidad `0.5`.

---

## 4. Requisitos de Usabilidad e Interfaz (IHC)

| ID del Requisito | Nombre del Requisito | Descripción de la Interacción (Qué ve/hace el usuario) | Principio de Usabilidad / Heurística de Nielsen | Estado Actual |
| :--- | :--- | :--- | :--- | :--- |
| **REQ-IHC-01** | Estados de Botones Dinámicos | Los botones reaccionan con transiciones suaves al pasar el cursor (hover), reducen su tamaño a `0.96` al hacer clic (efecto pulsación/active) y muestran un cursor de bloqueo `not-allowed` con opacidad `0.5` si están deshabilitados. | **Visibilidad del Estado del Sistema** & **Prevención de Errores** | `Implementado` |
| **REQ-IHC-02** | Animación del Carrito Lateral | En pantallas móviles, el carrito se desliza suavemente (`slide-in` de 0.3s) desde la derecha con un overlay desenfocado de fondo. Al añadir productos, el contador (badge) del carrito aumenta y disminuye de escala (`scale(1.35)`) de forma interactiva. | **Visibilidad del Estado del Sistema** | `Implementado` |
| **REQ-IHC-03** | Diálogos de Confirmación | Al hacer clic en "Vaciar Carrito 🗑️", se despliega un cuadro de diálogo/modal personalizado que solicita confirmación explícita al usuario para evitar la pérdida accidental de su selección de componentes. | **Prevención de Errores** & **Control y Libertad del Usuario** | `Implementado` |
| **REQ-IHC-04** | Feedback de Error Contextual | Las validaciones del formulario de checkout ocurren en tiempo real (onChange/onBlur). Si hay un error, el borde del input se torna rojo (`is-invalid`) y se muestra un mensaje aclaratorio directamente debajo del campo. | **Ayuda a los usuarios a reconocer, diagnosticar y recuperarse de errores** | `Implementado` |
| **REQ-IHC-05** | Adaptabilidad Multi-pantalla (Responsivo) | En móviles (`< 768px`), el catálogo es una columna vertical y el carrito es un cajón flotante interactivo. En escritorio (`≥ 768px`), se despliega una estructura multi-columna fija (catálogo a la izquierda, carrito fijo a la derecha) optimizando el área visual a `1440px`. | **Flexibilidad y Eficiencia de Uso** | `Implementado` |
| **REQ-IHC-06** | Jerarquía Visual Estricta | Los precios y botones de acción ("Añadir 🛒") destacan con mayor peso tipográfico (`800`) y tamaños más prominentes (`1.6rem`, `1.05rem`) sobre las especificaciones técnicas secundarias de los componentes. | **Diseño Estético y Minimalista** | `Implementado` |
| **REQ-IHC-07** | Accesibilidad por Teclado | Navegación estructurada con orden de tabulación lógico (`tabindex`). Al presionar la tecla `Escape`, se cierran automáticamente los modales y el carrito lateral. | **Flexibilidad y Eficiencia de Uso** | `Implementado` |
| **REQ-IHC-08** | Enfoque de Accesibilidad Clara (Focus State) | Cuando el usuario navega con la tecla `Tab`, los elementos enfocados muestran un contorno brillante de color verde/teal `#03DAC6` (`outline: 3px solid var(--secondary)`) altamente identificable. | **Visibilidad del Estado del Sistema** | `Implementado` |
| **REQ-IHC-09** | Iconografía con Soporte Textual | Todos los iconos y botones interactivos (como el corazón de favoritos, los botones de cantidad y remover) cuentan con tooltips descriptivos nativos (vía atributo `title`) que orientan al usuario al posar el cursor. | **Ayuda y Documentación** | `Implementado` |
| **REQ-IHC-10** | Indicador de Contexto (Breadcrumbs) | Una barra de navegación reactiva en la parte superior del catálogo (`Inicio / Catálogo / [Categoría]`) guía espacialmente al usuario dentro de la jerarquía de la tienda. | **Visibilidad del Estado del Sistema** | `Implementado` |
| **REQ-IHC-11** | Persistencia de Estado del Carrito | El carrito mantiene los componentes seleccionados mediante localStorage si el usuario recarga la página por accidente. | **Consistencia y Estándares** | `Implementado` |
| **REQ-IHC-12** | Estado de Carga Activo (Spinner) | El botón de confirmación cambia a 'Procesando...' con un spinner visual al enviar el checkout para evitar el doble clic. | **Visibilidad del Estado del Sistema** | `Implementado` |
| **REQ-IHC-13** | Feedback Positivo de Éxito (Toast) | Alertas flotantes temporales de color verde/teal al agregar componentes o aplicar cupones con éxito. | **Visibilidad del Estado del Sistema** | `Implementado` |
| **REQ-IHC-14** | Limpieza Rápida del Buscador | Un botón interactivo de 'X' dentro del input de búsqueda para limpiar el filtro de texto con un solo clic. | **Flexibilidad y Eficiencia de Uso** | `Implementado` |

---

## 5. Plan de Verificación y Pruebas

### Pruebas de Interfaz de Usuario y Estilo
- **Validación de Contraste**: Confirmar que todos los botones de fondo `#03DAC6` usen color de texto negro `#000000`.
- **Estados Dinámicos**: Confirmar cursor `not-allowed` y opacidad 0.5 al intentar hacer checkout o añadir con stock en 0.
- **Efecto de Pulsación**: Validar que hacer click sobre los botones ejecute una micro-animación de escala a `0.96`.
- **Responsive Layout**: Modificar la pantalla a menos de `768px` y corroborar que el catálogo sea una sola columna y el carrito se transforme en panel deslizable.

### Pruebas de Funcionalidades y Negocio
- **Checkout por Pasos**: Probar avanzar en el formulario y asegurar que no deje pasar al Paso 2 si el Paso 1 tiene campos inválidos.
- **Spinner de Checkout**: Enviar el formulario y verificar la aparición del spinner circular animado y el texto "Procesando...".
- **Descuentos y Validación de Cupones**: Introducir el código `"DESCUENTO10"` y comprobar que el precio total refleje la reducción del 10%. Probar con cupones inválidos para certificar el bloqueo de backend.
- **Historial e Impresión**:
  - Verificar que las compras finalizadas aparezcan listadas en la pestaña "Historial de Pedidos".
  - Presionar "Imprimir Recibo" y verificar en la ventana de previsualización que solo se renderice la factura formateada para A4.
