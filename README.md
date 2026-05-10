# Cuanto es lo mio?

Web app movil para leer un ticket, revisar conceptos y calcular cuanto paga cada comensal.

## Estado actual

Primera base de desarrollo con flujo mock:

- captura con camara
- OCR local gratuito con Tesseract.js
- parser propio de lineas, cantidades y precios
- confirmacion de suma total
- seleccion por comensal
- resumen final

## Comandos

```bash
npm install
npm run dev
npm run build
```

## GitHub Pages

El proyecto esta preparado para publicarse en GitHub Pages desde la rama `main`.

En GitHub, activa Pages con `GitHub Actions` como fuente de despliegue.

## Extraccion

La lectura del ticket se hace en el navegador con `tesseract.js`. No usa OpenAI Vision ni requiere backend para el MVP.

El parser intenta detectar:

- total del ticket
- lineas con precio
- cantidades repetidas, por ejemplo `4 CERVEZA 3,20 12,80`
- formato multiplicador, por ejemplo `CERVEZA 4 x 3,20 12,80`

Cuando una linea tiene varias unidades, la app la convierte despues en elementos seleccionables individuales.
