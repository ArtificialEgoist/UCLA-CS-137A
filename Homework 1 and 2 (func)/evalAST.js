// Nathan Tung
// 004-059-195
// CS 137A

F.evalAST = function(ast) {
	var emptyEnv = new Env(undefined, undefined, undefined);
	return ev(ast, emptyEnv);
};

function ev(ast, env) {
	
	if(isPrimitive(ast)) {
		return ast;
	}
	else {			
		var tag = ast[0];
		var args = ast.slice(1)
		// return impls[tag].apply(undefined, args);
	
		switch(tag) {
			case "closure":
				// closure is a basic type; simply add env's first name/value pair to its environment so it can call itself
				ast[3] = new Env(env.name, env.value, ast[3]);
				return ast;
			case "+":
				// check that arguments are numbers, then evaluate
				if(!isNumber(ev(args[0], env)) || !isNumber(ev(args[1], env)))
					throw new Error('the \'+\' operator takes in only numbers');
				return ev(args[0], env) + ev(args[1], env);
			case "-":
				// check that arguments are numbers, then evaluate
				if(!isNumber(ev(args[0], env)) || !isNumber(ev(args[1], env)))
					throw new Error('the \'-\' operator takes in only numbers');
				return ev(args[0], env) - ev(args[1], env);
			case "*":
				// check that arguments are numbers, then evaluate
				if(!isNumber(ev(args[0], env)) || !isNumber(ev(args[1], env)))
					throw new Error('the \'*\' operator takes in only numbers');
				return ev(args[0], env) * ev(args[1], env);
			case "/":
				// check that arguments are numbers, then evaluate
				if(!isNumber(ev(args[0], env)) || !isNumber(ev(args[1], env)))
					throw new Error('the \'/\' operator takes in only numbers');
				return ev(args[0], env) / ev(args[1], env);
			case "%":
				// check that arguments are numbers, then evaluate
				if(!isNumber(ev(args[0], env)) || !isNumber(ev(args[1], env)))
					throw new Error('the \'%\' operator takes in only numbers');
				return ev(args[0], env) % ev(args[1], env);
			case "=":
				// check if arguments are same type, then compare arguments
				if(typeof ev(args[0], env) !== typeof ev(args[1], env))
					return false;
				return ev(args[0], env) === ev(args[1], env);
			case "!=":
				// compare arguments
				return ev(args[0], env) !== ev(args[1], env);
			case "<":
				// check that arguments are numbers, then evaluate
				if(!isNumber(ev(args[0], env)) || !isNumber(ev(args[1], env)))
					throw new Error('the \'<\' operator takes in only numbers');
				return ev(args[0], env) < ev(args[1], env);
			case ">":
				// check that arguments are numbers, then evaluate
				if(!isNumber(ev(args[0], env)) || !isNumber(ev(args[1], env)))
					throw new Error('the \'>\' operator takes in only numbers');
				return ev(args[0], env) > ev(args[1], env);
			case "&&":
			case "and":
				// check that arguments are booleans, then evaluate
				if(!isBoolean(ev(args[0], env)) || !isBoolean(ev(args[1], env)))
					throw new Error('the \'and\' operator takes in only booleans');
				return ev(args[0], env) && ev(args[1], env);
			case "||":
			case "or":
				// check that arguments are booleans, then evaluate
				if(!isBoolean(ev(args[0], env)) || !isBoolean(ev(args[1], env)))
					throw new Error('the \'or\' operator takes in only booleans');
				return ev(args[0], env) || ev(args[1], env);
			case "id":
				// return value if name-value pair is found in environment
				return env.lookup(args[0]); // return ev(env.lookup(args[0]), env);
			case "fun":
				var fun = []; // create a function element
				fun.push('closure'); // closure tag
				fun.push(args[0]); // list of variables
				fun.push(args[1]); // unevaluated expression (evaluate when called)
				fun.push(env); // environment
				return fun;
			case "call":
				var fun = ev(args[0], env); // evaluated closure without updated environment
				var numArgsNeeded = fun[1].length; // size of list of parameter variables
				var numArgsGiven = args.length-1; // number of provided parameter values
				// check that number of parameters/arguments matches expectations
				if(numArgsGiven === numArgsNeeded) {
					var newEnv = fun[3]; // initialize newEnv to current env in outer function
					// wrap all name-value pairs in child environments
					for(var i=1; i<numArgsGiven+1; i++) {
						var name = fun[1][i-1];
						var value = ev(args[i], env);
						newEnv = new Env(name, value, newEnv);
					}
					
					return ev(fun[2], newEnv); // return expression with updated environment
				}
				else if (numArgsGiven < numArgsNeeded) {
					var newEnv = fun[3]; // initialize newEnv to current env in outer function
					// wrap all name-value pairs in child environments
					for(var i=1; i<numArgsGiven+1; i++) {
						var name = fun[1][i-1];
						var value = ev(args[i], env);
						newEnv = new Env(name, value, newEnv);
					}
					
					var newFun = []; // create a function element
					newFun.push('closure'); // closure tag
					
					var newParams = [];
					for(var i = numArgsGiven; i<numArgsNeeded; i++) {
						newParams.push(fun[1][i]);
					}
					newFun.push(newParams); // new list of variables
					
					newFun.push(fun[2]); // unevaluated expression (not enough arguments)
					newFun.push(newEnv); // new environment

					return newFun;
				}
				else {
					throw new Error('too many arguments');
				}
			case "let":
				var value = ev(args[1], env); // evaluate the value

				// set value to itself evaluated with recursive function mapping
				// this is used for functions/closures so that the function binds itself to its environment
				value = ev(value, new Env(args[0], value, env));
				
				var newEnv = new Env(args[0], value, env); // create child env with name-value pair
				return ev(args[2], newEnv); // return expression with updated environment
			case "if":
				// check that variable being used as a condition is a boolean
				// if so, return different arguments depending on its value
				var condition = ev(args[0], env);
				if(isBoolean(condition)) {
					return condition ? ev(args[1], env) : ev(args[2], env);
				}
				else
					throw new Error('the \'if\' condition must evaluate to a boolean');
			case "cons":
				var cons = []; // create a cons element
				cons.push('cons'); // cons tag
				cons.push(ev(args[0], env)); // first evaluated variable
				cons.push(ev(args[1], env)); // second evaluated variable
				return cons;
			case "match":				
				var exp = ev(args[0], env);
				
				// match 3 with 1->1 | 2->2 | null->null | _ -> 100
				// match [1;2::3;4] with [1;x::_;y] -> 1
				
				// cycle through all pairs of patterns (p) and expressions (e)
				for(var i=1; i<args.length-1; i+=2) {
					var p = args[i];
					var e = args[i+1];
					
					// if primitive pattern matches exp type and value, evaluate e using current env
					if(isPrimitiveMatch(p, exp))
						return ev(e, env);
					
					// for patterns with tags
					if(!isPrimitive(p)) {
						
						// if pattern is _, evaluate e using current env
						if(p[0]==='_') {
							return ev(e, env);
						}
						
						// if pattern is id or cons (with a match on exp), evaluate e using multiply-newly-bound env
						if(p[0]==='id' || p[0]==='cons') {
							
							// generate an empty map
							var bindings = {};
							
							if(recursiveMatch(p, exp, bindings)) {
								
								// if pattern matches exp, continuously create new outer env with bindings
								var newEnv = env;
								for(var name in bindings) {
									newEnv = new Env(name, bindings[name], newEnv);
								}
								
								// evaluate e using the new env
								return ev(e, newEnv);
							}
							
							// if pattern doesn't match with exp, reset bindings map
							bindings = {};
						}
					}
				}
				throw new Error('no match found');
			case "set":
				// return the new value which the variable is set to
				return env.set(args[0], ev(args[1], env));
			case "seq":
				// evaluate both expressions, returning the value of the second
				ev(args[0], env);
				return ev(args[1], env);
			case "listComp":
				return recursiveListComp(args[0], args[1], args[2], env, args[3]);
			case "delay":
				// create a closure that expects no arguments
				var arr = [];
				arr.push('closure');
				arr.push([]);
				arr.push(args[0]);
				arr.push(env);
				return arr;
			case "force":
				// create a call on the "delay closure" and evaluate it
				var closure = ev(args[0], env);
				var exp2 = ['call', closure];
				return ev(exp2, env);
			default:
				// all other tags/operations are not supported, according to the specs
				throw new Error('this operation is unsupported');
		}
	}
}

