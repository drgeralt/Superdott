from google import genai

from src.core.config import settings


def test_connection():
    try:
        client = genai.Client(api_key=settings.GEMINI_API_KEY)

        response = client.models.generate_content(
            model="gemini-2.0-flash", contents="Olá, responda apenas 'OK'."
        )

        print(f"Status Gemini: {response.text.strip()}")

    except Exception as e:
        print(f"Erro na conexão Gemini: {e}")


if __name__ == "__main__":
    test_connection()
