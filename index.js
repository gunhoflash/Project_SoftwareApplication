const express = require('express');
const multer  = require('multer');
const upload  = multer({ dest: 'uploads/' });
const core    = require('./core/core');
const app     = express();

var server = require('http').createServer(app);

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(express.static('public'));

app.locals.pretty = true;

app.get('/', (req, res) => {
	res.render('d3');
});

// get uploaded file or text and return analyzed data
app.post('/upload', upload.single('input_file'), (req, res) => {

	let text = null;
	     if (req.file && req.file.path) text = core.getText(req.file.path);
	else if (req.body.input_text)       text = req.body.input_text;

	analysis(text)
	.then(result => {
		res.json({
			result: result
		});
	}, err => {
		console.log(err);
		res.json({
			result: null
		});
	});
});

analysis = text =>
	new Promise((resolve, reject) => {
		console.log(`analysis`);
		
		//우빈 중간결과 확인용
		//var pageRank_Array = core.pageRank(text, 0.0001);
		var HITS_Array=core.HITS(text, 0.0001);

		let result = {};

		result.graphArray            = core.getArray(text);
		result.nodeSizeNeighborArray = core.getNodeSizeNeighborArray(result.graphArray);
		result.nodeSizeArray         = core.getNodeSizeArray(result.graphArray);
		result.d3data                = core.getD3(result.graphArray, result.nodeSizeNeighborArray);
		
		result.numberOfNodes         = result.nodeSizeArray.length;
		result.numberOfEdges         = result.graphArray.length;
		result.density               = result.numberOfEdges / result.numberOfNodes / (result.numberOfNodes - 1) * 2;
		result.HITS_Array            = HITS_Array;
		
		// TODO: count the number of networks
		
		resolve(result);
	});

server.listen(3344);
console.log(`server listen 127.0.0.1:3344`);