/*
	graph: [community, community, ..., community]
	community: [edge, edge, ..., edge]
	edge: [i, j]
*/
// CHECK: this function will be deprecated
exports.getModularityByEdgeCommunities = (graph) => {

	// handle exception: graph is not an array
	if (!Array.isArray(graph)) return 0;

	let i, j;                 // index
	let k, a, m, modularity;
	let n1, n2;               // temporary nodes
	let nodes, numberOfNodes; // all nodes
	
	// calculate m first
	m = 0;
	for (let community of graph) {
		// handle exception: community is not an array
		if (!Array.isArray(community)) continue;
		m += community.length;
	}
	m *= 2;

	// for each community, set the k and a and add modularity
	modularity = 0;
	for (let community of graph) {

		// handle exception: community is not an array
		if (!Array.isArray(community)) continue;

		// init k, a, nodes, m, ...
		k     = [];
		a     = [];
		nodes = [];
		for (let edge of community) {

			// suppose that edge is valid array

			i = edge[0];
			j = edge[1];

			// reduce computations instead of increasing memory usage
			k[i] = k[i] + 1 || 1;
			k[j] = k[j] + 1 || 1;
			if (!a[i]) a[i] = [];
			a[i][j] = m;
			if (!a[j]) a[j] = [];
			a[j][i] = m;
			nodes.push(i, j);
		}
		nodes = [... new Set(nodes)];
		numberOfNodes = nodes.length;

		// calculate modularity
		for (i = 0; i < numberOfNodes; i++) {
			// start from (i + 1) since the graph is undirected
			for (j = i + 1; j < numberOfNodes; j++) {
				n1 = nodes[i];
				n2 = nodes[j];
				modularity += (a[n1][n2] || 0) - (k[n1] * k[n2]);
			}
		}
	}

	// return normalized modularity (-1 ~ 1 expected)
	return modularity * 2 / (m * m);
};

/*
	graph: [community, community, ..., community]
	community: [node, node, ..., node]
	nodeSizeArray: [int, int, ..., int]
	edges: [edge, edge, ..., edge]
	edge: [i, j]
*/
exports.getModularity = (graph, nodeSizeArray, edges) => {
	
	// handle exception: graph or edges is not an array
	if (!Array.isArray(graph) || !Array.isArray(edges)) return 0;

	// handle exception: no edges
	if (edges.length == 0) return 0;

	let i, j, len;
	let m2;
	let a, _a, modularity;

	// calculate the 2m first
	m2 = edges.length * 2;

	// set a
	a = [];
	for (let edge of edges) {
		// no check exception. suppose that edge is 2-length array
		i = edge[0];
		j = edge[1];
		if (!a[i]) a[i] = [];
		if (!a[j]) a[j] = [];
		a[i][j] = m2;
		a[j][i] = m2;
	}

	// for each community, set the k and a and add modularity
	modularity = 0;
	for (let community of graph) {
		// handle exception: community is not an array
		if (!Array.isArray(community)) continue;

		len = community.length;
		// calculate modularity
		for (i = 0; i < len; i++) {
			// start from (i + 1) since the graph is undirected
			for (j = i; j < len; j++) {
				n1 = community[i];
				n2 = community[j];
				_a = (a[n1]) ? (a[n1][n2] || 0) : 0;
				
				let c = (j == i) ? 1 : 2;
				modularity += (_a - (nodeSizeArray[n1] * nodeSizeArray[n2])) * c;
			}
		}
	}
	
	// return normalized modularity (-1 ~ 1 expected)
	return modularity / (m2 * m2);
};

/*
	graph: [community, community, ..., community]
	community: [node, node, ..., node]
	nodeSizeArray: [int, int, ..., int]
	edges: [edge, edge, ..., edge]
	edge: [i, j]
*/
exports.getImprovedModularity = (graph, nodeSizeArray, edges) => {

	console.log(`calculate modularity`);

	// handle exception: graph or edges is not an array
	if (!Array.isArray(graph) || !Array.isArray(edges)) {
		console.log(`invalid parameter`);
		return 0;
	}

	// handle exception: no edges
	if (edges.length == 0) {
		console.log(`no edges`);
		return 0;
	}

	let i, j, m2;
	let edges_inner = [];
	let modularity;

	// calculate the 2m first
	m2 = edges.length * 2;

	// group each edge according to the group they belong
	for (i = 0; i < graph.length; i++)
		edges_inner[i] = [];
	for (i = 0; i < edges.length; i++) {
		for (j = 0; j < graph.length; j++) {
			if (graph[j].indexOf(edges[i][0]) < 0) continue;
			if (graph[j].indexOf(edges[i][1]) < 0) continue;
			edges_inner[j].push(edges[i]);
			break;
		}
	}

	// for each community, set the k and a and add modularity
	modularity = 0;
	for (i = 0; i < graph.length; i++) {
		let community = graph[i];
		let A, B;

		// calculate A = sum(A_ij)
		A = edges_inner[i].length * 2;
		console.log(`A = ${A}`);
		
		// calculate B = sum(total)
		B = 0;
		for (j = 0; j < community.length; j++) {
			B += nodeSizeArray[community[j]];
		}
		console.log(`B = ${B}`);
		console.log(`add ${A - B * B / m2}`);
		// modularity += A - B^2 / 2m
		modularity += A - B * B / m2;
	}

	// return normalized modularity (-1 ~ 1 expected)
	return modularity / m2;
};