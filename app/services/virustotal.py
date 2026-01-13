import time
import requests
from flask import current_app


class VirusTotalService:
    """Service for interacting with VirusTotal API."""

    BASE_URL = "https://www.virustotal.com/api/v3"

    def __init__(self):
        self.api_key = current_app.config['VIRUSTOTAL_API_KEY']
        self.headers = {"x-apikey": self.api_key}

    def scan_file(self, file_storage):
        """
        Upload and scan a file.

        Args:
            file_storage: Flask FileStorage object from request.files

        Returns:
            dict with 'stats' or 'error'
        """
        # Step 1: Upload file
        analysis_id = self._upload_file(file_storage)
        if not analysis_id:
            return {"error": "Failed to upload file"}

        # Step 2: Poll for results
        results = self._poll_results(analysis_id)
        if not results:
            return {"error": "Scan timed out"}

        return results

    def _upload_file(self, file_storage):
        """Upload file to VirusTotal, return analysis ID."""
        url = f"{self.BASE_URL}/files"

        try:
            response = requests.post(
                url,
                headers=self.headers,
                files={"file": (file_storage.filename, file_storage.read())}
            )

            if response.status_code == 200:
                return response.json()["data"]["id"]

            return None

        except requests.RequestException:
            return None

    def _poll_results(self, analysis_id, max_attempts=15, wait_seconds=20):
        """Poll until scan completes or timeout."""
        url = f"{self.BASE_URL}/analyses/{analysis_id}"

        for _ in range(max_attempts):
            try:
                response = requests.get(url, headers=self.headers)

                if response.status_code == 200:
                    data = response.json()["data"]["attributes"]

                    if data["status"] == "completed":
                        return {
                            "stats": {
                                "malicious": data["stats"].get("malicious", 0),
                                "suspicious": data["stats"].get("suspicious", 0),
                                "harmless": data["stats"].get("harmless", 0),
                                "undetected": data["stats"].get("undetected", 0)
                            }
                        }

                time.sleep(wait_seconds)

            except requests.RequestException:
                time.sleep(wait_seconds)

        return None
