#!/usr/bin/env python3
import asyncio
from playwright.async_api import async_playwright

async def fetch_visionox_data():
    """Fetch Visionox ViP technology information"""
    
    async with async_playwright() as p:
        browser = await p.chromium.connect_over_cdp("http://127.0.0.1:18888")
        context = await browser.new_context()
        page = await context.new_page()
        
        results = {}
        
        # Try Wikipedia OLED with longer timeout
        print("Fetching Wikipedia OLED article...")
        try:
            await page.goto("https://en.wikipedia.org/wiki/OLED", timeout=20000)
            await page.wait_for_load_state("domcontentloaded", timeout=10000)
            text = await page.locator("body").text_content()
            results['wikipedia'] = text if text else "No content"
            print(f"✓ Wikipedia fetched ({len(text)} chars)")
        except Exception as e:
            print(f"✗ Wikipedia error: {str(e)[:80]}")
        
        # Try Google Scholar search
        print("Fetching Google Scholar...")
        try:
            await page.goto("https://scholar.google.com/scholar?q=Visionox+ViP+AMOLED", timeout=20000)
            await page.wait_for_load_state("domcontentloaded", timeout=10000)
            text = await page.locator("body").text_content()
            results['scholar'] = text if text else "No content"
            print(f"✓ Google Scholar fetched ({len(text)} chars)")
        except Exception as e:
            print(f"✗ Google Scholar error: {str(e)[:80]}")
        
        # Try Hacker News
        print("Fetching Hacker News...")
        try:
            await page.goto("https://news.ycombinator.com", timeout=20000)
            await page.wait_for_load_state("domcontentloaded", timeout=10000)
            text = await page.locator("body").text_content()
            results['hackernews'] = text if text else "No content"
            print(f"✓ Hacker News fetched ({len(text)} chars)")
        except Exception as e:
            print(f"✗ Hacker News error: {str(e)[:80]}")
        
        await context.close()
        await browser.close()
        
        return results

if __name__ == "__main__":
    results = asyncio.run(fetch_visionox_data())
    
    # Save results
    with open("/Users/federerx/Desktop/ui-tars/visionox_data.txt", "w") as f:
        for key, value in results.items():
            if value and len(value) > 100:
                f.write(f"\n{'='*70}\n")
                f.write(f"Source: {key.upper()}\n")
                f.write(f"{'='*70}\n")
                f.write(value[:8000])
                f.write("\n")
    
    print("\n✓ Data saved to visionox_data.txt")
