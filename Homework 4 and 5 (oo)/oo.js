// Nathan Tung (004-059-195) for CS 137A

/* Homework 4 */

// declare the OO "library" as an object
var OO = {};

// create global class table
var classTable = {};

OO.initializeCT = function() {
	
	// "initialize" and reset class table
	classTable = {};
	
	// create a base Object class
	var object = {};
	// set its super class to null and variable names to empty list
	object["super"] = null;
	object["var"] = [];
	// set its initial functions
	object["fun"] = {};
	object["fun"]["initialize"] = function(_this) { };
	object["fun"]["==="] = function(_this, x) { return _this === x; };
	object["fun"]["!=="] = function(_this, x) { return _this !== x; };
	object["fun"]["isNumber"] = function(_this) { return false; };
	// place "Object" class into class table
	classTable["Object"] = object;
	
	// create a Number class with Object super class and no variables; declare appropriate methods
	// using declareClass method guarantees that Number class "inherits" (copies down) its Object super class' methods
	OO.declareClass("Number", "Object", []);
	OO.declareMethod("Number", "+", function(_this, anotherNumber) { return _this + anotherNumber; });
	OO.declareMethod("Number", "-", function(_this, anotherNumber) { return _this - anotherNumber; });
	OO.declareMethod("Number", "*", function(_this, anotherNumber) { return _this * anotherNumber; });
	OO.declareMethod("Number", "/", function(_this, anotherNumber) { return _this / anotherNumber; });
	OO.declareMethod("Number", "%", function(_this, anotherNumber) { return _this % anotherNumber; });
	OO.declareMethod("Number", "<", function(_this, anotherNumber) { return _this < anotherNumber; });
	OO.declareMethod("Number", "<=", function(_this, anotherNumber) { return _this <= anotherNumber; });
	OO.declareMethod("Number", ">", function(_this, anotherNumber) { return _this > anotherNumber; });
	OO.declareMethod("Number", ">=", function(_this, anotherNumber) { return _this >= anotherNumber; });
	OO.declareMethod("Number", "isNumber", function(_this) { return true; });
	
	// create a Null class with Object super class and no variables
	OO.declareClass("Null", "Object", []);

	// create a Boolean class with Object super class and no variables
	OO.declareClass("Boolean", "Object", []);

	// create a True class with Boolean super class and no variables
	OO.declareClass("True", "Boolean", []);
	
	// create a False class with Boolean super class and no variables
	OO.declareClass("False", "Boolean", []);
	
	// create a Block class with Object super class; declare appropriate methods
	OO.declareClass("Block", "Object", ["blockFun"]);
	OO.declareMethod("Block", "initialize", function(_this, blockFun) { OO.setInstVar(_this, "blockFun", blockFun); });
	OO.declareMethod("Block", "call", function(_this, arg1, arg2) {
		var args = Array.prototype.slice.call(arguments).slice(1);
		var ans = _this["var"]["blockFun"].apply(undefined, args); 
		return ans;
	});

};

OO.declareClass = function(name, superClassName, instVarNames) {
	
	if(classTable.hasOwnProperty(name)) {
		// return error if class table already contains a class with given name
		throw new Error("duplicate class declaration");
	}
	else if(!(classTable.hasOwnProperty(superClassName))) {
		// return error if class table doesn't contain a class with given super name
		throw new Error("undeclared class");
	}
	else if(containsDuplicatesArray(instVarNames) || containsDuplicatesSuperClass(instVarNames, superClassName)) {
		// return false if instance variable array contains duplicates
		throw new Error("duplicate instance variable declaration");
	}
	
	// create new class with given super class, variables, and functions
	var newClass = {};
	newClass["super"] = superClassName;
	newClass["var"] = instVarNames;
	newClass["fun"] = {};
	
	// make a copy of all the super classes' functions, propagating upwards until superClass is null
	var superClass = superClassName;
	while(superClass !== null) {
		var superFunArray = classTable[superClass]["fun"];
		for(superFun in superFunArray) {
			newClass["fun"][superFun] = superFunArray[superFun];
		}
		superClass = classTable[superClass]["super"];
	}
	
	// place class into class table
	classTable[name] = newClass;
};

OO.declareMethod = function(className, selector, implFn) {
	
	if(!(classTable.hasOwnProperty(className))) {
		// return error if class table doesn't contain given class name
		throw new Error("undeclared class");
	}
	
	// set selector function to parameter function body
	classTable[className]["fun"][selector] = implFn;
};

