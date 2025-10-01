// 获取URL参数
function getURLParameter(name: string): string | null {
    return new URLSearchParams(window.location.search).get(name);
}

// 定义主题类型
type StyleType = 'atom-one-dark' | 'base16/edge-dark' | 'base16/tomorrow-night' |
                 'base16/material-darker' | 'github-dark-dimmed' | 'androidstudio' |
                 'atom-one-light' | 'base16/material-lighter' | 'base16/tomorrow' | 'github';

// 定义语言类型
type LanguageType = 'english' | 'chinese';

// 存储原始代码（带前缀）
const originalCodeCache = new Map<string, string>();

// 从代码中移除Python交互式前缀（保留前缀后的缩进，去除行首多余空格）
function removePythonPrefixes(code: string): string {
    // 分割代码为行
    const lines = code.split('\n');
    // 存储处理后的代码行
    const resultLines: string[] = [];
    
    // 处理每一行
    for (const line of lines) {
        // 检查是否是只有前缀的行（需要保留为空行）
        const trimmedLine = line.trim();
        if (trimmedLine === '>>>' || trimmedLine === '&gt;&gt;&gt;' || trimmedLine === '...') {
            resultLines.push(''); // 保留为空行
            continue;
        }
        
        // 检查是否包含前缀
        const hasPythonPrefix = line.startsWith('>>>') || line.startsWith('&gt;&gt;&gt;') || line.startsWith('...');
        
        // 输出行：前面不含>>>或者...的行
        if (!hasPythonPrefix) {
            continue; // 移除输出行
        }
        
        // 处理包含前缀的代码行
        let cleanedLine = line;
        
        // 不使用正则表达式处理前缀，保留前缀后的缩进
        if (line.startsWith('>>>') && !line.startsWith('&gt;&gt;&gt;')) {
            // 处理 >>> 前缀
            cleanedLine = line.substring(3);
        } else if (line.startsWith('&gt;&gt;&gt;')) {
            // 处理HTML转义的 &gt;&gt;&gt; 前缀
            cleanedLine = line.substring(10); // '&gt;&gt;&gt;'长度为10
        } else if (line.startsWith('...')) {
            // 处理 ... 前缀
            cleanedLine = line.substring(3);
        }
        
        // 去除行首可能存在的多余空格
        if (cleanedLine.startsWith(' ')) {
            cleanedLine = cleanedLine.substring(1);
        }
        
        // 只添加非空的代码行
        if (cleanedLine.trim() !== '') {
            resultLines.push(cleanedLine);
        }
    }
    
    return resultLines.join('\n');
}

