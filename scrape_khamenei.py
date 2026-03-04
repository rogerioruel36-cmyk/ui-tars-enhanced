import asyncio
from playwright.async_api import async_playwright

async def scrape_khamenei_info():
    async with async_playwright() as p:
        browser = await p.chromium.connect_over_cdp("http://127.0.0.1:18888")
        page = await browser.new_page()
        
        try:
            # 访问维基百科，使用更长的超时
            await page.goto("https://en.wikipedia.org/wiki/Ayatollah_Khamenei", timeout=60000, wait_until="domcontentloaded")
            
            # 等待一下让页面稳定
            await page.wait_for_timeout(2000)
            
            # 提取主要文本内容
            text_content = await page.evaluate("""
                () => {
                    const paragraphs = document.querySelectorAll('p');
                    let text = '';
                    paragraphs.forEach(p => {
                        text += p.innerText + '\\n\\n';
                    });
                    return text;
                }
            """)
            
            with open("/Users/federerx/Desktop/ui-tars/khamenei_content.txt", "w", encoding="utf-8") as f:
                f.write(text_content)
            
            print("Content saved successfully")
            
        except Exception as e:
            print(f"Error: {e}")
        finally:
            await browser.close()

asyncio.run(scrape_khamenei_info())
