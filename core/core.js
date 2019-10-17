const fs = require('fs');

exports.getTextArray = (url) => {

	// file not found
	if (!fs.existsSync(url)) {
		console.log(`${url} not found`);
		return [];
	}

	// return text array
	return fs.readFileSync(url, 'utf8').match(/[^\r\n]+/g);
};

exports.getArray = (textArray, splitby) => {
	let graphArray = [];
	let cited = [];
	let max_node_id = 0;

	for (let i = 0; i < textArray.length; i++) {

		graphArray[i] = textArray[i].split(splitby).map(Number);

		if (!cited[graphArray[i][0]]) cited[graphArray[i][0]] = 1;
		if (!cited[graphArray[i][1]]) cited[graphArray[i][1]] = 1;

		if (max_node_id < graphArray[i][0]) max_node_id = graphArray[i][0];
		if (max_node_id < graphArray[i][1]) max_node_id = graphArray[i][1];
	}

	return graphArray;
};

exports.getNodeSizeNeighborArray = (array) => {
	let nodeSizeNeighborArray = [];
	for (let i = 0; i < array.length; i++) {
		if (!nodeSizeNeighborArray[array[i][0]]) nodeSizeNeighborArray[array[i][0]] = [];
		if (!nodeSizeNeighborArray[array[i][1]]) nodeSizeNeighborArray[array[i][1]] = [];
		nodeSizeNeighborArray[array[i][0]].push(array[i][1]);
		nodeSizeNeighborArray[array[i][1]].push(array[i][0]);
	}
	return nodeSizeNeighborArray;
};

exports.getNodeSizeArray = (array) => {
	let nodeSizeArray = [];
	for (let i = 0; i < array.length; i++) {
		if (!nodeSizeArray[array[i][0]]) nodeSizeArray[array[i][0]] = 0;
		if (!nodeSizeArray[array[i][1]]) nodeSizeArray[array[i][1]] = 0;
		nodeSizeArray[array[i][0]]++;
		nodeSizeArray[array[i][1]]++;
	}
	return nodeSizeArray;
};

exports.getLinkValueArray = () => {

};

exports.getD3 = (graphArray, getNodeSizeNeighborArray) => {
	let source, target, node_value_source, node_value_target, intersect, outersect, intersect_ratio, max_intersect_ratio = 0;
	let cited = [];
	let d3data = {
		"nodes": [],
		"links": [],
		"maxLinkValue": 0,
		"maxNodeSize": 0
	};

	for (let i = 0; i < graphArray.length; i++) {
		source = graphArray[i][0];
		target = graphArray[i][1];
		node_value_source = (getNodeSizeNeighborArray[source] ? getNodeSizeNeighborArray[source].length : 0);
		node_value_target = (getNodeSizeNeighborArray[target] ? getNodeSizeNeighborArray[target].length : 0);
		intersect = getNumberOfIntersection(getNodeSizeNeighborArray[source], getNodeSizeNeighborArray[target]);
		outersect = getNumberOfOutersection(getNodeSizeNeighborArray[source], getNodeSizeNeighborArray[target]);
		intersect_ratio = intersect / outersect;
		max_intersect_ratio = (max_intersect_ratio < intersect_ratio) ? intersect_ratio : max_intersect_ratio;

		d3data.maxLinkValue = (d3data.maxLinkValue > intersect) ? d3data.maxLinkValue : intersect;
		d3data.maxNodeSize = (d3data.maxNodeSize > node_value_source) ? d3data.maxNodeSize : node_value_source;
		d3data.maxNodeSize = (d3data.maxNodeSize > node_value_target) ? d3data.maxNodeSize : node_value_target;

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
			"intersect_ratio": intersect_ratio / max_intersect_ratio
		});
	}

	return d3data;
};

exports.arrayMax = (array) => {
	let max = 0;
	for (let i = 0; i < array.length; i++) {
		max = (max > array[i]) ? max : array[i];
	}
	return max;
};

exports.calculateWeightByNeighbor = () => {

};

getNumberOfIntersection = (array1, array2) => {
	return array1.filter(value => array2.includes(value)).length;
};

getNumberOfOutersection = (array1, array2) => {
	return [...new Set([...array1, ...array2])].length;
};

exports.pageRank = (url, tolerance) => {
	var pageRank_Array=[];
	var file_array=this.getArray(this.getTextArray("./data/nodes1000.txt"),"	");
	var num_of_neighbor=this.getNodeSizeArray(file_array);
	var arr_of_neighbor=this.getNodeSizeNeighborArray(file_array);
	var pageRank_table=[];
	var length=num_of_neighbor.length;
	for(var i=1; i<length+1; i++)
	{
		pageRank_table.push([i,num_of_neighbor[i],arr_of_neighbor[i]]);
	}
	//console.log(pageRank_table);
	
	var beta=0.85;
	var j=0;
	var old_R=Array.apply(null,new Array(length)).map(Number.prototype.valueOf,1/length);
	var new_R=Array.apply(null,new Array(length)).map(Number.prototype.valueOf,0);
	//console.log(old_R);
	//console.log(new_R);
	var err=this.getError(old_R,new_R);
	while(err>tolerance)
	{
		new_R=Array.apply(null,new Array(length)).map(Number.prototype.valueOf,(1-beta)/length);
		for(i=0; i<length; i++)
		{
			for(j=0; j<pageRank_table[i][1]; j++)
			{
				new_R[pageRank_table[i][2][j]]+=(beta*old_R[i])/pageRank_table[i][1];
			}
		}
		//console.clear();
		//console.log(new_R);
		err=this.getError(old_R,new_R);
		old_R=new_R;
	}
	console.log(err);
	console.log("out of loop");
	console.log(old_R);
	return pageRank_Array;
};

exports.getError = (arr1,arr2) => {
	var error=0;
	for(var i=0; i<arr1.length; i++)
	{
		error+=Math.abs(arr1[i]-arr2[i]);
	}
	return error;
}

exports.HITS = (url) => {
	var HITS_Array=[];
	return HITS_Array;
};