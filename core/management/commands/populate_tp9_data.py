from decimal import Decimal

from django.core.management.base import BaseCommand
from django.db import transaction

from core.models import Product, Store
from users.models import Usuario


class Command(BaseCommand):
    help = "Puebla la base de datos con comercios y productos reales para el desarrollo del TP9, conservando Crazy Burgers."

    @transaction.atomic
    def handle(self, *args, **options):
        self.stdout.write(self.style.MIGRATE_HEADING("Iniciando saneamiento y carga de datos para TP9..."))

        # 1. Eliminar tiendas de prueba obsoletas, preservando Crazy Burgers
        deleted_count = 0
        obsolete_stores = Store.objects.exclude(name__icontains="Crazy Burgers")
        for store in obsolete_stores:
            self.stdout.write(self.style.WARNING(f"Eliminando tienda de prueba: {store.name} (ID: {store.id})"))
            store.delete()
            deleted_count += 1

        self.stdout.write(self.style.SUCCESS(f"Se eliminaron {deleted_count} tiendas de prueba obsoletas."))

        # 2. Actualizar y asegurar Crazy Burgers
        crazy_store = Store.objects.filter(name__icontains="Crazy Burgers").first()
        if crazy_store:
            crazy_store.name = "Crazy Burgers"
            crazy_store.description = "Hamburguesas artesanales premium, papas crujientes y combos especiales."
            crazy_store.save()
            self.stdout.write(self.style.SUCCESS(f"Tienda 'Crazy Burgers' actualizada (ID: {crazy_store.id})."))
        else:
            owner = Usuario.objects.filter(role__in=[Usuario.RoleChoices.VENDEDOR, Usuario.RoleChoices.ADMIN]).first()
            if not owner:
                owner = Usuario.objects.create_user(
                    email="admin@crazyburgers.com",
                    name="Admin Crazy Burgers",
                    password="password123",
                    role=Usuario.RoleChoices.ADMIN,
                )
            crazy_store = Store.objects.create(
                owner=owner,
                name="Crazy Burgers",
                description="Hamburguesas artesanales premium, papas crujientes y combos especiales.",
            )
            self.stdout.write(self.style.SUCCESS(f"Tienda 'Crazy Burgers' creada (ID: {crazy_store.id})."))

        # 3. Asegurar tiendas adicionales de variedad gastronómica
        # 3.a. Pizza Planet
        pizza_owner = Usuario.objects.filter(email="vendedor@test.com").first()
        if not pizza_owner:
            pizza_owner = Usuario.objects.filter(role=Usuario.RoleChoices.CLIENTE).first()
        if pizza_owner and not hasattr(pizza_owner, "store"):
            pizza_store, _ = Store.objects.get_or_create(
                owner=pizza_owner,
                defaults={
                    "name": "Pizza Planet",
                    "description": "Auténticas pizzas al horno de leña, empanadas caseras y cervezas artesanales.",
                },
            )
        else:
            pizza_store = Store.objects.filter(name__icontains="Pizza Planet").first()
            if not pizza_store:
                user_available = Usuario.objects.filter(store__isnull=True).first()
                if user_available:
                    pizza_store = Store.objects.create(
                        owner=user_available,
                        name="Pizza Planet",
                        description="Auténticas pizzas al horno de leña, empanadas caseras y cervezas artesanales.",
                    )

        # 3.b. Café Central
        cafe_owner = Usuario.objects.filter(email="user@prueba.com").first()
        if cafe_owner and not hasattr(cafe_owner, "store"):
            cafe_store, _ = Store.objects.get_or_create(
                owner=cafe_owner,
                defaults={
                    "name": "Café Central",
                    "description": "Cafetería de especialidad, pastelería fina, tostados y meriendas.",
                },
            )
        else:
            cafe_store = Store.objects.filter(name__icontains="Café Central").first()
            if not cafe_store:
                user_available = Usuario.objects.filter(store__isnull=True).exclude(pk=pizza_owner.pk if pizza_owner else 0).first()
                if user_available:
                    cafe_store = Store.objects.create(
                        owner=user_available,
                        name="Café Central",
                        description="Cafetería de especialidad, pastelería fina, tostados y meriendas.",
                    )

        # 4. Limpiar productos previos para evitar duplicados en re-ejecuciones
        Product.objects.all().delete()
        self.stdout.write(self.style.MIGRATE_HEADING("Cargando carta de productos gastronómicos..."))

        # 5. Poblado de productos por tienda
        products_data = [
            # --- Crazy Burgers ---
            {
                "store": crazy_store,
                "name": "Crazy Burger Simple",
                "description": "Medallón de carne vacuna 150g, queso cheddar fundido, lechuga crocante y tomate en pan brioche.",
                "price": Decimal("4200.00"),
                "stock": 30,
                "is_available": True,
            },
            {
                "store": crazy_store,
                "name": "Crazy Bacon Doble",
                "description": "Doble medallón 150g, cuádruple cheddar, bacon crocante ahumado y salsa BBQ especial de la casa.",
                "price": Decimal("5600.00"),
                "stock": 25,
                "is_available": True,
            },
            {
                "store": crazy_store,
                "name": "Crazy Veggie Burger",
                "description": "Medallón de lentejas y champiñones salteados, rúcula fresca, cebolla morada y mayonesa vegana.",
                "price": Decimal("4800.00"),
                "stock": 15,
                "is_available": True,
            },
            {
                "store": crazy_store,
                "name": "Papas Rústicas con Cheddar y Bacon",
                "description": "Porción abundante de papas fritas naturales con lluvia de panceta crocante y cheddar caliente.",
                "price": Decimal("2900.00"),
                "stock": 40,
                "is_available": True,
            },
            {
                "store": crazy_store,
                "name": "Gaseosa Cola 500ml",
                "description": "Bebida cola en botella individual de 500ml servida bien fría.",
                "price": Decimal("1500.00"),
                "stock": 60,
                "is_available": True,
            },
        ]

        if pizza_store:
            products_data.extend([
                {
                    "store": pizza_store,
                    "name": "Pizza Muzzarella Tradicional",
                    "description": "Salsa de tomate casera al orégano, 300g de muzzarella de primera calidad y aceitunas verdes.",
                    "price": Decimal("6200.00"),
                    "stock": 20,
                    "is_available": True,
                },
                {
                    "store": pizza_store,
                    "name": "Pizza Fugazzeta Rellena",
                    "description": "Doble piso relleno de queso muzzarella y cubierta de cebolla caramelizada suave.",
                    "price": Decimal("7800.00"),
                    "stock": 12,
                    "is_available": True,
                },
                {
                    "store": pizza_store,
                    "name": "Pizza Calabresa Especial",
                    "description": "Muzzarella, rodajas finas de longaniza calabresa seleccionada y ají molido suave.",
                    "price": Decimal("7100.00"),
                    "stock": 18,
                    "is_available": True,
                },
                {
                    "store": pizza_store,
                    "name": "Empanada de Carne Criolla",
                    "description": "Carne tierna cortada a cuchillo con huevo, cebolla de verdeo y aceitunas, cocida al horno.",
                    "price": Decimal("950.00"),
                    "stock": 50,
                    "is_available": True,
                },
                {
                    "store": pizza_store,
                    "name": "Cerveza Artesanal IPA 1L",
                    "description": "Cerveza rubia lupulada aromática y refrescante en envase de litro retornable.",
                    "price": Decimal("3400.00"),
                    "stock": 30,
                    "is_available": True,
                },
            ])

        if cafe_store:
            products_data.extend([
                {
                    "store": cafe_store,
                    "name": "Café Latte Doble",
                    "description": "Doble shot de café espresso arábica con leche texturizada sedosa y arte latte.",
                    "price": Decimal("2200.00"),
                    "stock": 35,
                    "is_available": True,
                },
                {
                    "store": cafe_store,
                    "name": "Croissant de Almendras",
                    "description": "Hojaldre 100% manteca relleno con crema frangipane y almendras fileteadas tostadas.",
                    "price": Decimal("1900.00"),
                    "stock": 20,
                    "is_available": True,
                },
                {
                    "store": cafe_store,
                    "name": "Cheesecake de Frutos Rojos",
                    "description": "Porción individual con base crocante de galleta y coulis casero de frambuesas y moras.",
                    "price": Decimal("3500.00"),
                    "stock": 10,
                    "is_available": True,
                },
                {
                    "store": cafe_store,
                    "name": "Tostado Clásico de Jamón y Queso",
                    "description": "Pan de molde artesanal con jamón cocido natural y queso dambo gratinado a la plancha.",
                    "price": Decimal("2800.00"),
                    "stock": 25,
                    "is_available": True,
                },
            ])

        created_products = []
        for p in products_data:
            product = Product.objects.create(**p)
            created_products.append(product)

        self.stdout.write(self.style.SUCCESS(f"\n¡Éxito! Se crearon {len(created_products)} productos reales:"))
        for p in created_products:
            self.stdout.write(f" • [{p.store.name}] {p.name} - ${p.price} (Stock: {p.stock})")

        self.stdout.write(self.style.SUCCESS("\nBase de datos lista para el TP9."))