// function to "create" an Env "object" with name-value pair and pointer to parent Env
function Env(name, value, parent) {
	this.name = name;
	this.value = value;
	this.parent = parent;
}

// Env function to return name-value pair if name exists
// otherwise, continuously chain up the prototypes until name-value is found or no more Envs exist
Env.prototype.lookup = function(name) {
	if(this.name===name) // return value if this environment has name-value pair
		return this.value;
	else if(this.parent) // check that a parent environment exists and call this function on it
		return this.parent.lookup(name);
	else // no value bound to identifier, so throw an error
		throw new Error('unbound identifier: ' + name);
}

// var x3 = new Env('x3', 3, new Env('x2', 2, new Env('x1', 1, new Env(undefined, undefined, undefined)));
Env.prototype.set = function(name, newValue) {
	if(this.name===name) { // return value if this environment has name-value pair
		this.value = newValue;
		return this.value;
	}
	else if(this.parent) { // check that a parent environment exists and call this function on it
		return this.parent.set(name, newValue);
	}
	else { // no value bound to identifier, so throw an error
		throw new Error('unbound identifier: ' + name);
	}
}

// return true if element is null or undefined
function isNullOrUndefined(element) {
	return (element == null || typeof element === 'undefined');
}

// return true if element is boolean type
function isBoolean(element) {
	return (typeof element === 'boolean');
}

