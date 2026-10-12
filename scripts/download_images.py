import os
import sys
import shutil
import urllib.request
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'FoodRush.settings')
django.setup()

from core.models import Store, Product
from django.conf import settings

BASE_DIR = settings.BASE_DIR
MEDIA_ROOT = settings.MEDIA_ROOT
FRONTEND_PUBLIC = BASE_DIR / 'frontend' / 'public' / 'images'

MEDIA_STORES = MEDIA_ROOT / 'stores'
MEDIA_PRODUCTS = MEDIA_ROOT / 'products'
FRONTEND_STORES = FRONTEND_PUBLIC / 'stores'
FRONTEND_PRODUCTS = FRONTEND_PUBLIC / 'products'

for folder in [MEDIA_STORES, MEDIA_PRODUCTS, FRONTEND_STORES, FRONTEND_PRODUCTS]:
    os.makedirs(folder, exist_ok=True)

# Mapeo de tiendas con fotos representativas de alta calidad
STORE_IMAGES = {
    'Crazy Burgers': (
        'crazy_burgers.jpg',
        'https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&auto=format&fit=crop&q=80',
    ),
    'Pizza Planet': (
        'pizza_planet.jpg',
        'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80',
    ),
    'Café Central': (
        'cafe_central.jpg',
        'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&auto=format&fit=crop&q=80',
    ),
    'Mini Market Express': (
        'mini_market_express.jpg',
        'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=600&auto=format&fit=crop&q=80',
    ),
    'Heladería Gelato Real': (
        'heladeria_gelato_real.jpg',
        'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600&auto=format&fit=crop&q=80',
    ),
    'Farmacia San Lucas': (
        'farmacia_san_lucas.jpg',
        'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?w=600&auto=format&fit=crop&q=80',
    ),
}

# Mapeo de productos gastronómicos y de retail con imágenes específicas
PRODUCT_IMAGES = {
    # Crazy Burgers
    'Crazy Burger Simple': (
        'crazy_burger_simple.jpg',
        'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80',
    ),
    'Crazy Bacon Doble': (
        'crazy_bacon_doble.jpg',
        'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=500&auto=format&fit=crop&q=80',
    ),
    'Crazy Veggie Burger': (
        'crazy_veggie_burger.jpg',
        'https://images.unsplash.com/photo-1520072959219-c595dc870360?w=500&auto=format&fit=crop&q=80',
    ),
    'Papas Rústicas con Cheddar y Bacon': (
        'papas_rusticas_cheddar.jpg',
        'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500&auto=format&fit=crop&q=80',
    ),
    'Gaseosa Cola 500ml': (
        'gaseosa_cola_500ml.jpg',
        'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&auto=format&fit=crop&q=80',
    ),

    # Pizza Planet
    'Pizza Muzzarella Tradicional': (
        'pizza_muzzarella.jpg',
        'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500&auto=format&fit=crop&q=80',
    ),
    'Pizza Fugazzeta Rellena': (
        'pizza_fugazzeta.jpg',
        'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=500&auto=format&fit=crop&q=80',
    ),
    'Pizza Calabresa Especial': (
        'pizza_calabresa.jpg',
        'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500&auto=format&fit=crop&q=80',
    ),
    'Empanada de Carne Criolla': (
        'empanada_carne.jpg',
        'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=500&auto=format&fit=crop&q=80',
    ),
    'Cerveza Artesanal IPA 1L': (
        'cerveza_artesanal_ipa.jpg',
        'https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=500&auto=format&fit=crop&q=80',
    ),

    # Café Central
    'Café Latte Doble': (
        'cafe_latte_doble.jpg',
        'https://images.unsplash.com/photo-1534778101976-62847782c213?w=500&auto=format&fit=crop&q=80',
    ),
    'Croissant de Almendras': (
        'croissant_almendras.jpg',
        'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500&auto=format&fit=crop&q=80',
    ),
    'Cheesecake de Frutos Rojos': (
        'cheesecake_frutos_rojos.jpg',
        'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=500&auto=format&fit=crop&q=80',
    ),
    'Tostado Clásico de Jamón y Queso': (
        'tostado_clasico.jpg',
        'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500&auto=format&fit=crop&q=80',
    ),

    # Mini Market Express
    'Alfajor de Chocolate Relleno': (
        'alfajor_chocolate.jpg',
        'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500&auto=format&fit=crop&q=80',
    ),
    'Papas Fritas Clásicas 150g': (
        'papas_fritas_clasicas.jpg',
        'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500&auto=format&fit=crop&q=80',
    ),
    'Gaseosa Lima Limón 1.5L': (
        'gaseosa_lima_limon.jpg',
        'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&auto=format&fit=crop&q=80',
    ),
    'Galletitas Dulces con Chispas': (
        'galletitas_chispas.jpg',
        'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=500&auto=format&fit=crop&q=80',
    ),
    'Agua Mineral Sin Gas 1.5L': (
        'agua_mineral_1500ml.jpg',
        'https://images.unsplash.com/photo-1560023907-5f339617ea30?w=500&auto=format&fit=crop&q=80',
    ),

    # Heladería Gelato Real
    'Pote de Helado 1 Kg': (
        'pote_helado_1kg.jpg',
        'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=500&auto=format&fit=crop&q=80',
    ),
    'Pote de Helado 1/2 Kg': (
        'pote_helado_medio.jpg',
        'https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=500&auto=format&fit=crop&q=80',
    ),
    'Cucurucho Bañado Especial': (
        'cucurucho_especial.jpg',
        'https://images.unsplash.com/photo-1549395156-e0c1fe6fc7a5?w=500&auto=format&fit=crop&q=80',
    ),
    'Bombón Escocés Helado': (
        'bombon_escoces.jpg',
        'https://images.unsplash.com/photo-1582293041079-7814c2f12063?w=500&auto=format&fit=crop&q=80',
    ),
    'Paleta Artesanal Frutilla al Agua': (
        'paleta_artesanal_frutilla.jpg',
        'https://images.unsplash.com/photo-1505394033641-40c6ad1178d7?w=500&auto=format&fit=crop&q=80',
    ),

    # Farmacia San Lucas
    'Alcohol en Gel Sanitizante 250ml': (
        'alcohol_en_gel.jpg',
        'https://images.unsplash.com/photo-1584744982491-665216d95f8b?w=500&auto=format&fit=crop&q=80',
    ),
    'Ibuprofeno 400mg x 10 Cápsulas': (
        'ibuprofeno_capsulas.jpg',
        'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=80',
    ),
    'Protector Solar FPS 50 150ml': (
        'protector_solar.jpg',
        'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&auto=format&fit=crop&q=80',
    ),
    'Apósitos Adhesivos Curitas x 20': (
        'apositos_curitas.jpg',
        'https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=500&auto=format&fit=crop&q=80',
    ),
    'Cepillo Dental Cerda Suave': (
        'cepillo_dental.jpg',
        'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=500&auto=format&fit=crop&q=80',
    ),
}

