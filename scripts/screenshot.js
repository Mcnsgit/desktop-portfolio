const puppeteer = require('puppeteer');
const fs = require('fs-extra');
const path = require('path');

const screenshotPath = path.join(__dirname, '..', 'screenshots');

(async () => {
  try {
    console.log('Starting screenshot script...');
    await fs.ensureDir(screenshotPath);
    console.log('Screenshots directory ensured.');

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    console.log('Browser launched.');
    const page = await browser.newPage();
    console.log('New page created.');
    await page.setViewport({ width: 1920, height: 1080 });
    console.log('Viewport set.');

    const url = 'http://localhost:3000';
    console.log(`Navigating to ${url}...`);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
    console.log('Page loaded.');

    const screenshotFile = path.join(screenshotPath, 'screenshot.png');
    console.log(`Taking screenshot and saving to ${screenshotFile}...`);
    await page.screenshot({ path: screenshotFile, fullPage: true });
    console.log('Screenshot taken successfully.');

    await browser.close();
    console.log('Browser closed.');
    console.log('Screenshot script finished successfully.');
  } catch (error) {
    console.error('Error taking screenshot:', error);
    process.exit(1);
  }
})();
