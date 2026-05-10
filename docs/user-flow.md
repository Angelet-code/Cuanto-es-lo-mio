# Flujo de usuario

1. El usuario abre la app.
2. Toca el icono de camara.
3. Hace una foto del ticket.
4. La app muestra una rueda de carga mientras analiza.
5. La app muestra el total detectado y pregunta si es correcto.
6. Si el usuario pulsa `Si`, empieza el reparto.
7. Si pulsa `No`, vuelve a la camara.
8. Cada comensal marca sus productos.
9. Al pulsar `Siguiente`, esos productos quedan asignados y oscurecidos.
10. Cuando todos los productos pendientes quedan seleccionados, el boton cambia a `Terminar`.
11. Al terminar, la app muestra el resumen final y permite copiarlo.

## Validacion clave

Comparar siempre:

- total confirmado del ticket
- suma de productos detectados

La validacion manual se limita a confirmar si el total detectado es correcto.
