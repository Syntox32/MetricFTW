
var MetricFTW = MetricFTW || {

    // http://james.padolsey.com/javascript/find-and-replace-text-with-javascript/
    filterImperial: function(searchNode) {
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
            metric = MetricFTW.convertToMetric(m);

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
    },

    // http://www.initium.demon.co.uk/converts/metimp.htm
    convertToMetric: function(match) {
        name = this.removeWhitespace(match[2].toLowerCase());
        value = this.parseNumeric(match[1]);
        var newName = "" , newValue = 0;

        var found = false;
        var dictLen = this.peasant_table.length;
        for(var i = 0; i < dictLen; i++) {
            var abbr = this.peasant_table[i].aliases.split(",");
            for(var j = 0; j < abbr.length; j++) {
                if (name === abbr[j]) {
                    found = true;
                    return {
                        name: this.peasant_table[i].name,
                        value: this.peasant_table[i].convert(value)
                    }
                    break;
                }
            }
            if (found) {
                break;
            }
        }

        if (!found) { 
            console.log("this can't happen, right?");
        }

        return null;
    },
        
    removeWhitespace: function(string) {
        return string.replace(/ /g, "");
    },

    parseNumeric: function(numString) {
        var re = /[\\ \\.\\,]+/gi;
        numString = numString.replace(re, ""); // parseInt doesn't remove ','
        return parseInt(numString);
    },

    // http://www.initium.demon.co.uk/converts/metimp.htm
    //
    // Much thanks to Rocket for providing a list of units and measurements!
    // https://github.com/cpancake/unitconvert/blob/master/default.json
    peasant_table: [
        { 
            name: "kg",
            aliases: "pound,pounds,lb,lbs",
            convert: function(value) {
                return value * 0.4536;
            }
        },
        { 
            name: "grams",
            aliases: "ounce,ounces,oz",
            convert: function(value) {
                return value * 28.41;
            }
        }
    ]
}

var init = function() {
    var numActs =  MetricFTW.filterImperial();
    console.log("Removed " + numActs.toString() + " act(s) of peasantry!");
    return numActs;
};

chrome.extension.sendMessage({
    action: "filterImperial",
    actsOfPeasantry: init()
});