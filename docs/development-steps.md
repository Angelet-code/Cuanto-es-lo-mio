# Pasos de desarrollo

## 1. Flujo mock

Construir todas las pantallas con datos simulados antes de conectar IA.

## 2. Edicion manual

Permitir corregir nombres, cantidades, precios y total confirmado.

## 3. Reparto

Seleccionar productos por comensal, marcar asignados y calcular resumen.

## 4. OCR local

Leer la imagen en el navegador con `tesseract.js`.

Debe devolver:

```json
{
  "restaurantName": "Bar ejemplo",
  "detectedTotal": 42.8,
  "items": []
}
```

## 5. Parser

Convertir el texto OCR en conceptos:

- detectar el total
- ignorar cabecera, CIF, IVA y pago
- detectar cantidades
- detectar precio unitario y precio total

## 6. PWA

Anadir manifest, iconos y cache basica cuando el flujo principal este estable.
