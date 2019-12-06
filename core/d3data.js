
exports.getD3 = (edges, edges_deleted, nodeSizeNeighborArray) => {
	let cited = [];
	let d3data = {
		"nodes": [],
		"links": [],
		"maxLinkValue": 0,
		"maxNodeSize": 0
	};
	addData(d3data, cited, edges, false, nodeSizeNeighborArray);
	addData(d3data, cited, edges_deleted, true, nodeSizeNeighborArray);

	// handle undefined elements: for independent nodes
	for (i = 0; i < nodeSizeNeighborArray.length; i++) {
		if (cited[i] == undefined) {
			d3data.nodes.push({"id": i, "group": 1, "size": 0});
		}
	}

	return d3data;
};

addData = (d3data, cited, edges, is_deleted, nodeSizeNeighborArray) => {
	let i, source, target,
		node_value_source, node_value_target,
		intersect, outersect,
		intersect_ratio, max_intersect_ratio = 0;

	for (i = 0; i < edges.length; i++) {
		source = edges[i][0];
		target = edges[i][1];

		node_value_source   = nodeSizeNeighborArray[source]          ? nodeSizeNeighborArray[source].length : 0;
		node_value_target   = nodeSizeNeighborArray[target]          ? nodeSizeNeighborArray[target].length : 0;

		intersect = getNumberOfIntersection(nodeSizeNeighborArray[source], nodeSizeNeighborArray[target]);
		outersect = getNumberOfOutersection(nodeSizeNeighborArray[source], nodeSizeNeighborArray[target]) - 2;

		intersect_ratio     = (outersect           > 0                ) ? intersect / outersect                   : 0;
		max_intersect_ratio = (max_intersect_ratio < intersect_ratio  ) ? intersect_ratio                         : max_intersect_ratio;

		d3data.maxLinkValue = (d3data.maxLinkValue > intersect        ) ? d3data.maxLinkValue                     : intersect;
		d3data.maxNodeSize  = (d3data.maxNodeSize  > node_value_source) ? d3data.maxNodeSize                      : node_value_source;
		d3data.maxNodeSize  = (d3data.maxNodeSize  > node_value_target) ? d3data.maxNodeSize                      : node_value_target;

		if (!cited[source])
		{
			d3data.nodes.push({"id": source, "group": 1, "size": node_value_source});
			cited[source] = 1;
		}
		if (!cited[target])
		{
			d3data.nodes.push({"id": target, "group": 1, "size": node_value_target});
			cited[target] = 1;
		}
		d3data.links.push({
			"source": source,
			"target": target,
			"intersect_ratio": intersect_ratio / max_intersect_ratio,
			"is_deleted": is_deleted
		});
	}
};

getNumberOfIntersection = (array1, array2) => {
	return array1.filter(value => array2.includes(value)).length;
};

getNumberOfOutersection = (array1, array2) => {
	return [...new Set([...array1, ...array2])].length;
};
