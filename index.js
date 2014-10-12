
/**
 * Module dependencies.
 */

var Canvas = require('canvas')
  , canvas = new Canvas(1918, 2296)
  , Image = Canvas.Image
  , Font = Canvas.Font
  , ctx = canvas.getContext('2d')
  , fs = require('fs')
  , path = require("path")
  , im = require('gm').subClass({imageMagick: true});

if (!Font) {
	throw new Error('Need to compile with font support');
}

function fontFile(name) {
	return path.join(__dirname, '/fonts/', name);
}

var simheiFont = new Font('simheiFont', fontFile('simhei.ttf'));

// Function for create the student card image
function createStudentCard(schoolName, studentName, serial, photoPath) {
	var canvas = new Canvas(1918, 2296);
	var ctx = canvas.getContext('2d');

	//ctx.patternQuality = "best";

	// set white background
	ctx.fillStyle = '#FFF'
	ctx.fillRect(0,0,1918,2296);
	ctx.save();

	// Set color to black
	ctx.fillStyle = '#000'
	ctx.save();

	ctx.addFont(simheiFont);	

	// #1: School name text
	ctx.font = 'normal normal 50px simheiFont';
	ctx.fillText(schoolName, 450, 135+174);

	// #2: Student photo 
	var photo = fs.readFileSync(photoPath);
	img = new Image;
	img.src = photo;
	ctx.drawImage(img, 464, 389, img.width *4 , img.height*4 );

	// #3: Student name text
	ctx.font = 'normal normal 125px simheiFont';
	ctx.fillText('姓名：  ' + studentName , 450, 1837+125);

	// #4: Student serial number
	ctx.font = 'normal normal 125px simheiFont';
	ctx.fillText('序号：  ' + serial, 450, 2036+125);

	var out = fs.createWriteStream(__dirname + '/' + serial + '_' + studentName + '.png');

	var stream = canvas.createPNGStream();

	// var stream = canvas.createJPEGStream({
	//	  bufsize : 4096,
	//	  quality : 95
	//  });

	stream.on('data', function(chunk){
	  out.write(chunk);
	});
}

var testPath = __dirname + '/images/陈潇璇.jpg';

createStudentCard('南宫第一小学', '张三', '080132', testPath);

//var input_img = __dirname + '/result.png';
var input_img = __dirname + '/font.png';
var output_img = __dirname + '/converted.jpg';


//output all available image properties
im(input_img)
	.identify(function (err, data) {
		if (!err) 
			console.log(data);
		else
			console.log(err);
	});

/*
im(input_img)
	.units('PixelsPerInch')
	.density(1200,1200)
//	.resize(100,100)
	.write('resized.jpg', function (error) {
		if (error) return console.dir(arguments);
		console.log(this.outname + "created :: " + arguments[3])
	});
*/

//convert -units PixelsPerInch input.jpg -density 1200 output.jpg
// convert input.jpg -density 1200 output.jpg
