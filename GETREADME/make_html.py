import os
import time

from GETREADME import main


before = """
<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width,initial-scale=1,
        minimum-scale=1,maximum-scale=1,user-scalable=no" />
        <title>Python Cheatsheet Redefined</title>
        <link rel="alternative stylesheet" id="code-style" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/{{style}}.min.css">
        <link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.5.0/semantic.min.css">
        <script
        src="https://code.jquery.com/jquery-3.1.1.min.js"
        integrity="sha256-hVVnYaiADRTO2PzUGmuLJr8BLUSjGIZsDYGmIJLv2b8="
        crossorigin="anonymous"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.5.0/semantic.min.js"></script>
        <script src="https://unpkg.com/axios/dist/axios.min.js"></script>
        <script src="//cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
        <script>hljs.highlightAll()</script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/marked/4.0.2/marked.min.js"></script>
        <script src="{{ url_for('static', filename='main.js') }}"></script>
        <script>
            $(function(){
                $('#style').dropdown({
                    onChange: function(value, text, $selectedItem) {
                        window.location.href="/{{ language }}/" + value + "/" + text
                    }
                })
            });
            $(function(){
                $('#language').dropdown({
                    onChange: function(value, text, $selectedItem) {
                        window.location.href="/" + value + "/{{ style.replace('/', '_') }}/{{ style_name }}"
                    }
                })
            });
            function download() {
                {% if language=='english' %}
                location.href =  "https://raw.githubusercontent.com/pynickle/python-cheatsheet-redefined/master/README.pdf"
                {% else %}
                location.href =  "https://raw.githubusercontent.com/pynickle/python-cheatsheet-redefined/master/README-zh-cn.pdf"
                {% endif %}
            }
        </script>
    </head>
    <body>
        <br>
        <div class="ui container">
            <div class="ui selection dropdown" id="style">
                <input id="style-value" type="hidden" name="style">
                <div class="text">{{ style_name }}</div>
                <div class="menu">
                    <div class="item" data-value="atom-one-dark">Atom One Dark</div>
                    <div class="item" data-value="base16_edge-dark">Edge Dark</div>
                    <div class="item" data-value="base16_tomorrow-night">Tomorrow Night</div>
                    <div class="item" data-value="base16_material-darker">Material Darker</div>
                    <div class="item" data-value="github-dark-dimmed">Github Dark Dimmed</div>
                    <div class="item" data-value="androidstudio">Android Studio</div>
                    <div class="ui divider"></div>
                    <div class="item" data-value="atom-one-light">Atom One Light</div>
                    <div class="item" data-value="base16_material-lighter">Material Lighter</div>
                    <div class="item" data-value="base16_tomorrow">Tomorrow</div>
                    <div class="item" data-value="github">Github</div>
                </div>
            </div>
            &nbsp;
            <div class="ui selection dropdown" id="language">
                <input id="language-value" type="hidden" name="language">
                <div class="text">{{ language_name }}</div>
                <div class="menu">
                    <div class="item" data-value="english">English</div>
                    <div class="item" data-value="chinese">中文</div>
                </div>
            </div>
            &nbsp;
            <button class="ui button" onclick="download()">下载pdf</button>
        </div>
        <br>
        <div id="content" class="ui container">
"""

after = """
        </div>
    </body>
</html>
"""

main("2", "1")

os.popen("pandoc python-cheatsheet.md -t html -o python-cheatsheet.html")
time.sleep(1)
with open("python-cheatsheet.html", "r", encoding="utf-8") as f:
    data = f.read()
os.remove("python-cheatsheet.html")
os.remove("python-cheatsheet.md")

data = before + data + after

with open("python-cheatsheet.html", "w", encoding="utf-8") as f:
    f.write(data)

    
main("1", "1")

os.popen("pandoc python-cheatsheet.md -t html -o python-cheatsheet-zh-cn.html")
time.sleep(1)
with open("python-cheatsheet-zh-cn.html", "r", encoding="utf-8") as f:
    data = f.read()
os.remove("python-cheatsheet-zh-cn.html")
os.remove("python-cheatsheet.md")

data = before + data + after

with open("python-cheatsheet-zh-cn.html", "w", encoding="utf-8") as f:
    f.write(data)