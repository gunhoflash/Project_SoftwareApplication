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

	let text = req.body.input_text;
	let path = req.file ? req.file.path : null;
	if (path) text = core.getText(path);

	// analyze text
	analysis(text)
	.then(result => {
		res.json({ result: result });
	}, err => {
		console.log(err);
		res.json({ result: null });
	})
	.then(() => {
		// delete uploaded file
		if (!path) return;
		console.log(`remove file: ${path}`);
		core.deleteFile(path);
	});
});

analysis = text =>
	new Promise((resolve, reject) => {
		console.log(`start analysis`);
		if (!text) return reject(`invalid input to analyze`);
		
		let result = {};

		result.graphArray            = core.getArray(text);
		result.nodeSizeNeighborArray = core.getNodeSizeNeighborArray(result.graphArray);
		result.nodeSizeArray         = core.getNodeSizeArray(result.graphArray);
		result.d3data                = core.getD3(result.graphArray, result.nodeSizeNeighborArray);

		result.numberOfNodes         = result.nodeSizeArray.length;
		result.numberOfEdges         = result.graphArray.length;
		result.density               = result.numberOfEdges / result.numberOfNodes / (result.numberOfNodes - 1) * 2;

		//우빈 중간결과 확인용
		result.pageRank_Array        = core.pageRank(text, 0.0001);
		result.HITS_Array            = core.HITS(text, 0.0001);
		
		// TODO: count the number of networks

		console.log(`end analysis`);
		resolve(result);
	});

// delete all files in the upload folder
core.clearFolder('uploads');

// start server
server.listen(3344);
console.log(`server listen 127.0.0.1:3344`);
