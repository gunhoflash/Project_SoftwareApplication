const express = require('express');
const core = require('./core/core');
const app = express();

let url;
let splitby;
let graphArray;
let nodeSizeArray;
let nodeSizeNeighborArray;
let d3data;

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
		dots: nodeSizeArray.length
	});
});

url     = './data/nodes1000.txt';
splitby = '	';

graphArray            = core.getArray(core.getTextArray(url), splitby);
nodeSizeNeighborArray = core.getNodeSizeNeighborArray(graphArray);
nodeSizeArray         = core.getNodeSizeArray(graphArray);
d3data                = core.getD3(graphArray, nodeSizeNeighborArray);

server.listen(3344);
console.log(`server listen 127.0.0.1:3344`);
console.log(`${nodeSizeNeighborArray.length} nodes`);

//우빈 중간결과 확인용
var pageRank_Array=core.pageRank(url);