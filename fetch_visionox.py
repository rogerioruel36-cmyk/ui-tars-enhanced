#!/usr/bin/env python3
import asyncio
from playwright.async_api import async_playwright

async def fetch_visionox_info():
    """Fetch Visionox ViP technology information from accessible sources"""
    
    async with async_playwright() as p:
        browser = await p.chromium.connect_over_cdp("http://127.0.0.1:18888")
        context = await browser.new_context()
        page = await context.new_page()
        
        results = {}
        
        # Try Brave Search with better query
        print("Fetching from Brave Search...")
        try:
            await page.goto("https://search.brave.com/search?q=Visionox+ViP+technology+AMOLED", timeout=15000)
            await page.wait_for_load_state("networkidle", timeout=8000)
            text = await page.locator("body").text_content()
            results['brave_search'] = text[:4000] if text else "No content"
            print("✓ Brave Search fetched")
        except Exception as e:
            print(f"✗ Brave error: {str(e)[:100]}")
            results['brave_search'] = ""
        
        # Try Wikipedia OLED article
        print("Fetching from Wikipedia OLED...")
        try:
            await page.goto("https://en.wikipedia.org/wiki/OLED", timeout=15000)
            await page.wait_for_load_state("networkidle", timeout=8000)
            text = await page.locator("body").text_content()
            results['wikipedia_oled'] = text[:4000] if text else "No content"
            print("✓ Wikipedia OLED fetched")
        except Exception as e:
            print(f"✗ Wikipedia error: {str(e)[:100]}")
            results['wikipedia_oled'] = ""
        
        # Try BBC News
        print("Fetching from BBC News...")
        try:
            await page.goto("https://www.bbc.com/news/technology", timeout=15000)
            await page.wait_for_load_state("networkidle", timeout=8000)
            text = await page.locator("body").text_content()
            results['bbc_tech'] = text[:4000] if text else "No content"
            print("✓ BBC News fetched")
        except Exception as e:
            print(f"✗ BBC error: {str(e)[:100]}")
            results['bbc_tech'] = ""
        
        await context.close()
        await browser.close()
        
        return results

if __name__ == "__main__":
    results = asyncio.run(fetch_visionox_info())
    
    # Save to file
    with open("/Users/federerx/Desktop/ui-tars/visionox_research.txt", "w") as f:
        for key, value in results.items():
            if value:
                f.write(f"\n{'='*60}\n")
                f.write(f"Source: {key}\n")
                f.write(f"{'='*60}\n")
                f.write(value)
                f.write("\n")
    
    print("\n✓ Research data saved")
