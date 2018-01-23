// ==UserScript==
// @name         bgg mass hotkey
// @namespace    bgg
// @version      1.1
// @description  bgg mass video or wishlist
// @match        https://*.boardgamegeek.com/*
// @match        https://boardgamegeek.com/*
// @author       You
// @match        https://www.greasespot.net/2017/09/greasemonkey-4-for-users.html
// @grant        none
// ==/UserScript==

// ==KeyCodes==
// Ctrl+Y        Show video review button for all titles
// Ctrl+1        Set every opened box to Wishlist 1, Want to Play, Want in Trade, Want to Buy
// Ctrl+2        Set every opened box to Wishlist 1, Want to Play, Want in Trade
// Ctrl+3        Set every opened box to Wishlist 1, Want to Play
// Ctrl+4        Set every opened box to Wishlist 1, Want to Play
// Ctrl+5        Set every opened box to Wishlist 1
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

function wishlist(level) {
    "use strict";

    var boxes = document.getElementsByClassName('select-free');

    Array.prototype.forEach.call(boxes, function(box){
        var inputs = box.getElementsByTagName('input');
        Array.prototype.forEach.call(inputs, function(input){
            if ('wishlist' === input.name) {
                input.checked = 1;
            } else if ('wanttobuy' === input.name) {
                input.checked = 1 ? 1 >= level : 0;
            } else if ('want' === input.name) {
                input.checked = 1 ? 2 >= level : 0;
            } else if ('wanttoplay' === input.name) {
                input.checked = 1 ? 4 >= level : 0;
            }
        })
        var select = box.getElementsByTagName('select')[0];
        select.value = level;
        box.getElementsByClassName('geekinput')[0].click();
    });
}

function keyPress(e) {
    "use strict";

    var evtObj = window.event ? window.event : e;
    if      ((89 === evtObj.keyCode || 89 === evtObj.which) && evtObj.ctrlKey && !evtObj.altKey && !evtObj.shiftKey) reviewButtons();
    else if ((49 === evtObj.keyCode || 49 === evtObj.which) && evtObj.ctrlKey && !evtObj.altKey && !evtObj.shiftKey) wishlist(1);
    else if ((50 === evtObj.keyCode || 50 === evtObj.which) && evtObj.ctrlKey && !evtObj.altKey && !evtObj.shiftKey) wishlist(2);
    else if ((51 === evtObj.keyCode || 51 === evtObj.which) && evtObj.ctrlKey && !evtObj.altKey && !evtObj.shiftKey) wishlist(3);
    else if ((52 === evtObj.keyCode || 52 === evtObj.which) && evtObj.ctrlKey && !evtObj.altKey && !evtObj.shiftKey) wishlist(4);
    else if ((53 === evtObj.keyCode || 53 === evtObj.which) && evtObj.ctrlKey && !evtObj.altKey && !evtObj.shiftKey) wishlist(5);

}

document.onkeydown = keyPress;
