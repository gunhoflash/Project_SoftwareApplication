exports.getD3 = (graph, edges, edges_deleted, nodeSizeArray, nodeSizeNeighborArray) => {
	let d3data = {
		nodes                 : [],
		links                 : [],
		maxNode               : -1,
		maxNodeSize           : -1,
		maxEdge               : null,
		maxEdgeStrength       : -1
	};
	addNodes(d3data, graph, nodeSizeArray);
	addData(d3data, edges, false, nodeSizeNeighborArray);
	addData(d3data, edges_deleted, true, nodeSizeNeighborArray);

	return d3data;
};

addNodes = (d3data, graph, nodeSizeArray) => {
	let i, j, nodeSize;

	for (i = 0; i < graph.length; i++) {

		// handle exception
		if (!Array.isArray(graph[i])) continue;

		for (j = 0; j < graph[i].length; j++) {
			nodeSize = nodeSizeArray[graph[i][j]] ? nodeSizeArray[graph[i][j]] : 0;
			if (nodeSize > d3data.maxNodeSize) {
				d3data.maxNode     = graph[i][j];
				d3data.maxNodeSize = nodeSize;
			}
			d3data.nodes.push({
				"id"       : `${graph[i][j]}`,
				"id_local" : j,
				"group"    : i,
				"size"     : nodeSize
			});
		}
	}
};

addData = (d3data, edges, is_deleted, nodeSizeNeighborArray) => {
	let i, source, target,
		edge_strength;

	for (i = 0; i < edges.length; i++) {
		source = edges[i][0];
		target = edges[i][1];

		edge_strength = getIntersectRatio(nodeSizeNeighborArray[source], nodeSizeNeighborArray[target]);
		if (d3data.maxEdgeStrength < edge_strength) {
			d3data.maxEdge         = [source, target];
			d3data.maxEdgeStrength = edge_strength;
		}

		d3data.links.push({
			"source": source,
			"target": target,
			"edge_strength": edge_strength,
			"is_deleted": (is_deleted) ? 'Y' : 'N'
		});
	}
};

getIntersectRatio = (array1, array2) => {
	let intersect = getNumberOfIntersection(array1, array2);
	let outersect = getNumberOfOutersection(array1, array2) - 2;
	return (outersect > 0) ? intersect / outersect : 0;
};

getNumberOfIntersection = (array1, array2) => {
	return array1.filter(value => array2.includes(value)).length;
};

getNumberOfOutersection = (array1, array2) => {
	return [...new Set([...array1, ...array2])].length;
};
