from flask import Blueprint, request, jsonify, current_app

# Blueprint for API routes (like Next.js pages/api/)
api_bp = Blueprint('api', __name__)


@api_bp.route('/scan', methods=['POST'])
def scan_file():
    """
    API endpoint to upload and scan a file.

    POST /api/scan
    Body: multipart/form-data with 'file' field
    """
    # Check if file was uploaded
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['file']

    # Check if file has a name
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    # TODO: Add VirusTotal scanning in Step 2.3
    # TODO: Add Gemini explanation in Step 2.4

    # Placeholder response
    return jsonify({
        'success': True,
        'message': 'File received (scanning not yet implemented)',
        'filename': file.filename
    })


@api_bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({'status': 'healthy'})
