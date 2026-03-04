from playwright.sync_api import sync_playwright
import json
import time

def fetch_iran_news():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        try:
            print("正在访问BBC中文网站...")
            page.goto('https://www.bbc.com/zhongwen/simp', timeout=30000)
            
            # 等待页面加载
            time.sleep(2)
            
            # 获取页面内容
            content = page.content()
            
            # 提取所有文本
            text_content = page.evaluate('''() => {
                return document.body.innerText;
            }''')
            
            # 查找包含"伊朗"的行
            lines = text_content.split('\n')
            iran_news = [line.strip() for line in lines if '伊朗' in line and line.strip()]
            
            print("\n=== BBC中文网站上的伊朗相关新闻 ===\n")
            if iran_news:
                for i, news in enumerate(iran_news[:20], 1):
                    print(f"{i}. {news}")
            else:
                print("未在首页找到伊朗相关新闻标题")
            
            # 获取所有链接
            links = page.evaluate('''() => {
                return Array.from(document.querySelectorAll('a')).map(a => ({
                    text: a.innerText,
                    href: a.href
                })).filter(item => item.text && item.text.includes('伊朗'));
            }''')
            
            print("\n=== 伊朗相关链接 ===\n")
            if links:
                for i, link in enumerate(links[:10], 1):
                    print(f"{i}. {link['text']}")
                    print(f"   链接: {link['href']}\n")
            else:
                print("未找到伊朗相关链接")
            
            # 保存结果到文件
            results = {
                'iran_news_titles': iran_news[:20],
                'iran_related_links': links[:10]
            }
            
            with open('/Users/federerx/Desktop/ui-tars/iran_news.json', 'w', encoding='utf-8') as f:
                json.dump(results, f, ensure_ascii=False, indent=2)
            
            print("\n结果已保存到 iran_news.json")
            
        except Exception as e:
            print(f"错误: {e}")
        finally:
            browser.close()

if __name__ == '__main__':
    fetch_iran_news()
