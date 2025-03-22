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

  //define page varibale outside the try block
  let page = null;
  try {
    console.log("Opening new page...");
    page = await browser.newPage();
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

    await page.evaluate(
      () => new Promise((resolve) => setTimeout(resolve, 1000))
    );

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
    throw error; // Re-throw the error to handle it in the calling function
  } finally {
    // Only close the page if it was successfully created
    if (page) {
      await page.close();
    }
  }
}

// Clean up function to close browser when done
async function closeBrowser() {
  if (browser) {
    await browser.close();
    browser = null;
  }
}

if (require.main === module) {
  takeScreenshot()
    .then(() => {
      console.log("Screenshot process completed");
      return closeBrowser();
    })
    .catch((error) => {
      console.error("Screenshot process failed:", error);
      closeBrowser().then(() => process.exit(1));
    });
}

module.exports = { takeScreenshot, closeBrowser };
