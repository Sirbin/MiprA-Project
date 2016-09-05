cd ..
Echo Eseguo Server MiprA
start python manage.py runserver 0.0.0.0:8000

IF EXIST celerybeat.pid (
    Echo Elimino celerybeat.pid
    Del celerybeat.pid
)
timeout 5
Echo Eseguo Beat
start celery -A MiprA beat -l info

timeout 5
Echo Eseguo Celery
start celery -A MiprA worker -l info