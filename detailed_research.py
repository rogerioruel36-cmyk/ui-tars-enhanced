import asyncio
from playwright.async_api import async_playwright

async def detailed_research():
    async with async_playwright() as p:
        browser = await p.chromium.connect_over_cdp("http://127.0.0.1:18888")
        page = await browser.new_page()
        
        # 更详细的搜索
        detailed_searches = [
            ("商务新闻详细", "https://www.hurun.net/zh-cn/info/detail"),  # 胡润百富榜单
            ("金融新闻详细", "https://zhuanlan.zhihu.com/p/全球排名前十的财经媒体"),
            ("科技新闻详细", "https://www.techcrunch.com"),
            ("娱乐新闻详细", "https://ent.163.com")
        ]
        
        results = {}
        
        for category, url in detailed_searches:
            print(f"\n正在获取 {category}...")
            try:
                await page.goto(url, wait_until="networkidle", timeout=30000)
                text = await page.evaluate("() => document.body.innerText")
                results[category] = text[:8000]
                print(f"{category} 获取成功")
            except Exception as e:
                print(f"{category} 获取失败: {e}")
        
        await browser.close()
        return results

results = asyncio.run(detailed_research())

# 保存详细结果
with open('/Users/federerx/Desktop/ui-tars/detailed_research.txt', 'w', encoding='utf-8') as f:
    for category, content in results.items():
        f.write(f"\n{'='*60}\n{category}\n{'='*60}\n")
        f.write(content)
        f.write("\n")

print("\n详细研究结果已保存")
