"use strict";
// ==UserScript==
// @name         bgg tools
// @namespace    bgg
// @version      1.0
// @description  bgg tool scripts
// @match        https://*.boardgamegeek.com/*
// @match        https://boardgamegeek.com/*
// @author       masu
// @grant        GM_addStyle
// ==/UserScript==

// noinspection JSUnusedGlobalSymbols
function collectionValue() {
    /**
     * Calculates the value of a collection
     */
    return Array.from(
        document.getElementsByClassName('collectiontable_ownership')
    ).filter(
        (box) => (4 <= box.getElementsByTagName('td').length) || console.log(box.textContent.trim())
    ).map(
        (box) => ([box.getElementsByTagName('td')[1].textContent, box.getElementsByTagName('td')[3].textContent])
    ).map(
        (values) => ({'Paid': parseFloat(values[0]), 'Current': parseFloat(values[1])})
    ).reduce(
        (value1, value2) => ({'Paid': value1['Paid'] + value2['Paid'], 'Current': value1['Current'] + value2['Current']})
    );
}

// noinspection JSUnusedGlobalSymbols
function openLast(num) {
    /**
     * Opens the last num items in a page from a collection
     */
    let array = Array.from(document.getElementsByClassName('collection_objectname'));
    array.slice((array.length>=num) ? array.length - num : 0).map((box) => (window.open(box.getElementsByTagName('a')[0].href, '_blank')));
}

// noinspection JSUnusedGlobalSymbols
function previewProcess() {
    /**
     * Processes event preview lists wrt wishlist priority
     */
    const priorities = {
        'Must have': 1,
        'Love to have': 2,
        'Like to have': 3,
        'Thinking about it': 4,
        'Don\'t buy this': 5,
    };
    // noinspection JSCheckFunctionSignatures
    (
        Array
            .from(document.querySelectorAll('dt'))
            .filter((box) => (box.textContent.match('\\s*Wishlist\\s*Priority\\s*')))
            .map(function(box) {
                let priority = parseInt(priorities[box.nextElementSibling.textContent.trim()]);
                let buttons = (
                    box.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement
                        .parentElement.parentElement.children[2].firstElementChild.firstElementChild
                );
                switch(priority) {
                    case 1:
                        buttons.children[0].click();
                        break;
                    case 2:
                    case 3:
                        buttons.children[1].click();
                        break;
                    case 4:
                        buttons.children[2].click();
                        break;
                    case 5:
                        buttons.children[3].click();
                        break;
                    default:
                        console.log(box);
                }
            })
    );
}