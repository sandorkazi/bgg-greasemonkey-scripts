"use strict";
// ==UserScript==
// @name         bgg mass hotkey
// @namespace    bgg
// @version      1.3
// @description  bgg mass video or wishlist
// @match        https://*.boardgamegeek.com/*
// @match        https://boardgamegeek.com/*
// @author       masu
// @grant        GM_addStyle
// ==/UserScript==

// ==KeyCodes==
// Ctrl+Alt+A		 Add new games to collection
// Ctrl+E        Open editor box for all without a status (only for pages where this is listed)
// Ctrl+K        Open editor box for all (only for pages where this is listed)
// Ctrl+Y        Show video review button for all titles
// Ctrl+1        Set every opened box to Wishlist 1, Want to Play, Want in Trade, Want to Buy
// Ctrl+2        Set every opened box to Wishlist 1, Want to Play, Want in Trade
// Ctrl+3        Set every opened box to Wishlist 1, Want to Play
// Ctrl+4        Set every opened box to Wishlist 1, Want to Play
// Ctrl+5        Set every opened box to Wishlist 1
// ==/KeyCodes==

const KEY_B = 66;
const KEY_E = 69;
const KEY_K = 75;
const KEY_Y = 89;
const KEY_1 = 49;
const KEY_2 = 50;
const KEY_3 = 51;
const KEY_4 = 52;
const KEY_5 = 53;

const buttonBoxClassName = "review_buttons_GREASEMONKEY";
const iconSize = 12;

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

function drawBox(box, hotVideo) {

    // clear all
    let reviewButtonBoxes = box.getElementsByClassName(buttonBoxClassName);
    while (0 < reviewButtonBoxes.length) {
        reviewButtonBoxes[0].parentNode.removeChild(reviewButtonBoxes[0]);
    }

    let reviewButtonBox = document.createElement("span");
    reviewButtonBox.className = buttonBoxClassName;

    let hotButton = document.createElement("a");
    // noinspection JSUnresolvedVariable
    hotButton.href = videoUrl(hotVideo.videohost, hotVideo.extvideoid);
    hotButton.target = "_blank";

    let hotButtonImage = document.createElement("img");
    // noinspection JSUnresolvedVariable
    hotButtonImage.src = videoIcon(hotVideo.videohost);
    hotButtonImage.alt = "@";
    hotButtonImage.height = iconSize;
    hotButtonImage.width = iconSize;

    hotButton.appendChild(hotButtonImage);

    reviewButtonBox.appendChild(hotButton);

    box.children[box.children.length - 1].appendChild(reviewButtonBox);

}

function addVideoBox(box) {
    let id = box.getElementsByTagName("a")[0].href.split("/")[4];
    hottestReview(id).then(
        (hotVideo) => drawBox(box, hotVideo),
        (error) => console.log('Could not get data for ' + id + ': ' + error)
    );
}

function reviewButtons() {
    // add all on search or collection page
    let collectionNameBoxes = document.getElementsByClassName("collection_objectname");
    Array.prototype.forEach.call(collectionNameBoxes, addVideoBox);

    // add all on creator page
    // noinspection SpellCheckingInspection
    let infoPageNameBoxes = document.getElementsByClassName("geekitem_linkeditems_title");
    Array.prototype.forEach.call(infoPageNameBoxes, addVideoBox);
}

function hottestReview(id) {
    let url = "https://boardgamegeek.com/api/videos?type=review&objecttype=thing&showcount=1&sort=hot&objectid=" + id;

    return new Promise(function (resolve, reject) {
        let xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        xhr.setRequestHeader("Content-type", "application/json");
        // noinspection JSUnresolvedVariable
        xhr.onload = () => resolve(JSON.parse(xhr.response).videos[0]);
        xhr.onerror = () => reject(xhr.statusText);
        xhr.send();
    });
}

function wishlistMass(level) {
    let boxes = document.getElementsByClassName('select-free');

    Array.prototype.forEach.call(boxes, function (box) {
        let inputs = box.getElementsByTagName('input');
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
        let select = box.getElementsByTagName('select')[0];
        select.value = level;
        box.getElementsByClassName('geekinput')[0].click();
    });
}

