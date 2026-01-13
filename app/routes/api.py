from flask import Blueprint, request, jsonify
from app.services.virustotal import VirusTotalService

api_bp = Blueprint('api', __name__)


@api_bp.route('/scan', methods=['POST'])
def scan_file():
    """
    Upload and scan a file with VirusTotal.

    POST /api/scan
    Body: multipart/form-data with 'file' field

    Returns: {"stats": {"malicious": N, "suspicious": N, ...}}
    """
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['file']

    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    vt_service = VirusTotalService()
    result = vt_service.scan_file(file)

    if 'error' in result:
        return jsonify(result), 500

    return jsonify(result)
