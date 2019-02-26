"use strict";
// ==UserScript==
// @name         bgg contest
// @namespace    bgg
// @version      1.1
// @description  bgg contest autofill
// @match        https://*.boardgamegeek.com/thread/*
// @match        https://boardgamegeek.com/thread/*
// @author       masu
// @grant        GM_addStyle
// ==/UserScript==

function parseAnswer(radioButton) {
    let text = radioButton.nextSibling.textContent.trim();
    // noinspection JSValidateTypes
    text = text.split(')');
    return {
        'radio': radioButton,
        'id': text.shift().trim(),
        'text': text.join(')').trim(),
    }
}

function parseQuestion(box) {
    let question = box.firstChild.textContent.trim();
    let answers = Array.from(box.querySelectorAll('input')).map(parseAnswer);
    // noinspection JSValidateTypes
    question = question.split(':');
    return {
        'question_id': question.shift().trim(),
        'question': question.join(':').trim(),
        'answers': answers,
    }
}

function parseQuestions(response) {
    let page = document.querySelector('#autofill_view');
    // noinspection InnerHTMLJS
    page.innerHTML = response;
    let boxes = Array.from(page.querySelectorAll('.question'));
    return {
        'questions': boxes.slice(1).map(parseQuestion),
        'submit': page.querySelector('input[type="submit"]'),
        'links': Array.from(boxes[0].querySelectorAll('a')).map((a) => (a.href)),
    };
}

function autofill(url) {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.setRequestHeader('Content-type', 'text/html');
    xhr.onload = function() {
        let form = parseQuestions(xhr.response);
        randomFill(form);
    };
    xhr.send();
}

function randomFill(form) {
    form.questions.map(
        (question) => (
            question.answers[Math.floor(Math.random()*question.answers.length)].radio.click()
        )
    );
    form.submit.click();
}

function append() {
    let aContest = document.querySelector('a[href="/user/BGG Contest"]');
    if (null == aContest) {
        aContest = document.querySelector('a[href="/user/chaddyboy_2000"]');
        if (null == aContest) {
            return;
        }
    }
    let as = (
        aContest.parentElement.parentElement.parentElement.nextElementSibling
    ).querySelectorAll('a[class="postlink"][target="_blank"][rel="nofollow"]');
    let aEnter = as[as.length - 1];
    if (null == aEnter) {
        return;
    }
    let aAutofill = document.querySelector('#autofill');
    if (null == aAutofill) {
        aAutofill = document.createElement('a');
        aAutofill.className = 'postlink';
        aAutofill.text = 'Autofill Now!';
        aAutofill.id = 'autofill';
        let divAutofill = document.createElement('div');
        divAutofill.id = 'autofill_view';
        aEnter.parentElement.appendChild(document.createElement('br'));
        aEnter.parentElement.appendChild(aAutofill);
        aEnter.parentElement.appendChild(document.createElement('br'));
        aEnter.parentElement.appendChild(divAutofill);
    }
    aAutofill.onclick = function() {
        autofill(aEnter.href + '/questions');
    };
}

append();
