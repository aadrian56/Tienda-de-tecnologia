import "./globals.css";

export const metadata = {
  title: "ElectroMart - Tienda de Componentes Electrónicos",
  description: "Encuentra microcontroladores, sensores y equipos de red para tus proyectos de electrónica y desarrollo IoT. Envíos a todo el país.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
