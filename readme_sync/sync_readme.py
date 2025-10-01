replace_contents = [
    ('Text Processing', '文本处理'),
    ('Binary Data', '二进制数据'),
    ('Data Type', '数据类型'),
    ('Mathematical Modules', '数学模块'),
    ('Functional Programming', '函数式编程'),
    ('Directory Access', '目录访问'),
    ('Data Persistence', '数据持久化'),
    ('Data Compression', '数据压缩'),
    ('File Formats', '文件格式'),
    ('Cryptographic Services', '加密服务'),
    ('Operating System', '操作系统'),
    ('Networking Communication', '网络通信'),
    ('Internet Data', '互联网数据'),
    ('Structured Markup', '结构化标记'),
    ('Internet Protocols', '互联网协议'),
    ('Multimedia Services', '多媒体服务'),
    ('Program Frameworks', '程序框架'),
    ('Graphical Interfaces', '图形化用户界面'),
    ('Development Tools', '开发工具'),
    ('Debugging Profiling', '调试和分析'),
    ('Software Packaging', '软件打包与分发'),
    ('Runtime Services', '运行时服务'),
    ('Importing Modules', '导入模块'),
    ('Language Services', 'Python 语言服务'),
    ('Bonus Scene', '彩蛋')
]

if __name__ == "__main__":
    with open("../README.md", "r", encoding="utf-8") as f:
        text = f.read()

    with open("README_S.md", "r", encoding="utf-8") as en_us_s:
        readme_s = en_us_s.read()
    with open("README_zh_cn_S.md", "r", encoding="utf-8") as zh_cn_s:
        readme_zh_cn_s = zh_cn_s.read()

    text = text.replace(readme_s, readme_zh_cn_s)
    for replace_content in replace_contents:
        text = text.replace(replace_content[0], replace_content[1], 1)

    with open("../README-zh-cn.md", "w", encoding="utf-8") as res:
        res.write(text)
