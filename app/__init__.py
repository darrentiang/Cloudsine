from flask import Flask
from config import Config


def create_app():
    """
    Application factory - creates and configures the Flask app.

    This pattern allows us to create multiple instances of the app
    (useful for testing) and keeps configuration flexible.
    """
    app = Flask(__name__)

    # Load configuration
    app.config.from_object(Config)

    # Register blueprints (routes)
    from app.routes.main import main_bp
    from app.routes.api import api_bp

    app.register_blueprint(main_bp)
    app.register_blueprint(api_bp, url_prefix='/api')

    return app
