from decimal import Decimal
from django.core.management.base import BaseCommand
from django.db import transaction

from core.models import Product, Store
from users.models import Usuario


class Command(BaseCommand):
    help = "Puebla la base de datos con un catálogo extendido de 50 tiendas (10 por categoría) y asigna imágenes."

    @transaction.atomic
    def handle(self, *args, **options):
        self.stdout.write(self.style.MIGRATE_HEADING("Iniciando carga de catálogo extendido (50 tiendas)..."))

        # Mapa de tiendas adicionales y sus productos
        stores_data = [
            # --- RESTAURANTES ---
            {
                "username": "vendedor_parrilla_tio",
                "email": "parrilla_tio@foodrush.com",
                "name": "La Parrilla del Tío",
                "description": "Asador criollo con los mejores cortes de carne argentina, provoletas crocantes y achuras a la brasa.",
                "image": "stores/parrilla_asador.jpg",
                "products": [
                    {"name": "Ojo de Bife con Papas Fritas", "description": "Corte premium a punto con papas fritas caseras.", "price": "9500.00", "stock": 20, "is_available": True, "image": "products/asado_carne.jpg"},
                    {"name": "Provoleta a la Parrilla", "description": "Queso provolone fundido con orégano y ají molido.", "price": "4200.00", "stock": 15, "is_available": True, "image": "products/provoleta.jpg"},
                    {"name": "Vacío al Asador", "description": "Cocción lenta a las brasas, tierno y sabroso.", "price": "8900.00", "stock": 12, "is_available": True, "image": "products/asado_carne.jpg"},
                    {"name": "Chinchulines Crocantes", "description": "Con limón natural y sal marina.", "price": "3800.00", "stock": 0, "is_available": False, "image": "products/asado_carne.jpg"},
                ],
            },
            {
                "username": "vendedor_bodegon_porteno",
                "email": "bodegon_porteno@foodrush.com",
                "name": "El Bodegón Porteño",
                "description": "Comida casera abundante, milanesas gigantes, pastas caseras y empanadas fritas.",
                "image": "stores/bodegon_porteno.jpg",
                "products": [
                    {"name": "Milanesa Napolitana con Fritas", "description": "Salsa de tomate casera, jamón cocido y muzzarella gratinada.", "price": "7800.00", "stock": 25, "is_available": True, "image": "products/milanesa_napolitana.jpg"},
                    {"name": "Pastel de Papas Tradicional", "description": "Carne picada especiada, aceitunas y puré dorado al horno.", "price": "5900.00", "stock": 14, "is_available": True, "image": "products/pastel_de_papas.jpg"},
                    {"name": "Empanadas de Carne a Cuchillo (x3)", "description": "Jugosas con cebolla de verdeo y huevo duro.", "price": "3300.00", "stock": 40, "is_available": True, "image": "products/empanada_carne.jpg"},
                    {"name": "Revuelto Gramajo", "description": "Papas pay crocantes, jamón y huevos cremosos.", "price": "4800.00", "stock": 4, "is_available": True, "image": "products/pastel_de_papas.jpg"},
                ],
            },
            {
                "username": "vendedor_sushi_koi",
                "email": "sushi_koi@foodrush.com",
                "name": "Sushi Koi Garden",
                "description": "Restaurante de cocina japonesa y nikkei con rolls artesanales frescos, sashimi y gyozas.",
                "image": "stores/sushi_koi.jpg",
                "products": [
                    {"name": "Combo Koi 15 Piezas", "description": "Variedad de salmon rolls, nigiris y makis de la casa.", "price": "11500.00", "stock": 18, "is_available": True, "image": "products/sushi_combo.jpg"},
                    {"name": "Salmón Roll Especial (8 un.)", "description": "Salmón rosado, palta y queso philadelphia con sésamo tostado.", "price": "6800.00", "stock": 22, "is_available": True, "image": "products/sushi_combo.jpg"},
                    {"name": "Gyozas de Cerdo y Verdeo (5 un.)", "description": "Empanaditas al vapor y doradas con salsa agridulce.", "price": "4100.00", "stock": 16, "is_available": True, "image": "products/gyozas.jpg"},
                    {"name": "Roll Veggie Philadelphia", "description": "Zanahoria glaceada, pepino y queso.", "price": "5200.00", "stock": 0, "is_available": False, "image": "products/sushi_combo.jpg"},
                ],
            },
            {
                "username": "vendedor_tacos_chiles",
                "email": "tacos_chiles@foodrush.com",
                "name": "Tacos & Chiles Taquería",
                "description": "Comida mexicana auténtica con tacos al pastor, totopos con guacamole y quesadillas doradas.",
                "image": "stores/tacos_taqueria.jpg",
                "products": [
                    {"name": "Tacos al Pastor (x3)", "description": "Carne marinada con achiote, piña asada, cilantro y cebolla.", "price": "5400.00", "stock": 30, "is_available": True, "image": "products/tacos_al_pastor.jpg"},
                    {"name": "Nachos con Cheddar y Guacamole", "description": "Totopos crocantes con abundante queso y dip de palta.", "price": "4600.00", "stock": 20, "is_available": True, "image": "products/nachos_guacamole.jpg"},
                    {"name": "Burrito de Pollo Chipotle", "description": "Arroz, frijoles negros, queso y pollo desmenuzado.", "price": "5800.00", "stock": 15, "is_available": True, "image": "products/burrito.jpg"},
                    {"name": "Quesadilla Doble Queso", "description": "Tortilla de trigo tostada rellena de blend de quesos.", "price": "4200.00", "stock": 10, "is_available": True, "image": "products/nachos_guacamole.jpg"},
                ],
            },
            {
                "username": "vendedor_pasta_nostra",
                "email": "pasta_nostra@foodrush.com",
                "name": "Pasta Nostra Trattoria",
                "description": "Pastas frescas elaboradas en el día, sorrentinos rellenos, lasagna bolognesa y salsas italianas.",
                "image": "stores/pasta_trattoria.jpg",
                "products": [
                    {"name": "Sorrentinos de Jamón y Queso", "description": "Con salsa mixta de pomodoro y crema fresca.", "price": "6200.00", "stock": 25, "is_available": True, "image": "products/sorrentinos_pasta.jpg"},
                    {"name": "Lasagna Emiliana Gratinada", "description": "Capas de masa casera, bolognesa y bechamel.", "price": "7100.00", "stock": 10, "is_available": True, "image": "products/lasagna.jpg"},
                    {"name": "Ravioles de Espinaca y Ricotta", "description": "Con salsa bolognesa tradicional.", "price": "5600.00", "stock": 18, "is_available": True, "image": "products/sorrentinos_pasta.jpg"},
                    {"name": "Tiramisú Clásico", "description": "Con mascarpone y café expreso.", "price": "3200.00", "stock": 0, "is_available": False, "image": "products/tiramisu.jpg"},
                ],
            },
            {
                "username": "vendedor_empanadas_lorenzo",
                "email": "empanadas_lorenzo@foodrush.com",
                "name": "Empanadas Criollas Don Lorenzo",
                "description": "Empanadas salteñas y tucumanas horneadas al horno de barro con masa casera.",
                "image": "stores/empanadas_lorenzo.jpg",
                "products": [
                    {"name": "Docena de Empanadas Variadas", "description": "Elegí 12 empanadas de carne, pollo, jamón o verdura.", "price": "12000.00", "stock": 35, "is_available": True, "image": "products/empanada_carne.jpg"},
                    {"name": "Empanada Criolla Picante", "description": "Carne suave con comino y ají picante salteño.", "price": "1100.00", "stock": 50, "is_available": True, "image": "products/empanada_carne.jpg"},
                    {"name": "Empanada de Jamón y Muzzarella", "description": "Muzzarella fundida con jamón cocido seleccionado.", "price": "1100.00", "stock": 45, "is_available": True, "image": "products/empanada_carne.jpg"},
                    {"name": "Empanada de Humita y Queso", "description": "Choclo cremoso, cebolla y queso derretido.", "price": "1100.00", "stock": 30, "is_available": True, "image": "products/empanada_carne.jpg"},
                ],
            },
            {
                "username": "vendedor_green_bowls",
                "email": "green_bowls@foodrush.com",
                "name": "Green Life Bowls",
                "description": "Restaurante gourmet de bowls frescos de quinoa, ensaladas completas y wraps proteicos para nutrirte.",
                "image": "stores/green_bowls.jpg",
                "products": [
                    {"name": "Power Bowl de Pollo y Palta", "description": "Quinoa, pollo grillado, palta, tomates cherry y aderezo tahini.", "price": "6100.00", "stock": 15, "is_available": True, "image": "products/power_bowl.jpg"},
                    {"name": "Wrap Mediterráneo de Falafel", "description": "Falafel horneado, hummus, espinaca y pepino.", "price": "5200.00", "stock": 12, "is_available": True, "image": "products/wrap_vegetariano.jpg"},
                    {"name": "Ensalada César Crunch", "description": "Mix de lechugas, croutons caseros, parmesano y aderezo césar.", "price": "5500.00", "stock": 20, "is_available": True, "image": "products/power_bowl.jpg"},
                ],
            },
            {
                "username": "vendedor_asador_querencia",
                "email": "asador_querencia@foodrush.com",
                "name": "Asador La Querencia (Cerrado por reformas)",
                "description": "Asador y parrilla tradicional de campo. Cerrado temporalmente por refacciones hasta la próxima semana.",
                "image": "stores/asador_querencia.jpg",
                "products": [
                    {"name": "Parrillada Completa para Dos", "description": "Tira de asado, vacío, chorizo y morcilla.", "price": "16000.00", "stock": 0, "is_available": False, "image": "products/asado_carne.jpg"},
                    {"name": "Bife de Chorizo a la Brasa", "description": "Corte jugoso de 400g.", "price": "8500.00", "stock": 0, "is_available": False, "image": "products/asado_carne.jpg"},
                ],
            },

            # --- SÚPER Y KIOSCOS ---
            {
                "username": "vendedor_kiosco_parada",
                "email": "kiosco_parada@foodrush.com",
                "name": "Kiosco La Parada 24hs",
                "description": "Kiosco céntrico con golosinas, chocolates, snacks y bebidas bien frías a toda hora.",
                "image": "stores/kiosco_parada.jpg",
                "products": [
                    {"name": "Alfajor Triple de Chocolate", "description": "Relleno con abundante dulce de leche y baño de chocolate semiamargo.", "price": "1200.00", "stock": 60, "is_available": True, "image": "products/alfajor_chocolate.jpg"},
                    {"name": "Gaseosa Cola 500ml", "description": "Botella individual bien fría.", "price": "1500.00", "stock": 50, "is_available": True, "image": "products/gaseosa_cola_500ml.jpg"},
                    {"name": "Papas Fritas Clásicas 120g", "description": "Papas crocantes saladas.", "price": "1800.00", "stock": 30, "is_available": True, "image": "products/papas_fritas_clasicas.jpg"},
                    {"name": "Chocolatada 200ml", "description": "Leche con cacao chocolatada lista para tomar.", "price": "900.00", "stock": 20, "is_available": True, "image": "products/chocolate_barra.jpg"},
                ],
            },
            {
                "username": "vendedor_super_don_bosco",
                "email": "super_don_bosco@foodrush.com",
                "name": "Super Almacén Don Bosco",
                "description": "Supermercado barrial, abarrotes, lácteos, fideos, aceites y artículos de despensa diaria.",
                "image": "stores/super_don_bosco.jpg",
                "products": [
                    {"name": "Leche Entera Larga Vida 1L", "description": "Leche fortificada con vitaminas A y D.", "price": "1450.00", "stock": 40, "is_available": True, "image": "products/leche_entera.jpg"},
                    {"name": "Arroz Doble Carolina 1kg", "description": "Grano largo fino selecto.", "price": "2100.00", "stock": 35, "is_available": True, "image": "products/arroz_paquete.jpg"},
                    {"name": "Aceite de Girasol 900ml", "description": "Aceite 100% puro para cocina.", "price": "2300.00", "stock": 25, "is_available": True, "image": "products/aceite_girasol.jpg"},
                    {"name": "Fideos Tallarines 500g", "description": "Pasta seca al huevo tradicional.", "price": "1200.00", "stock": 50, "is_available": True, "image": "products/sorrentinos_pasta.jpg"},
                ],
            },
            {
                "username": "vendedor_despensa_belgrano",
                "email": "despensa_belgrano@foodrush.com",
                "name": "Despensa & Market Belgrano",
                "description": "Almacén gourmet con quesos, fiambres selectos y conservas artesanales de alta calidad.",
                "image": "stores/despensa_belgrano.jpg",
                "products": [
                    {"name": "Tabla de Picada Clásica", "description": "Queso gouda, salame de colonia, jamón cocido y aceitunas.", "price": "8500.00", "stock": 15, "is_available": True, "image": "products/tabla_picada.jpg"},
                    {"name": "Jamón Crudo Reserva 150g", "description": "Estacionado 12 meses, feteado fino.", "price": "3600.00", "stock": 20, "is_available": True, "image": "products/tabla_picada.jpg"},
                    {"name": "Queso Parmesano Trozado 200g", "description": "Sabor intenso ideal para rallar o picar.", "price": "4200.00", "stock": 18, "is_available": True, "image": "products/tabla_picada.jpg"},
                    {"name": "Aceitunas Rellenas 250g", "description": "Rellenas con morrón dulce.", "price": "2100.00", "stock": 3, "is_available": True, "image": "products/tabla_picada.jpg"},
                ],
            },
            {
                "username": "vendedor_kiosco_tentacion",
                "email": "kiosco_tentacion@foodrush.com",
                "name": "Kiosco Dulce Tentación",
                "description": "Kiosco de golosinas importadas, gomitas, caramelos masticables y bombones.",
                "image": "stores/kiosco_tentacion.jpg",
                "products": [
                    {"name": "Paquete de Gomitas Frutales", "description": "Sabor a frutas surtidas con azúcar.", "price": "950.00", "stock": 45, "is_available": True, "image": "products/gomitas_frutales.jpg"},
                    {"name": "Barra de Chocolate con Maní", "description": "Chocolate con leche crocante.", "price": "1400.00", "stock": 30, "is_available": True, "image": "products/chocolate_barra.jpg"},
                    {"name": "Chicles Mentolados", "description": "Sabor menta intensa sin azúcar.", "price": "600.00", "stock": 80, "is_available": True, "image": "products/gomitas_frutales.jpg"},
                    {"name": "Caja de Bombones Surtidos", "description": "Bombones rellenos con licor y dulce.", "price": "4500.00", "stock": 0, "is_available": False, "image": "products/bombon_escoces.jpg"},
                ],
            },
            {
                "username": "vendedor_fresh_market",
                "email": "fresh_market@foodrush.com",
                "name": "Fresh Market Orgánico",
                "description": "Market orgánico y almacén con productos agroecológicos, frutos secos y semillas naturales.",
                "image": "stores/fresh_market.jpg",
                "products": [
                    {"name": "Mix de Frutos Secos 250g", "description": "Nueces, almendras, castañas de cajú y pasas.", "price": "3800.00", "stock": 25, "is_available": True, "image": "products/frutos_secos.jpg"},
                    {"name": "Miel Pura de Monte 500g", "description": "Cosecha propia 100% natural sin aditivos.", "price": "3200.00", "stock": 18, "is_available": True, "image": "products/miel_pura.jpg"},
                    {"name": "Harina de Almendras 500g", "description": "Sin TACC ideal para repostería keto.", "price": "4100.00", "stock": 12, "is_available": True, "image": "products/arroz_paquete.jpg"},
                    {"name": "Granola Artesanal con Miel", "description": "Avena tostada, semillas de chía y coco rallado.", "price": "2900.00", "stock": 20, "is_available": True, "image": "products/granola.jpg"},
                ],
            },
            {
                "username": "vendedor_bebidas_snacks",
                "email": "bebidas_snacks@foodrush.com",
                "name": "Bebidas & Snacks Express",
                "description": "Almacén de bebidas frías, aguas saborizadas, aperitivos y snacks salados para picar.",
                "image": "stores/bebidas_snacks.jpg",
                "products": [
                    {"name": "Cerveza Rubia Lata 473ml", "description": "Refrescante, servir bien fría.", "price": "1800.00", "stock": 60, "is_available": True, "image": "products/cerveza_artesanal_ipa.jpg"},
                    {"name": "Agua Mineral con Gas 1.5L", "description": "Agua de manantial purificada.", "price": "1100.00", "stock": 40, "is_available": True, "image": "products/agua_mineral_1500ml.jpg"},
                    {"name": "Maní Salado Tostado 150g", "description": "Snack clásico para acompañar bebidas.", "price": "1200.00", "stock": 35, "is_available": True, "image": "products/frutos_secos.jpg"},
                    {"name": "Nachos Horneados con Sal", "description": "Totopos de maíz crujientes.", "price": "1600.00", "stock": 25, "is_available": True, "image": "products/nachos_guacamole.jpg"},
                ],
            },
            {
                "username": "vendedor_minisuper_amigos",
                "email": "minisuper_amigos@foodrush.com",
                "name": "Minisuper Los Amigos",
                "description": "Supermercado de cercanía con ofertas en lácteos, panificados y productos de almacén.",
                "image": "stores/minisuper_amigos.jpg",
                "products": [
                    {"name": "Queso Crema Untable 290g", "description": "Clásico para desayunos y meriendas.", "price": "2100.00", "stock": 30, "is_available": True, "image": "products/leche_entera.jpg"},
                    {"name": "Galletitas Dulces Surtidas", "description": "Paquete familiar de 400g.", "price": "1300.00", "stock": 40, "is_available": True, "image": "products/galletitas_chispas.jpg"},
                    {"name": "Yogur Firme de Vainilla", "description": "Pote individual de 120g.", "price": "950.00", "stock": 25, "is_available": True, "image": "products/leche_entera.jpg"},
                ],
            },
            {
                "username": "vendedor_kiosco_trebol",
                "email": "kiosco_trebol@foodrush.com",
                "name": "Kiosco El Trébol",
                "description": "Kiosco tradicional con golosinas, alfajores de maicena caseros y snacks al paso.",
                "image": "stores/kiosco_trebol.jpg",
                "products": [
                    {"name": "Alfajor de Maicena Artesanal", "description": "Con abundante coco rallado y dulce de leche repostero.", "price": "1100.00", "stock": 25, "is_available": True, "image": "products/alfajor_chocolate.jpg"},
                    {"name": "Turrón de Maní Crocante", "description": "Oblea rellena con pasta de turrón.", "price": "600.00", "stock": 50, "is_available": True, "image": "products/gomitas_frutales.jpg"},
                    {"name": "Bebida Energizante 250ml", "description": "Para recargar energías durante el día.", "price": "1900.00", "stock": 30, "is_available": True, "image": "products/cerveza_artesanal_ipa.jpg"},
                ],
            },
            {
                "username": "vendedor_almacen_esquina",
                "email": "almacen_esquina@foodrush.com",
                "name": "Almacén La Esquina (Cerrado por inventario)",
                "description": "Almacén y despensa barrial. Cerrado hoy por balance y conteo general de stock.",
                "image": "stores/almacen_esquina.jpg",
                "products": [
                    {"name": "Paquete de Harina 0000 1kg", "description": "Harina refinada para cocina.", "price": "1200.00", "stock": 0, "is_available": False, "image": "products/arroz_paquete.jpg"},
                    {"name": "Yerba Mate Especial 500g", "description": "Con palo, estacionamiento natural.", "price": "2800.00", "stock": 0, "is_available": False, "image": "products/te_hebras.jpg"},
                ],
            },

            # --- CAFETERÍAS ---
            {
                "username": "vendedor_cafe_bonafide",
                "email": "cafe_bonafide@foodrush.com",
                "name": "Café Bonafide Del Sol",
                "description": "Cafetería de especialidad con café en grano molido a la vista, tostados y pastelería fina.",
                "image": "stores/cafe_bonafide.jpg",
                "products": [
                    {"name": "Café Espresso Doble", "description": "Extracción intensa con granos arábigos tostados.", "price": "2200.00", "stock": 50, "is_available": True, "image": "products/cafe_latte_doble.jpg"},
                    {"name": "Cappuccino Italiano con Cacao", "description": "Espuma de leche cremosa con lluvia de cacao amargo.", "price": "2800.00", "stock": 40, "is_available": True, "image": "products/cafe_latte_doble.jpg"},
                    {"name": "Medialuna de Manteca Tradicional", "description": "Hojaldrada y con almíbar artesanal.", "price": "800.00", "stock": 60, "is_available": True, "image": "products/medialunas.jpg"},
                    {"name": "Tostado de Jamón y Queso", "description": "En pan árabe tostado bien crocante.", "price": "3900.00", "stock": 25, "is_available": True, "image": "products/tostado_clasico.jpg"},
                ],
            },
            {
                "username": "vendedor_panaderia_molino",
                "email": "panaderia_molino@foodrush.com",
                "name": "Panadería & Café El Molino",
                "description": "Panadería artesanal con medialunas calientes, chipá recién horneado y café con leche.",
                "image": "stores/panaderia_molino.jpg",
                "products": [
                    {"name": "Café con Leche y 2 Medialunas", "description": "El combo de desayuno argentino por excelencia.", "price": "3400.00", "stock": 35, "is_available": True, "image": "products/medialunas.jpg"},
                    {"name": "Porción de Chipá Calentito (x4)", "description": "Bollitos de fécula de mandioca con blend de tres quesos.", "price": "2200.00", "stock": 40, "is_available": True, "image": "products/chipa_queso.jpg"},
                    {"name": "Torta Red Velvet (porción)", "description": "Bizcochuelo aterciopelado con frosting de queso dulce.", "price": "3800.00", "stock": 12, "is_available": True, "image": "products/torta_porcion.jpg"},
                    {"name": "Sándwich de Miga Triple Jamón y Queso", "description": "Miga fresca y mayonesa suave.", "price": "2400.00", "stock": 20, "is_available": True, "image": "products/sandwich_miga.jpg"},
                ],
            },
            {
                "username": "vendedor_moka_coffee",
                "email": "moka_coffee@foodrush.com",
                "name": "Moka Specialty Coffee",
                "description": "Cafetería moderna con filtrados V60, flat white, cookies neoyorquinas y brunch.",
                "image": "stores/moka_coffee.jpg",
                "products": [
                    {"name": "Flat White Australiano", "description": "Doble ristretto con microespuma de leche aterciopelada.", "price": "3100.00", "stock": 30, "is_available": True, "image": "products/cafe_latte_doble.jpg"},
                    {"name": "Iced Caramel Latte", "description": "Café frío con salsa de caramelo casera y hielo.", "price": "3400.00", "stock": 25, "is_available": True, "image": "products/cafe_latte_doble.jpg"},
                    {"name": "Cookie Gigante de Chocolate y Sal Marina", "description": "Horneada al momento con corazón fundente.", "price": "2100.00", "stock": 30, "is_available": True, "image": "products/cookie_chocolate.jpg"},
                    {"name": "Avocado Toast con Huevo Poché", "description": "Pan de masa madre tostado, palta pisada y huevo poché.", "price": "4900.00", "stock": 15, "is_available": True, "image": "products/avocado_toast.jpg"},
                ],
            },
            {
                "username": "vendedor_baguette_pasteleria",
                "email": "baguette_pasteleria@foodrush.com",
                "name": "La Baguette Pastelería",
                "description": "Cafetería francesa y pastelería fina con croissants, macarons, tartas y submarinos.",
                "image": "stores/baguette_pasteleria.jpg",
                "products": [
                    {"name": "Croissant Relleno de Almendras", "description": "Hojaldre francés relleno con crema frangipane.", "price": "3200.00", "stock": 20, "is_available": True, "image": "products/croissant_almendras.jpg"},
                    {"name": "Tarta Lemon Pie Individual", "description": "Base crocante, crema de limón suave y merengue italiano.", "price": "3600.00", "stock": 15, "is_available": True, "image": "products/lemon_pie.jpg"},
                    {"name": "Macarons Surtidos (x4)", "description": "Sabores pistacho, chocolate, frambuesa y vainilla.", "price": "4200.00", "stock": 18, "is_available": True, "image": "products/macarons.jpg"},
                    {"name": "Submarino con Chocolate en Rama", "description": "Leche bien caliente con barra de chocolate artesanal.", "price": "3100.00", "stock": 22, "is_available": True, "image": "products/submarino_chocolate.jpg"},
                ],
            },
            {
                "username": "vendedor_deli_palermo",
                "email": "deli_palermo@foodrush.com",
                "name": "Deli & Brunch Palermo",
                "description": "Meriendas completas, café gourmet, tostados en pan de campo y jugos naturales exprimidos.",
                "image": "stores/deli_palermo.jpg",
                "products": [
                    {"name": "Brunch Completo para Dos", "description": "2 cafés, 2 jugos, tostón de salmón, porción dulce y tostadas.", "price": "13500.00", "stock": 10, "is_available": True, "image": "products/avocado_toast.jpg"},
                    {"name": "Tostón de Salmón Ahumado", "description": "Pan de centeno, queso crema con ciboulette y alcaparras.", "price": "5800.00", "stock": 12, "is_available": True, "image": "products/avocado_toast.jpg"},
                    {"name": "Jugo de Naranja Exprimido Natural", "description": "100% fruta recién exprimida sin azúcar agregada.", "price": "2200.00", "stock": 30, "is_available": True, "image": "products/jugo_naranja.jpg"},
                    {"name": "Waffle con Dulce de Leche y Frutillas", "description": "Waffle tibio con frutas de estación.", "price": "4100.00", "stock": 0, "is_available": False, "image": "products/waffle_frutas.jpg"},
                ],
            },
            {
                "username": "vendedor_martinez_paseo",
                "email": "martinez_paseo@foodrush.com",
                "name": "Café Martínez Paseo",
                "description": "Cafetería clásica argentina con tostados de lomito y queso, masas finas y café tostado.",
                "image": "stores/martinez_paseo.jpg",
                "products": [
                    {"name": "Café Cortado en Jarrito", "description": "Con la medida justa de leche caliente.", "price": "2300.00", "stock": 45, "is_available": True, "image": "products/cafe_latte_doble.jpg"},
                    {"name": "Tostado de Lomito y Cheddar", "description": "En pan de campo tostado con manteca.", "price": "4400.00", "stock": 20, "is_available": True, "image": "products/tostado_clasico.jpg"},
                    {"name": "Cuadrado de Ricotta y Limón", "description": "Masa suave con relleno dulce de ricotta.", "price": "2600.00", "stock": 15, "is_available": True, "image": "products/torta_porcion.jpg"},
                ],
            },
            {
                "username": "vendedor_merienda_tea",
                "email": "merienda_tea@foodrush.com",
                "name": "La Merienda Coffee & Tea",
                "description": "Espacio cálido para meriendas, amplia carta de té en hebras premium y scones ingleses.",
                "image": "stores/merienda_tea.jpg",
                "products": [
                    {"name": "Té en Hebras con Scones (x2)", "description": "Té Earl Grey servido con mermelada y queso.", "price": "3500.00", "stock": 20, "is_available": True, "image": "products/te_hebras.jpg"},
                    {"name": "Carrot Cake con Frosting", "description": "Torta especiada de zanahoria con nueces.", "price": "3700.00", "stock": 14, "is_available": True, "image": "products/torta_porcion.jpg"},
                    {"name": "Frappé de Café y Dulce de Leche", "description": "Bebida batida con crema chantilly.", "price": "3600.00", "stock": 25, "is_available": True, "image": "products/cafe_latte_doble.jpg"},
                ],
            },
            {
                "username": "vendedor_cafe_tentacion",
                "email": "cafe_tentacion@foodrush.com",
                "name": "Café Dulce Tentación",
                "description": "Cafetería barrial con facturas artesanales, alfajores de chocolate y café al paso.",
                "image": "stores/cafe_tentacion.jpg",
                "products": [
                    {"name": "Café con Leche Chico", "description": "Taza clásica con café torrado suave.", "price": "1900.00", "stock": 40, "is_available": True, "image": "products/cafe_latte_doble.jpg"},
                    {"name": "Factura Rellena con Dulce de Leche", "description": "Masa suave horneada en el día.", "price": "750.00", "stock": 50, "is_available": True, "image": "products/medialunas.jpg"},
                    {"name": "Budín de Limón y Amapolas", "description": "Porción generosa glaseada.", "price": "2200.00", "stock": 18, "is_available": True, "image": "products/torta_porcion.jpg"},
                ],
            },
            {
                "username": "vendedor_boutique_cafe",
                "email": "boutique_cafe@foodrush.com",
                "name": "Boutique del Café (Cerrado los lunes)",
                "description": "Cafetería y tostadero artesanal de micro-lotes. Cerrado temporalmente los lunes por descanso.",
                "image": "stores/boutique_cafe.jpg",
                "products": [
                    {"name": "Espresso Americano", "description": "Taza de 200ml café suave.", "price": "2000.00", "stock": 0, "is_available": False, "image": "products/cafe_latte_doble.jpg"},
                    {"name": "Brownie con Nuez", "description": "Cacao amargo y nueces tostadas.", "price": "2500.00", "stock": 0, "is_available": False, "image": "products/cheesecake_frutos_rojos.jpg"},
                ],
            },

            # --- HELADOS ---
            {
                "username": "vendedor_freddo_artesanal",
                "email": "freddo_artesanal@foodrush.com",
                "name": "Freddo Helados Artesanales",
                "description": "Heladería tradicional con dulce de leche tentación, chocolates puros y cucuruchos crocantes.",
                "image": "stores/freddo_helados.jpg",
                "products": [
                    {"name": "1 Kilo de Helado (4 Sabores)", "description": "Elegí hasta 4 sabores de cremas y chocolates.", "price": "13500.00", "stock": 30, "is_available": True, "image": "products/pote_helado_1kg.jpg"},
                    {"name": "1/2 Kilo de Helado (3 Sabores)", "description": "Pote térmico ideal para dos personas.", "price": "7800.00", "stock": 35, "is_available": True, "image": "products/pote_helado_medio.jpg"},
                    {"name": "1/4 Kilo de Helado (2 Sabores)", "description": "Porción individual generosa con cucurucho.", "price": "4500.00", "stock": 40, "is_available": True, "image": "products/cucurucho_especial.jpg"},
                    {"name": "Cucurucho Bañado en Chocolate", "description": "Waffle crocante bañado en chocolate cobertura.", "price": "3200.00", "stock": 25, "is_available": True, "image": "products/cucurucho_especial.jpg"},
                ],
            },
            {
                "username": "vendedor_luccianos_gelato",
                "email": "luccianos_gelato@foodrush.com",
                "name": "Lucciano's Ice Cream & Paletas",
                "description": "Gelato artesanal italiano y paletas de autor con coberturas crocantes y diseños únicos.",
                "image": "stores/luccianos_gelato.jpg",
                "products": [
                    {"name": "Paleta IcePop Cookie Monster", "description": "Crema americana con galletitas oreo y baño de chocolate blanco.", "price": "3900.00", "stock": 25, "is_available": True, "image": "products/paleta_artesanal_frutilla.jpg"},
                    {"name": "Paleta de Frutilla al Agua", "description": "Pura fruta natural sin conservantes.", "price": "3100.00", "stock": 30, "is_available": True, "image": "products/paleta_artesanal_frutilla.jpg"},
                    {"name": "Pote de 1 Kg de Gelato Selección", "description": "Pistacho italiano, sambayón y gianduia.", "price": "14200.00", "stock": 20, "is_available": True, "image": "products/pote_helado_1kg.jpg"},
                    {"name": "Bombón Escocés Individual", "description": "Centro de dulce de leche bañado en chocolate.", "price": "2800.00", "stock": 0, "is_available": False, "image": "products/bombon_escoces.jpg"},
                ],
            },
            {
                "username": "vendedor_persicco_cremas",
                "email": "persicco_cremas@foodrush.com",
                "name": "Heladería Persicco",
                "description": "Helados cremosos elaborados con materias primas de primera calidad y frutas naturales.",
                "image": "stores/persicco_cremas.jpg",
                "products": [
                    {"name": "Kilo de Helado Clásico", "description": "Hasta 4 sabores clásicos y especiales.", "price": "13200.00", "stock": 25, "is_available": True, "image": "products/pote_helado_1kg.jpg"},
                    {"name": "Pote Dulce de Leche Especial 1/2 Kg", "description": "Blend exclusivo con nueces pecan y veteado.", "price": "7500.00", "stock": 30, "is_available": True, "image": "products/pote_helado_medio.jpg"},
                    {"name": "Copa Sundae con Salsa Caliente", "description": "Helado de crema americana con salsa de chocolate caliente.", "price": "4100.00", "stock": 15, "is_available": True, "image": "products/cucurucho_especial.jpg"},
                ],
            },
            {
                "username": "vendedor_venezia_postres",
                "email": "venezia_postres@foodrush.com",
                "name": "Gelato & Postres Helados Venezia",
                "description": "Postres helados artesanales, cassatas napolitanas, bombón suizo y tortas heladas para eventos.",
                "image": "stores/venezia_postres.jpg",
                "products": [
                    {"name": "Torta Helada Oreo", "description": "Base de galletitas, crema helada de vainilla y cobertura crocante.", "price": "9500.00", "stock": 10, "is_available": True, "image": "products/torta_helada.jpg"},
                    {"name": "Bombón Suizo Artesanal", "description": "Helado de chocolate y americana con corazón de dulce de leche.", "price": "3100.00", "stock": 20, "is_available": True, "image": "products/bombon_escoces.jpg"},
                    {"name": "Pote 1/4 Kg Sabores a Elección", "description": "Copa individual con vasito comestible.", "price": "4400.00", "stock": 35, "is_available": True, "image": "products/cucurucho_especial.jpg"},
                ],
            },
            {
                "username": "vendedor_paleteria_mexicana",
                "email": "paleteria_mexicana@foodrush.com",
                "name": "Paletería Mexicana & Helados",
                "description": "Paletas artesanales rellenas con leche condensada y helados refrescantes de fruta natural.",
                "image": "stores/paleteria_mexicana.jpg",
                "products": [
                    {"name": "Paleta de Maracuyá Rellena", "description": "Fruta tropical con corazón de leche condensada líquida.", "price": "3400.00", "stock": 25, "is_available": True, "image": "products/paleta_artesanal_frutilla.jpg"},
                    {"name": "Paleta de Chocolate Belga", "description": "Chocolate con 70% cacao intenso.", "price": "3600.00", "stock": 20, "is_available": True, "image": "products/paleta_artesanal_frutilla.jpg"},
                    {"name": "Paleta de Limón y Menta al Agua", "description": "Súper refrescante para días de calor.", "price": "2800.00", "stock": 30, "is_available": True, "image": "products/paleta_artesanal_frutilla.jpg"},
                ],
            },
            {
                "username": "vendedor_grido_plaza",
                "email": "grido_plaza@foodrush.com",
                "name": "Heladería Grido Plaza",
                "description": "Helados familiares económicos, potes tentación y postres congelados para compartir.",
                "image": "stores/grido_plaza.jpg",
                "products": [
                    {"name": "Pote Familiar de 3 Litros", "description": "Sabores clásicos para toda la familia.", "price": "11900.00", "stock": 40, "is_available": True, "image": "products/pote_helado_1kg.jpg"},
                    {"name": "Pote Tentación Dulce de Leche 500g", "description": "Con bombones de chocolate rellenos.", "price": "4900.00", "stock": 30, "is_available": True, "image": "products/pote_helado_medio.jpg"},
                    {"name": "Caja de 6 Bombones Crocantes", "description": "Bañados en chocolate con maní.", "price": "5200.00", "stock": 20, "is_available": True, "image": "products/bombon_escoces.jpg"},
                ],
            },
            {
                "username": "vendedor_rapanui_helados",
                "email": "rapanui_helados@foodrush.com",
                "name": "Rapanui Helados & Chocolates",
                "description": "Helados artesanales con frambuesas patagónicas, bombones y el auténtico Franui helado.",
                "image": "stores/rapanui_helados.jpg",
                "products": [
                    {"name": "Franui Chocolate con Leche 150g", "description": "Frambuesas de la Patagonia con doble baño de chocolate.", "price": "4600.00", "stock": 35, "is_available": True, "image": "products/franui_frambuesas.jpg"},
                    {"name": "Franui Chocolate Amargo 150g", "description": "Frambuesas bañadas en chocolate amargo.", "price": "4600.00", "stock": 30, "is_available": True, "image": "products/franui_frambuesas.jpg"},
                    {"name": "1 Kg Helado Sabores Patagónicos", "description": "Calafate, frutos del bosque y chocolate alpino.", "price": "14500.00", "stock": 20, "is_available": True, "image": "products/pote_helado_1kg.jpg"},
                ],
            },
            {
                "username": "vendedor_chungo_helados",
                "email": "chungo_helados@foodrush.com",
                "name": "Chungo Helados y Café",
                "description": "Heladería y cafetería combinada con batidos helados cremosos, affogattos y postres.",
                "image": "stores/chungo_helados.jpg",
                "products": [
                    {"name": "Milkshake de Americana y Dulce de Leche", "description": "Batido cremoso con salsa casera.", "price": "4200.00", "stock": 20, "is_available": True, "image": "products/milkshake.jpg"},
                    {"name": "1/2 Kg de Helado Premium", "description": "Hasta 3 gustos artesanales a elección.", "price": "7900.00", "stock": 25, "is_available": True, "image": "products/pote_helado_medio.jpg"},
                    {"name": "Affogato Espresso con Helado", "description": "Café espresso vertido sobre una bocha de vainilla.", "price": "3500.00", "stock": 15, "is_available": True, "image": "products/cucurucho_especial.jpg"},
                ],
            },
            {
                "username": "vendedor_heladeria_andes",
                "email": "heladeria_andes@foodrush.com",
                "name": "Heladería Los Andes (Cerrado por temporada baja)",
                "description": "Helados y postres helados artesanales de montaña. Cerrado por reformas hasta nuevo aviso.",
                "image": "stores/heladeria_andes.jpg",
                "products": [
                    {"name": "Pote 1 Kg Tradicional", "description": "Cremas heladas clásicas.", "price": "11000.00", "stock": 0, "is_available": False, "image": "products/pote_helado_1kg.jpg"},
                    {"name": "Paleta Frutal de Agua", "description": "Sabor naranja y limón.", "price": "2500.00", "stock": 0, "is_available": False, "image": "products/paleta_artesanal_frutilla.jpg"},
                ],
            },

            # --- FARMACIA ---
            {
                "username": "vendedor_farmacity_centro",
                "email": "farmacity_centro@foodrush.com",
                "name": "Farmacia Farmacity Centro",
                "description": "Medicamentos bajo receta, analgésicos, higiene personal y cuidado de la salud familiar.",
                "image": "stores/farmacity_centro.jpg",
                "products": [
                    {"name": "Ibuprofeno 400mg x 10 Cápsulas", "description": "Analgésico y antiinflamatorio de acción rápida.", "price": "2800.00", "stock": 50, "is_available": True, "image": "products/ibuprofeno_capsulas.jpg"},
                    {"name": "Paracetamol 500mg x 16 Comprimidos", "description": "Para alivio del dolor y la fiebre.", "price": "2400.00", "stock": 60, "is_available": True, "image": "products/ibuprofeno_capsulas.jpg"},
                    {"name": "Alcohol en Gel 250ml", "description": "Sanitizante de manos con glicerina humectante.", "price": "1900.00", "stock": 40, "is_available": True, "image": "products/alcohol_en_gel.jpg"},
                    {"name": "Pasta Dental Protección Total 90g", "description": "Con flúor activo anticaries.", "price": "2200.00", "stock": 45, "is_available": True, "image": "products/cepillo_dental.jpg"},
                ],
            },
            {
                "username": "vendedor_farmacia_puente",
                "email": "farmacia_puente@foodrush.com",
                "name": "Farmacia del Puente",
                "description": "Atención farmacéutica, primeros auxilios, curaciones y medicamentos de venta libre.",
                "image": "stores/farmacia_puente.jpg",
                "products": [
                    {"name": "Botiquín de Primeros Auxilios Básico", "description": "Incluye gasas, vendas, alcohol, apósitos y cinta.", "price": "6800.00", "stock": 15, "is_available": True, "image": "products/botiquin_primeros_auxilios.jpg"},
                    {"name": "Vendas Elásticas 10cm x 2m", "description": "Para soporte muscular y vendajes.", "price": "1400.00", "stock": 30, "is_available": True, "image": "products/botiquin_primeros_auxilios.jpg"},
                    {"name": "Gasas Estériles (sobre x 10 un.)", "description": "Gasas no tejidas para curaciones.", "price": "1200.00", "stock": 50, "is_available": True, "image": "products/botiquin_primeros_auxilios.jpg"},
                    {"name": "Termómetro Digital Rápido", "description": "Lectura precisa en 60 segundos con alarma sonora.", "price": "4500.00", "stock": 20, "is_available": True, "image": "products/termometro_digital.jpg"},
                ],
            },
            {
                "username": "vendedor_farmacia_san_jorge",
                "email": "farmacia_san_jorge@foodrush.com",
                "name": "Farmacia San Jorge",
                "description": "Farmacia barrial con descuentos en perfumería, protectores solares y cuidado capilar.",
                "image": "stores/farmacia_san_jorge.jpg",
                "products": [
                    {"name": "Protector Solar FPS 50 (200ml)", "description": "Protección alta UVA/UVB resistente al agua.", "price": "14900.00", "stock": 18, "is_available": True, "image": "products/protector_solar.jpg"},
                    {"name": "Champú Reparación Profunda 400ml", "description": "Con keratina vegetal para cabello dañado.", "price": "4200.00", "stock": 25, "is_available": True, "image": "products/shampoo_crema.jpg"},
                    {"name": "Crema Corporal Hidratante 400ml", "description": "Nutrición intensa con manteca de karité.", "price": "5100.00", "stock": 20, "is_available": True, "image": "products/shampoo_crema.jpg"},
                    {"name": "Desodorante Antitranspirante Roll-On", "description": "Protección 48 horas sin alcohol.", "price": "2600.00", "stock": 35, "is_available": True, "image": "products/shampoo_crema.jpg"},
                ],
            },
            {
                "username": "vendedor_farmacia_pasteur",
                "email": "farmacia_pasteur@foodrush.com",
                "name": "Farmacia Pasteur",
                "description": "Especialistas en preparados magistrales, cuidado del bebé e higiene infantil segura.",
                "image": "stores/farmacia_pasteur.jpg",
                "products": [
                    {"name": "Pañales Talle G (x 36 un.)", "description": "Cintura elastizada y máxima absorción nocturna.", "price": "13500.00", "stock": 22, "is_available": True, "image": "products/panales_bebe.jpg"},
                    {"name": "Toallitas Húmedas para Bebé (x 50)", "description": "Sin fragancia, hipoalergénicas con manzanilla.", "price": "2900.00", "stock": 40, "is_available": True, "image": "products/panales_bebe.jpg"},
                    {"name": "Crema Protectora de Pasapaduras 100g", "description": "Con óxido de zinc y caléndula.", "price": "3800.00", "stock": 25, "is_available": True, "image": "products/panales_bebe.jpg"},
                    {"name": "Aspirina Protect 100mg (x 30)", "description": "Comprimidos recubiertos protectores.", "price": "2700.00", "stock": 30, "is_available": True, "image": "products/ibuprofeno_capsulas.jpg"},
                ],
            },
            {
                "username": "vendedor_farmacia_salud",
                "email": "farmacia_salud@foodrush.com",
                "name": "Farmacia Central Salud",
                "description": "Suplementos dietarios, vitaminas, proteínas y productos para deportistas y bienestar.",
                "image": "stores/farmacia_salud.jpg",
                "products": [
                    {"name": "Multivitamínico Complejo A-Z (x 30)", "description": "Minerales y vitaminas para reforzar el sistema inmune.", "price": "7900.00", "stock": 25, "is_available": True, "image": "products/vitaminas_suplemento.jpg"},
                    {"name": "Vitamina C 1000mg Efervescente (x 10)", "description": "Sabor naranja de rápida absorción.", "price": "3200.00", "stock": 30, "is_available": True, "image": "products/vitaminas_suplemento.jpg"},
                    {"name": "Colágeno Hidrolizado Polvo 250g", "description": "Para salud articular, piel y uñas.", "price": "9800.00", "stock": 15, "is_available": True, "image": "products/vitaminas_suplemento.jpg"},
                    {"name": "Barra Proteica de Chocolate", "description": "15g de proteína sin azúcar agregada.", "price": "2100.00", "stock": 40, "is_available": True, "image": "products/chocolate_barra.jpg"},
                ],
            },
            {
                "username": "vendedor_farmacia_belgrano",
                "email": "farmacia_belgrano@foodrush.com",
                "name": "Farmacia Belgrano Norte",
                "description": "Medicamentos esenciales, apósitos adhesivos, jarabes y descongestivos respiratorios.",
                "image": "stores/farmacia_belgrano.jpg",
                "products": [
                    {"name": "Jarabe para la Tos con Miel 120ml", "description": "Calma la irritación de garganta y la tos seca.", "price": "4100.00", "stock": 20, "is_available": True, "image": "products/jarabe_tos.jpg"},
                    {"name": "Caja de Curitas Adhesivas (x 20)", "description": "Tiras resistentes al agua con almohadilla antiadherente.", "price": "1500.00", "stock": 50, "is_available": True, "image": "products/apositos_curitas.jpg"},
                    {"name": "Spray Descongestivo Nasal", "description": "Alivio rápido de la congestión por resfrío.", "price": "3600.00", "stock": 25, "is_available": True, "image": "products/jarabe_tos.jpg"},
                    {"name": "Caramelos Antisépticos para Garganta", "description": "Sabor miel y limón con benzocaína.", "price": "1800.00", "stock": 35, "is_available": True, "image": "products/jarabe_tos.jpg"},
                ],
            },
            {
                "username": "vendedor_farmacia_azul",
                "email": "farmacia_azul@foodrush.com",
                "name": "Farmacia Azul & Perfumería",
                "description": "Perfumería selecta, cremas faciales, desmaquillantes e higiene dermo-cosmética.",
                "image": "stores/farmacia_azul.jpg",
                "products": [
                    {"name": "Agua Micelar Desmaquillante 400ml", "description": "Limpia, desmaquilla y tonifica sin enjuague.", "price": "5600.00", "stock": 20, "is_available": True, "image": "products/agua_micelar.jpg"},
                    {"name": "Sérum Ácido Hialurónico 30ml", "description": "Hidratación profunda efecto relleno.", "price": "11200.00", "stock": 14, "is_available": True, "image": "products/agua_micelar.jpg"},
                    {"name": "Jabón Líquido Neutro 300ml", "description": "Para pieles sensibles con pH balanceado.", "price": "2300.00", "stock": 30, "is_available": True, "image": "products/shampoo_crema.jpg"},
                    {"name": "Bálsamo Labial Reparador", "description": "Con manteca de cacao y filtro UV.", "price": "1600.00", "stock": 3, "is_available": True, "image": "products/shampoo_crema.jpg"},
                ],
            },
            {
                "username": "vendedor_farmacia_mutual",
                "email": "farmacia_mutual@foodrush.com",
                "name": "Farmacia La Mutual",
                "description": "Medicamentos para adultos mayores, tensiómetros, test y control de glucosa y presión.",
                "image": "stores/farmacia_mutual.jpg",
                "products": [
                    {"name": "Tensiómetro Digital de Brazo", "description": "Medición automática con memoria de 90 registros.", "price": "24500.00", "stock": 8, "is_available": True, "image": "products/tensiometro_digital.jpg"},
                    {"name": "Tiras Reactivas de Glucosa (x 25)", "description": "Compatibles con glucómetros estándar.", "price": "8900.00", "stock": 12, "is_available": True, "image": "products/tensiometro_digital.jpg"},
                    {"name": "Alcohol Etílico 70% 500ml", "description": "Antiséptico de uso hospitalario y domiciliario.", "price": "1800.00", "stock": 40, "is_available": True, "image": "products/alcohol_en_gel.jpg"},
                    {"name": "Almohada Cervical Ortopédica", "description": "Espuma viscoelástica para descanso del cuello.", "price": "16200.00", "stock": 0, "is_available": False, "image": "products/tensiometro_digital.jpg"},
                ],
            },
            {
                "username": "vendedor_farmacia_parque",
                "email": "farmacia_parque@foodrush.com",
                "name": "Farmacia del Parque (Cerrado por turno rotativo)",
                "description": "Farmacia comunitaria. Cerrada momentáneamente fuera de turno de guardia hasta mañana a las 08:00.",
                "image": "stores/farmacia_parque.jpg",
                "products": [
                    {"name": "Antigripal Día y Noche (x 10)", "description": "Fórmula combinada para aliviar síntomas del resfrío.", "price": "3500.00", "stock": 0, "is_available": False, "image": "products/ibuprofeno_capsulas.jpg"},
                    {"name": "Solución Fisiológica 500ml", "description": "Para nebulizaciones y lavados nasales.", "price": "2100.00", "stock": 0, "is_available": False, "image": "products/agua_mineral_1500ml.jpg"},
                ],
            },
        ]

        stores_count = 0
        products_count = 0

        for s_info in stores_data:
            user, _ = Usuario.objects.get_or_create(
                username=s_info["username"],
                defaults={
                    "email": s_info["email"],
                    "name": s_info["name"].split()[0],
                    "role": Usuario.RoleChoices.VENDEDOR,
                },
            )
            if not user.password:
                user.set_password("password123")
                user.save()

            store, created = Store.objects.get_or_create(
                owner=user,
                defaults={
                    "name": s_info["name"],
                    "description": s_info["description"],
                    "image": s_info["image"],
                },
            )
            if not created:
                store.name = s_info["name"]
                store.description = s_info["description"]
                store.image = s_info["image"]
                store.save()
            stores_count += 1

            for p_info in s_info["products"]:
                is_retail = any(
                    term in s_info["name"].lower() or term in s_info["description"].lower()
                    for term in ["farmacia", "kiosco", "super", "almacén", "almacen", "despensa", "market", "bebidas"]
                )
                track_stock = p_info.get("track_stock", is_retail)

                prod, p_created = Product.objects.get_or_create(
                    store=store,
                    name=p_info["name"],
                    defaults={
                        "description": p_info["description"],
                        "price": Decimal(p_info["price"]),
                        "stock": p_info["stock"],
                        "track_stock": track_stock,
                        "is_available": p_info["is_available"],
                        "image": p_info.get("image", ""),
                    },
                )
                prod.track_stock = track_stock
                if p_info.get("image"):
                    prod.image = p_info["image"]
                prod.save()
                products_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Catálogo extendido poblado exitosamente: {stores_count} tiendas procesadas, {products_count} productos vinculados."
            )
        )
