import re

with open("README.md", "r", encoding="utf-8") as f:
    text = f.read()
    content = re.search("## Contents(.*?)##", text, flags = re.M|re.S).group()
    libraries = re.findall("\[``(.*?)``\]", content)
    for library in libraries:
        detail = re.search(f"## {library}", text)
        if not detail:
            print(f"{library} has no details")
    details = re.findall("\n## ([^#]*?)\n", text)
    details.remove("Contents")
    for detail in details:
        library = re.search(f"\[``{detail}``\]", content)
        if not library:
            print(f"{detail} has no content")

print("scan finished!")