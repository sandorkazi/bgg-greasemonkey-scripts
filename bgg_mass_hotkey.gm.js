"use strict";
// ==UserScript==
// @name         bgg mass hotkey
// @namespace    bgg
// @version      1.2
// @description  bgg mass video or wishlist
// @match        https://*.boardgamegeek.com/*
// @match        https://boardgamegeek.com/*
// @author       masu
// @grant        GM_addStyle
// ==/UserScript==

// ==KeyCodes==
// Ctrl+Y        Show video review button for all titles
// Ctrl+E        Open editor box for all without a status (only for pages where this is listed)
// Ctrl+M        Open editor box for all (only for pages where this is listed)
// Ctrl+1        Set every opened box to Wishlist 1, Want to Play, Want in Trade, Want to Buy
// Ctrl+2        Set every opened box to Wishlist 1, Want to Play, Want in Trade
// Ctrl+3        Set every opened box to Wishlist 1, Want to Play
// Ctrl+4        Set every opened box to Wishlist 1, Want to Play
// Ctrl+5        Set every opened box to Wishlist 1
// ==/KeyCodes==

var KEY_Y = 89;
var KEY_E = 69;
var KEY_M = 77;
var KEY_1 = 49;
var KEY_2 = 50;
var KEY_3 = 51;
var KEY_4 = 52;
var KEY_5 = 53;

var buttonBoxClassName = "review_buttons_GREASEMONKEY";
var iconSize = 12;

function videoUrl(videoHost, videoId) {

    switch (videoHost) {
        case "youtube":
            return "https://youtu.be/" + videoId;
        case "vimeo":
            return "https://vimeo.com/" + videoId;
        default:
            alert("Unknown video host: " + videoHost);
            return "";
    }
}

function videoIcon(videoHost) {

    switch (videoHost) {
        case "youtube":
            return "https://youtube.com/favicon.ico";
        case "vimeo":
            return "https://vimeo.com/favicon.ico";
        default:
            alert("Unknown video host: " + videoHost);
            return "";
    }
}

function addVideoBox(box) {

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
    // add all on search or collection page
    var collectionNameBoxes = document.getElementsByClassName("collection_objectname");
    Array.prototype.forEach.call(collectionNameBoxes, addVideoBox);

    // add all on creator page
    // noinspection SpellCheckingInspection
    var infoPageNameBoxes = document.getElementsByClassName("geekitem_linkeditems_title");
    Array.prototype.forEach.call(infoPageNameBoxes, addVideoBox);
}

function serialize(obj) {
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

function hottestReview(id, callback) {

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
            // noinspection MagicNumberJS
            if (4 === this.readyState && 200 === this.status) {
                // noinspection JSUnresolvedVariable
                callback(JSON.parse(xHttp.response).videos[0]);
            }
        }
    );
}

function wishlistMass(level) {
    var boxes = document.getElementsByClassName('select-free');

    Array.prototype.forEach.call(boxes, function (box) {
        var inputs = box.getElementsByTagName('input');
        Array.prototype.forEach.call(inputs, function (input) {
            switch (input.name) {
                case 'wishlist':
                    input.checked = 1;
                    break;
                case 'wanttobuy':
                    input.checked = 1 ? 1 >= level : 0;
                    break;
                case 'want':
                    input.checked = 1 ? 2 >= level : 0;
                    break;
                case 'wanttoplay':
                    input.checked = 1 ? 4 >= level : 0;
                    break;
                default:
                    break
            }
        });
        var select = box.getElementsByTagName('select')[0];
        select.value = level;
        box.getElementsByClassName('geekinput')[0].click();
    });
}

function editAll(test) {
    var boxes = document.getElementsByClassName('collection_status editfield');

    Array.prototype.forEach.call(boxes, function (box) {
        if (test(box)) {
            box.click();
        }
    });
}

function editEmpty() {
    editAll(function test(box) {
        return "" === box.textContent.trim();
    })
}

function keyPress(e) {
    var evtObj = window.event ? window.event : e;
    if (evtObj.ctrlKey && !evtObj.altKey && !evtObj.shiftKey) {  // Ctrl + <something>
        if (KEY_Y === evtObj.keyCode || KEY_Y === evtObj.which) {  // Y
            reviewButtons();
        }
        else if (KEY_E === evtObj.keyCode || KEY_E === evtObj.which) {  // E
            editEmpty();
        }
        else if (KEY_M === evtObj.keyCode || KEY_M === evtObj.which) {  // M
            editAll();
        }
        else if (KEY_1 === evtObj.keyCode || KEY_1 === evtObj.which) {  // 1
            wishlistMass(1);
        }
        else if (KEY_2 === evtObj.keyCode || KEY_2 === evtObj.which) {  // 2
            wishlistMass(2);
        }
        else if (KEY_3 === evtObj.keyCode || KEY_3 === evtObj.which) {  // 3
            wishlistMass(3);
        }
        else if (KEY_4 === evtObj.keyCode || KEY_4 === evtObj.which) {  // 4
            wishlistMass(4);
        }
        else if (KEY_5 === evtObj.keyCode || KEY_5 === evtObj.which) {  // 5
            wishlistMass(5);
        }
    }
}

document.onkeydown = keyPress;
