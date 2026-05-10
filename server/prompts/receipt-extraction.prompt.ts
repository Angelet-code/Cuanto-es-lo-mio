export const receiptExtractionPrompt = `
Extrae los conceptos de este ticket de restaurante.
Devuelve solo JSON valido.

Formato esperado:
{
  "restaurantName": "string opcional",
  "detectedTotal": 0,
  "items": [
    {
      "name": "string",
      "quantity": 1,
      "unitPrice": 0,
      "totalPrice": 0
    }
  ],
  "warnings": ["string"]
}

Reglas:
- Ignora cabeceras, CIF, direccion, fecha, metodo de pago e IVA salvo que sean necesarios para entender el total.
- Si una linea tiene cantidad multiplicada por precio unitario, calcula totalPrice.
- Si no estas seguro de un nombre, usa el texto mas probable.
- Si el total no esta claro, omite detectedTotal y anade un warning.
- No inventes productos que no aparezcan en el ticket.
`;
