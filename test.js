
var Graph = require("./index.js");

//defining a school using node4node nodes

//Graph
var schoolGraph = new Graph();

//type node
var type=schoolGraph.createNode({id:"type"});

//root node
var school=schoolGraph.createNode({id:"school",isA:type});

//primary type nodes
var person=schoolGraph.createNode({id:"person",isA:type,isPartOf:[school]});
var course=schoolGraph.createNode({id:"course",isA:type,isPartOf:[school]});

//secondary type nodes
var physics=schoolGraph.createNode({id:"physics",isATypeOf:course});
var chemistry=schoolGraph.createNode({id:"chemistry",isATypeOf:course});
var teacher=schoolGraph.createNode({id:"teacher",isATypeOf:person});
var student=schoolGraph.createNode({id:"student",isATypeOf:person});

//value nodes
var susi = schoolGraph.createNode({id:"susi",isA:teacher,isPartOf:[physics]});
var thomas = schoolGraph.createNode({id:"thomas",isA:teacher,isPartOf:[chemistry]});

var shakkir = schoolGraph.createNode({id:"shakkir",isA:student,marks:80,isPartOf:[physics]});
var sameer = schoolGraph.createNode({id:"sameer",isA:student,marks:60,isPartOf:[physics]});
var appu = schoolGraph.createNode({id:"appu",isA:student,marks:90,isPartOf:[chemistry]});
var raj = schoolGraph.createNode({id:"raj",isA:student,marks:70,isPartOf:[chemistry]});


console.assert(schoolGraph.nodes.all.school.has.length == 12, "failed");// all
																		// nodes
console.assert(schoolGraph.execute({
	select : "*",
	from : [ student, physics ],
	where : {
		mark : {
			$gt : 70
		}
	}
})[0].id == "shakkir", "failed");// query1
console.assert(schoolGraph.execute({
	select : "*",
	from : [ student ],
	where : {
		mark : {
			$le : 70
		}
	}
}).length == 2, "failed");//query2
