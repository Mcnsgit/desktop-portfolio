const fs = require("fs-extra");
const path = require("path");

/**
 * Updates the README.md with the latest screenshot
 */
async function updateReadme() {
  try {
    const readmePath = path.join(__dirname, "..", "README.md");
    console.log(`Reading README from ${readmePath}...`);

    // Read the current README content
    let readmeContent = await fs.readFile(readmePath, "utf8");

    // Define the screenshot section markers
    const startMarker = "<!-- PORTFOLIO_SCREENSHOT_START -->";
    const endMarker = "<!-- PORTFOLIO_SCREENSHOT_END -->";

    // Get the current date for the timestamp
    const timestamp = new Date().toISOString().split("T")[0];

    // Check which screenshot file exists
    const screenshotsDir = path.join(__dirname, "..", "screenshots");
    const portfolioScreenshotPath = path.join(
      screenshotsDir,
      "portfolio-screenshot.png"
    );
    const simpleScreenshotPath = path.join(screenshotsDir, "screenshot.png");

    let screenshotFilename = "portfolio-screenshot.png";

    // Check if the files exist and use the one that exists
    if (await fs.pathExists(portfolioScreenshotPath)) {
      console.log("Found portfolio-screenshot.png");
      screenshotFilename = "portfolio-screenshot.png";
    } else if (await fs.pathExists(simpleScreenshotPath)) {
      console.log("Found screenshot.png, using this instead");
      screenshotFilename = "screenshot.png";
    } else {
      console.log("No screenshot file found, but continuing anyway");
    }

    // Create the new screenshot section
    const screenshotSection = `${startMarker}
## Portfolio Screenshot
*Last updated: ${timestamp}*

![Portfolio Screenshot](./screenshots/${screenshotFilename})
${endMarker}`;

    // Check if the README already has the screenshot section
    if (
      readmeContent.includes(startMarker) &&
      readmeContent.includes(endMarker)
    ) {
      // Replace the existing section
      const regex = new RegExp(`${startMarker}[\\s\\S]*${endMarker}`, "g");
      readmeContent = readmeContent.replace(regex, screenshotSection);
      console.log("Replaced existing screenshot section in README.");
    } else {
      // Add the section to the end of the README
      readmeContent += `\n\n${screenshotSection}`;
      console.log("Added new screenshot section to README.");
    }

    // Write the updated README back to disk
    await fs.writeFile(readmePath, readmeContent, "utf8");
    console.log("README updated successfully!");
  } catch (error) {
    console.error("Error updating README:", error);
    throw error;
  }
}

// Run the function if this script is executed directly
if (require.main === module) {
  updateReadme()
    .then(() => console.log("README update process completed"))
    .catch((error) => {
      console.error("README update process failed:", error);
      process.exit(1);
    });
}

module.exports = { updateReadme };
