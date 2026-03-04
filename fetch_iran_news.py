import asyncio
from pyppeteer import launch
import json

async def fetch_iran_news():
    browser = await launch({
        'headless': True,
        'args': ['--no-sandbox', '--disable-setuid-sandbox']
    })
    
    page = await browser.newPage()
    
    try:
        # 访问BBC中文网站
        print("正在访问BBC中文网站...")
        await page.goto('https://www.bbc.com/zhongwen/simp', {
            'waitUntil': 'networkidle2',
            'timeout': 30000
        })
        
        # 获取页面内容
        content = await page.content()
        
        # 搜索伊朗相关内容
        print("正在搜索伊朗相关新闻...")
        
        # 尝试在页面中搜索伊朗
        await page.keyboard.type('伊朗')
        await asyncio.sleep(1)
        
        # 获取页面的所有文本
        text_content = await page.evaluate('''() => {
            return document.body.innerText;
        }''')
        
        # 查找包含"伊朗"的行
        lines = text_content.split('\n')
        iran_news = [line for line in lines if '伊朗' in line]
        
        print("\n=== BBC中文网站上的伊朗相关新闻 ===\n")
        if iran_news:
            for i, news in enumerate(iran_news[:20], 1):
                print(f"{i}. {news.strip()}")
        else:
            print("未在首页找到伊朗相关新闻标题")
        
        # 获取所有链接
        links = await page.evaluate('''() => {
            return Array.from(document.querySelectorAll('a')).map(a => ({
                text: a.innerText,
                href: a.href
            })).filter(item => item.text.includes('伊朗'));
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
        await browser.close()

# 运行
asyncio.run(fetch_iran_news())
