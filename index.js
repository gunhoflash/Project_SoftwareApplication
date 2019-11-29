const express = require('express');
const multer  = require('multer');
const upload  = multer({ dest: 'uploads/' });
const community = require('./core/community');
const core    = require('./core/core');
const modularity = require('./core/modularity');
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
		
		let result = core.parseTextGraph(text); // nodes and edges are in here

		result.numberOfNodes          = result.nodes.length;
		result.numberOfEdges          = result.edges.length;

		result.nodeSizeNeighborArray  = core.getNodeSizeNeighborArray(result.edges);
		result.nodeSizeArray          = core.getNodeSizeArray(result.edges);

		result.modularity_edge_before = modularity.getModularityByEdgeCommunities([result.edges]);
		result.modularity_node_before = modularity.getModularityByNodeCommunities([result.nodes], result.nodeSizeArray, result.edges);

		console.log(`nodes.length: ${result.nodes.length}`);
		let communitized = community.findCommunities(result.nodes, result.edges,
			result.nodeSizeArray, result.nodeSizeNeighborArray);

		console.log(`nodes.length: ${result.nodes.length}`);
		result.edges                  = communitized.edges;
		result.numberOfEdges          = result.edges.length;
		result.nodeSizeNeighborArray  = communitized.nodeSizeNeighborArray;
		result.nodeSizeArray          = communitized.nodeSizeArray;
		result.modularity_node        = communitized.modularity;

		result.d3data                 = core.getD3(result.edges, result.nodeSizeNeighborArray);

		result.density                = 2 * result.numberOfEdges / (result.numberOfNodes * (result.numberOfNodes - 1));


		//우빈 중간결과 확인용
		result.pageRank_Array         = core.pageRank(text, 0.0001);
		result.HITS_Array             = core.HITS(text, 0.0001);
		
		// TODO: count the number of networks

		console.log(`end analysis`);
		resolve(result);
	});

// delete all files in the upload folder
core.clearFolder('uploads');

// start server
server.listen(3344);
console.log(`server listen 127.0.0.1:3344`);
