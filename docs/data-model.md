# Modelo de datos

## Ticket

```ts
type Ticket = {
  id: string;
  imageUrl?: string;
  restaurantName?: string;
  detectedTotal?: number;
  confirmedTotal?: number;
  items: TicketItem[];
};
```

## Producto

```ts
type TicketItem = {
  id: string;
  name: string;
  quantity: number;
  unitPrice?: number;
  totalPrice: number;
  assignedTo?: string;
  isAssigned: boolean;
};
```

## Comensal

```ts
type Diner = {
  id: string;
  name: string;
  itemIds: string[];
  total: number;
};
```
