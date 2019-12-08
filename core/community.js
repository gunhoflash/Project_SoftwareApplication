const ARRAY = require('./array');
const MODULARITY = require('./modularity');
const CORE = require('./core');
const EDGE = require('./edge');
const maximumModularityState = {
	graph: [],
	edges: [],
	modularity: 0,
	nodeSizeArray: [],
	nodeSizeNeighborArray: [],
	deleted_edges: []
};

/*
	nodes: [node, node, ..., node]
	edges: [edge, edge, ..., edge]
	node: i
	edge: [i, j]
*/
exports.findCommunities = (_nodes, _edges, _nodeSizeArray, _nodeSizeNeighborArray, _pageRank, unlink_step_size = 'AUTO') => {
	let nodes                 = ARRAY.clone_deep(_nodes);
	let edges                 = ARRAY.clone_deep(_edges);
	let nodeSizeArray         = ARRAY.clone_deep(_nodeSizeArray);
	let nodeSizeNeighborArray = ARRAY.clone_deep(_nodeSizeNeighborArray);
	let pageRank              = ARRAY.clone_deep(_pageRank);
	let deleted_edges         = [];

	let graph = [nodes];
	let modularity;
	let edge_deleted, edge_deleted_index, b;
	let step_counter;
	let i, j;
	let ind1, ind2;

	// calulate modularity and edge betweenesses
	modularity = MODULARITY.getImprovedModularity(graph, nodeSizeArray, edges);
	edges = EDGE.neighborhoods(edges, nodeSizeNeighborArray, pageRank);

	// save initial state
	saveState(graph, edges, modularity, nodeSizeArray, nodeSizeNeighborArray, deleted_edges);

	if (unlink_step_size == 'AUTO')
		unlink_step_size = parseInt(edges.length / 1000) + 1;

	console.log(`start communitization. step size: ${unlink_step_size}, init state:`);
	console.log(maximumModularityState);

	while (true) {
		//console.log(`communitizatiton`);
		//console.log(maximumModularityState);

		// break if there is no edge
		if (edges.length == 0) {
			console.log(`end communitization. final state:`);
			console.log(maximumModularityState);
			break;
		}

		step_counter = 0;

		// delete edges: {unlink_step_size} edges in 1 time
		while (step_counter < unlink_step_size) {
			
			step_counter++;

			// break if there is no edge
			if (edges.length == 0) {
				break;
			}

			// find the weakest edge
			edge_deleted = edges[0];
			edge_deleted_index = 0;
			for (i = 1; i < edges.length; i++) {
				if (edges[i][2] < edge_deleted[2]) {
					edge_deleted = edges[i];
					edge_deleted_index = i;
				}
			}

			// delete the weakest edge (update edges, nodeSizeArray, nodeSizeNeighborArray, graph)
			edges.splice(edge_deleted_index, 1);
			nodeSizeArray[edge_deleted[0]]--;
			nodeSizeArray[edge_deleted[1]]--;
			ind1 = nodeSizeNeighborArray[edge_deleted[0]].indexOf(edge_deleted[1]);
			ind2 = nodeSizeNeighborArray[edge_deleted[1]].indexOf(edge_deleted[0]);
			if (ind1 != -1) nodeSizeNeighborArray[edge_deleted[0]].splice(ind1, 1);
			if (ind2 != -1) nodeSizeNeighborArray[edge_deleted[1]].splice(ind2, 1);
			
			// update graph if the edge was only one that connect 2 communities.
			b = EDGE.hasPath(edge_deleted[0], edge_deleted[1], nodeSizeNeighborArray);
			if (b.result == false) {
				// divide a community into 2 communities.
				
				// find a community to divide
				for (i = 0; i < graph.length; i++) {
					if (graph[i].indexOf(edge_deleted[0]) >= 0) {
						// graph[i] is the community to divide
						// CHECK: is the communities are sorted?
						// suppose that the communities are not sorted
						for (j = 0; j < b.array.length; j++) {
							let index = graph[i].indexOf(b.array[j]);
							if (index >= 0) graph[i].splice(index, 1);
						}

						// push the divided community
						graph.push(b.array);
						community_divided = [i, graph.length - 1];
						//console.log(`The community ${i} divided into 2 communities: [${i}] and [${graph.length - 1}].`);
						break;
					}
					if (i == graph.length - 1) {
						throw Error(`There is no community that contains the node ${edge_deleted[0]}.`);
					}
				}
			} else community_divided = null;
		}

		// calculate new modularity
		modularity = MODULARITY.getImprovedModularity(graph, nodeSizeArray, edges);

		/*
			TODO: save the maximized-modularity status and loop it until
			it is clear that saved modularity is the global maximum.
		*/

		// re-calculate edge betweeness
		pageRank = CORE.pageRank(nodeSizeArray, nodeSizeNeighborArray, 0.0001);
		edges = EDGE.neighborhoods(edges, nodeSizeNeighborArray, pageRank, edge_deleted);

		deleted_edges.push(edge_deleted);

		// save if current state's modularity is higher than saved state
		if (maximumModularityState.modularity < modularity) {
			console.log(`new modularity! ${maximumModularityState.modularity} -> ${modularity}`);
			saveState(graph, edges, modularity, nodeSizeArray, nodeSizeNeighborArray, deleted_edges);
		}
	}

	return maximumModularityState;
};

