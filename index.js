const express = require('express');
const multer  = require('multer');
const upload  = multer({ dest: 'uploads/' });
const community = require('./core/community');
const core    = require('./core/core');
const d3data  = require('./core/d3data');
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

	let radio_group = parseInt(req.body.radio_group);
	let radio_node = parseInt(req.body.radio_node);
	let radio_edge = parseInt(req.body.radio_edge);

	// analyze text
	analysis(text, radio_group, radio_node, radio_edge)
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

analysis = (text, radio_group, radio_node, radio_edge) =>
	new Promise((resolve, reject) => {
		console.log(`start analysis`);
		if (!text) return reject(`invalid input to analyze`);
		
		let result = core.parseTextGraph(text); // nodes and edges are in here
		console.log(`result initialized: ${result}`);

		result.numberOfNodes          = result.nodes.length;
		result.numberOfEdges          = result.edges.length;

		result.nodeSizeNeighborArray  = core.getNodeSizeNeighborArray(result.edges);
		result.nodeSizeArray          = core.getNodeSizeArray(result.edges);

		result.pageRank_Array         = core.pageRank(result.nodeSizeArray, result.nodeSizeNeighborArray, 0.0001);
		result.HITS_Array             = core.HITS(text, 0.0001);
		// community.Louvain(result);

		result.deleted_edges = [];
		switch (radio_group) {
			// Girvan Newman
			case 2:
			case 3:
			case 4:
				let unlink_step_size;
				if (radio_group == 2) unlink_step_size = 1;
				if (radio_group == 3) unlink_step_size = 4;
				if (radio_group == 4) unlink_step_size = 'AUTO';
				let girvan_newman = community.findCommunities(
					result.nodes, result.edges,
					result.nodeSizeArray, result.nodeSizeNeighborArray,
					result.pageRank_Array, unlink_step_size);
				result.graph         = girvan_newman.graph;
				result.deleted_edges = girvan_newman.deleted_edges;
				break;
			// Label Propagation
			case 5:
				result.graph = community.labelPropagation(result.numberOfNodes, result.nodeSizeNeighborArray);
				break;

			// (None)
			case 1:
			default:
				result.graph = [result.nodes];
				break;
		}

		let nodeSizes;
		switch (radio_node) {
			case 2:          nodeSizes = result.pageRank_Array;     break;
			case 3:          nodeSizes = result.HITS_Array['hubs']; break;
			case 1: default: nodeSizes = result.nodeSizeArray;      break;
		}

		result.modularity          = modularity.getModularity(result.graph, result.nodeSizeArray, result.edges);
		result.numberOfCommunities = result.graph.length;
		result.density             = 2 * result.numberOfEdges / (result.numberOfNodes * (result.numberOfNodes - 1));

		result.d3data                 = d3data.getD3(result.graph, result.edges, result.deleted_edges, nodeSizes, result.nodeSizeNeighborArray);
		result.maxSizeOfCommunities   = community.maxSizeOfCommunities(result.graph);
		console.log(`end analysis`);
		resolve(result);
	});

// delete all files in the upload folder
core.clearFolder('uploads');

// start server
server.listen(3344);
console.log(`server listen 127.0.0.1:3344`);
