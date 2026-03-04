#!/usr/bin/env python3
import asyncio
from playwright.async_api import async_playwright

async def fetch_oled_sources():
    """Fetch OLED and display technology information from trusted sources"""
    
    async with async_playwright() as p:
        browser = await p.chromium.connect_over_cdp("http://127.0.0.1:18888")
        context = await browser.new_context()
        page = await context.new_page()
        
        results = {}
        
        # OLED-Info
        print("Fetching from OLED-Info...")
        try:
            await page.goto("https://www.oled-info.com", timeout=15000)
            await page.wait_for_load_state("networkidle", timeout=8000)
            text = await page.locator("body").text_content()
            results['oled_info'] = text[:5000] if text else "No content"
            print("✓ OLED-Info fetched")
        except Exception as e:
            print(f"✗ OLED-Info error: {str(e)[:100]}")
            results['oled_info'] = ""
        
        # TechCrunch
        print("Fetching from TechCrunch...")
        try:
            await page.goto("https://techcrunch.com/tag/oled/", timeout=15000)
            await page.wait_for_load_state("networkidle", timeout=8000)
            text = await page.locator("body").text_content()
            results['techcrunch'] = text[:5000] if text else "No content"
            print("✓ TechCrunch fetched")
        except Exception as e:
            print(f"✗ TechCrunch error: {str(e)[:100]}")
            results['techcrunch'] = ""
        
        # Reuters
        print("Fetching from Reuters...")
        try:
            await page.goto("https://www.reuters.com", timeout=15000)
            await page.wait_for_load_state("networkidle", timeout=8000)
            text = await page.locator("body").text_content()
            results['reuters'] = text[:5000] if text else "No content"
            print("✓ Reuters fetched")
        except Exception as e:
            print(f"✗ Reuters error: {str(e)[:100]}")
            results['reuters'] = ""
        
        # CNBC Tech
        print("Fetching from CNBC...")
        try:
            await page.goto("https://www.cnbc.com/technology/", timeout=15000)
            await page.wait_for_load_state("networkidle", timeout=8000)
            text = await page.locator("body").text_content()
            results['cnbc'] = text[:5000] if text else "No content"
            print("✓ CNBC fetched")
        except Exception as e:
            print(f"✗ CNBC error: {str(e)[:100]}")
            results['cnbc'] = ""
        
        await context.close()
        await browser.close()
        
        return results

if __name__ == "__main__":
    results = asyncio.run(fetch_oled_sources())
    
    # Save to file
    with open("/Users/federerx/Desktop/ui-tars/oled_research.txt", "w") as f:
        for key, value in results.items():
            if value:
                f.write(f"\n{'='*60}\n")
                f.write(f"Source: {key}\n")
                f.write(f"{'='*60}\n")
                f.write(value)
                f.write("\n")
    
    print("\n✓ OLED research data saved")