saveState = (graph, edges, modularity, nodeSizeArray, nodeSizeNeighborArray, deleted_edges) => {
	maximumModularityState.graph                 = ARRAY.clone_deep(graph);
	maximumModularityState.edges                 = ARRAY.clone_deep(edges);
	maximumModularityState.modularity            = modularity;
	maximumModularityState.nodeSizeArray         = ARRAY.clone_deep(nodeSizeArray);
	maximumModularityState.nodeSizeNeighborArray = ARRAY.clone_deep(nodeSizeNeighborArray);
	maximumModularityState.deleted_edges         = ARRAY.clone_deep(deleted_edges);
};

exports.LinkCommunity =() =>{

};

// semi only
// refer to https://www.isislab.it/cordasco/papers/BASNA10/BASNA_pres.pdf from https://www.nature.com/articles/srep30750
exports.labelPropagation = (numberOfNodes, _nodeSizeNeighborArray) => {

	let i, j, k;
	let nodeSizeNeighborArray = ARRAY.clone_deep(_nodeSizeNeighborArray);

	let colors = [-1]; // colors[i] is the color of node-i
	let color_groups = []; // colors[i] is the array of nodes that has color-i
	
	let communites = []; // communites[i] is the community-ID of node-i

	/*
		coloring with bfs
	*/
	let opend = [0]; // array of opened nodes
	while (1) {
		let visit;
		if (opend.length > 0) {
			// select next nodes to visit
			visit = opend.shift();
		} else {
			// if node wasn't selected, find from colors[] == undefined
			for (i = 0; i < numberOfNodes; i++) {
				if (colors[i] == undefined) {
					// node found
					visit = i;
					break;
				}
			}
			if (i == numberOfNodes) {
				// node not found
				break;
			}
		}

		// set color of the node
		let neighborhoods = nodeSizeNeighborArray[visit];
		let color, bannedColors = [];
		for (i = 0; i < color_groups.length + 1; i++)
			bannedColors.push(0);
		// look neighbors
		for (i = 0; i < neighborhoods.length; i++) {
			color = colors[neighborhoods[i]]; // get a neighbors color
			if (color == undefined) {
				// open the neighbor
				opend.push(neighborhoods[i]);
				colors[neighborhoods[i]] = -1;
				continue;
			} else if (color < 0) continue; // opended neighbor
			bannedColors[color] = 1; // ban the color
		}

		// find a color not banned
		for (i = 0; i < bannedColors.length; i++) {
			if (bannedColors[i] == 0) {
				colors[visit] = i;
				if (i == bannedColors.length - 1) {
					// new color
					color_groups.push([visit]);
				} else {
					// existing color
					color_groups[i].push(visit);
				}
				break;
			}
		}
	}
	console.log(`all nodes was colored`);
	//console.log(colors);
	//console.log(color_groups);

	/*
		Initialize communities
	*/
	for (i = 0; i < numberOfNodes; i++) {
		communites[i] = i;
	}
	console.log(`all communities are initialized`);
	//console.log(communites);

	/*
		Start LPA
	*/
	let _numberOfCommunities = [];
	for (i = 0; i < numberOfNodes; i++)
	_numberOfCommunities[i] = 0;
	console.log(`start LPA`);
	while(1) {
		//console.log(`\n -- LPA --`);
		let convergence = true;
		// for all color groups
		for (i = 0; i < color_groups.length; i++) {
			// for all nodees in the group
			for (j = 0; j < color_groups[i].length; j++) {
				// get the major community of its neighbors
				let node = color_groups[i][j];
				let neighbors = nodeSizeNeighborArray[node];
				if (neighbors.length == 0) continue;

				///console.log(`node: ${node}`);

				let numberOfCommunities = _numberOfCommunities.slice();
				for (let neighbor of neighbors) {
					numberOfCommunities[communites[neighbor]]++;
				}

				// filter only major communities
				let majorNumber = 0;
				let majorCommunities = [];

				for (k = 0; k < numberOfCommunities.length; k++) {
					if (numberOfCommunities[k] > majorNumber) {
						majorNumber = numberOfCommunities[k];
						majorCommunities = [k];
					} else if (numberOfCommunities[k] == majorNumber) {
						majorCommunities.push(k);
					}
				}
				//console.log(`major communites:`);
				//console.log(majorCommunities);
				// select a random community among major communities
				majorCommunities = majorCommunities[parseInt(Math.random() * majorCommunities.length)];
				if (communites[node] != majorCommunities) {
					convergence = false;
					communites[node] = majorCommunities;
				}
			}
		}

		// check state converged
		if (convergence) break;
	}

	// make graph from communities
	let _graph = [];
	for (i = 0; i < communites.length; i++) {
		if (communites[i] > 0) {
			if (_graph[communites[i]] == undefined)
				_graph[communites[i]] = [];
			_graph[communites[i]].push(i);
		}
	}

	for (i = 0; i < _graph.length; i++) {
		if (_graph[i] == undefined) {
			_graph.splice(i, 1);
			i--;
		}
	}

	return _graph;
};

