import json
import re
from pathlib import Path

import fitz


PDF_PATH = Path(r"c:\Users\Scam\Desktop\7887cf179befcdcab59c52d34b4b2308.pdf")
OUT_PATH = Path(r"c:\Users\Scam\Desktop\Сайт\economics-questions-data.js")


def clean_line(text: str) -> str:
    text = text.replace("\u00a0", " ").replace("\u00ad", "").replace("­", "")
    text = re.sub(r"\s+", " ", text).strip()
    return text


def clean_text(text: str) -> str:
    text = re.sub(r"([A-Za-zА-Яа-яЁё])-\s+([A-Za-zА-Яа-яЁё])", r"\1\2", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def parse_answer(raw: str) -> str:
    normalized = raw.replace(" ", "")
    # Example formats:
    # "Ответ:14."
    # "Ответ:34|43"
    normalized = normalized.replace("О", "О").replace("т", "т")
    if ":" in normalized:
        normalized = normalized.split(":", 1)[1]
    normalized = normalized.strip(".")
    variant = normalized.split("|", 1)[0]
    digits = re.findall(r"\d", variant)
    return "".join(sorted(set(digits)))


def main() -> None:
    doc = fitz.open(PDF_PATH)
    text = "\n".join(page.get_text("text") for page in doc)
    raw_lines = [line.strip() for line in text.splitlines() if line.strip()]

    lines = []
    for line in raw_lines:
        line = clean_line(line)
        if not line:
            continue
        if re.match(r"^\d+\s*/\s*\d+$", line):
            continue
        if "РЕШУ ЕГЭ" in line:
            continue
        if re.match(r"^--\s*\d+\s*of\s*\d+\s*--$", line):
            continue
        lines.append(line)

    question_start_re = re.compile(r"^(\d+)\.\s*Тип\s*5\s*№\s*\d+$")
    option_re = re.compile(r"^(\d+)[\.\)]\s+(.*)$")
    answer_re = re.compile(r"^О\s*т\s*в\s*е\s*т\s*:\s*(.+)$", re.IGNORECASE)

    starts = [i for i, line in enumerate(lines) if question_start_re.match(line)]
    questions = []

    for idx, start_idx in enumerate(starts):
        end_idx = starts[idx + 1] if idx + 1 < len(starts) else len(lines)
        chunk = lines[start_idx:end_idx]
        qid = int(question_start_re.match(chunk[0]).group(1))

        i = 1
        question_parts = []
        while i < len(chunk) and not re.match(r"^1[\.\)]\s+", chunk[i]):
            question_parts.append(chunk[i])
            i += 1

        options = []
        current_option = None
        explanation_lines = []
        answer_value = ""
        in_explanation = False

        while i < len(chunk):
            line = chunk[i]
            answer_match = answer_re.match(line)
            if answer_match:
                if not answer_value:
                    answer_value = parse_answer(answer_match.group(1))
                i += 1
                continue

            if line.startswith("Пояснение."):
                in_explanation = True
                explanation_lines.append(line[len("Пояснение.") :].strip())
                if current_option is not None:
                    current_option["text"] = clean_text(current_option["text"])
                    options.append(current_option)
                    current_option = None
                i += 1
                continue

            if in_explanation:
                explanation_lines.append(line)
                i += 1
                continue

            option_match = option_re.match(line)
            if option_match:
                if current_option is not None:
                    current_option["text"] = clean_text(current_option["text"])
                    options.append(current_option)
                current_option = {
                    "key": option_match.group(1),
                    "text": option_match.group(2).strip(),
                }
            elif current_option is not None:
                current_option["text"] = f"{current_option['text']} {line}".strip()
            i += 1

        if current_option is not None:
            current_option["text"] = clean_text(current_option["text"])
            options.append(current_option)

        question_text = clean_text(" ".join(question_parts))
        explanation = clean_text(" ".join(explanation_lines))
        questions.append(
            {
                "id": qid,
                "question": question_text,
                "options": options,
                "correct": answer_value,
                "explanation": explanation,
            }
        )

    output = "export const ECONOMICS_QUESTIONS = " + json.dumps(questions, ensure_ascii=False, indent=2) + ";\n"
    OUT_PATH.write_text(output, encoding="utf-8")
    print(f"Written {len(questions)} questions to {OUT_PATH}")


if __name__ == "__main__":
    main()
