const fs = require('fs');

exports.getText = url => {

	// file not found
	if (!fs.existsSync(url)) {
		console.log(`${url} not found`);
		return [];
	}

	// return text
	return fs.readFileSync(url, 'utf8');
};

exports.getArray = text => {

	let raw_textArray;
	let graphArray = [];

	// TODO: type check
	// handle exception: no text
	if (!text) return null;

	// split line
	raw_textArray = text.match(/[^\r\n]+/g);
	
	// pop only validate lines
	for (let i = 0, n; i < raw_textArray.length; i++) {
		n = raw_textArray[i].match(/[0-9]+/g);
		if (!n || n.length < 2) continue;
		graphArray.push([Number(n[0]), Number(n[1])]);
	}

	return graphArray;
};

exports.getNodeSizeNeighborArray = array => {
	let nodeSizeNeighborArray = [];
	for (let i = 0; i < array.length; i++) {
		if (!nodeSizeNeighborArray[array[i][0]]) nodeSizeNeighborArray[array[i][0]] = [];
		if (!nodeSizeNeighborArray[array[i][1]]) nodeSizeNeighborArray[array[i][1]] = [];
		nodeSizeNeighborArray[array[i][0]].push(array[i][1]);
		nodeSizeNeighborArray[array[i][1]].push(array[i][0]);
	}
	return nodeSizeNeighborArray;
};

exports.getNodeSizeArray = array => {
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
	var file_array=this.getArray(text);//입력받은 text를 array형태로 변환
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
	var file_array=this.getArray(text);//입력받은 text를 array형태로 변환
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