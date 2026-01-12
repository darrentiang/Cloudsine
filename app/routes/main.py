from flask import Blueprint, render_template

# Blueprint for page routes (like Next.js pages/)
main_bp = Blueprint('main', __name__)


@main_bp.route('/')
def index():
    """Home page with file upload form."""
    return render_template('index.html')
