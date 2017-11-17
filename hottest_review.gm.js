// ==UserScript==
// @name        collection video review
// @namespace   bgg
// @description video review button on the collection button
// @include     https://boardgamegeek.com/
// @version     1
// @grant       none
// ==/UserScript==

var buttonBoxClassName = 'review_buttons_GREASEMONKEY';

function serialize(obj) {
  var str = [];
  for(var p in obj)
    str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
  return str.join("&");
}

function video_url(video) {
  var url = 'https://'
  if (video.videohost == 'youtube' ) {
    url += 'youtu.be'
  } 
  else if (video.videohost == 'vimeo' ) {
    url += 'vimeo.com'
  } else {
    console.log('Unknown video host: ' + video.videohost)
  }
  url += '/'
  url += video.extvideoid;
  
  return url;
}

function video_image(video) {
  if (video.videohost == 'youtube' ) {
    return "https://youtube.com/favicon.ico"
  } 
  else if (video.videohost == 'vimeo' ) {
    return 'https://vimeo.com/favicon.ico'
  } else {
    console.log('Unknown video host: ' + video.videohost)
  }  
}

function add_video_box(box){
    
    var objectid = box.getElementsByTagName('a')[0].href.split('/')[4];
    var hotVideo = hottest_review(objectid);
    
    if (hotVideo) {
    
      var reviewButtonBox = document.createElement('span');
      reviewButtonBox.className = buttonBoxClassName;

      var hotButton = document.createElement('a');
      hotButton.href = video_url(hotVideo);
      hotButton.target = '_blank';

      var hotButtonImage = document.createElement('img');
      hotButtonImage.src = video_image(hotVideo);
      hotButtonImage.alt = 'Hottest'
      hotButtonImage.height = 16;
      hotButtonImage.width = 16;

      hotButton.append(hotButtonImage);

      reviewButtonBox.append(hotButton);

      box.children[box.children.length-1].append(reviewButtonBox);
      
    }
}

function review_buttons() {
  // clear all
  review_button_boxes = document.getElementsByClassName(buttonBoxClassName)
  while(review_button_boxes.length > 0) {
    review_button_boxes[0].parentNode.removeChild(review_button_boxes[0]);
  };
  
  // add all on search or collection page 
  nameboxes = document.getElementsByClassName('collection_objectname');
  Array.prototype.forEach.call(nameboxes, add_video_box);
  
  // add all on creator page
  nameboxes = document.getElementsByClassName('geekitem_linkeditems_title');
  Array.prototype.forEach.call(nameboxes, add_video_box);  
}

function hottest_review(objectid) {

  var payload = {
    'ajax': 1,
    'nosession': 1,
    'objectid': objectid,
    'objecttype': 'thing',
    'showcount': 1,
    'sort': 'hot'
  }

  var url = 'https://boardgamegeek.com/api/videos?' + serialize(payload);

  var xhttp = new XMLHttpRequest();
  xhttp.open("GET", url, false);
  xhttp.setRequestHeader("Content-type", "application/json");
  xhttp.send();
  
  var video = JSON.parse(xhttp.response).videos[0];
  
  return video;
}

function KeyPress(e) {
      var evtobj = window.event? event : e
      if ((evtobj.keyCode == 89 || evtobj.which == 89) && evtobj.ctrlKey) review_buttons();
}

document.onkeydown = KeyPress;


