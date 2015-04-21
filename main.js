
var auto_detect = false;

function execute() {
	chrome.tabs.executeScript(null, {
		file: "metricftw.js"
	}, function() {
		if (chrome.extension.lastError) {
			setStatus("Error: " + chrome.extension.lastError.message);
		}
	});
}

function setStatus(text) {
	document.querySelector("#status").innerText = "Status: " + text;
}

window.onload = function() {
	if (auto_detect) {
		execute();
	}

	var button = document.getElementById("btn");
	button.addEventListener("click", function() {
		execute();
	});
}

chrome.extension.onMessage.addListener(function(request, sender) {
	if (request.action == "filterImperial") {
		if (request.actsOfPeasantry === 0) {
			setStatus("No fields changed!");
		} else {
			setStatus(request.actsOfPeasantry.toString() + " fields changed!");
		}
	}
});
