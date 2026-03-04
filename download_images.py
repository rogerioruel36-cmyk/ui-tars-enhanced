import asyncio
from playwright.async_api import async_playwright
import os

async def download_images():
    async with async_playwright() as p:
        browser = await p.chromium.connect_over_cdp("http://127.0.0.1:18888")
        page = await browser.new_page()
        
        try:
            await page.goto("https://en.wikipedia.org/wiki/Ayatollah_Khamenei", timeout=60000, wait_until="domcontentloaded")
            await page.wait_for_timeout(2000)
            
            # 获取所有图片URL
            images = await page.evaluate("""
                () => {
                    const imgs = document.querySelectorAll('img[src*="upload.wikimedia"]');
                    return Array.from(imgs).map(img => ({
                        src: img.src,
                        alt: img.alt || 'Image'
                    })).slice(0, 5);
                }
            """)
            
            print(f"Found {len(images)} images")
            
            # 下载图片
            for i, img in enumerate(images):
                try:
                    # 获取完整的图片URL
                    full_url = img['src']
                    if not full_url.startswith('http'):
                        full_url = 'https:' + full_url
                    
                    print(f"Downloading image {i+1}: {full_url[:80]}")
                    
                    # 使用page.goto下载
                    response = await page.goto(full_url)
                    if response and response.ok:
                        buffer = await response.body()
                        filename = f"/Users/federerx/Desktop/ui-tars/image_{i+1}.jpg"
                        with open(filename, 'wb') as f:
                            f.write(buffer)
                        print(f"Saved: {filename}")
                except Exception as e:
                    print(f"Error downloading image {i+1}: {e}")
            
        except Exception as e:
            print(f"Error: {e}")
        finally:
            await browser.close()

asyncio.run(download_images())
