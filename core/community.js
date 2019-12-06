const ARRAY = require('./array');
const MODULARITY = require('./modularity');
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
exports.findCommunities = (_nodes, _edges, _nodeSizeArray, _nodeSizeNeighborArray) => {
	let nodes                 = ARRAY.clone_deep(_nodes);
	let edges                 = ARRAY.clone_deep(_edges);
	let nodeSizeArray         = ARRAY.clone_deep(_nodeSizeArray);
	let nodeSizeNeighborArray = ARRAY.clone_deep(_nodeSizeNeighborArray);
	let deleted_edges         = [];

	let graph = [nodes];
	let modularity;
	let edge_deleted, edge_deleted_index, b;
	let community_divided;
	let i, j;
	let ind1, ind2;

	// calulate modularity and edge betweenesses
	modularity = MODULARITY.getImprovedModularity(graph, nodeSizeArray, edges);
	edges = EDGE.edgeBetweenesses(edges, nodeSizeNeighborArray);

	// save initial state
	saveState(graph, edges, modularity, nodeSizeArray, nodeSizeNeighborArray, deleted_edges);

	console.log(`start communitization. init state:`);
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

		// calculate new modularity
		modularity = MODULARITY.getImprovedModularity(graph, nodeSizeArray, edges);

		/*
			TODO: save the maximized-modularity status and loop it until
			it is clear that saved modularity is the global maximum.
		*/

		
		// if the modularity was decreased, undo and break
		// if not, re-calculate edge betweeness of the 2 nodes that the deleted edge was connecting
		/*if (modularity_after < modularity_before) {
			// unify the divided communities
			if (community_divided) {
				graph[community_divided[0]] = graph[community_divided[0]].concat(graph[community_divided[1]]);
				graph.splice(-1, 1);
			}

			// rollback the deleted edge (update edges, nodeSizeArray, nodeSizeNeighborArray, graph)
			edges.push(edge_deleted);
			nodeSizeArray[edge_deleted[0]]++;
			nodeSizeArray[edge_deleted[1]]++;
			nodeSizeNeighborArray[edge_deleted[0]].push(edge_deleted[1]);
			nodeSizeNeighborArray[edge_deleted[1]].push(edge_deleted[0]);
			break;
		} else {*/
			// update modularity
			//modularity_before = modularity_after;

			// re-calculate edge betweeness
			edges = EDGE.edgeBetweenesses(edges, nodeSizeNeighborArray, edge_deleted);

			deleted_edges.push(edge_deleted);

			// save if current state's modularity is higher than saved state
			if (maximumModularityState.modularity < modularity) {
				console.log(`new modularity! ${maximumModularityState.modularity} -> ${modularity}`);
				saveState(graph, edges, modularity, nodeSizeArray, nodeSizeNeighborArray, deleted_edges);
			}
		/*}*/
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

exports.LabelPropagation =() =>{

};

exports.Louvain =(graph) =>{
	//phase1
	console.log("I'm in Louvain");
	/*
	graph
		- nodes : 노드 번호 배열
		- edges : edge 배열
		- num_of_nodes : 노드 개수
		- num_of_edges : edge 개수
		- nodeSizeNeighborArray : 이웃노드 번호 배열
		- nodeSizeArray : 이웃노드 개수 배열
	*/
	
	//phase2


};