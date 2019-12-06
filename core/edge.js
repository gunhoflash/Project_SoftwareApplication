exports.edgeBetweeness = (node1, node2, nodeSizeNeighborArray) => {
	let size_intersection, size_union;

	// suppose that node1 and node2 is linked
	size_union = [...new Set([...nodeSizeNeighborArray[node1], ...nodeSizeNeighborArray[node2]])].length - 2;
	size_intersection = nodeSizeNeighborArray[node1].filter(n => nodeSizeNeighborArray[node2].includes(n)).length;
	
	return (size_union > 0) ? size_intersection / size_union : 0;
};

exports.edgeBetweenesses = (edges, nodeSizeNeighborArray, updateOnlyPair = null) => {
	let i, len = edges.length;

	// TODO: optimize
	if (updateOnlyPair) {
		for (i = 0; i < len; i++) {
			if (edges[i][0] == updateOnlyPair[0] || edges[i][0] == updateOnlyPair[1]
				|| edges[i][1] == updateOnlyPair[0] || edges[i][1] == updateOnlyPair[1])
				edges[i][2] = exports.edgeBetweeness(edges[i][0], edges[i][1], nodeSizeNeighborArray);
		}
	} else {
		for (i = 0; i < len; i++) {
			edges[i][2] = exports.edgeBetweeness(edges[i][0], edges[i][1], nodeSizeNeighborArray);
		}
	}

	return edges;
};

/*
	Return boolean and array.
	
	If the path from node1 and node2 exist,
	return true and an empty array.
	If not, return false and an array of nodes that reachable from the node1 include the node1 itself.
*/
exports.hasPath = (node1, node2, nodeSizeNeighborArray) => {
	let queue = [];
	let queued = [];
	let i = 0;
	let now;

	// start visiting from the node1
	queue.push(node1);
	queued[node1] = true;

	while (i < queue.length) {

		// visit a new node
		now = queue[i++];

		// break if the node2 found
		if (now == node2)
			return {
				result: true,
				array: []
			};

		// queue the new neighbor nodes
		for (let neighbor of nodeSizeNeighborArray[now]) {
			if (!queued[neighbor]) {
				queued[neighbor] = true;
				queue.push(neighbor);
			}
		}
	}

	return {
		result: false,
		array: queue
	};
};