// ==UserScript==
// @name         bgg wishlist
// @namespace    bgg
// @version      1.0
// @description  puts the boardgame viewed on the wishlists respective category
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
// Ctrl+4        Wishlist 4, Want to Play
// Ctrl+5        Wishlist 5
// ==/KeyCodes==


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
    var model = {
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
    var wlp = $('select[ng-model=\"item.wishlistpriority\"]');
    wlp.val('number:' + level);
    // noinspection JSUnresolvedFunction
    wlp.trigger('input');
    wlp.trigger('change');
    // noinspection JSUnresolvedFunction, JSUnresolvedVariable, ChainedFunctionCallJS, SpellCheckingInspection
    unsafeWindow.jQuery('select[ng-model=\"item.wishlistpriority\"]').change();  // GM location hack
}

function openBoxFor(callback) {
    $('.toolbar-actions .toolbar-action:first .hidden-xs')[0].click();
    var editButton = $('.collection-dropdown-edit')[0] || '';
    if (editButton) {
        editButton.click();
    }
    waitForEl(
        '.media-body',
        function () {
            $('.media-body')[0].click();
            callback();
        },
        2000
    )
}

function saveBox() {
    $('button[ng-disabled="editctrl.saving"]')[0].click();
}

function cancelBox() {
    $('button[ng-click="$dismiss()"]')[0].click();
}

function wishlist(level) {
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
                setCheckboxValue(4, 4 >= level ? 1 : 0);  // Want to Play
                saveBox();
            }
        }
    );
}

function keyPress(e) {
    "use strict";

    var evtObj = window.event ? event : e;
    if      ((49 === evtObj.keyCode || 49 === evtObj.which) && evtObj.ctrlKey && !evtObj.altKey && !evtObj.shiftKey) wishlist(1);
    else if ((50 === evtObj.keyCode || 50 === evtObj.which) && evtObj.ctrlKey && !evtObj.altKey && !evtObj.shiftKey) wishlist(2);
    else if ((51 === evtObj.keyCode || 51 === evtObj.which) && evtObj.ctrlKey && !evtObj.altKey && !evtObj.shiftKey) wishlist(3);
    else if ((52 === evtObj.keyCode || 52 === evtObj.which) && evtObj.ctrlKey && !evtObj.altKey && !evtObj.shiftKey) wishlist(4);
    else if ((53 === evtObj.keyCode || 53 === evtObj.which) && evtObj.ctrlKey && !evtObj.altKey && !evtObj.shiftKey) wishlist(5);

}

document.onkeydown = keyPress;
