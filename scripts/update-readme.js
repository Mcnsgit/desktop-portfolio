const fs = require("fs-extra");
const path = require("path");

async function updateReadme() {
  try {
    const readmePath = path.join(__dirname, "..", "README.md");
    console.log(`Reading Readme from ${readmePath}`);

    //read the current  readme content
    let readmeContent = await fs.readFile(readmePath, "utf-8");

    //define the screenshot section markers

    const startMarker = "<!-- START_SCREENSHOTS -->";
    const endMarker = "<!-- END_SCREENSHOTS -->";

    //get the current date for the timestamp
    const timestamp = new Date().toISOString().split("T")[0];

    //create the new scree\nshot section
    const screenshotSection = `${startMarker}
        ## Portfolio Screenshot 
        *Last updated: ${timestamp}*

        ! [Portfolio Screenshot](./screenshots/screenshot.png)]

        ${endMarker}`;

    //check if the README already has the screenshot section
    if (
      readmeContent.includes(startMarker) &&
      readmeContent.includes(endMarker)
    ) {
      //replace the screenshot section
      const regex = new RegExp(`${startMarker}[\\s\\S]*${endMarker}`, "g");
      readmeContent = readmeContent.replace(regex, screenshotSection);
      console.log("Replaced existing screenshot section in README");
    } else {
      //add the section to the end of the README
      readmeContent += screenshotSection;
      console.log("Added screenshot section to the end of README");
    }

    //write the updated README back to disk
    await fs.writeFile(readmePath, readmeContent, "utf-8");
    console.log("README updated successfully!");
  } catch (error) {
    console.error("Error updating README:", error);
    throw error;
  }
}

//run the function if this script is executed directly
if (require.main === module) {
  updateReadme()
    .then(() => console.log("Screenshot process completed"))
    .catch((error) => {
      console.error("Screenshot process failed:", error);
      process.exit(1);
    });
}

module.exports = { updateReadme };
