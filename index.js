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
			graphArray:    result.graphArray,
			d3data:        result.d3data,
			numberOfNodes: result.nodeSizeArray.length,
			numberOfEdges: result.graphArray.length
			// TODO: count the number of networks
		});
	}, err => {
		console.log(err);
		res.json({
			graphArray: null,
			d3data:     null,
			numberOfNodes: null,
			numberOfEdges: null
		});
	});
});

analysis = text =>
	new Promise((resolve, reject) => {
		console.log(`analysis`);
		
		//우빈 중간결과 확인용
		var pageRank_Array = core.pageRank(text, 0.0001);

		let result = {};
		result.graphArray            = core.getArray(text);
		result.nodeSizeNeighborArray = core.getNodeSizeNeighborArray(result.graphArray);
		result.nodeSizeArray         = core.getNodeSizeArray(result.graphArray);
		result.d3data                = core.getD3(result.graphArray, result.nodeSizeNeighborArray);

		resolve(result);
	});

server.listen(3344);
console.log(`server listen 127.0.0.1:3344`);