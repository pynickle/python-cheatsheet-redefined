from sys import exit
import time
import re
import codecs
import requests
from typing import List
from urllib.parse import urljoin


# Constants
BASE_URL = "https://raw.githubusercontent.com/pynickle/python-cheatsheet-redefined/master/"
ENGLISH_FILE = "README.md"
CHINESE_FILE = "README-zh-cn.md"
OUTPUT_FILE = "python-cheatsheet.md"
ALLOWED_CHOICES = ["1", "2"]
CODE_BLOCK_LANGUAGE = "python"


def fetch_markdown_file(choice: str) -> str:
    """
    Fetch the Markdown file from GitHub based on language choice.

    Args:
        choice (str): "1" for Chinese, "2" for English.

    Returns:
        str: The raw Markdown content.

    Raises:
        requests.RequestException: If the request fails.
    """
    if choice == "1":
        file_url = urljoin(BASE_URL, CHINESE_FILE)
    elif choice == "2":
        file_url = urljoin(BASE_URL, ENGLISH_FILE)
    else:
        raise ValueError("Invalid language choice.")

    print("Requesting...")
    response = requests.get(file_url, timeout=10)
    response.raise_for_status()
    return response.text


def save_to_file(content: str, filename: str) -> None:
    """Save the given content to the specified file."""
    with codecs.open(filename, "w", encoding="utf-8") as file:
        file.write(content)
    print("Saving...")


def extract_code_blocks(content: str) -> List[str]:
    """
    Extract all code blocks from the Markdown content.

    Args:
        content (str): The full Markdown content.

    Returns:
        List[str]: List of extracted code blocks (inner content only).
    """
    code_blocks = []
    in_code_block = False
    current_code = ""

    lines = content.splitlines(keepends=True)
    for line in lines:
        stripped_line = line.strip()
        if stripped_line.startswith("```") and not in_code_block:
            in_code_block = True
            current_code = ""
            continue
        elif stripped_line.startswith("```") and in_code_block:
            in_code_block = False
            code_blocks.append(current_code)
            current_code = ""
            continue
        elif in_code_block:
            current_code += line

    return code_blocks


def remove_prefixes(code_block: str) -> str:
    """
    Remove interactive Python prompt prefixes (>>> and ...) from the code block,
    and skip non-prompt lines (e.g., outputs).

    Args:
        code_block (str): The raw code block.

    Returns:
        str: The cleaned code without prefixes and outputs.
    """
    if not code_block.strip():
        return code_block

    lines = code_block.splitlines(keepends=True)
    cleaned_lines = []

    for line in lines:
        if line.startswith(">>> "):
            cleaned_line = line[4:]
            cleaned_lines.append(cleaned_line)
        elif line.startswith("... "):
            cleaned_line = line[4:]
            cleaned_lines.append(cleaned_line)
        elif line.strip() in ("...", ">>>"):
            cleaned_lines.append("\n")

        # Skip other lines (outputs, etc.)

    return "".join(cleaned_lines)


def replace_code_blocks(content: str, cleaned_blocks: List[str]) -> str:
    """
    Replace original code blocks in content with cleaned versions, adding language specifier.

    Args:
        content (str): The original Markdown content.
        cleaned_blocks (List[str]): List of cleaned code blocks.

    Returns:
        str: The updated content with replaced code blocks.
    """
    if not cleaned_blocks:
        return content

    lines = content.splitlines(keepends=True)
    updated_lines = []
    block_index = 0
    in_code_block = False
    block_start_index = -1

    for i, line in enumerate(lines):
        stripped_line = line.strip()
        if stripped_line.startswith("```") and not in_code_block:
            in_code_block = True
            block_start_index = len(updated_lines)
            updated_lines.append(line)  # Temporarily append opening ```
            continue
        elif stripped_line.startswith("```") and in_code_block:
            in_code_block = False
            if block_index < len(cleaned_blocks):
                cleaned_block = cleaned_blocks[block_index]
                # Replace from the opening line to here with full new block
                replacement = f"```{CODE_BLOCK_LANGUAGE}\n{cleaned_block}```\n"
                # Remove temporary lines from block_start_index to current
                del updated_lines[block_start_index:]
                updated_lines.append(replacement)
                block_index += 1
            else:
                # If no matching cleaned block, keep original closing
                updated_lines.append(line)
            continue
        elif in_code_block:
            # Skip inner lines; they'll be replaced
            continue
        else:
            updated_lines.append(line)

    result = "".join(updated_lines)
    # Normalize line endings
    result = re.sub(r"\r\n", "\n", result)
    return result


def get_user_choice(prompt: str, valid_choices: List[str]) -> str:
    """
    Prompt user for input and validate it.

    Args:
        prompt (str): The input prompt.
        valid_choices (List[str]): List of allowed choices.

    Returns:
        str: The validated user choice.
    """
    while True:
        choice = input(prompt).strip()
        if choice in valid_choices:
            return choice
        print("Invalid Choice!")


def main(language_choice: str, remove_prefix_choice: str) -> None:
    """Main function to orchestrate the download and processing."""
    start_time = time.time()

    # Fetch and save the file
    markdown_content = fetch_markdown_file(language_choice)
    save_to_file(markdown_content, OUTPUT_FILE)

    # Optionally process code blocks
    if remove_prefix_choice == "2":
        print("Removing prefixes...")
        code_blocks = extract_code_blocks(markdown_content)
        cleaned_blocks = [remove_prefixes(block) for block in code_blocks]
        processed_content = replace_code_blocks(markdown_content, cleaned_blocks)
        save_to_file(processed_content, OUTPUT_FILE)

    elapsed_time = time.time() - start_time
    print(f"Completed in {elapsed_time:.2f} seconds")


if __name__ == "__main__":
    language_prompt = "Chinese(1) or English(2): "
    prefix_prompt = "With command line code prefix(1) or not(2): "

    language_choice = get_user_choice(language_prompt, ALLOWED_CHOICES)
    prefix_choice = get_user_choice(prefix_prompt, ALLOWED_CHOICES)

    main(language_choice, prefix_choice)