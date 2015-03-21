C.map = {}; //or simply use: var map = {}

C.evalAST = function(ast) {
  C.map = {};
  return ev(ast);
};

function ev(ast) {
  if (typeof ast === "number") {
    return ast;
  } else {
    var tag = ast[0];
    var args = ast.slice(1);
    return impls[tag].apply(undefined, args);
  }
}

var impls = {
  "+": function(x, y) {
    return ev(x) + ev(y);
  },
  "-": function(x, y) {
    return ev(x) - ev(y);
  },
  "*": function(x, y) {
    return ev(x) * ev(y);
  },
  "/": function(x, y) {
    return ev(x) / ev(y);
  },
  "^": function(x, y) {
    return Math.pow(ev(x), ev(y));
  },
  "seq": function(x, y) {
	ev(x);
    return ev(y);
  },
  "id": function(x) {
	if(!(x in C.map))
		C.map[x] = 0;	
	return C.map[x];
  },
  "set": function(x, e) {
    C.map[x] = ev(e);
	return C.map[x];
  }
  
};
