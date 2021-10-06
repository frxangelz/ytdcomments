/*
	Delete all your comments on youtube
	(c) 2021 - FreeAngel 
		
		youtube channel : http://www.youtube.com/channel/UC15iFd0nlfG_tEBrt6Qz1NQ
		PLEASE SUBSCRIBE !
		
	github : https://github.com/frxangelz/
*/

const _MAX_DELETE_TO_RELOAD = 20; // will reload page after certain amount of deletions
const _TIMEOUT_IN_SECS = 60;
const _COMMENTS_PAGE = "https://myactivity.google.com/page?utm_source=my-activity&hl=en&page=youtube_comments";
const _DEFAULT_WAIT_TIME = 5;

tick_count = 0;
first = true;
delete_count = 0;

var CurActionUrl = "";

var config = {
	enable : 0,
	total : 0
}

var wait_time = _DEFAULT_WAIT_TIME;

var click_count = 0;

function clog(s){

		chrome.runtime.sendMessage({action:"log", log: s});
}

var simulateMouseEvent = function(element, eventName, coordX, coordY) {
	element.dispatchEvent(new MouseEvent(eventName, {
	  view: window,
	  bubbles: true,
	  cancelable: true,
	  clientX: coordX,
	  clientY: coordY,
	  button: 0
	}));
  };
  
  function click(btn){
	  var box = btn.getBoundingClientRect(),
		  coordX = box.left + (box.right - box.left) / 2,
		  coordY = box.top + (box.bottom - box.top) / 2;
		  
	  btn.focus();
	  simulateMouseEvent(btn,"mousemove",coordX,coordY);
	  simulateMouseEvent(btn,"mousedown",coordX,coordY);
	  setTimeout(function(){
		  simulateMouseEvent(btn,"click",coordX,coordY);
		  simulateMouseEvent(btn,"mouseup",coordX,coordY);
	  },200);
  }

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {

    if (request.action === "set") {
		config.enable = request.enable;
		tick_count = 0;
		
		if(!config.enable){
			var info = document.getElementById("info_ex");
			if(info) {
				console.log("removed");
				info.parentNode.removeChild(info);
			}
			first = true;
		}		
	}
	
});

function show_info(){

	var info = document.getElementById("info_ex");
	if(!info) {
	
		info = document.createElement('div');
		info.style.cssText = "position: fixed; bottom: 0; width:100%; z-index: 999;background-color: #F5FACA; border-style: solid;  border-width: 1px; margins: 5px; paddingLeft: 10px; paddingRight: 10px;";
		info.innerHTML = "<center><h3 id='status_ex'>active</h3></center>";
		info.id = "info_ex";
		document.body.appendChild(info);
		console.log("info_ex created");
	}
}

function info(txt){

	var info = document.getElementById("status_ex");
	if(!info) { return; }
	if(txt !== ""){	info.textContent = "Deleted : "+config.total+", "+txt; }
	else { info.textContent = "Deleted : "+config.total; }
}

// ini pertama kali biasanya muncul
function DeleteFromDialogOpen(){
	
	var dlg = document.querySelector('div[jscontroller="N5Lqpc"]');
	if(!dlg) { return; }
	var btns = dlg.querySelectorAll('div[role="button"]');
	for(i=0; i<btns.length;i++){

		if (btns[i].textContent == "Delete") {
			btns[i].click();
			wait_time = _DEFAULT_WAIT_TIME;
			break;
		}
	}
}

function GotIt(){
	
	var btns = document.querySelectorAll('span[jsname="V67aGc"]');
	if(!btns) { return; }
	for(i=0; i<btns.length;i++){

		if (btns[i].textContent === "Got it") {
			btns[i].click();
			wait_time = _DEFAULT_WAIT_TIME;
			break;
		}
	}
}

function DeleteTopComment(){

	wait_time = _DEFAULT_WAIT_TIME;
	var section = document.querySelector('div[jsname="MFYZYe"]');
	if(!section) { return false; }
	var btn = section.querySelector("button.eT1oJ");
	if(!btn) { return false; }
	btn.click();	
	chrome.runtime.sendMessage({action:"inc"},function(response){
		config.total = response.total;
	})
	
	delete_count++;
	return true;
}

var loading_tick_count = 0;

 	   var readyStateCheckInterval = setInterval(function() {
	       
		   if (document.readyState !== "complete") { return; }

		   if(first){
				first = false;
				chrome.runtime.sendMessage({action: "get"}, function(response){
	
					config.enable = response.enable;
					config.total = response.total;
				});
		   }

		   if(!config.enable) { return; }
		   
		   cur_url = //$(location).attr('href');		   
					 window.location.href;

           tick_count= tick_count+1; 

		   if(cur_url.indexOf("//myactivity.google.com/") === -1){
				return;
		   }

 		   show_info();
		   
		   if(wait_time > 0){
			    // sedang dalam proses menanti
				wait_time--;
				info("Wait for "+wait_time.toString()+"s");
				return;
		   }
		   
		   if(delete_count >= _MAX_DELETE_TO_RELOAD){
			   
			   window.location.href = _COMMENTS_PAGE;
			   return;
		   }

		   if(cur_url.indexOf("youtube_comments") === -1){
			   
			   window.location.href = _COMMENTS_PAGE;
			   return;
		   }
		   
		   if(DeleteTopComment()){
			   
			   DeleteFromDialogOpen();
			   GotIt();
		   }
		   
		   info("");
		   
	 }, 1000);

