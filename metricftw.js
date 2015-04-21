
function removeWhitespace(string) {
	return string.replace(/ /g, "");
}

function parseNumeric(numString) {
	var re = /[\\ \\.\\,]+/gi;
	numString = numString.replace(re, ""); // parseInt doesn't remove ','
	return parseInt(numString);
}

/**
 * http://www.initium.demon.co.uk/converts/metimp.htm
 */
function convertToMetric(match) {
	name = removeWhitespace(match[2].toLowerCase());
	value = parseNumeric(match[1]);
	var newName = "" , newValue = 0;

	switch(name) {
		case "pounds":
		case "lbs":
		case "lb":
			newName = "kg";
			newValue = peasant_table["pounds"] * value;
			break;
		default:
			newName = "unknown";
			newValue = "-1";
			break;
	}

	return {
		name: newName,
		value: newValue
	}
}

/**
 * Original code from http://james.padolsey.com/javascript/find-and-replace-text-with-javascript/
 */
function filterImperial(searchNode) {
	var valueReg = "(\\d[0-9\\/\\,\\.\\s]+\\s*)";
	var nameReg= "(pounds|lbs|lb)";
	var reg = new RegExp(valueReg + nameReg, "gi");

    var childNodes = (searchNode || document.body).childNodes,
	 	excludes = 'html,head,style,title,link,meta,script,object,iframe',
    	cnLength = childNodes.length,
    	peasantryFound = 0;

    while (cnLength--) {
        var currentNode = childNodes[cnLength];
        if (currentNode.nodeType === 1 
        	&& (excludes + ',').indexOf(currentNode.nodeName.toLowerCase() + ',') === -1) {
            peasantryFound += arguments.callee(currentNode);
        }

        m = reg.exec(currentNode.data);
        if (currentNode.nodeType !== 3 || m === null) {
            continue;
        }
        // reset regex index when getting multiple matches
        reg.lastIndex = 0;
        peasantryFound++;

        metric = convertToMetric(m);

        // I'll add a star cause I'll forget I have it turned on if it changes something
        replacement = metric.value.toString() + " " + metric.name + "*";

        // replace the peasantry with metric values
        var parent = currentNode.parentNode,
            frag = (function() {
                var html = currentNode.data.replace(reg, replacement),
                    wrap = document.createElement('div'),
                    frag = document.createDocumentFragment();
                wrap.innerHTML = html;
                while (wrap.firstChild) {
                    frag.appendChild(wrap.firstChild);
                }
                return frag;
            })();
        parent.insertBefore(frag, currentNode);
        parent.removeChild(currentNode);
    }

    return peasantryFound;
}

peasant_table = {
	pounds: 0.4536,
};

function init() {
	var acts = filterImperial();
	console.log("Removed " + acts.toString() + " act(s) of peasantry!");
    return acts;
}

chrome.extension.sendMessage({
    action: "filterImperial",
    actsOfPeasantry: init()
});