def download_file(url, target_path, copy_path=None):
    if os.path.exists(target_path) and os.path.getsize(target_path) > 1000:
        if copy_path and not os.path.exists(copy_path):
            shutil.copy(target_path, copy_path)
        return True
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 FoodRush/1.0'})
        with urllib.request.urlopen(req, timeout=10) as response, open(target_path, 'wb') as out_file:
            data = response.read()
            out_file.write(data)
        if copy_path:
            shutil.copy(target_path, copy_path)
        return True
    except Exception as e:
        print(f"Error descargando {url}: {e}")
        return False

print("Descargando imágenes de Tiendas...")
for store in Store.objects.all():
    match = None
    for key in STORE_IMAGES:
        if key.lower() in store.name.lower():
            match = STORE_IMAGES[key]
            break
    if match:
        filename, url = match
        media_path = MEDIA_STORES / filename
        frontend_path = FRONTEND_STORES / filename
        if download_file(url, media_path, frontend_path):
            store.image = f'stores/{filename}'
            store.save(update_fields=['image'])
            print(f"  [OK] {store.name} -> stores/{filename}")

print("\nDescargando imágenes de Productos...")
for product in Product.objects.all():
    match = None
    for key in PRODUCT_IMAGES:
        if key.lower() in product.name.lower() or product.name.lower() in key.lower():
            match = PRODUCT_IMAGES[key]
            break
    if match:
        filename, url = match
        media_path = MEDIA_PRODUCTS / filename
        frontend_path = FRONTEND_PRODUCTS / filename
        if download_file(url, media_path, frontend_path):
            product.image = f'products/{filename}'
            product.save(update_fields=['image'])
            print(f"  [OK] {product.name} ({product.store.name}) -> products/{filename}")
    else:
        print(f"  - No match para producto: {product.name}")

print("\n¡Proceso de imágenes completado exitosamente!")
