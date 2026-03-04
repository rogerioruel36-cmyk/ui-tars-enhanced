from playwright.sync_api import sync_playwright
import json
import time

def fetch_detailed_iran_articles():
    articles_to_fetch = [
        {
            'title': '分析：伊朗政权架构仍在运作，未来几天将显示它是否能够撑下去',
            'url': 'https://www.bbc.com/zhongwen/articles/c75ev5dvqg5o/simp'
        },
        {
            'title': '为何美国以色列此刻出手？伊朗进入"生存模式"，结局仍充满变数',
            'url': 'https://www.bbc.com/zhongwen/articles/cy57glv45lgo/simp'
        },
        {
            'title': '美以联手攻击伊朗致哈梅内伊丧生以及伊朗的报复性打击——我们目前知道什么？',
            'url': 'https://www.bbc.com/zhongwen/articles/c87549gz8vwo/simp'
        },
        {
            'title': '伊朗：哈梅内伊的铁腕统治结束',
            'url': 'https://www.bbc.com/zhongwen/articles/c1e940735ppo/simp'
        },
        {
            'title': '"人民越来越穷"：伊朗经济困境如何改变民众生活',
            'url': 'https://www.bbc.com/zhongwen/articles/cg5n1de4v5yo/simp'
        }
    ]
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        detailed_articles = []
        
        for article in articles_to_fetch:
            try:
                print(f"正在获取: {article['title']}")
                page.goto(article['url'], timeout=30000)
                time.sleep(1)
                
                # 提取文章内容
                article_content = page.evaluate('''() => {
                    // 获取文章标题
                    const title = document.querySelector('h1')?.innerText || '';
                    
                    // 获取文章摘要
                    const summary = document.querySelector('[data-testid="internal-link"]')?.innerText || 
                                   document.querySelector('p')?.innerText || '';
                    
                    // 获取文章主体内容
                    const mainContent = document.querySelector('article')?.innerText || 
                                       document.querySelector('main')?.innerText || 
                                       document.body.innerText;
                    
                    return {
                        title: title,
                        summary: summary,
                        content: mainContent.substring(0, 2000)  // 获取前2000个字符
                    };
                }''')
                
                detailed_articles.append({
                    'url': article['url'],
                    'title': article['title'],
                    'content': article_content
                })
                
                print(f"✓ 成功获取")
                
            except Exception as e:
                print(f"✗ 获取失败: {e}")
        
        browser.close()
        
        # 保存详细内容
        with open('/Users/federerx/Desktop/ui-tars/iran_articles_detailed.json', 'w', encoding='utf-8') as f:
            json.dump(detailed_articles, f, ensure_ascii=False, indent=2)
        
        print(f"\n已获取 {len(detailed_articles)} 篇文章的详细内容")
        print("结果已保存到 iran_articles_detailed.json")

if __name__ == '__main__':
    fetch_detailed_iran_articles()
