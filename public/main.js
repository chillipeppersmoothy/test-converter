async function executeCommand(command) {
  try {
    const response = await fetch("/execute-command", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ command }),
    });
    const result = await response.json();
    if (result.error) {
      console.error(`Error: ${result.error}`);
    } else {
      console.log(`Output: ${result.output}`);
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
}

async function downloadZip(tool) {
  try {
    const response = await fetch(`/download-zip?tool=${tool}`, {
      method: "GET",
    });
    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${tool}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } else {
      console.error("Failed to download zip file.");
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
}

document
  .getElementById("converter-form")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const sourceFilePath = document.getElementById("source-file").value;
    const tool = document.querySelector('input[name="tool"]:checked').value;

    if (tool === "playwright") {
      const command = `npm run pw convert ${sourceFilePath} destination_file_path`;
      await executeCommand(command);
      await downloadZip(tool);
    } else if (tool === "jmeter") {
      alert("JMeter conversion is not supported yet.");
    } else {
      alert("Please select one of the tools.");
    }
  });
