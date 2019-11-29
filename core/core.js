const fs = require('fs');

// delete all files in the folder
exports.clearFolder = path => {
	fs.readdirSync(path)
	.forEach((file, index) => {
		exports.deleteFile(path + '/' + file);
	});
};

// delete a file
exports.deleteFile = url => {
	fs.unlink(url, err => {
		if (err)
			console.log(err);
	});
};

// read the file and return as text
exports.getText = url => {

	// file not found
	if (!fs.existsSync(url)) {
		console.log(`${url} not found`);
		return [];
	}

	// return text
	return fs.readFileSync(url, 'utf8');
};

exports.parseTextGraph = text => {

	let i, textLine, node1, node2, nodeTemp, nodeLast = -1;
	let textLines;
	let nodes = [];
	let edges = [];

	// TODO: type check
	// handle exception: no text
	if (!text) return null;

	// split line
	textLines = text.match(/[^\r\n]+/g);
	
	// pop only validate lines
	for (i = 0; i < textLines.length; i++) {
		textLine = textLines[i].match(/[0-9]+/g);
		if (!textLine || textLine.length < 2) continue;
		node1 = Number(textLine[0]);
		node2 = Number(textLine[1]);

		// swap to sort
		if (node1 > node2) {
			nodeTemp = node1;
			node1 = node2;
			node2 = nodeTemp;
		}
		nodeLast = (node1 > nodeLast) ? node1 : nodeLast;
		edges.push([node1, node2]); // edge is sorted ascending
	}

	// nodes: [0, 1, 2, ..., max]
	nodes = [...Array(nodeLast + 1).keys()];

	return {
		nodes: nodes,
		edges: edges
	};
};

exports.getNodeSizeNeighborArray = edges => {
	let i, node1, node2, nodeSizeNeighborArray = [];
	for (i = 0; i < edges.length; i++) {
		node1 = edges[i][0];
		node2 = edges[i][1];
		if (!nodeSizeNeighborArray[node1]) nodeSizeNeighborArray[node1] = [];
		if (!nodeSizeNeighborArray[node2]) nodeSizeNeighborArray[node2] = [];
		nodeSizeNeighborArray[node1].push(node2);
		nodeSizeNeighborArray[node2].push(node1);
	}

	// handle undefined elements: for independent nodes
	for (i = 0; i < nodeSizeNeighborArray.length; i++) {
		if (nodeSizeNeighborArray[i] == undefined)
			nodeSizeNeighborArray[i] = [];
	}

	return nodeSizeNeighborArray;
};

exports.getNodeSizeArray = edges => {
	let i, node1, node2, nodeSizeArray = [];
	for (i = 0; i < edges.length; i++) {
		node1 = edges[i][0];
		node2 = edges[i][1];
		if (!nodeSizeArray[node1]) nodeSizeArray[node1] = 0;
		if (!nodeSizeArray[node2]) nodeSizeArray[node2] = 0;
		nodeSizeArray[node1]++;
		nodeSizeArray[node2]++;
	}

	// handle undefined elements: for independent nodes
	for (i = 0; i < nodeSizeArray.length; i++) {
		if (nodeSizeArray[i] == undefined)
			nodeSizeArray[i] = 0;
	}

	return nodeSizeArray;
};

exports.getLinkValueArray = () => {

};

exports.getD3 = (edges, getNodeSizeNeighborArray) => {
	let source, target, node_value_source, node_value_target, intersect, outersect, intersect_ratio, max_intersect_ratio = 0;
	let cited = [];
	let d3data = {
		"nodes": [],
		"links": [],
		"maxLinkValue": 0,
		"maxNodeSize": 0
	};

	for (let i = 0; i < edges.length; i++) {
		source = edges[i][0];
		target = edges[i][1];

		node_value_source   = getNodeSizeNeighborArray[source]          ? getNodeSizeNeighborArray[source].length : 0;
		node_value_target   = getNodeSizeNeighborArray[target]          ? getNodeSizeNeighborArray[target].length : 0;

		intersect = getNumberOfIntersection(getNodeSizeNeighborArray[source], getNodeSizeNeighborArray[target]);
		outersect = getNumberOfOutersection(getNodeSizeNeighborArray[source], getNodeSizeNeighborArray[target]) - 2;

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
			"intersect_ratio": intersect_ratio / max_intersect_ratio
		});
	}

	// handle undefined elements: for independent nodes
	for (i = 0; i < getNodeSizeNeighborArray.length; i++) {
		if (cited[i] == undefined)
			d3data.nodes.push({"id": i, "group": 1, "size": 0});
	}

	return d3data;
};

