# frontend/ - Cliente React (TP5 y TP6)

Cliente single-page de la app de pedidos (estilo PedidosYa), creado con Vite + React.
Vive al nivel del backend (mismo repositorio) y consume la API Django via JSON + JWT.

## Stack

* React 19
* Vite 8 (dev server con HMR)
* Bootstrap 5 + bootstrap-icons (Home maquetada en el TP6)
* Poppins (tipografia FoodRush)
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

## Home (TP6)

La Home esta maquetada con Bootstrap, responsive de movil a desktop. Estructura:

```
src/
├── components/  Navbar · Logo · Hero · CategoryCard · SectionHeader · StoreLogo · Footer · BottomNav
├── views/       Home.jsx
├── data/        homeData.js (categorias + tiendas)
├── styles/      theme.css (variables de color FoodRush)
└── (imágenes)   public/images/ (categorias + logo)
```

* Movil (< 768px): header compacto + BottomNav fija con anchors reales a las secciones.
* md+ : navbar clasica + footer.
* Enlaces `<a href="#">` aun son placeholders, para reemplazar por el router en el TP7.