# frontend/ - Cliente React (TP5)

Cliente single-page de la app de pedidos (estilo PedidosYa), creado con Vite + React.
Vive al nivel del backend (mismo repositorio) y consume la API Django via JSON + JWT.

## Stack

* React 19
* Vite 8 (dev server con HMR)
* JavaScript (JSX)
* npm (Node.js)

## Requisitos

* Node.js `^20.19 || >=22.12` (requisito de Vite 8; probado con v24.19.0)

## Como correr

```bash
npm install      # primera vez
npm run dev      # dev server en http://localhost:3000
```

Otros scripts:

* `npm run build` - build de produccion
* `npm run lint` - ESLint
* `npm run preview` - previsualizar el build

## Puertos

* Frontend (Vite): `http://localhost:3000` (configurado en `vite.config.js`)
* Backend (Django): `http://localhost:8000/api/`

## Diseno

El bosquejo inicial de la Home / estructura de componentes (con flujo y rutas) esta en
[`docs/diagrama.md`](../docs/diagrama.md) en la raiz del repositorio.