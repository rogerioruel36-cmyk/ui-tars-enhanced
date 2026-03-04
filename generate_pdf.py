import asyncio
from playwright.async_api import async_playwright

async def generate_pdf():
    async with async_playwright() as p:
        browser = await p.chromium.connect_over_cdp("http://127.0.0.1:18888")
        page = await browser.new_page()
        
        # 加载本地 HTML 文件
        html_path = "/Users/federerx/Desktop/ui-tars/visionox_vip_report.html"
        await page.goto(f"file://{html_path}", wait_until="networkidle")
        
        # 生成 PDF
        pdf_path = "/Users/federerx/Desktop/ui-tars/visionox_vip_report.pdf"
        await page.pdf(
            path=pdf_path,
            format="A4",
            margin={
                "top": "20mm",
                "bottom": "20mm",
                "left": "15mm",
                "right": "15mm"
            },
            print_background=True
        )
        
        await browser.close()
        print(f"PDF 已生成: {pdf_path}")

asyncio.run(generate_pdf())