// 为代码块添加复制按钮和处理前缀切换
function setupCodeBlocks(): void {
    const codeBlocks = document.querySelectorAll('pre code');
    
    codeBlocks.forEach((block, index) => {
        // 确保这是一个Python代码块
        if (block.textContent && (block.className.includes('python') || block.textContent.includes('>>>'))) {
            const blockId = `code-block-${index}`;
            block.id = blockId;
            
            // 存储原始代码（带前缀）
            const originalCode = block.textContent;
            originalCodeCache.set(blockId, originalCode);
            
            // 获取父元素pre
            const preElement = block.parentElement;
            if (preElement && preElement.tagName === 'PRE') {
                // 设置pre元素的相对定位，以便按钮可以绝对定位
                preElement.style.position = 'relative';
                
                // 创建复制代码按钮
                const copyButton = document.createElement('button');
                copyButton.className = 'button is-small mt-2 mr-2 is-white';

                const copyIcon = document.createElement('span');
                copyButton.appendChild(copyIcon);
                copyIcon.innerHTML = '<svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" p-id="2301" width="128" height="128"><path d="M672 832 224 832c-52.928 0-96-43.072-96-96L128 160c0-52.928 43.072-96 96-96l448 0c52.928 0 96 43.072 96 96l0 576C768 788.928 724.928 832 672 832zM224 128C206.368 128 192 142.368 192 160l0 576c0 17.664 14.368 32 32 32l448 0c17.664 0 32-14.336 32-32L704 160c0-17.632-14.336-32-32-32L224 128zM800 960 320 960c-17.664 0-32-14.304-32-32s14.336-32 32-32l480 0c17.664 0 32-14.336 32-32L832 256c0-17.664 14.304-32 32-32s32 14.336 32 32l0 608C896 916.928 852.928 960 800 960zM544 320 288 320c-17.664 0-32-14.336-32-32s14.336-32 32-32l256 0c17.696 0 32 14.336 32 32S561.696 320 544 320zM608 480 288.032 480c-17.664 0-32-14.336-32-32s14.336-32 32-32L608 416c17.696 0 32 14.336 32 32S625.696 480 608 480zM608 640 288 640c-17.664 0-32-14.304-32-32s14.336-32 32-32l320 0c17.696 0 32 14.304 32 32S625.696 640 608 640z" fill="#272636"></path></svg>';
                copyIcon.className = 'icon is-small';

                copyButton.title = 'Copy code';
                copyButton.style.position = 'absolute';
                copyButton.style.top = '17px';
                copyButton.style.right = '20px';
                copyButton.style.cursor = 'pointer';
                
                // 添加点击事件
                copyButton.addEventListener('click', function() {
                    // 获取当前代码块的内容并复制
                    const codeToCopy = block.textContent || '';
                    navigator.clipboard.writeText(codeToCopy).then(() => {
                        // 创建浮动提示框
                        const tooltip = document.createElement('div');
                        tooltip.textContent = 'copied';
                        tooltip.style.position = 'absolute';
                        tooltip.style.top = '60px';
                        tooltip.style.right = '30px'; // 复制按钮左侧
                        tooltip.style.padding = '5px 10px';
                        tooltip.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
                        tooltip.style.color = 'white';
                        tooltip.style.borderRadius = '4px';
                        tooltip.style.fontSize = '12px';
                        tooltip.style.zIndex = '1000';
                        tooltip.style.opacity = '0';
                        tooltip.style.transition = 'opacity 0.3s ease';
                        tooltip.style.pointerEvents = 'none';
                        tooltip.style.minWidth = '60px';
                        tooltip.style.textAlign = 'center';
                        tooltip.style.fontWeight = 'bold';
                        
                        // 添加到pre元素
                        preElement.appendChild(tooltip);
                        
                        // 触发重排后显示提示框
                        setTimeout(() => {
                            tooltip.style.opacity = '1';
                        }, 10);
                        
                        // 2秒后移除提示框
                        setTimeout(() => {
                            tooltip.style.opacity = '0';
                            setTimeout(() => {
                                if (tooltip.parentNode) {
                                    tooltip.parentNode.removeChild(tooltip);
                                }
                            }, 300);
                        }, 2000);
                    }).catch(err => {
                        console.error('Failed to copy text:', err);
                    });
                });

                // 创建处理前缀按钮
                const prefixButton = document.createElement('button');
                prefixButton.className = 'button is-small mt-2 mr-2 is-white';

                const prefixIcon = document.createElement('span');
                prefixButton.appendChild(prefixIcon);
                prefixIcon.innerHTML = '<svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="16" height="16"><path d="M256 938.666667c-12.8 0-21.333333-4.266667-29.866667-12.8l-128-128c-17.066667-17.066667-17.066667-42.666667 0-59.733334l640-640c17.066667-17.066667 42.666667-17.066667 59.733334 0l128 128c17.066667 17.066667 17.066667 42.666667 0 59.733334l-640 640c-8.533333 8.533333-17.066667 12.8-29.866667 12.8z m-68.266667-170.666667L256 836.266667 836.266667 256 768 187.733333 187.733333 768z" fill="#000000"></path><path d="M768 426.666667c-12.8 0-21.333333-4.266667-29.866667-12.8l-128-128c-17.066667-17.066667-17.066667-42.666667 0-59.733334s42.666667-17.066667 59.733334 0l128 128c17.066667 17.066667 17.066667 42.666667 0 59.733334-8.533333 8.533333-17.066667 12.8-29.866667 12.8zM384 341.333333c-25.6 0-42.666667-17.066667-42.666667-42.666666s-17.066667-42.666667-42.666666-42.666667-42.666667-17.066667-42.666667-42.666667 17.066667-42.666667 42.666667-42.666666 42.666667-17.066667 42.666666-42.666667 17.066667-42.666667 42.666667-42.666667 42.666667 17.066667 42.666667 42.666667 17.066667 42.666667 42.666666 42.666667 42.666667 17.066667 42.666667 42.666666-17.066667 42.666667-42.666667 42.666667-42.666667 17.066667-42.666666 42.666667-17.066667 42.666667-42.666667 42.666666zM810.666667 768c-25.6 0-42.666667-17.066667-42.666667-42.666667s-17.066667-42.666667-42.666667-42.666666-42.666667-17.066667-42.666666-42.666667 17.066667-42.666667 42.666666-42.666667 42.666667-17.066667 42.666667-42.666666 17.066667-42.666667 42.666667-42.666667 42.666667 17.066667 42.666666 42.666667 17.066667 42.666667 42.666667 42.666666 42.666667 17.066667 42.666667 42.666667-17.066667 42.666667-42.666667 42.666667-42.666667 17.066667-42.666667 42.666666-17.066667 42.666667-42.666666 42.666667z" fill="#000000"></path></svg>';
                prefixIcon.className = 'icon is-small';

                prefixButton.title = 'Remove prefix';
                prefixButton.style.position = 'absolute';
                prefixButton.style.top = '17px';
                prefixButton.style.right = '60px'; // 移到复制按钮左侧
                prefixButton.style.cursor = 'pointer';
                
                // 添加点击事件
                prefixButton.addEventListener('click', function() {
                    // 切换当前代码块的前缀显示
                    toggleCodePrefix(blockId);
                });
                
                // 添加按钮到pre元素
                preElement.appendChild(copyButton);
                preElement.appendChild(prefixButton);
            }
        }
    });
}