// MODULARITY.getImprovedModularity(graph, nodeSizeArray, edges)
exports.Louvain =(graph) =>{
	//사용할 변수, 리스트, 객체 세팅
	console.log("I'm in Louvain");
	/*----------------------------------------------------------------------------------------------------------------------------------------
	graph
		- nodes : 노드 번호 배열
		- edges : edge 배열
		- num_of_nodes : 노드 개수
		- num_of_edges : edge 개수
		- nodeSizeNeighborArray : 이웃노드 번호 배열
		- nodeSizeArray : 이웃노드 개수 배열
	*/
	var neighbors=graph.nodeSizeNeighborArray;
	var num_of_nodes=graph.nodes.length;
	var num_of_edges=graph.edges.length;
	var i=0, j=0, k=0, counter=0;
	var node_list=[];
	var community_list=[];
	var edge_list=[];
	for(i=0; i<num_of_nodes; i++) //노드의 번호에 상관없이 랜덤한 노드를 선택하여 실행하기위한 리스트 생성
	{
		node_list[i]={//node형태 정의
			CID : null
		};
		community_list[i]={	//community 정의
			nodes : [],
			neighborCommunities : []	
		};

		node_list[i].CID=Math.floor(Math.random()*(num_of_nodes));
		for(j=0; j<i; j++)
		{
			if(node_list[i].CID==node_list[j].CID)
			{
				i--;
				break;
			}
		}
	}

	for(i=0; i<num_of_nodes; i++)
	{		
		community_list[node_list[i].CID].nodes[0]=i; //community_list의 nodes 초기화
	}

	for(i=0; i<community_list.length; i++)
	{		
		for(j=0; j<neighbors[community_list[i].nodes[0]].length; j++)
		{
			community_list[i].neighborCommunities.push(node_list[neighbors[community_list[i].nodes[0]][j]].CID);//community_list의 neighborCommunities 초기화
		}
	}

	counter=0;
	for(i=0; i<community_list.length; i++)
	{
		for(j=0; j<community_list[i].neighborCommunities.length; j++)
		{
			if(i<community_list[i].neighborCommunities[j])
			{
				edge_list[counter]={
					edge : [],
					weight : 0
				};
				edge_list[counter].edge[0]=i;
				edge_list[counter].edge[1]=community_list[i].neighborCommunities[j];
				edge_list[counter].weight+=1;
				counter++;
			}
		}
	}
	
	/*
	for(i=0; i<num_of_nodes; i++)
	{
		console.log(neighbors[i]);
	}
	for(i=0; i<num_of_nodes; i++)
	{
		console.log(node_list[i].node_num+"	"+node_list[i].CID);
		console.log(community_list[i].nodes+"	"+community_list[i].neighborCommunities+"\n");
	}	
	for(i=0; i<edge_list.length; i++)
	{
		console.log(edge_list[i].edge+"	"+edge_list[i].weight);
	}
	*/


	/*------------------------------------------------------------------------------------------------------------------------------------------------
	community_list[i]
		i : community ID
		community_list[i].nodes : i community에 포함되는 노드 번호의 배열
		community_list[i].neighborCommunities : i community와 이웃하는 community ID의 배열

	node_list[i]
		i : node ID
		noed_list[i].CID : node i가 포함된 community의 ID
	*/
	var num_of_change=0;
	var delta_M;
	//phase1
	this.louvainPhase1();
	//phase2


};

exports.louvainPhase1 =(community_list, edge_list) =>{
}