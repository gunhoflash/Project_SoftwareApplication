exports.getD3 = (graph, edges, edges_deleted, nodeSizeNeighborArray) => {
	let d3data = {
		nodes        : [],
		links        : [],
		maxLinkValue : 0,
		maxNodeSize  : 0
	};
	addNodes(d3data, graph, nodeSizeNeighborArray);
	addData(d3data, edges, false, nodeSizeNeighborArray);
	addData(d3data, edges_deleted, true, nodeSizeNeighborArray);

	return d3data;
};

addNodes = (d3data, graph, nodeSizeNeighborArray) => {
	let i, j, nodeSize;

	for (i = 0; i < graph.length; i++) {

		// handle exception
		if (!Array.isArray(graph[i])) continue;

		for (j = 0; j < graph[i].length; j++) {
			nodeSize = nodeSizeNeighborArray[graph[i][j]] ? nodeSizeNeighborArray[graph[i][j]].length : 0;
			if (nodeSize > d3data.maxNodeSize) d3data.maxNodeSize = nodeSize;
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
		intersect, outersect,
		intersect_ratio, max_intersect_ratio = 0;

	for (i = 0; i < edges.length; i++) {
		source = edges[i][0];
		target = edges[i][1];

		intersect = getNumberOfIntersection(nodeSizeNeighborArray[source], nodeSizeNeighborArray[target]);
		outersect = getNumberOfOutersection(nodeSizeNeighborArray[source], nodeSizeNeighborArray[target]) - 2;

		intersect_ratio     = (outersect           > 0              ) ? intersect / outersect : 0;
		max_intersect_ratio = (max_intersect_ratio < intersect_ratio) ? intersect_ratio       : max_intersect_ratio;
		d3data.maxLinkValue = (d3data.maxLinkValue > intersect      ) ? d3data.maxLinkValue   : intersect;

		d3data.links.push({
			"source": source,
			"target": target,
			"intersect_ratio": intersect_ratio / max_intersect_ratio,
			"is_deleted": (is_deleted) ? 'Y' : 'N'
		});
	}
};

getNumberOfIntersection = (array1, array2) => {
	return array1.filter(value => array2.includes(value)).length;
};

getNumberOfOutersection = (array1, array2) => {
	return [...new Set([...array1, ...array2])].length;
};