// 切换单个代码块的前缀显示
function toggleCodePrefix(blockId: string): void {
    const codeBlock = document.getElementById(blockId);
    if (codeBlock && originalCodeCache.has(blockId)) {
        const originalCode = originalCodeCache.get(blockId)!;
        const currentText = codeBlock.textContent || '';
        
        // 判断当前状态并切换（检查更多可能的前缀模式）
        if (currentText.startsWith(">>>") || currentText.startsWith("&gt;&gt;&gt;")) {
            codeBlock.textContent = removePythonPrefixes(originalCode);
        } else {
            codeBlock.textContent = originalCode;
        }

        // 确保元素类型正确并重新高亮代码
        if ((window as any).hljs && typeof (window as any).hljs.highlightElement === 'function' && codeBlock instanceof HTMLElement) {
            try {
                // 先移除已高亮标记，以便重新高亮
                delete codeBlock.dataset.highlighted;

                (window as any).hljs.highlightElement(codeBlock);
            } catch (error) {
                console.error('Error highlighting code:', error);
            }
        }
    }
}

// 动态加载HTML内容的函数
function loadContent(language: LanguageType): void {
    // 设置当前语言显示
    const languageTextElement = document.getElementById('language-text');
    if (languageTextElement) {
        languageTextElement.textContent = language === 'english' ? 'English' : '中文';
    }
    
    // 清空代码缓存
    originalCodeCache.clear();
    
    // 更新URL参数但不刷新页面
    const style: StyleType = (getURLParameter('hl_style') as StyleType) || 'atom-one-dark';
    const url = new URL(window.location.href);
    url.searchParams.set('lang', language);
    url.searchParams.set('hl_style', style);
    window.history.pushState({}, '', url.toString());
    
    // 确定要加载的HTML文件
    const htmlFile = language === 'english' ? 'assets/en-us.html' : 'assets/zh-cn.html';
    
    // 发送AJAX请求加载HTML内容
    fetch(htmlFile)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(html => {
            // 创建一个临时容器来解析HTML
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;
            
            // 提取主要内容
            const contentContainer = document.getElementById('content-container');
            if (contentContainer) {
                contentContainer.innerHTML = html;
            }
            
            // 设置代码块（添加按钮和处理前缀）
            setupCodeBlocks();
            
            // 高亮代码
            if ((window as any).hljs && typeof (window as any).hljs.highlightAll === 'function') {
                (window as any).hljs.highlightAll();
            }
        })
        .catch(error => {
            console.error('Error loading content:', error);
        });
}

// 暴露给全局的语言切换函数
(window as any).changeLanguage = function(language: LanguageType): void {
    loadContent(language);
};

