/*
	graph: [community, community, ..., community]
	community: [edge, edge, ..., edge]
	edge: [i, j]
*/
// TODO: handle nodes, not edges
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