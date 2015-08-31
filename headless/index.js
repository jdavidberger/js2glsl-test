var webpage = require('webpage').create();

var fs = require('fs'); 
var files = fs.list("headless");

var htmlFiles = [];
files.forEach(function(path) {
    if(path.endsWith(".html"))
	htmlFiles.push(path); 
});

function next() {
    if(htmlFiles.length == 0){
	slimer.exit()
	return;
    }
    var path = htmlFiles.pop();
    webpage
	.open("./headless/"+path) // loads a page
	.then(function(){ // executed after loading
	    // store a screenshot of the page
	    webpage.viewportSize =
		{ width:1525, height:325 };
	    webpage.render("test_images/" + path + '.png',
			   {onlyViewport:true});
	    next();
	});
}

next();
