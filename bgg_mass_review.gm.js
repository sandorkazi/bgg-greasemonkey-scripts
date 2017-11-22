// ==UserScript==
// @name         bgg mass video review
// @namespace    bgg
// @version      1.1
// @description  video review button on the collection button
// @match        https://*.boardgamegeek.com/*
// @match        https://boardgamegeek.com/*
// @author       You
// @match        https://www.greasespot.net/2017/09/greasemonkey-4-for-users.html
// @grant        none
// ==/UserScript==

// ==KeyCodes==
// Ctrl+Y        Do...
// ==/KeyCodes==


var buttonBoxClassName = "review_buttons_GREASEMONKEY";
var iconSize = 12;

function serialize(obj) {
    "use strict";

    var str = "";
    for (var key in obj) {
        if ("" !== str) {
            str += "&";
        }
        // noinspection JSUnfilteredForInLoop
        str += key + "=" + encodeURIComponent(obj[key]);
    }
    return str;
}

function videoUrl(videohost, videoid) {
    "use strict";

    switch(videohost) {
        case "youtube":
            return "https://youtu.be/" + videoid;
        case "vimeo":
            return "https://vimeo.com/" + videoid;
        default:
            alert("Unknown video host: " + videohost);
            return "";
    }
}

function videoIcon(videohost) {
    "use strict";

    switch(videohost) {
        case "youtube":
            return "https://youtube.com/favicon.ico";
        case "vimeo":
            return "https://vimeo.com/favicon.ico";
        default:
            alert("Unknown video host: " + videohost);
            return "";
    }
}

function addVideoBox(box) {
    "use strict";

    var id = box.getElementsByTagName("a")[0].href.split("/")[4];
    hottestReview(
        id,
        function draw(hotVideo) {

            // clear all
            var reviewButtonBoxes = box.getElementsByClassName(buttonBoxClassName);
            while (0 < reviewButtonBoxes.length) {
                reviewButtonBoxes[0].parentNode.removeChild(reviewButtonBoxes[0]);
            }

            var reviewButtonBox = document.createElement("span");
            reviewButtonBox.className = buttonBoxClassName;

            var hotButton = document.createElement("a");
            // noinspection JSUnresolvedVariable
            hotButton.href = videoUrl(hotVideo.videohost, hotVideo.extvideoid);
            hotButton.target = "_blank";

            var hotButtonImage = document.createElement("img");
            // noinspection JSUnresolvedVariable
            hotButtonImage.src = videoIcon(hotVideo.videohost);
            hotButtonImage.alt = "@";
            hotButtonImage.height = iconSize;
            hotButtonImage.width = iconSize;

            hotButton.appendChild(hotButtonImage);

            reviewButtonBox.appendChild(hotButton);

            box.children[box.children.length - 1].appendChild(reviewButtonBox);
        }
    );
}

function reviewButtons() {
    "use strict";

    // add all on search or collection page
    var collectionNameBoxes = document.getElementsByClassName("collection_objectname");
    Array.prototype.forEach.call(collectionNameBoxes, addVideoBox);

    // add all on creator page
    // noinspection SpellCheckingInspection
    var infoPageNameBoxes = document.getElementsByClassName("geekitem_linkeditems_title");
    Array.prototype.forEach.call(infoPageNameBoxes, addVideoBox);
}

function hottestReview(id, callback) {
    "use strict";

    var payload = {
        "ajax": 1,
        "nosession": 1,
        "objectid": id,
        "objecttype": "thing",
        "showcount": 1,
        "sort": "hot"
    };

    var url = "https://boardgamegeek.com/api/videos?" + serialize(payload);

    var xHttp = new XMLHttpRequest();
    xHttp.open("GET", url, true);
    xHttp.setRequestHeader("Content-type", "application/json");
    xHttp.send();
    xHttp.onreadystatechange = (
        function () {
            if (4 === this.readyState && 200 === this.status) {
                // noinspection JSUnresolvedVariable, JSCheckFunctionSignatures
                callback(JSON.parse(xHttp.response).videos[0]);
            }
        }
    )
}

function keyPress(e) {
    "use strict";

    var evtObj = window.event ? window.event : e;
    if ((89 === evtObj.keyCode || 89 === evtObj.which) && evtObj.ctrlKey) {
        reviewButtons();
    }
}

document.onkeydown = keyPress;
