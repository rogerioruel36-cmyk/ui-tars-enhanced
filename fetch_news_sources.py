import asyncio
from playwright.async_api import async_playwright

async def fetch_news_sources():
    async with async_playwright() as p:
        browser = await p.chromium.connect_over_cdp("http://127.0.0.1:18888")
        page = await browser.new_page()
        
        searches = [
            ("商务新闻", "https://www.google.com/search?q=中国商务新闻网站排名"),
            ("金融新闻", "https://www.google.com/search?q=金融新闻媒体排名权威"),
            ("科技新闻", "https://www.google.com/search?q=科技新闻网站排名"),
            ("娱乐新闻", "https://www.google.com/search?q=娱乐新闻媒体排名")
        ]
        
        all_results = {}
        
        for category, url in searches:
            print(f"\n正在获取 {category}...")
            try:
                await page.goto(url, wait_until="networkidle", timeout=30000)
                
                # 提取文本内容
                text = await page.evaluate("() => document.body.innerText")
                all_results[category] = text[:5000]
                
                print(f"{category} 获取成功")
            except Exception as e:
                print(f"{category} 获取失败: {e}")
        
        await browser.close()
        return all_results

results = asyncio.run(fetch_news_sources())

# 保存结果
with open('/Users/federerx/Desktop/ui-tars/news_sources_content.txt', 'w', encoding='utf-8') as f:
    for category, content in results.items():
        f.write(f"\n{'='*50}\n{category}\n{'='*50}\n")
        f.write(content)
        f.write("\n")

print("\n结果已保存")
