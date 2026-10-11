from decimal import Decimal

from django.core.management.base import BaseCommand
from django.db import transaction

from core.models import Product, Store
from users.models import Usuario


class Command(BaseCommand):
    help = "Puebla la base de datos con comercios y productos reales para todas las categorías del TP9."

    @transaction.atomic
    def handle(self, *args, **options):
        self.stdout.write(self.style.MIGRATE_HEADING("Iniciando saneamiento y carga de comercios por categoría para TP9..."))

        # Helper para garantizar usuarios comerciantes únicos
        def get_or_create_seller(email, name):
            user, created = Usuario.objects.get_or_create(
                email=email,
                defaults={
                    "username": email,
                    "name": name,
                    "role": Usuario.RoleChoices.VENDEDOR,
                },
            )
            if created:
                user.set_password("password123")
                user.save()
            return user

        # 1. Asegurar comercios representativos de cada categoría
        stores_config = [
            # Categoría: Restaurantes (Hamburguesas) - Conservando Crazy Burgers
            {
                "email": "admin@crazyburgers.com",
                "owner_name": "Dueño Crazy Burgers",
                "name": "Crazy Burgers",
                "description": "Hamburguesas artesanales premium, papas crujientes y combos especiales.",
            },
            # Categoría: Restaurantes (Pizzas y Empanadas)
            {
                "email": "vendedor@test.com",
                "owner_name": "Dueño Pizza Planet",
                "name": "Pizza Planet",
                "description": "Auténticas pizzas al horno de leña, empanadas caseras y cervezas artesanales.",
            },
            # Categoría: Cafeterías (Bebidas y más)
            {
                "email": "user@prueba.com",
                "owner_name": "Dueño Café Central",
                "name": "Café Central",
                "description": "Cafetería de especialidad, pastelería fina, tostados y meriendas.",
            },
            # Categoría: Súper y Kioscos (Compras en un solo lugar)
            {
                "email": "kiosco@foodrush.com",
                "owner_name": "Dueño Mini Market",
                "name": "Mini Market Express",
                "description": "Golosinas, snacks, bebidas frías, galletitas y artículos de almacén express.",
            },
            # Categoría: Helados (Postres y más)
            {
                "email": "heladeria@foodrush.com",
                "owner_name": "Dueño Heladería",
                "name": "Heladería Gelato Real",
                "description": "Helados artesanales por kilo, potes individuales, paletas gourmet y postres helados.",
            },
            # Categoría: Farmacia (Salud y bienestar)
            {
                "email": "farmacia@foodrush.com",
                "owner_name": "Dueño Farmacia",
                "name": "Farmacia San Lucas",
                "description": "Medicamentos de venta libre, cuidado personal, higiene y primeros auxilios.",
            },
        ]

        active_stores = {}
        for config in stores_config:
            # Si ya existe una tienda con ese nombre (o crazy burgers existente)
            existing_store = Store.objects.filter(name__iexact=config["name"]).first()
            if not existing_store and "crazy" in config["name"].lower():
                existing_store = Store.objects.filter(name__icontains="crazy").first()

            if existing_store:
                existing_store.name = config["name"]
                existing_store.description = config["description"]
                existing_store.save()
                active_stores[config["name"]] = existing_store
                self.stdout.write(self.style.SUCCESS(f"Tienda actualizada: {config['name']} (ID: {existing_store.id})"))
            else:
                owner = get_or_create_seller(config["email"], config["owner_name"])
                # Si el usuario ya tuviera otra tienda asignada, desvincular o reutilizar
                store, _ = Store.objects.get_or_create(
                    owner=owner,
                    defaults={
                        "name": config["name"],
                        "description": config["description"],
                    },
                )
                store.name = config["name"]
                store.description = config["description"]
                store.save()
                active_stores[config["name"]] = store
                self.stdout.write(self.style.SUCCESS(f"Tienda creada: {config['name']} (ID: {store.id})"))

        # Eliminar tiendas obsoletas que no pertenezcan al ecosistema
        valid_ids = [s.id for s in active_stores.values()]
        obsolete_count = Store.objects.exclude(id__in=valid_ids).delete()[0]
        if obsolete_count > 0:
            self.stdout.write(self.style.WARNING(f"Se eliminaron {obsolete_count} registros de comercios no reconocidos."))

        # 2. Limpiar productos previos para repoblar la carta completa
        Product.objects.all().delete()
        self.stdout.write(self.style.MIGRATE_HEADING("\nCargando carta de productos por comercio..."))

        # 3. Lista exhaustiva de productos reales
        products_data = [
            # --- 1. Crazy Burgers (Restaurante / Hamburguesas) ---
            {
                "store": active_stores["Crazy Burgers"],
                "name": "Crazy Burger Simple",
                "description": "Medallón de carne vacuna 150g, queso cheddar fundido, lechuga crocante y tomate en pan brioche.",
                "price": Decimal("4200.00"),
                "stock": 30,
                "is_available": True,
            },
            {
                "store": active_stores["Crazy Burgers"],
                "name": "Crazy Bacon Doble",
                "description": "Doble medallón 150g, cuádruple cheddar, bacon crocante ahumado y salsa BBQ especial de la casa.",
                "price": Decimal("5600.00"),
                "stock": 25,
                "is_available": True,
            },
            {
                "store": active_stores["Crazy Burgers"],
                "name": "Crazy Veggie Burger",
                "description": "Medallón de lentejas y champiñones salteados, rúcula fresca, cebolla morada y mayonesa vegana.",
                "price": Decimal("4800.00"),
                "stock": 15,
                "is_available": True,
            },
            {
                "store": active_stores["Crazy Burgers"],
                "name": "Papas Rústicas con Cheddar y Bacon",
                "description": "Porción abundante de papas fritas naturales con lluvia de panceta crocante y cheddar caliente.",
                "price": Decimal("2900.00"),
                "stock": 40,
                "is_available": True,
            },
            {
                "store": active_stores["Crazy Burgers"],
                "name": "Gaseosa Cola 500ml",
                "description": "Bebida cola en botella individual de 500ml servida bien fría.",
                "price": Decimal("1500.00"),
                "stock": 60,
                "is_available": True,
            },

            # --- 2. Pizza Planet (Restaurante / Pizzas) ---
            {
                "store": active_stores["Pizza Planet"],
                "name": "Pizza Muzzarella Tradicional",
                "description": "Salsa de tomate casera al orégano, 300g de muzzarella de primera calidad y aceitunas verdes.",
                "price": Decimal("6200.00"),
                "stock": 20,
                "is_available": True,
            },
            {
                "store": active_stores["Pizza Planet"],
                "name": "Pizza Fugazzeta Rellena",
                "description": "Doble piso relleno de queso muzzarella y cubierta de cebolla caramelizada suave.",
                "price": Decimal("7800.00"),
                "stock": 12,
                "is_available": True,
            },
            {
                "store": active_stores["Pizza Planet"],
                "name": "Pizza Calabresa Especial",
                "description": "Muzzarella, rodajas finas de longaniza calabresa seleccionada y ají molido suave.",
                "price": Decimal("7100.00"),
                "stock": 18,
                "is_available": True,
            },
            {
                "store": active_stores["Pizza Planet"],
                "name": "Empanada de Carne Criolla",
                "description": "Carne tierna cortada a cuchillo con huevo, cebolla de verdeo y aceitunas, cocida al horno.",
                "price": Decimal("950.00"),
                "stock": 50,
                "is_available": True,
            },
            {
                "store": active_stores["Pizza Planet"],
                "name": "Cerveza Artesanal IPA 1L",
                "description": "Cerveza rubia lupulada aromática y refrescante en envase de litro retornable.",
                "price": Decimal("3400.00"),
                "stock": 30,
                "is_available": True,
            },

            # --- 3. Café Central (Cafetería / Meriendas) ---
            {
                "store": active_stores["Café Central"],
                "name": "Café Latte Doble",
                "description": "Doble shot de café espresso arábica con leche texturizada sedosa y arte latte.",
                "price": Decimal("2200.00"),
                "stock": 35,
                "is_available": True,
            },
            {
                "store": active_stores["Café Central"],
                "name": "Croissant de Almendras",
                "description": "Hojaldre 100% manteca relleno con crema frangipane y almendras fileteadas tostadas.",
                "price": Decimal("1900.00"),
                "stock": 20,
                "is_available": True,
            },
            {
                "store": active_stores["Café Central"],
                "name": "Cheesecake de Frutos Rojos",
                "description": "Porción individual con base crocante de galleta y coulis casero de frambuesas y moras.",
                "price": Decimal("3500.00"),
                "stock": 10,
                "is_available": True,
            },
            {
                "store": active_stores["Café Central"],
                "name": "Tostado Clásico de Jamón y Queso",
                "description": "Pan de molde artesanal con jamón cocido natural y queso dambo gratinado a la plancha.",
                "price": Decimal("2800.00"),
                "stock": 25,
                "is_available": True,
            },

            # --- 4. Mini Market Express (Súper y Kioscos) ---
            {
                "store": active_stores["Mini Market Express"],
                "name": "Alfajor de Chocolate Relleno",
                "description": "Alfajor triple bañado en chocolate semiamargo con abundante dulce de leche.",
                "price": Decimal("850.00"),
                "stock": 60,
                "is_available": True,
            },
            {
                "store": active_stores["Mini Market Express"],
                "name": "Papas Fritas Clásicas 150g",
                "description": "Snack crocante sabor original en paquete mediano ideal para compartir.",
                "price": Decimal("1600.00"),
                "stock": 40,
                "is_available": True,
            },
            {
                "store": active_stores["Mini Market Express"],
                "name": "Gaseosa Lima Limón 1.5L",
                "description": "Gaseosa refrescante sabor lima limón en botella de 1.5 litros.",
                "price": Decimal("2300.00"),
                "stock": 30,
                "is_available": True,
            },
            {
                "store": active_stores["Mini Market Express"],
                "name": "Galletitas Dulces con Chispas",
                "description": "Paquete de galletitas horneadas con chips de chocolate puro.",
                "price": Decimal("1200.00"),
                "stock": 35,
                "is_available": True,
            },
            {
                "store": active_stores["Mini Market Express"],
                "name": "Agua Mineral Sin Gas 1.5L",
                "description": "Agua mineral natural baja en sodio, presentación familiar.",
                "price": Decimal("950.00"),
                "stock": 50,
                "is_available": True,
            },

            # --- 5. Heladería Gelato Real (Helados / Postres) ---
            {
                "store": active_stores["Heladería Gelato Real"],
                "name": "Pote de Helado 1 Kg",
                "description": "Hasta 4 sabores a elección: Dulce de Leche Granizado, Chocolate Belga, Frutos del Bosque y Sambayón.",
                "price": Decimal("7500.00"),
                "stock": 15,
                "is_available": True,
            },
            {
                "store": active_stores["Heladería Gelato Real"],
                "name": "Pote de Helado 1/2 Kg",
                "description": "Hasta 3 sabores a elección con cucuruchos incluidos.",
                "price": Decimal("4300.00"),
                "stock": 25,
                "is_available": True,
            },
            {
                "store": active_stores["Heladería Gelato Real"],
                "name": "Cucurucho Bañado Especial",
                "description": "Cucurucho artesanal bañado en chocolate crocante con 2 bochas generosas.",
                "price": Decimal("2800.00"),
                "stock": 30,
                "is_available": True,
            },
            {
                "store": active_stores["Heladería Gelato Real"],
                "name": "Bombón Escocés Helado",
                "description": "Clásico postre helado relleno con dulce de leche y corazón crocante.",
                "price": Decimal("2200.00"),
                "stock": 20,
                "is_available": True,
            },
            {
                "store": active_stores["Heladería Gelato Real"],
                "name": "Paleta Artesanal Frutilla al Agua",
                "description": "Paleta natural elaborada con frutillas seleccionadas 100% fruta.",
                "price": Decimal("1400.00"),
                "stock": 35,
                "is_available": True,
            },

            # --- 6. Farmacia San Lucas (Farmacia / Salud y Bienestar) ---
            {
                "store": active_stores["Farmacia San Lucas"],
                "name": "Alcohol en Gel Sanitizante 250ml",
                "description": "Alcohol en gel 70% con glicerina humectante en envase dosificador.",
                "price": Decimal("1300.00"),
                "stock": 50,
                "is_available": True,
            },
            {
                "store": active_stores["Farmacia San Lucas"],
                "name": "Ibuprofeno 400mg x 10 Cápsulas",
                "description": "Analgésico y antiinflamatorio de venta libre en cápsulas blandas.",
                "price": Decimal("1900.00"),
                "stock": 40,
                "is_available": True,
            },
            {
                "store": active_stores["Farmacia San Lucas"],
                "name": "Protector Solar FPS 50 150ml",
                "description": "Emulsión protectora solar de amplio espectro resistente al agua.",
                "price": Decimal("6800.00"),
                "stock": 15,
                "is_available": True,
            },
            {
                "store": active_stores["Farmacia San Lucas"],
                "name": "Apósitos Adhesivos Curitas x 20",
                "description": "Tiras adhesivas hipoalergénicas y respirables para heridas leves.",
                "price": Decimal("950.00"),
                "stock": 60,
                "is_available": True,
            },
            {
                "store": active_stores["Farmacia San Lucas"],
                "name": "Cepillo Dental Cerda Suave",
                "description": "Cepillo ergonómico con limpiador lingual y cerdas microfinas.",
                "price": Decimal("1700.00"),
                "stock": 30,
                "is_available": True,
            },
        ]

        created_products = []
        for p in products_data:
            product = Product.objects.create(**p)
            created_products.append(product)

        self.stdout.write(self.style.SUCCESS(f"\n¡Éxito! Se crearon {len(created_products)} productos reales distribuidos en {len(active_stores)} comercios:"))
        for store_name, s in active_stores.items():
            count = len([p for p in created_products if p.store_id == s.id])
            self.stdout.write(f" • [{store_name}] (ID: {s.id}) - {count} productos disponibles")

        self.stdout.write(self.style.SUCCESS("\nBase de datos completamente poblada para todas las categorías del TP9."))