OO.instantiate = function(className, arg1, arg2) {
	
	if(!(classTable.hasOwnProperty(className))) {
		// return error if class table doesn't contain given class name
		throw new Error("undeclared class");
	}
	
	// create an instance object with a link to its actual class (in class table) and empty variable map
	var instance = {};
	instance["className"] = className;
	instance["var"] = {};
	
	// grab all expected variables from its class in class table
	var varArray = classTable[className]["var"];
	
	// make (variable, null) entries in the instance's variable map for each expected variable in class
	for(var i=0; i<varArray.length; i++) {
		instance["var"][varArray[i]] = null;
	}
	
	// make a copy of all the super classes' variables as well, propagating upwards until superClass is null
	var superClass = classTable[className]["super"];
	while(superClass !== null) {
		var superVarArray = classTable[superClass]["var"];
		for(var i=0; i<superVarArray.length; i++) {
			instance["var"][superVarArray[i]] = null;
		}
		superClass = classTable[superClass]["super"];
	}
	
	// create an arguments array with the instance object concatenated with the rest of arg1, arg2, etc.
	var args = [instance].concat(Array.prototype.slice.call(arguments).slice(1));
	
	// call initialize function, using instance object as _this and the remaining arguments as parameters
	// this will set the instance variables inside the instance object we just constructed
	OO.getClass(className)["fun"]["initialize"].apply(undefined, args);

	// return updated instance
	return instance;	
};

OO.send = function(recv, selector, arg1, arg2) {
	
	// if the receiver is an NLR, no selectors should be called on it; return it
	if(recv instanceof NLR) {
		return recv;
	}
	
	if(recv !== null && typeof recv !== "boolean" && typeof recv !== "number" && !(classTable[recv["className"]]["fun"].hasOwnProperty(selector))) {
		// return error if method selector is not found in recv's class (if recv is not null, number, or boolean)
		throw new Error("message not understood");
	}

	// create an arguments array with the receiver object concatenated with the rest of arg1, arg2, etc.
	var args = [recv].concat(Array.prototype.slice.call(arguments).slice(2));
	
	var receiver = "";

	// if receiver is null, boolean (true/false), or number, use appropriate selector function
	if(recv === null) {
		receiver = "Null";
	}
	else if(typeof recv === "boolean") {
		receiver = recv ? "True" : "False";
	}
	else if(typeof recv === "number") {
		receiver = "Number";
	}
	else {
		receiver = recv["className"];
	}
	
	// call and return selected function, using receiver object as _this and the remaining arguments as parameters
	return classTable[receiver]["fun"][selector].apply(undefined, args);
};

OO.superSend = function(superClassName, recv, selector, arg1, arg2) {
	
	if(!(classTable.hasOwnProperty(superClassName))) {
		// return error if class table doesn't contain given super class name
		throw new Error("undeclared class");
	}
	else if(!(classTable[superClassName]["fun"].hasOwnProperty(selector))) {
		// return error if method selector is not found in recv's super class
		throw new Error("message not understood");
	}
	
	// create an arguments array with the receiver object concatenated with the rest of arg1, arg2, etc.
	var args = [recv].concat(Array.prototype.slice.call(arguments).slice(3));
	
	// call and return the super's selected function, using receiver object as _this and the remaining arguments as parameters
	return classTable[superClassName]["fun"][selector].apply(undefined, args);
};

OO.getInstVar = function(recv, instVarName) {
	
	if(!(recv["var"].hasOwnProperty(instVarName))) {
		// return error if instance variable is not found in recv instance
		throw new Error("undeclared instance variable");
	}
	
	// return value of specified variable in receiver
	return recv["var"][instVarName];
};

OO.setInstVar = function(recv, instVarName, value) {
	
	if(!(recv["var"].hasOwnProperty(instVarName))) {
		// return error if instance variable is not found in recv instance
		throw new Error("undeclared instance variable");
	}
	
	// set specified variable in receiver to specified value and return it
	recv["var"][instVarName] = value;
	return value;
};

OO.getClass = function(name) {
	
	if(!(classTable.hasOwnProperty(name))) {
		// return error if class table doesn't contain given class name
		throw new Error("undeclared class");
	}
	
	// return class object mapped to by name
	return classTable[name];
};

OO.classOf = function(x) {
	
	// given an instance object, obtain its class name and return the class object
	return OO.getClass(x["className"]);
};

