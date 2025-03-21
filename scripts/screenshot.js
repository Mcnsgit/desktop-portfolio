const puppeteer = require("puppeteer");
const fs = require("fs-extra");
const path = require("path");

async function takeScreenshot() {
  console.log("Launching browser...");

  //create screenshot folder if it doesn't exist
  const screenshotsDir = path.join(__dirname, "..", "screenshots");
  await fs.ensureDir(screenshotsDir);

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    console.log("Opening new page...");
    const page = await browser.newPage();

    //set viewport to desktop size
    await page.setViewport({
      width: 1280,
      height: 800,
      deviceScaleFactor: 2, //retina-like display
    });

    //replace with you actual url
    const url =
      process.env.WEBSITE_URL ||
      "https://desktop-portfolio-git-main-mcnsgits-projects.vercel.app/";
    console.log(`Navigating to ${url}...`);

    await page.goto(url, {
      waitUntil: "networkidle2", //wait until the network is idle for 2 seconds
      timeout: 30000, //wait for 30 seconds before timing out
    });

    //wait for animations to complete
    await page.waitForTimeout(3000);

    //take screenshot

    const screenshotPath = path.join(screenshotsDir, "screenshot.png");
    console.log(`Taking screenshot and saving to ${screenshotPath}...`);

    await page.screenshot({
      path: screenshotPath,
      fullPage: false, //set true if you want to take a full page screenshot
    });

    console.log("screenshot taken successfully");
    return screenshotPath;
  } catch (error) {
    console.error("Error taking screenshot:", error);
  } finally {
    await browser.close();
  }
}

//run the function if this scrip is executed directly
if (require.main === module) {
  takeScreenshot()
    .then(() => console.log("Screenshot process completed"))
    .catch((error) => {
      console.error("Screenshot process failed:", error);
      process.exit(1);
    });
}

module.exports = { takeScreenshot };
