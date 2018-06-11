/**
 * @author shakkirptb@gmail.com
 * */
const ootil = require("ootil");
var Node = require("node4node");

var Graph = function(rawData) {
    this.groups = {
        all: []
    };
    this.nodes = {};
    this.konst = Node.konst;
    if (rawData instanceof Array) {
        this.addNodesFromArray(rawData)
    }
}
Object.defineProperty(Graph.prototype, "createNode", {
    value: function(item, noReplace) {
        if (noReplace && this.exists(item.id)) {
            return this.nodes[item.id];
        }
        delete item._noMatches;
        if (item.id == null) {
            item.id = item.isA.id + (this.groups[item.isA.id] || []).length;
        }
        if (this.exists(item.id)) {
            item.id = item.id + "-" + item.isA;
        }
        let newNode = new Node(item);
        if (newNode != null) {
            //---------
            this.nodes[newNode.id] = newNode;
            //---------
            this.groups.all.push(newNode);
            //---------
            let parents = newNode.getParents();
            if (parents) {
                for (parent of parents) {
                    if (parent instanceof Node) {
                        newNode.addAsRelative(this.groups, parent);
                        //					parent.has.push(newNode);
                    }
                }
            }

            //------
            return newNode;
        } else {
            console.log("could not create node " + item.id);
        }
        return undefined;
    }
});
Object.defineProperty(Graph.prototype, "addNodesFromArray", {
    value: function(rawData) {
        for (node of rawData) {
            this.createNode(this.parse(node));
        }
    }
});
Object.defineProperty(Graph.prototype, "parse", {
    value: function(item) {
        let noMatches = [];
        for (atr in item) {
            if (["_id", "id"].indexOf(atr) != -1) {
                continue;
            }
            prop = item[atr];
            if (prop instanceof Array) {
                var tempArray = [];
                for (parentName of prop) {
                    if (this.nodes[parentName] != null) {
                        tempArray.push(this.nodes[parentName])
                    } else {
                        noMatches.push(parentName);
                        //					console.error(parentName + " not found!..");
                    }
                }
                item[atr] = tempArray;
            } else if (prop instanceof Node) {
                continue;
            } else if (prop instanceof Object) {
                item[atr] = this.parse(prop)
            } else {
                item[atr] = this.nodes[prop];
                if (item[atr] == null) {
                    item[atr] = prop;
                }
            }
        }
        if (noMatches.length != 0) {
            item._noMatches = noMatches;
        }
        return item;
    }
});
Object.defineProperty(Graph.prototype, "getNode", {
    value: function(id) {
        return this.nodes[id];
    }
});
Object.defineProperty(Graph.prototype, "exists", {
    value: function(id) {
        return this.nodes.hasOwnProperty(id) && this.nodes[id] instanceof Node;
    }
});
Graph.getShallow=ootil.getShallow;
Object.defineProperty(Graph.prototype, "execute", {
    value: function(queryObj, logs) {
        try {
            queryObj.hasOwnProperty('any'); //testing the object
        } catch (e) {
            queryObj = JSON.parse(JSON.stringify(queryObj));
        }
        if (logs) {
            console.log("query", queryObj);
        }

        var select = this.parse(queryObj.select || queryObj.get || "*");

        let query = this.parse(queryObj);

        let selectOnly = query.select || query.get;
        let from = query.from || [];
        let where = query.where || {};
        let getAll = select == "*" || select == null;
        let selectIsFilter =  typeof selectOnly === "string" && selectOnly.startsWith("$");
        if (query._noMatches == null) {
            delete query._noMatches;
            if (query.hasOwnProperty('where')) {
                delete where._noMatches;
            }
            //neither from nor where
            if (!getAll && !query.hasOwnProperty('from') && !query.hasOwnProperty('where')) {
                if (logs) {
                    console.log("result:", select.getShallow());
                }
                return selectOnly;
            }
            //select is a Node = filter specified object
            if (selectOnly instanceof Node) {
                if (selectOnly.isATypeOf instanceof Node) {
                    where.isA = selectOnly.isATypeOf;
                } else {
                    where.isA = selectOnly;
                }
            // select is an Object ({$sum:"something"}) or operator ($count)     
            } else if (getAll || selectIsFilter || select instanceof Object) {
            	
                if (from instanceof Array) {
                    if (from.length == 1) {
                        selectOnly = from[0];
                    } else if (from.length > 0) {
                        selectOnly = from.shift();
                    } else {
                        var result = [];
                        result = this.groups.all.query(where).select(select)
                        if (logs) {
                            console.log("result:", result.length);
                        }
                        return result;
                    }
                } else {
                    selectOnly = from;
                }
            }

            var result = [];
            if (selectOnly instanceof Node || selectIsFilter) {
                result = selectOnly.commonChildren(from).query(where).select(select);
            } else {
                console.log("ERROR: select is not a Node!");
            }
            if (logs) {
                console.log("result:", result.length);
            }
            return result;
        } else {
            console.log("ERROR: unresolved item(s) in query!", query._noMatches.getShallow());
        }
        return [];
    }
});
Object.defineProperty(Graph.prototype, "get", {
    value: function(query) {
        return this.nodes[query];
    }
});
Object.defineProperty(Graph.prototype, "isAlsoPartOf", {
    value: function(node, isPartOf) {
        node.isPartOf.push(isPartOf);
        node.addAsRelative(this.groups, isPartOf);
        isPartOf.has.push(node);
    }
});
//export
module.exports = Graph;