// returns true if array arr contains duplicates
function containsDuplicatesArray(arr) {
	
	// iterate over array starting from the end; if index ever mismatches, there is a duplicate, so return true
	for(var i=arr.length-1; i>=0; i--) {
		if(arr.indexOf(arr[i]) !== i) {
			return true;
		}
	}
	
	// no duplicates, so return false
	return false;
}

// returns true if array arr contains any variable elements that are duplicated in any super class
function containsDuplicatesSuperClass(arr, superClass) {
	
	// if we've checked all super classes, then no duplicates exist; return false
	if(superClass === null) {
		return false;
	}
	
	// otherwise, if any variables in the array exists in variable list from immediate super class, return true
	for(var i=0; i<arr.length; i++) {
		if(classTable[superClass]["var"].indexOf(arr[i]) != -1) {
			return true;
		}
	}
	
	// if no duplicates found in immediate super class, propagate upwards to the next super class
	return containsDuplicatesSuperClass(arr, classTable[superClass]["super"]);
}

/* Homework 5 */

// convert a string array into string representation (including brackets)
function stringifyArray(arr) {
	
	var str = "[";
	for(var i=0; i<arr.length; i++) {
		if(i < arr.length-1) {
			str += stringify(arr[i]) + ", ";
		}
		else {
			str += stringify(arr[i]);
		}
	}
	str += "]";
	return str;
}

// convert an array into string representation (including brackets)
function arrayStringify(arr) {
	return "[" + arr.toString() + "]";
}

// add escaped quotes to both ends of string
function stringify(str) {
	return "\"" + str + "\"";
}

// cast variable to string
function castString(str) {
	return "" + str;
}

// add semicolon to end of string if it doesn't exist
function addSemicolon(str) {
	if(castString(str).slice(-1) !== ";") {
		str += ";";
	}
	return str;
}

// add "return " to beginning of string if it doesn't exist
function addReturn(str) {
	if(castString(str).indexOf("return ") !== 0) {
		str = "return " + str;
	}
	return str;
}

// remove semicolon to end of string if it exists
function removeSemicolon(str) {
	if(castString(str).slice(-1) === ";") {
		str = str.substring(0, str.length-1);
	}
	return str;
}

// remove "return " to beginning of string if it doesn't exist
function removeReturn(str) {
	if(castString(str).indexOf("return ") === 0) {
		str = str.substring(7);
	}
	return str;
}

// define non-local return (NLR) "Error" object`
function NLR(id, value) {
	this.name = 'NLR';
	this.id = id;
	this.value = value;
}

function getNLRValue(nlr) {
	while(nlr instanceof NLR) {
		nlr = nlr.value;
	}
	return nlr;
}

// create global variable table
var variableTable = {};

// create global AST translated JavaScript string
var jsCode = "";

//create non-local return ID tracker and answer
var nlrNext = 0;
var nlrAns = null;

O.transAST = function(ast) {
	
	// reset class table and javascript translation string
	OO.initializeCT();
	jsCode = "";
	
	// reset non-local return variables
	nlrNext = 0;
	nlrAns = null;
	
	return translateAST(undefined, ast);
  
};

