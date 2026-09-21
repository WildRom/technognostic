from pathlib import Path
import tempfile
import time

from selenium import webdriver
from selenium.webdriver.chrome.options import Options

options = Options()
options.binary_location = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
options.add_argument("--headless=new")
options.add_argument("--hide-scrollbars")
options.add_argument(f"--user-data-dir={tempfile.mkdtemp(prefix='technognostic-glow-')}")

driver = webdriver.Chrome(options=options)
try:
    driver.set_window_size(1920, 1500)
    driver.get("http://127.0.0.1:4173/")
    gallery = driver.find_element("id", "artwork-gallery")
    driver.execute_script("arguments[0].scrollIntoView({block: 'start'})", gallery)
    time.sleep(1)
    media = driver.find_element("css selector", ".shirt-gallery__image")
    style = driver.execute_script(
        "const s=getComputedStyle(arguments[0],'::before'); return {width:s.width,height:s.height,opacity:s.opacity,background:s.backgroundImage}",
        media,
    )
    screenshot = Path(tempfile.gettempdir()) / "technognostic-gallery-glow-stronger.png"
    driver.save_screenshot(str(screenshot))
    print(style)
    print(screenshot)
finally:
    driver.quit()
