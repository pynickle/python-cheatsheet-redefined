import doctest
import re

NOTEST = ["random.random", "random.randint", "random.randrange",
          "random.uniform", "codecs.getdecoder", "codecs.getencoder",
          "time.ctime", "time.perf_counter", "time.strftime",
          "time.localtime", "os.getcwd", "os.name", "secrets.choice",
          "date.today", "date.isocalendar", "calendar.month",
          "shutil.rmtree", "secrets.token_hex", "logger.info",
          "logger.error", "logger.critical", "logger.warning",
          "logger.log", "getpass.getpass", "getpass.getuser",
          "secrets.token_bytes", "platform.platform", "platform.python_compiler",
          "platform.python_version", "timeit.timeit", "ensurepip.version",
          "ensurepip.bootstrap", "sys.implementation", "sys.version",
          "sys.exit", "atexit.register", "exit",
          "ast.literal_eval", "dis.show_code", "runpy.run_path",
          "dis.code_info", "linecache.getline", "inspect.getmembers",
          "doctest.testfile", "runpy.run_module"
          ]
NOTEST_2 = ["del c", "list(p.glob('**/*.py'))", "name", "c = pickle.dumps(a)",
            "password", "a.timeit(number = 1000)", "foo()",
            'cmd("python argparse_example.py --help")'
            ]


def main(file_name):
    status = None
    notest_status = False
    code = ""
    with open(file_name, "r", encoding="utf-8") as f:
        r = f.readlines()
        for i in r:
            if not status:
                if i.strip().startswith("```python"):
                    status = "code"
                    continue
            elif status == "notest":
                if i.startswith(">>>"):
                    status = "code"
                    notest_status = False
                else:
                    continue
            if status == "code":
                for item in NOTEST:
                    if re.search(item, i):
                        status = "notest"
                        notest_status = True
                        break
                if notest_status == False:
                    for item in NOTEST_2:
                        if ">>> " + item == i.strip():
                            status = "notest"
                            break
                    else:
                        if i.strip().startswith("```"):
                            status = None
                            continue
                        else:
                            if i.strip():
                                code += i
                            else:
                                code += "<BLANKLINE>\n"
                else:
                    continue
    first = """>>> try:
...     1/0
... except Exception:
...     print(sys.exc_info())   # traceback.print_exc is a beautful version of sys.exc_info()
...
(<class 'ZeroDivisionError'>, ZeroDivisionError('division by zero'), <traceback object at 0x000002D8BF38A248>)"""
    second = """>>> try:
...     1/0
... except Exception:
...     traceback.print_exc()
...
Traceback (most recent call last):
  File "<stdin>", line 2, in <module>
ZeroDivisionError: division by zero"""
    code = code.replace(first, "").replace(second, "")
    return code


if __name__ == "__main__":
    code = main("../README.md")
    doctest.run_docstring_examples(code, None)