import json
import time

from flask import Flask, render_template, request, Response, send_from_directory

from src.make_html import make_html


app = Flask(__name__)
app.config.from_object("config")

@app.route("/")
@app.route("/<language>/<style>/<style_name>")
def index(style="atom-one-dark", style_name = "Atom One Dark", language = "english"):
    if(language == "english"):
        return render_template("python-cheatsheet.html", style=style.replace("_", "/"), style_name = style_name,
                               language = language, language_name = "English")
    else:
        return render_template("python-cheatsheet-zh-cn.html", style=style.replace("_", "/"), style_name = style_name,
                                language = language, language_name = "中文")


@app.route("/chinese")
def zh_cn():
    return render_template("python-cheatsheet-zh-cn.html")


if __name__ == "__main__":
    app.run(port=5555)