// return true if element is number type
function isNumber(element) {
	return (typeof element === 'number');
}

// return true if element is primitive (null, undefined, boolean, or number)
function isPrimitive(element) {
	return isNullOrUndefined(element) || isBoolean(element) || isNumber(element);
}

// return true if expression matches the primitive pattern in type and value
function isPrimitiveMatch(pattern, expression) {
	return (isPrimitive(pattern) && typeof expression === typeof pattern && expression === pattern);
}

// return true if entire pattern matches expression
// adds all name-value pairs to bindings map
function recursiveMatch(pattern, expression, bindings) {

	// if pattern and expression are both primitives and match, return true
	if(isPrimitiveMatch(pattern, expression))
		return true;

	if(!isPrimitive(pattern)) {
		
		// if pattern is _, we don't care about the expression and return true
		if(pattern[0]==='_') {
			return true;
		}
		
		// if pattern is id, we bind the variable to its equivalent expression
		if(pattern[0]==='id') {
			bindings[pattern[1]] = expression;
			return true;
		}
		
		// if pattern is cons, we recursively match both the first and second elements
		if(pattern[0]==='cons') {
			return recursiveMatch(pattern[1], expression[1], bindings) && recursiveMatch(pattern[2], expression[2], bindings);
		}
	}
	
	// no matches were found, so return false
	// pattern does NOT match the expression,so our evaluate method needs to jump to the next pattern 
	return false;
}

// recursiveListComp(["*", ["id", "x"], 2], "x", ["cons", 0, ["cons", 1, ["cons", 2, ["cons", 3, ["cons", 4, null]]]]], new Env(undefined, undefined, undefined), ["=", ["%", ["id", "x"], 2], 0]);
function recursiveListComp(expression, variable, list, environment, predicate) {

	list = ev(list, environment);
	
	if(isPrimitive(list)) {
		
		if(isNullOrUndefined(list)) return list;
		
		var newEnv = new Env(variable, list, environment);
		
		if(predicate) {
			if(ev(predicate, newEnv)) {
				return ev(expression, newEnv);
			}
			else {
				return null;
			}
		}
		else
			return ev(expression, newEnv);
		
	}
	
	if(list[0]==='cons') {
		var element1 = recursiveListComp(expression, variable, list[1], environment, predicate);
		var element2 = recursiveListComp(expression, variable, list[2], environment, predicate);
		
		if(isNullOrUndefined(element1))
			return element2;
		
		var arr = [];
		arr.push('cons');
		arr.push(element1);
		arr.push(element2);
		return arr;
	}
	
	return null;
}