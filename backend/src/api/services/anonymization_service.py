import re

class AnonymizationService:
    @staticmethod
    def anonymize(text: str, student_full_name: str, parent_full_name: str = None) -> str:
        """
        Substitui nomes reais (compostos e primeiros nomes) por pseudônimos.
        """
        if not text:
            return text

        names_to_anonymize = []
        
        if student_full_name:
            names_to_anonymize.append((student_full_name.strip(), "[ALUNO]"))
            first_name = student_full_name.split()[0].strip()
            if first_name != student_full_name.strip():
                names_to_anonymize.append((first_name, "[ALUNO]"))

        if parent_full_name:
            names_to_anonymize.append((parent_full_name.strip(), "[RESPONSÁVEL]"))
            first_name = parent_full_name.split()[0].strip()
            if first_name != parent_full_name.strip():
                names_to_anonymize.append((first_name, "[RESPONSÁVEL]"))

        # Ordenar os nomes por tamanho decrescente para garantir que "João Silva"
        # seja substituído antes de "João", evitando substituição parcial errada.
        names_to_anonymize.sort(key=lambda x: len(x[0]), reverse=True)

        for name, tag in names_to_anonymize:
            if not name:
                continue
            # Regex com boundary (\b) e ignorando case para substituir o nome
            # Nota: \b não funciona bem com acentos se o locale não estiver certo.
            # Usaremos uma regex mais robusta:
            pattern = re.compile(re.escape(name), re.IGNORECASE)
            text = pattern.sub(tag, text)

        return text

    @staticmethod
    def deanonymize(text: str, student_first_name: str, parent_first_name: str = None) -> str:
        """
        Reverte a tag [ALUNO] para o nome real.
        """
        if not text:
            return text

        if student_first_name:
            text = text.replace("[ALUNO]", student_first_name)
        
        if parent_first_name:
            text = text.replace("[RESPONSÁVEL]", parent_first_name)
            
        return text
