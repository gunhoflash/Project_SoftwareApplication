const express = require('express');
const multer  = require('multer');
const upload  = multer({ dest: 'uploads/' });
const core    = require('./core/core');
const app     = express();

let graphArray            = null;
let nodeSizeArray         = null;
let nodeSizeNeighborArray = null;
let d3data                = null;

var server = require('http').createServer(app);

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(express.static('public'));

app.locals.pretty = true;

app.get('/', (req, res) => {
	res.render('d3');
});

app.get('/data', (req, res) => {
	res.json({
		graphArray: graphArray,
		d3data: d3data,
		dots: nodeSizeArray ? nodeSizeArray.length : null
	});
});

// get uploaded file or text and analyze that
app.post('/upload', upload.single('input_file'), function (req, res, next) {
	     if (req.file && req.file.path) loadUploadedfile(req.file.path);
	else if (req.body.input_text)       analysis(req.body.input_text);

	res.json({
		result: 1
	});
});

loadUploadedfile = url => {

	console.log(`loadUploadedfile`);
	
	//우빈 중간결과 확인용
	var pageRank_Array = core.pageRank(url, 0.0001);

	analysis(core.getText(url));
};
analysis = text => {

	console.log(`analysis`);

	graphArray            = core.getArray(text);
	nodeSizeNeighborArray = core.getNodeSizeNeighborArray(graphArray);
	nodeSizeArray         = core.getNodeSizeArray(graphArray);
	d3data                = core.getD3(graphArray, nodeSizeNeighborArray);
};

server.listen(3344);
console.log(`server listen 127.0.0.1:3344`);