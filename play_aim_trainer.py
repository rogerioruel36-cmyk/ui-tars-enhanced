import asyncio
from playwright.async_api import async_playwright
import time
import random

async def play_aim_trainer():
    async with async_playwright() as p:
        # Connect to the existing browser via CDP
        browser = await p.chromium.connect_over_cdp("http://127.0.0.1:18888")
        context = await browser.new_context()
        page = await context.new_page()
        
        # Navigate to the game
        print("Navigating to aim trainer...")
        await page.goto("https://cpstest.click/en/aim-trainer#google_vignette", wait_until="networkidle")
        
        # Wait for page to load
        await page.wait_for_timeout(3000)
        
        print("Page loaded, looking for settings...")
        
        # Take initial screenshot
        await page.screenshot(path="/Users/federerx/Desktop/ui-tars/game_initial.png")
        
        # Look for the time/seconds input field
        # Try different selectors
        time_input = await page.query_selector("input[type='number']")
        
        if time_input:
            print("Found time input, setting to 50...")
            await time_input.fill("50")
            await page.wait_for_timeout(500)
        
        # Look for start button
        print("Looking for start button...")
        buttons = await page.query_selector_all("button")
        print(f"Found {len(buttons)} buttons")
        
        # Take screenshot before clicking start
        await page.screenshot(path="/Users/federerx/Desktop/ui-tars/game_before_start.png")
        
        # Click the first button (likely the start button)
        if buttons:
            await buttons[0].click()
            print("Clicked start button")
        
        # Wait for game to start
        await page.wait_for_timeout(1000)
        
        # Now play the game - click on targets for 50 seconds
        print("Playing the game for 50 seconds...")
        start_time = time.time()
        clicks = 0
        
        while time.time() - start_time < 50:
            # Look for clickable targets - try various selectors
            targets = await page.query_selector_all("div[class*='target'], div[class*='circle'], div[class*='dot'], .target, .circle")
            
            if targets:
                # Click on targets
                for target in targets[:5]:  # Click up to 5 targets per iteration
                    try:
                        await target.click()
                        clicks += 1
                    except:
                        pass
            
            # Also try clicking anywhere in the game area
            game_area = await page.query_selector("body")
            if game_area:
                box = await game_area.bounding_box()
                if box:
                    x = random.randint(int(box['x'] + 100), int(box['x'] + box['width'] - 100))
                    y = random.randint(int(box['y'] + 100), int(box['y'] + box['height'] - 100))
                    try:
                        await page.click(f"body", position={"x": x, "y": y})
                        clicks += 1
                    except:
                        pass
            
            await page.wait_for_timeout(50)
            
            elapsed = time.time() - start_time
            if elapsed % 10 < 0.1:  # Print every 10 seconds
                print(f"Elapsed: {elapsed:.1f}s, Clicks: {clicks}")
        
        print(f"Game completed! Total clicks: {clicks}")
        
        # Take final screenshot
        await page.screenshot(path="/Users/federerx/Desktop/ui-tars/game_final.png")
        
        await context.close()
        await browser.close()

asyncio.run(play_aim_trainer())
