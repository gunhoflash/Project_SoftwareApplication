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
exports.findCommunities = (_nodes, _edges, _nodeSizeArray, _nodeSizeNeighborArray, unlink_step_size = 'AUTO') => {
	let nodes                 = ARRAY.clone_deep(_nodes);
	let edges                 = ARRAY.clone_deep(_edges);
	let nodeSizeArray         = ARRAY.clone_deep(_nodeSizeArray);
	let nodeSizeNeighborArray = ARRAY.clone_deep(_nodeSizeNeighborArray);
	let deleted_edges         = [];

	let graph = [nodes];
	let modularity;
	let edge_deleted, edge_deleted_index, b;
	let step_counter;
	let i, j;
	let ind1, ind2;

	// calulate modularity and edge betweenesses
	modularity = MODULARITY.getImprovedModularity(graph, nodeSizeArray, edges);
	edges = EDGE.edgeBetweenesses(edges, nodeSizeNeighborArray);

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
		edges = EDGE.edgeBetweenesses(edges, nodeSizeNeighborArray, edge_deleted);

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

exports.LabelPropagation =() =>{

};

exports.Louvain =(graph) =>{
	//사용할 변수, 리스트, 객체 세팅
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

	var community_L = {	//community 정의
		CID : null,
		nodes : null,
		edges : null	
	};

	var num_of_nodes=graph.nodes.length;
	var i=0, j=0;
	var randomized_node_list=[];
	for(i=0; i<num_of_nodes; i++) //노드의 번호에 상관없이 랜덤한 노드를 선택하여 실행하기위한 리스트 생성
	{
		randomized_node_list[i]=Math.floor(Math.random()*(num_of_nodes+1));
		for(j=0; j<i; j++)
		{
			if(randomized_node_list[i]==randomized_node_list[j])
			{
				i--;
				break;
			}
		}
	}
	//console.log("randomized array : "+randomized_node_list);

	for(i=0; i<num_of_nodes; i++)
	{
		
	}

	//phase1
	for(i=0; i<num_of_nodes; i++)
	{
		for(j=0; j<graph.nodeSizeNeighborArray[i].length; j++)
		{

		}
	}
	//phase2


};