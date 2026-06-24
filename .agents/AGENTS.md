# Constitución del Proyecto: Tienda de Componentes Electrónicos

Este archivo contiene las directrices de desarrollo, reglas arquitectónicas y decisiones de diseño fundamentales que los agentes deben seguir para este proyecto.

## Stack Tecnológico
- **Frontend**: React (utilizando Vite o Next.js según la decisión de arquitectura).
- **Backend**: Node.js (Express o rutas de API integradas en Next.js).
- **Estilos**: Vanilla CSS (CSS puro) con enfoque Mobile-First y uso de variables CSS para el diseño responsivo y dinámico.

## Paleta de Colores y Diseño
Deben utilizarse los siguientes colores principales de la paleta para lograr un diseño premium y de alta fidelidad:
- **Color Primario (Purple)**: `#6200EE` (usado para marca, botones principales, énfasis).
- **Color Secundario (Teal)**: `#03DAC6` (usado para llamadas a la acción secundarias, acentos, estados de éxito).
- **Estilo**: Premium, moderno, con soporte para modo oscuro, micro-transiciones suaves y bordes redondeados limpios.

## Reglas de Validación de Stock (Críticas)
1. **Validación en Frontend (UX)**:
   - Bloquear y deshabilitar los botones de añadir al carrito o incrementar cantidad cuando la cantidad seleccionada sea igual al stock disponible.
   - Mostrar indicadores visuales claros del stock restante del componente (e.g., "Quedan 3 unidades").
2. **Validación en Backend (Seguridad)**:
   - Toda transacción o modificación de carrito debe verificar el stock físico actual en el servidor antes de proceder.
   - Si una solicitud supera el stock actual disponible, el servidor debe responder con un error descriptivo (código HTTP `400 Bad Request` o similar) y no proceder con la reserva.
3. **Consistencia de Datos**:
   - Al finalizar la compra con éxito, restar el stock físico inmediatamente de la base de datos o archivo de persistencia.
