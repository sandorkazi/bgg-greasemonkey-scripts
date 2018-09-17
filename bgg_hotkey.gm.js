"use strict";
// ==UserScript==
// @name         bgg hotkey
// @namespace    bgg
// @version      1.3
// @description  bgg video or wishlist
// @match        https://*.boardgamegeek.com/boardgame/*
// @match        https://boardgamegeek.com/boardgame/*
// @require      https://cdnjs.cloudflare.com/ajax/libs/jquery/2.2.1/jquery.min.js
// @author       masu
// @grant        GM_addStyle
// ==/UserScript==

// ==KeyCodes==
// Ctrl+1        Wishlist 1, Want to Play, Want in Trade, Want to Buy
// Ctrl+2        Wishlist 2, Want to Play, Want in Trade
// Ctrl+3        Wishlist 3, Want to Play
// Ctrl+4        Wishlist 4
// Ctrl+5        Wishlist 5
// ==/KeyCodes==

const KEY_1 = 49;
const KEY_2 = 50;
const KEY_3 = 51;
const KEY_4 = 52;
const KEY_5 = 53;

function waitForEl(selector, callback, timeout) {
    if ($(selector).length) {
        callback();
    } else {
        setTimeout(function () {
            waitForEl(selector, callback);
        }, timeout);
    }
}

function getCheckboxObject(id) {
    let model = {
        1: "item.status.own",
        2: "item.status.prevowned",
        3: "item.status.fortrade",
        4: "item.status.wanttoplay",
        5: "item.status.want",
        6: "item.status.wanttobuy",
        7: "item.status.preordered",
        8: "item.status.wishlist"
    }[id];
    return $('input[ng-model="' + model + '"]')[0];
}

function setCheckboxObject(checkbox, value) {
    if (checkbox.checked ^ value) {
        checkbox.click();
    }
}

function getCheckboxValue(id) {
    return getCheckboxObject(id).checked ? 1 : 0;
}

function setCheckboxValue(id, value) {
    setCheckboxObject(getCheckboxObject(id), value);
}

// noinspection SpellCheckingInspection
function setWishlistPriority(level) {
    let wlp = $('select[ng-model="item.wishlistpriority"]');
    wlp.val('number:' + level);
    // noinspection JSUnresolvedFunction
    wlp.trigger('input');
    wlp.trigger('change');
    // noinspection JSUnresolvedFunction, JSUnresolvedVariable, ChainedFunctionCallJS, SpellCheckingInspection
    unsafeWindow.jQuery('select[ng-model="item.wishlistpriority"]').change();  // GM location hack
}

function openBoxFor(callback, timeout) {
    $('.toolbar-actions .toolbar-action:first .hidden-xs')[0].click();
    let editButton = $('.collection-dropdown-edit')[0] || '';
    if (editButton) {
        editButton.click();
    }
    waitForEl(
        '.media-body',
        function () {
            $('.media-body')[0].click();
            callback();
        },
        timeout
    )
}

function saveBox() {
    $('button[ng-disabled="editctrl.saving"]')[0].click();
}

function cancelBox() {
    $('button[ng-click="$dismiss()"]')[0].click();
}

function wishlist(level) {
    const timeout = 3000;
    openBoxFor(
        function () {
            if (1 === getCheckboxValue(1)) {  // Owned
                cancelBox();
                alert("Can't wishlist an owned item via hotkeys.");
            } else {
                setCheckboxValue(8, 1);  // Wishlist
                setWishlistPriority(level);  // Wishlist priority
                setCheckboxValue(6, 1 >= level ? 1 : 0);  // Want to Buy
                setCheckboxValue(5, 2 >= level ? 1 : 0);  // Want in Trade
                setCheckboxValue(4, 3 >= level ? 1 : 0);  // Want to Play
                saveBox();
            }
        },
        timeout
    );
}

function keyPress(e) {
    let evtObj = window.event ? window.event : e;
    if (evtObj.ctrlKey && !evtObj.altKey && !evtObj.shiftKey) {  // Ctrl + <something>
        if (KEY_1 === evtObj.keyCode || KEY_1 === evtObj.which) {  // 1
            wishlist(1);
        }
        else if (KEY_2 === evtObj.keyCode || KEY_2 === evtObj.which) {  // 2
            wishlist(2);
        }
        else if (KEY_3 === evtObj.keyCode || KEY_3 === evtObj.which) {  // 3
            wishlist(3);
        }
        else if (KEY_4 === evtObj.keyCode || KEY_4 === evtObj.which) {  // 4
            wishlist(4);
        }
        else if (KEY_5 === evtObj.keyCode || KEY_5 === evtObj.which) {  // 5
            wishlist(5);
        }
    }
}

let origKeyDown = document.onkeydown;
document.onkeydown = function(e) {
    keyPress(e);
    origKeyDown(e);
};
