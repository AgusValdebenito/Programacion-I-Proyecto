web: python manage.py migrate --noinput && python manage.py populate_extended_catalog && python manage.py upload_media_to_cloudinary && gunicorn FoodRush.wsgi:application
