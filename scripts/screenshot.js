const puppeteer = require("puppeteer");
const fs = require("fs-extra");
const path = require("path");
let browser; // Keep browser instance for reuse
async function launchBrowser() {
  if (!browser) {
    console.log("Launching browser...");
    browser = await puppeteer.launch({
      headless: "new",
      args: ["--disable-gpu", "--no-sandbox", "--disable-setuid-sandbox"],
    });
  }
}
async function takeScreenshot(fullPage = false) {
  await launchBrowser(); // Ensure the browser is launched
  const screenshotsDir = path.join(__dirname, "..", "screenshots");
  await fs.ensureDir(screenshotsDir);
  try {
    console.log("Opening new page...");
    const page = await browser.newPage();
    await page.setViewport({
      width: 1280,
      height: 800,
      deviceScaleFactor: 2,
    });
    const url =
      process.env.WEBSITE_URL ||
      "https://desktop-portfolio-git-main-mcnsgits-projects.vercel.app/";
    console.log(`Navigating to ${url}...`);
    const response = await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: 30000,
    });
    if (!response || !response.ok()) {
      throw new Error(`Failed to load page: ${response.status()}`);
    }
    await page.waitForTimeout(1000); // Reduced wait time for animations
    const screenshotPath = path.join(screenshotsDir, "screenshot.png");
    console.log(`Taking screenshot and saving to ${screenshotPath}...`);
    await page.screenshot({
      path: screenshotPath,
      fullPage: fullPage,
    });
    console.log("Screenshot taken successfully");
    return screenshotPath;
  } catch (error) {
    console.error("Error taking screenshot:", error);
  } finally {
    await page.close(); // Close the page instead of the browser
  }
}
if (require.main === module) {
  takeScreenshot()
    .then(() => console.log("Screenshot process completed"))
    .catch((error) => {
      console.error("Screenshot process failed:", error);
      process.exit(1);
    });
}
module.exports = { takeScreenshot };
