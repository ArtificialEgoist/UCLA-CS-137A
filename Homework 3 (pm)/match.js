// CS137A Homework 3 (Pattern Matching)
// Nathan Tung (004-059-195)

// constructor for when() calls
// wraps function within the When object
function When(func) {
	this.func = func;
}

// constructor for many() calls
// wraps expression within the Many object
function Many(expression) {
	this.expression = expression;
}

// constructor for Wildcard (_)
// check if a variable x is _ using conditional (x.constructor === Wildcard)
function Wildcard() {}

// define _ to be a Wildcard
var _ = new Wildcard();

// default match function
function match(value /* , pat1, fun1, pat2, fun2, ... */) {
	
	// go through all pattern-function pairs
	for(var i=1; i<arguments.length; i+=2) {
		
		// store all bindings to use as parameters in final called function; resets for independent calls to match()
		var params = [];
		
		// parse out pattern-function pairs
		var pattern = arguments[i];
		var func = arguments[i+1];
		
		// if function is of wrong type, return an exception
		if(typeof func !== 'function') {
			throw new Error("provided function is invalid");
		}
		
		// check to see (recursively) if the first layer of value and pattern matches
		var matched = matches(value, pattern, params);
		
		// if a match is found, check for equal numbers of parameters or throw an exception
		if(matched) {
			if (params.length === func.length)
				return func.apply(null, params);
			else
				throw new Error("wrong number of arguments");
		}
	}
	
	// if we didn't find any matches for all pattern-function pairs, return "no match" exception
	throw new Error("match failed");
}

// returns true if value recursively matches pattern
// also populates array arr with parameter bindings
function matches(value, pattern, arr) {
	
	// if pattern is neither a When nor a _ and its type differs from value, there's a type mismatch, so return false
	if(!(pattern.constructor === When || pattern.constructor === Wildcard))
		if(typeof value !== typeof pattern)
			return false;
		
	// if pattern is a When, return whether its function evaluates to true
	if(pattern.constructor === When) {
		
		// if When's function is true, push one-time binding to arr and return; return false otherwise
		if(pattern.func.apply(null, [value])) {
			arr.push(value);
			return true;
		}
		return false;
		
	}
	
	// if both value and pattern are arrays, do a recursive match on each element
	if(value.constructor === Array && pattern.constructor === Array) {
		
		// assign index pointers for both value and pattern arrays
		var valueIndex = 0, patternIndex = 0;
		
		// initialize an array to aggregate all Many bindings, if applicable
		var manyParams = [];
		
		// while both arrays are still in bounds, keep traversing through and testing for matches
		while(patternIndex<pattern.length && valueIndex<value.length) {
			
			var currValue = value[valueIndex];
			var currPattern = pattern[patternIndex];
			
			// if pattern is a Many
			if(currPattern.constructor === Many) {
				
				// decrement pointer value so the pattern stops at that Many (it's like a catchall)
				patternIndex--;
				
				console.log("MATCHING:");
				console.log(currValue);
				console.log(currPattern.expression);
				
				// check that value matches with Many's wrapped expression (and throw bindings into aggregate manyParams array)
				// if it doesn't match with the expression, adjust pointers to test if current value matches the pattern after Many
				if(!matches(currValue, currPattern.expression, manyParams)){
					//return false;
					valueIndex--;
					patternIndex++;
					
					// before moving on, if any parameters have been aggregated into manyParams, push that into arr
					// or rather, ALWAYS return manyParams, even if it's an empty list
					//if(manyParams.length>0) {
						arr.push(manyParams);
						manyParams = [];
					//}
					
					
				}
				
			}
			else {

				// in all other cases, if array values do not match, return false
				if(!matches(currValue, currPattern, arr))
					return false;
				
			}
			
			// increment indices
			valueIndex++;
			patternIndex++;
			
		}
		
		// if some pattern in array has not been matched, a Many has blocked off the rest of our pattern, so no match
		if(patternIndex<pattern.length-1)
			return false;
		
		// if any new parameters have been aggregated into manyParams, push that into arr
		if(manyParams.length>0) {
			arr.push(manyParams);
			manyParams = [];
		}
		
		return true;
	}
	
	// if both value and pattern are primitives, do a simple equality check
	if(isPrimitive(value) && isPrimitive(pattern)) {
		return (value===pattern);
	}
	
	// if pattern is a Wildcard, add value binding to arr 
	if(pattern.constructor === Wildcard) {
		arr.push(value);
		return true;
	}
	
	// if value didn't match by now...then it's hopeless; return false
	return false;
}

// return the function argument wrapped within a When "object"
// when matched, simply check if func.apply(null, [value]) returns true
function when(func) {
	return new When(func);
}

// return the expression wrapped within a "Many" object
// when matched, check if expression matches the rest of the values in the list
function many(expression) {
	return new Many(expression);
}

// check if element is a "primitive" (number, boolean, string, null, or undefined)
function isPrimitive(element) {
	return (typeof element === 'number' || typeof element === 'boolean' || typeof element === 'string' || isNullOrUndefined(element));
}

// check if element is null or undefined
function isNullOrUndefined(element) {
	return (element===null || typeof element === 'undefined');
}

// for testing purposes
function isOne(num) {
	return num===1;
}