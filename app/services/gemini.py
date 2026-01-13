import google.generativeai as genai
from flask import current_app


class GeminiService:
    """Service for generating AI explanations of scan results."""

    def __init__(self):
        genai.configure(api_key=current_app.config['GEMINI_API_KEY'])
        self.model = genai.GenerativeModel('gemini-pro')

    def explain_results(self, stats):
        """
        Generate a layman-friendly explanation of scan results.

        Args:
            stats: dict with malicious, suspicious, harmless, undetected counts

        Returns:
            str: Plain English explanation
        """
        malicious = stats.get('malicious', 0)
        suspicious = stats.get('suspicious', 0)
        harmless = stats.get('harmless', 0)
        undetected = stats.get('undetected', 0)
        total = malicious + suspicious + harmless + undetected

        prompt = f"""You are a cybersecurity assistant explaining file scan results to a non-technical user.

Scan results from {total} antivirus engines:
- {malicious} engines flagged this file as malicious
- {suspicious} engines found it suspicious
- {harmless} engines found it safe
- {undetected} engines could not determine

Write a 2-3 sentence explanation for a regular user. Be clear and direct.
If malicious > 0, warn them not to open the file.
If clean, reassure them briefly.
No technical jargon. No markdown formatting."""

        try:
            response = self.model.generate_content(prompt)
            return response.text.strip()
        except Exception:
            return self._fallback_explanation(malicious, total)

    def _fallback_explanation(self, malicious, total):
        """Fallback if Gemini fails."""
        if malicious > 0:
            return f"Warning: {malicious} out of {total} security scanners flagged this file as potentially dangerous. Do not open this file."
        return f"This file appears to be safe. {total} security scanners found no threats."