function saveAll() {
    let boxes = document.getElementsByClassName('select-free');

    Array.prototype.forEach.call(boxes, function (box) {
        box.getElementsByClassName('geekinput')[0].click();
    });
}

function editIf(test) {
    let statusBoxes = document.getElementsByClassName('collection_status');

    Array.prototype.forEach.call(statusBoxes, function (box) {
        if (test(box)) {
            box.click();
        }
    });
}

function editEmpty() {
    editIf(function test(box) {
        return "" === box.textContent.trim();
    })
}

function editAll() {
    editIf(() => true)
}

async function addGamePromise(box) {
    if ("" === box.textContent.trim()) {
        let id = box.getAttribute('onclick').match('objectid:[ \t]*\'([0-9]*)\'')[1];
        let collid = box.getAttribute('onclick').match('collid:[ \t]*\'([0-9]*)\'')[1];

        if ('' == collid) {
            let title = box.parentNode.getElementsByClassName('collection_objectname ')[0].getElementsByTagName('a')[0].textContent;
            console.log('Adding: ' + title + '\t (' + id + ')');

            let url = 'https://boardgamegeek.com/geekcollection.php';
            let params = "fieldname=status&collid&objecttype=thing&objectid=" + id + "&B1=Cancel&wishlistpriority=1&ajax=1&action=savedata"

            return new Promise(function(resolve) {
                let xhr = new XMLHttpRequest();
                xhr.open("POST", url, true);
                xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
                xhr.onreadystatechange = function() {
                    if (xhr.readyState == 4 && xhr.status == 200) {
                        resolve();
                    }
                }
                xhr.send(params);
            })
        }
    }
}

function addMore(page, lastPage, htmlbox=null) {
    if (page > lastPage) {
        return;
    }
    console.log('Processing page: ' + page);
    let url = 'https://boardgamegeek.com/browse/boardgame/page/' + page;
    if (null != htmlbox) {
        let statusBoxes = Array.from(htmlbox.getElementsByClassName('collection_status'));
        Promise.all(statusBoxes.map(addGamePromise)).then(addMore(page+1, lastPage, null));
    }
    else {
        let xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        xhr.setRequestHeader('Content-type', 'text/html');
        xhr.onload = function() {
            let htmlbox = document.createElement('html');
            htmlbox.innerHTML = xhr.response;
            let statusBoxes = Array.from(htmlbox.getElementsByClassName('collection_status'));
            Promise.all(statusBoxes.map(addGamePromise)).then(addMore(page+1, lastPage, null));
        }
        xhr.send();
    }
}

function addGames() {
    if (confirm('Adding new games to collection - this might take a while.\nDo not close this tab.')) {
        let url = 'https://boardgamegeek.com/browse/boardgame';
        let xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        xhr.setRequestHeader('Content-type', 'text/html');
        xhr.onload = function() {
            let htmlbox = document.createElement('html');
            htmlbox.innerHTML = xhr.response;
            let lastPage = parseInt(htmlbox.querySelectorAll('a[title="last page"]')[0].textContent.slice(1, -1));
            addMore(1, lastPage, htmlbox);
        }
        xhr.send();
    }
}

function keyPress(e) {

    let evtObj = window.event ? window.event : e;
    if (evtObj.ctrlKey) {
        if (!evtObj.altKey && !evtObj.shiftKey) {  // Ctrl + <something>
            if (KEY_Y === evtObj.keyCode || KEY_Y === evtObj.which) {  // Y
                reviewButtons();
            }
            else if (KEY_E === evtObj.keyCode || KEY_E === evtObj.which) {  // E
                editEmpty();
            }
            else if (KEY_K === evtObj.keyCode || KEY_K === evtObj.which) {  // K
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
        else if (!evtObj.altKey && evtObj.shiftKey) {  // Ctrl + Shift + <something>
            if (KEY_B === evtObj.keyCode || KEY_B === evtObj.which) {  // B
                addGames();
            }
        }
    }
}

document.onkeydown = keyPress;
