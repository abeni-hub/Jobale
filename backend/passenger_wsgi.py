import os
import sys

# 1. Add application directory to Python path
PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))
if PROJECT_DIR not in sys.path:
    sys.path.insert(0, PROJECT_DIR)

# 2. Set Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# 3. Load Django WSGI application
from django.core.wsgi import get_wsgi_application

application = get_wsgi_application()
