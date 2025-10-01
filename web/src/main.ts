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

// 动态加载HTML内容的函数
function loadContent(language: LanguageType): void {
    // 设置当前语言显示
    const languageTextElement = document.getElementById('language-text');
    if (languageTextElement) {
        languageTextElement.textContent = language === 'english' ? 'English' : '中文';
    }
    
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

    // 下载PDF
    (window as any).download = function() {
        const language: LanguageType = (getURLParameter('lang') as LanguageType) || 'english';
        if (language === 'english') {
            window.open('https://raw.githubusercontent.com/pynickle/python-cheatsheet-redefined/master/README.pdf', '_blank');
        } else {
            window.open('https://raw.githubusercontent.com/pynickle/python-cheatsheet-redefined/master/README-zh-cn.pdf', '_blank');
        }
    };

    // 初始加载内容
    loadContent(languageParam);
});