// 等待DOM完全加载后执行代码
document.addEventListener('DOMContentLoaded', function() {
    // 初始化主题选择器
    const hlStyleParam: StyleType = (getURLParameter('hl_style') as StyleType) || 'atom-one-dark';
    const hlStyleNameMap: Record<StyleType, string> = {
        'atom-one-dark': 'Atom One Dark',
        'base16/edge-dark': 'Edge Dark',
        'base16/tomorrow-night': 'Tomorrow Night',
        'base16/material-darker': 'Material Darker',
        'github-dark-dimmed': 'Github Dark Dimmed',
        'androidstudio': 'Android Studio',
        'atom-one-light': 'Atom One Light',
        'base16/material-lighter': 'Material Lighter',
        'base16/tomorrow': 'Tomorrow',
        'github': 'Github'
    };

    // 设置当前主题
    const hlStyleName: string = hlStyleNameMap[hlStyleParam] || 'Atom One Dark';
    const hlStyleTextElement = document.getElementById('hl-style-text');
    if (hlStyleTextElement) {
        hlStyleTextElement.textContent = hlStyleName;
    }

    const hlStyleElement: HTMLLinkElement | null = document.getElementById('hl-style-sheet') as HTMLLinkElement;
    if (hlStyleElement) {
        hlStyleElement.href = `https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.11.1/build/styles/${hlStyleParam}.min.css`;
    }

    // 主题切换 - 实现Bulma下拉菜单功能
    const hlStyleDropdown = document.getElementById('hl-style');
    const hlStyleTrigger = hlStyleDropdown?.querySelector('.dropdown-trigger button');
    const hlStyleMenu = document.getElementById('style-dropdown-menu');

    if (hlStyleDropdown && hlStyleTrigger && hlStyleMenu) {
        // 为下拉菜单触发按钮添加点击事件
        hlStyleTrigger.addEventListener('click', function(this: HTMLElement, event: Event) {
            event.stopPropagation();
            hlStyleDropdown.classList.toggle('is-active');
        });

        // 点击其他地方关闭下拉菜单
        document.addEventListener('click', function() {
            if (hlStyleDropdown.classList.contains('is-active')) {
                hlStyleDropdown.classList.remove('is-active');
            }
        });

        // 为菜单项添加点击事件
        const hlStyleMenuItems = hlStyleMenu.querySelectorAll('.dropdown-item');
        hlStyleMenuItems.forEach(item => {
            item.addEventListener('click', function(this: HTMLElement, event: Event) {
                event.preventDefault();
                const value = this.getAttribute('data-value');
                const text = this.textContent || '';
                
                if (value && hlStyleTextElement) {
                    hlStyleTextElement.textContent = text.trim();
                    
                    // 更新主题样式
                    if (hlStyleElement) {
                        hlStyleElement.href = `https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.11.1/build/styles/${value}.min.css`;
                    }
                    
                    // 更新URL参数但不刷新页面
                    const language: LanguageType = (getURLParameter('lang') as LanguageType) || 'english';
                    const url = new URL(window.location.href);
                    url.searchParams.set('lang', language);
                    url.searchParams.set('hl_style', value);
                    window.history.pushState({}, '', url.toString());
                    
                    // 重新高亮代码
                    if ((window as any).hljs && typeof (window as any).hljs.highlightAll === 'function') {
                        (window as any).hljs.highlightAll();
                    }
                }
            });
        });
    }

    // 初始化语言选择器
    const languageParam: LanguageType = (getURLParameter('lang') as LanguageType) || 'english';
    
    // 语言切换 - 实现Bulma下拉菜单功能
    const languageDropdown = document.getElementById('language');
    const languageTrigger = languageDropdown?.querySelector('.dropdown-trigger button');
    const languageMenu = document.getElementById('language-dropdown-menu');

    if (languageDropdown && languageTrigger && languageMenu) {
        // 为下拉菜单触发按钮添加点击事件
        languageTrigger.addEventListener('click', function(this: HTMLElement, event: Event) {
            event.stopPropagation();
            languageDropdown.classList.toggle('is-active');
        });

        // 点击其他地方关闭下拉菜单
        document.addEventListener('click', function() {
            if (languageDropdown.classList.contains('is-active')) {
                languageDropdown.classList.remove('is-active');
            }
        });

        // 为菜单项添加点击事件
        const languageMenuItems = languageMenu.querySelectorAll('.dropdown-item');
        languageMenuItems.forEach(item => {
            item.addEventListener('click', function(this: HTMLElement, event: Event) {
                event.preventDefault();
                const value = this.getAttribute('data-value') as LanguageType;
                if (value) {
                    loadContent(value);
                }
            });
        });
    }

    // 初始加载内容
    loadContent(languageParam);
});

// 暴露全局函数供外部调用
(window as any).toggleCodePrefix = toggleCodePrefix;