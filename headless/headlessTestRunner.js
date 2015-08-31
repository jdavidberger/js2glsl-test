var js2glsl = require("js2glsl");
var $ = require("jquery"); 

var spec = new js2glsl.ShaderSpecification(); 

spec.VertexPosition = function() {
    this.varyings.texCoord = [ this.attributes.position[0] / 2 + 0.5,
			       this.attributes.position[1] / 2 + 0.5 ]; 
    return this.attributes.position; 
}

$(function() {

    var width = 500;
    var height = 300; 

    var body = $("body")[0];
    var canvas3d = $("<canvas />").appendTo(body)[0]; 
    var canvas2d = $("<canvas />").appendTo(body)[0]; 
    var canvasDiff = $("<canvas />").appendTo(body)[0]; 

    $(canvas2d).css("padding-left", "2px");
    $(canvas2d).css("padding-right", "2px");
    canvasDiff.width = canvas3d.width = canvas2d.width = width;
    canvasDiff.height = canvas3d.height = canvas2d.height = height;

    var gl = canvas3d.getContext("experimental-webgl",  {preserveDrawingBuffer: true}) || canvas.getContext('webgl',  {preserveDrawingBuffer: true});

    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    setup(gl, spec); 

    var program = spec.GetProgram(gl); 

    gl.useProgram(program);


    var posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    var vertices = [ -1, -1,
		      1, -1,
		     -1,  1,
		      1,  1 ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.enableVertexAttribArray(gl.getAttribLocation(program, "position"));
    gl.vertexAttribPointer( gl.getAttribLocation(program, "position"), 2, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4 );

    js2glsl.drawToCanvas(canvas2d, "TRIANGLES", spec, vertices, spec.uniforms); 

    var glBuffer = new Uint8Array(width*height*4); 
    gl.readPixels(0,0,width,height, gl.RGBA, gl.UNSIGNED_BYTE, glBuffer);

    var ctx2d = canvas2d.getContext("2d");
    var img2d = ctx2d.getImageData(0, 0, width, height); 

    var ctx = canvasDiff.getContext("2d");
    var img = ctx.createImageData(width,height); 
    for(var x = 0;x < width;x++){
	for(var y = 0;y < height;y++) {
	    var idx3d = (x + (height-y-1) * width) * 4; 
	    var idx2d = (x + (y) * width) * 4; 
	    for(var c = 0;c < 4;c++) {
		var d = Math.abs(glBuffer[idx3d+c] - img2d.data[idx2d+c]);
		img.data[idx2d+c] = 255-d;
	    }
	    img.data[idx2d] -= (255-img.data[idx2d+3]);
	    img.data[idx2d+3] = 255;
	}
    }
    ctx.putImageData(img, 0, 0);     
    
}); 


module.exports = js2glsl; 
