var webpage = require('webpage').create();

webpage
    .open("./index.html")
    .then(function(){

	webpage.viewportSize =
	    { width:600, height:1500 };
	slimer.wait(5000);
	webpage.render("index.html.png",
		       {onlyViewport:true});
	slimer.exit();
    });