function translateAST(methodClass, ast) {
	
	var tag = ast[0];
	var args = ast.slice(1);
	
	switch(tag) {
		
		/* PROGRAM */
		
		case "program": //["program", ast1, ast2, ...]
			var ans;
			for(var i=0; i<args.length; i++) {
				 jsCode += translateAST(undefined, args[i]) + "\n";
			}
			return jsCode;
			
		/* SPECIAL STATEMENTS */
		
		case "classDecl": //["classDecl", "ThreeDeePoint", "Point", ["z"]]
			var name = args[0];
			var superClassName = args[1];
			var instVarNames = args[2];
			return "OO.declareClass(" + stringify(name) + ", " + stringify(superClassName) + ", " + stringifyArray(instVarNames) + ");";
			
		case "methodDecl": //["methodDecl", "C", "m", ["a", "b", "c"], [...]]
			var className = args[0];
			var selector = args[1];
			var expectedParameters = ["_this"].concat(args[2]);
			var functionStatements = args[3];
			var functionBody = "";
			functionBody += "var nlr = nlrNext++;\n";
			functionBody += "var nlrAns;\n";
			for(var i=0; i<functionStatements.length; i++) {
				var functionLine = translateAST(className, functionStatements[i]);
				if(castString(functionLine).indexOf("OO.send") === 0 || castString(functionLine).indexOf("return ") === 0) {
					functionLine = removeSemicolon(removeReturn(functionLine));
					functionLine = "try { throw new NLR(nlr, " + functionLine + "); }\n" + 
						"catch (ex) { if (ex instanceof NLR && ex.id === nlr) { return ex.value; } else throw ex; }\n";
				}
				functionLine = addSemicolon(functionLine);
				functionBody += functionLine + "\n";
			}
			functionBody += "return _this;";
			var implFn = new Function(expectedParameters, functionBody);
			// console.log("OO.declareMethod(" + stringify(className) + ", " + stringify(selector) + ", " + implFn.toString() + ");");
			return "OO.declareMethod(" + stringify(className) + ", " + stringify(selector) + ", " + implFn.toString() + ");";

		/* STATEMENTS */
			
		case "varDecls": //["varDecls", [x1, e1], [x2, e2]…]
			var variables = "";
			for(var i=0; i<args.length; i++) {
				if(i === 0) {
					variables = "var ";
				}
				var name = args[i][0];
				var value = translateAST(methodClass, args[i][1]);
				variables += (name + "=" + value);
				if(i < args.length-1) {
					variables += ", ";
				}
				else {
					variables += ";";
				}
			}
			return variables;

		case "return": //["return", e]
			var e = args[0];
			var translatedE = translateAST(methodClass, e);
			return addReturn(addSemicolon(translatedE));
			
		case "setVar": //["setVar", x, e]
			var name = args[0];
			var value = translateAST(methodClass, args[1]);
			return args[0] + "=" + value + ";";
			
		case "setInstVar": //["setInstVar", x, e]
			var recv = "_this";
			var instVarName = args[0];
			var value = translateAST(methodClass, args[1]);
			return "OO.setInstVar(" + recv + ", " + stringify(instVarName) + ", "  + value + ")";
			
		case "exprStmt": //["exprStmt", e]
			var e = args[0];
			var translatedE = translateAST(methodClass, e);
			if(typeof methodClass === "undefined") {
				return addSemicolon("nlrAns = " + translatedE) + "\n" + "nlrAns";
			}
			return translatedE;

		/* PRIMITIVE EXPRESSIONS */

		case "null":
			return null;
			
		case "true":
			return true;
			
		case "false":
			return false;
			
		case "number":
			var num = args[0];
			return num;
		
		/* EXPRESSIONS */
		
		case "getVar": //["getVar", x]
			var name = args[0];
			return name;

		case "getInstVar": //["getInstVar", x]
			var recv = "_this";
			var instVarName = args[0];
			return "OO.getInstVar(" + recv + ", " + stringify(instVarName) + ")";

		case "new": //["new", C, e1, e2, …]
			for(var i=1; i<args.length; i++) {
				args[i] = translateAST(methodClass, args[i]);
			}
			args[0] = stringify(args[0]);
			return "OO.instantiate.apply(null, " + arrayStringify(args) + ")";

		case "send": //["send", erecv, m, e1, e2, …]
			for(var i=0; i<args.length; i++) {
				if(i===1) {
					args[i] = stringify(args[i]);
					continue;
				}
				args[i] = translateAST(methodClass, args[i]);
			}
			return "OO.send.apply(null," + arrayStringify(args) + ")";
			
		case "super": //["super", m, e1, e2, …]
			var superClassNameLocation = "classTable[" + stringify(methodClass) + "][" + stringify("super") + "]";
			for(var i=1; i<args.length; i++) {
				args[i] = translateAST(methodClass, args[i]);
			}
			var recv = "_this";
			args[0] = stringify(args[0]);
			return "OO.superSend.apply(null," + arrayStringify([superClassNameLocation, recv].concat(args)) + ")";

		/* BLOCK EXPRESSIONS */

		case "block": // ["block", [x1, x2, …], [s1, s2, …]]
			var expectedParameters = args[0]; // if we don't pass in _this block
			var functionStatements = args[1];
			var functionBody = "";
			for(var i=0; i<functionStatements.length; i++) {
				var functionLine = translateAST(methodClass, functionStatements[i]);
				if(i === functionStatements.length-1) {
					functionLine = addSemicolon(addReturn(functionLine));
				}
				else {
					functionLine = addSemicolon(functionLine) + "\n";
				}
				functionBody += functionLine;
			}
			var implFn = new Function(expectedParameters, functionBody);
			return "OO.instantiate(" + stringify("Block") + ", " + implFn.toString() + ")";
			
		/* OTHER */

		case "this":
			return "_this";
		
		default:
			// console.log("something wasn't handled");
			throw new Error("unknown tag");
			break;
	}
	
}

