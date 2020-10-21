"use strict";
// ==UserScript==
// @name        bgg contest
// @namespace   bgg
// @version     1.1
// @description bgg contest autofill
// @match       https://*.boardgamegeek.com/thread/*
// @match       https://boardgamegeek.com/thread/*
// @author      masu
// @grant       GM_addStyle
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
  let aContest = null;
  let aAutofill = null; 
  var checkExist = setInterval(function() {
   aContest = document.querySelector("a[href*=\"https://www.boardgamegeek.com/contest/\"]");
   if (aContest != null) {
    console.log("Found a contest link...");
    var checkExist2 = setInterval(function() {
     aAutofill = document.querySelector('#autofill');
     if (null == aAutofill) {
       console.log("Adding autofill link...");
       aAutofill = document.createElement('a');
       aAutofill.className = 'postlink';
       aAutofill.text = 'Autofill Now!';
       aAutofill.id = 'autofill';
       let divAutofill = document.createElement('div');
       divAutofill.id = 'autofill_view';
       aContest.parentElement.appendChild(document.createElement('br'));
       aContest.parentElement.appendChild(aAutofill);
       aContest.parentElement.appendChild(document.createElement('br'));
       aContest.parentElement.appendChild(divAutofill);
       aAutofill.onclick = function() {
         autofill(aContest.href + '/questions');
       };
     } else {
      { clearInterval(checkExist2) }
     }
    }, 100)
    clearInterval(checkExist);
   }
  }, 100);
}

append();