exports.arrayMax = array => {
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

exports.pageRank = (text, tolerance) => {
	var file_array=this.parseTextGraph(text).edges;//입력받은 text를 array형태로 변환
	var num_of_neighbor=this.getNodeSizeArray(file_array);//각 노드의 이웃 수를 배열형태로 저장
	var arr_of_neighbor=this.getNodeSizeNeighborArray(file_array);//각 노드의 이웃을 나열한 배열을 배열형태로 저장(즉, 2차원배열)
	var pageRank_table=[];
	var length=num_of_neighbor.length;//나중에 자주쓰게될 배열길이 length 생성
	for(var i=0; i<length; i++)
	{
		pageRank_table.push([i,num_of_neighbor[i],arr_of_neighbor[i]]);//data가 많을경우를 대비하여 sparse matrix encoding을 진행
	}
	//console.log(pageRank_table);
	//console.log(old_R);
	//console.log(new_R);
	var rank_sum=0;	//모든 노드의 pagerank sum을 저장할 변수
	var beta=0.85; // beta값 지정
	var j=0; //반복에 쓰일 변수
	var old_R=Array.apply(null,new Array(length)).map(Number.prototype.valueOf,1/length);//old_R초기화	
	var new_R;
	do
	{
		new_R=Array.apply(null,new Array(length)).map(Number.prototype.valueOf,(1-beta)/length);//new_R초기화
		rank_sum=0;
		for(i=0; i<length; i++)
		{
			for(j=0; j<pageRank_table[i][1]; j++)
			{
				//console.log(i+","+j);
				new_R[pageRank_table[i][2][j]]+=(beta*old_R[i])/pageRank_table[i][1];//pageRank 계산
			}
		}
		
		for(i=0; i<length; i++)
		{
			rank_sum+=new_R[i];//new_R의 rank_sum확인용
		}
		console.log("rank_sum : "+rank_sum);
		//console.clear();
		//console.log(new_R);
		err=this.getError(old_R,new_R);
		old_R=new_R;
	}
	while(err>tolerance);
	console.log("err : "+err);//err가 tolerance를 만족하는지 확인용
	//console.log("out of loop");
	//console.log(old_R);
	console.log(old_R);
	return old_R;//pageRank가 저장된 vector를 반납
};

exports.getError = (arr1,arr2) => {
	var error=0;
	for(var i=0; i<arr1.length; i++)
	{
		error+=Math.abs(arr1[i]-arr2[i]);
	}
	return error;
}

exports.HITS = (text,tolerance) => {
	var file_array=this.parseTextGraph(text).edges;//입력받은 text를 array형태로 변환
	var num_of_neighbor=this.getNodeSizeArray(file_array);//각 노드의 이웃 수를 배열형태로 저장
	var arr_of_neighbor=this.getNodeSizeNeighborArray(file_array);//각 노드의 이웃을 나열한 배열을 배열형태로 저장(즉, 2차원배열)
	var length=num_of_neighbor.length;
	var old_authorities=Array.apply(null,new Array(length)).map(Number.prototype.valueOf,1/Math.sqrt(length));
	var new_authorities;
	var old_hubs=Array.apply(null,new Array(length)).map(Number.prototype.valueOf,1/Math.sqrt(length));
	var new_hubs;
	var normalizing_constant;
	var converged=false;
	var counter;
	var sum1;
	var sum2;
	do
	{		
		//new_authorities를 계산
		normalizing_constant=0;
		sum1=0;		
		new_authorities=Array.apply(null,new Array(length)).map(Number.prototype.valueOf,0);
		for(var i=0; i<length; i++)
		{
			for(var j=0; j<num_of_neighbor[i]; j++)
			{
				new_authorities[i]+=old_hubs[arr_of_neighbor[i][j]];//update authorities
			}	
			normalizing_constant+=Math.pow(new_authorities[i],2);
		}
		normalizing_constant=1/Math.sqrt(normalizing_constant);
		for(i=0; i<length; i++)
		{
			new_authorities[i]*=normalizing_constant;
			//sum1+=Math.pow(new_authorities[i],2);
		}

		//new_hubs를 계산
		normalizing_constant=0;
		sum2=0;
		new_hubs=Array.apply(null,new Array(length)).map(Number.prototype.valueOf,0);
		for(i=0; i<length; i++)
		{
			for(j=0; j<num_of_neighbor[i]; j++)
			{
				new_hubs[i]+=old_authorities[arr_of_neighbor[i][j]];//update hubs
			}	
			normalizing_constant+=Math.pow(new_hubs[i],2);
		}
		normalizing_constant=1/Math.sqrt(normalizing_constant);
		for(i=0; i<length; i++)
		{
			new_hubs[i]*=normalizing_constant;
			//sum2+=Math.pow(new_hubs[i],2);
		}

		//converged되었는지 확인
		counter=0;
		for(i=0; i<length; i++)
		{
			if(Math.abs(old_authorities[i]-new_authorities[i])<tolerance&&Math.abs(old_hubs[i]-new_hubs[i])<tolerance)
			{
				counter++;
			}
		}
		console.log(counter);
		if(counter==length)
		{
			converged=true;
		}
		else
		{
			old_authorities=new_authorities;
			old_hubs=new_hubs;
		}
	}
	while(converged==false);
	/*
	console.log("out_of_while");
	console.log("old_hubs");
	console.log(old_hubs);
	console.log("new_hubs");
	console.log(new_hubs);
	console.log("old_authorities");
	console.log(old_authorities);
	console.log("new_authorities");
	console.log(new_authorities);
	console.log("sum1 : "+sum1+", sum2 :"+sum2);
	*/
	var HITS_Array={}
	HITS_Array['hubs']=old_hubs;
	HITS_Array['authorities']=old_authorities;
	return HITS_Array;//hubs와 authorities성분을가지는 dictionary를 반환
};

exports.Girvan_Newman =(graph) =>{
	var new_mod=getModularityByEdgeCommunities(graph);
	var old_mod=0;
	var temp_edge=[];
	var flag=0;
	var i=0;
	do
	{
		old_mod=new_mod;
		temp_edge=deleteEdgeWithHighestBetweeness(graph);
		//community가 분리되었는가 검증(모든 조합이 없는가)
		if(flag==1)
		{
		//	graph의 community를 재정의
			flag=0;
		}
		new_mod=getModularityByEdgeCommunities(graph);
		if(old_mod>new_mod)
		{
		//	기억하고 있던 소거된 edge를 부착
		}
	}while(old_mod<=new_mod);
};

exports.LinkCommunity =() =>{

};

exports.LabelPropagation =() =>{

};

exports.Louvain =() =>{

};