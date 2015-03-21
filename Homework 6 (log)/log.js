// Nathan Tung (004-059-195) for CS137A

// -----------------------------------------------------------------------------
// Part I: Rule.prototype.makeCopyWithFreshVarNames() and
//         {Clause, Var}.prototype.rewrite(subst)
// -----------------------------------------------------------------------------

Rule.prototype.makeCopyWithFreshVarNames = function() {
	// no body; return a copy of rule with fresh copy of head
	if(this.body.length === 0) {
		return new Rule(this.head.makeCopyWithFreshVarNames());
	}
	// otherwise, propagate method to create copies of body clauses
	var newBody = [];
	for(var i=0; i<this.body.length; i++) {
		newBody[i] = this.body[i].makeCopyWithFreshVarNames();
	}
	return new Rule(this.head.makeCopyWithFreshVarNames(), newBody);
};

Clause.prototype.makeCopyWithFreshVarNames = function() {
	// atom clause with no args; return a fresh copy of itself
	if(this.args.length === 0) {
		return new Clause(this.name);
	}
	// otherwise, propagate method to create fresh copies of body clauses
	var newArgs = [];
	for(var i=0; i<this.args.length; i++) {
		newArgs[i] = this.args[i].makeCopyWithFreshVarNames();
	}
	return new Clause(this.name, newArgs);
};

Var.prototype.makeCopyWithFreshVarNames = function() {
	// return fresh copy of variable (with incremented name string)
	return new Var(incrementString(this.name));
};

// extracts trailing number in str, increments it by 1, and concatenates it back
// if str does not have a trailing number, a '1' is appended instead
function incrementString(str) {
	// get trailing numbers in str
	var base = str.replace(/\d+$/, '');
	// if no trailing numbers, return string base concatenated with "1"
	if (base === str) {
		return base + "1";
	}
	// extract string form of trailing numbers, parsed into an int
	var numStr = str.substring(base.length);
	var num = parseInt(numStr);
	// return string base concatenated with incremented number
	return base + (++num);
}

Clause.prototype.rewrite = function(subst) {
	// atom clause with no args; return a fresh copy of itself
	if(this.args.length === 0) {
		return new Clause(this.name);
	}
	// otherwise, propagate method to create fresh copies of body clauses
	var newArgs = [];
	for(var i=0; i<this.args.length; i++) {
		newArgs[i] = this.args[i].rewrite(subst);
	}
	return new Clause(this.name, newArgs);
};

Var.prototype.rewrite = function(subst) {
	// lookup substitution binding (from varName to term)
	var term = subst.lookup(this.name);
	// return either substituted term or original variable
	if(term) {
		return term;
	}
	return new Var(this.name);
};

// -----------------------------------------------------------------------------
// Part II: Subst.prototype.unify(term1, term2)
// -----------------------------------------------------------------------------

Subst.prototype.unify = function(term1, term2) {
	// simply return result from recursively running the unifier helper function
	return unifier(term1, term2, this);
};

function unifier(term1, term2, subst) {
	// rewrite both terms, resyncing with subst
	term1 = term1.rewrite(subst);
	term2 = term2.rewrite(subst);
	
	// if both terms are variables...
	// and both names match, return unchanged subst; otherwise, bind one name (ideally the query) to the other
	if(term1 instanceof Var && term2 instanceof Var) {
		if(term1.name === term2.name) {
			return subst;
		}
		else {
			return subst.bind(term2.name, term1);
		}
	}
	// if both terms are clauses with matching names and same number of arguments...
	// drill-down and unify corresponding terms, updating subst as we go along before returning it
	if(term1 instanceof Clause && term2 instanceof Clause) {
		if(term1.name === term2.name && term1.args.length === term2.args.length) {
			// run unify on all the other terms of subst
			for(var i=0; i<term1.args.length; i++) {
				subst = unifier(term1.args[i], term2.args[i], subst);
			}
			return subst;
		}
	}
	// if terms are variable/clause pairs, bind the variable to the clause
	// return the updated subst
	if(term1 instanceof Var && term2 instanceof Clause) {
		return subst.bind(term1.name, term2);
	}
	if(term1 instanceof Clause && term2 instanceof Var) {
		return subst.bind(term2.name, term1);
	}
	// otherwise, unification could not be done
	throw new Error("unification failed");
}

// -----------------------------------------------------------------------------
// Part III: Program.prototype.solve()
// -----------------------------------------------------------------------------

function Iterator(rules, query) {
	
	this.rules = rules;
	this.query = query;
	this.substList = [];	
	
}

Iterator.prototype.next = function() {

	// try to find the next solution and return the resulting Subst
	// if no solutions, return false
	try {
		var ans = solver(this.rules, this.query, 0, new Subst(), this.substList);
		// whenever a solution is found, push it into the substList so that it skips next time
		this.substList.push(ans);
		// rewrite the solution such that no more substitutions can be rewritten
		return rewriteSubst(rewriteSubst(ans));
	} catch (e) {
		return false;
	}
	
}

Program.prototype.solve = function() {
	
	// return an Iterator object which uses given rules/query to find next solution
	return new Iterator(this.rules, this.query);
	
};

function solver(rules, query, queryInd, subst, substList) {

	// rewrite the current query to be solved for
	var tmpQuery = query[queryInd].rewrite(subst);

	// console.log("unifying query " + queryInd + ": " + tmpQuery.toString());
	
	// check every rule from top to bottom, unifying/solving when possible
	for(var j=0; j<rules.length; j++) {

	// clone subst so any backtracked changes are not permanent
		var substClone = subst.clone();

		// rewrite the rule we're currently looking at
		var tmpRule = rules[j].makeCopyWithFreshVarNames();

		// get a new set of fresh rules to be passed into the next solver call
		var newRules = [];

		for(var k=0; k<rules.length; k++) {
			newRules[k] = rules[k].makeCopyWithFreshVarNames();
		}

		// if the rule has no body, we only need to unify head
		// otherwise, we need to unify head, then run body terms as queries
		if(tmpRule.body.length === 0) {

			// console.log("testing rule " + j + " (term): " + tmpRule.head.toString());

			try {
				substClone.unify(tmpRule.head, tmpQuery);
			
				// if substList contains copy of substClone, continue to check next rule
				if(listContainsSubst(substList, substClone)) {
					continue;
				}

				// if there are more queries, solve for the next one
				if(queryInd < query.length-1) {
					substClone = solver(newRules, query, queryInd+1, substClone, substList);
				}
				
				// otherwise, return substClone
				return substClone;
				
			} catch (e) {
				// no unification means we try next rule
				continue;
			}
		}
		else {
			// console.log("testing rule " + j + " (function): " + tmpRule.head.toString());
			try {
				substClone.unify(tmpRule.head, tmpQuery);
				
				//console.log("head matched, testing with body: ");
				
				substClone = solver(newRules, tmpRule.body, 0, substClone, substList);
				
				// if substList contains copy of substClone, continue to check next rule
				if(listContainsSubst(substList, substClone)) {
					continue;
				}
				
				// if there are more queries, solve for the next one
				if(queryInd < query.length-1) {
					substClone = solver(newRules, query, queryInd+1, substClone, substList);
				}
				
				// otherwise, return substClone
				return substClone;
			} catch (e) {
				// no unification means we try next rule
				continue;
			}
		}
	}
	// if query did not unify with any rule; otherwise, return subst
	throw new Error("could not solve instance");
}

// return true if term1 and term2 are recursively identical
function equivalentTerms(term1, term2) {
	if(term1 instanceof Var && term2 instanceof Var) {
		if(term1.name === term2.name) {
			return true;
		}
	}
	if(term1 instanceof Clause && term2 instanceof Clause) {
		if(term1.name === term2.name && term1.args.length === term2.args.length) {
			for(var i=0; i<term1.args.length; i++) {
				if(!equivalentTerms(term1.args[i], term2.args[i])) {
					return false;
				}
			}
			return true;
		}
	}
	return false;
}

// return true if subst1 includes subst2
function containsSubst(subst1, subst2) {
	if(!(subst1 instanceof Subst && subst2 instanceof Subst)) {
		return false;
	}
	for (var varName in subst1.bindings) {
		if(!equivalentTerms(subst1.lookup(varName),subst2.lookup(varName))) {
			return false;
		}
	}
	return true;
}

// return true if subst1 and subst2 are identical
function equivalentSubst(subst1, subst2) {
	return containsSubst(subst1, subst2) && containsSubst(subst2, subst2);
}

// return true if list contains subst
function listContainsSubst(list, subst) {
	for(var i=0; i<list.length; i++) {
		if(equivalentSubst(list[i], subst)) {
			return true;
		}
	}
	return false;
}

// rewrite all binding results in subst until no more changes are made
function rewriteSubst(subst) {
	var substClone = subst.clone();
	for(var varName in substClone.bindings) {
		var term = substClone.lookup(varName);
		substClone.bindings[varName] = term.rewrite(substClone);
	}
	while(!(equivalentSubst(subst, substClone))) {
		subst = substClone;
		for(var varName in substClone.bindings) {
			var term = substClone.lookup(varName);
			substClone.bindings[varName] = term.rewrite(substClone);
		}
	}
	return subst;
}

// return Clause as string representation (for debugging)
Clause.prototype.toString = function() {
	var argsString = "";
	for(var i=0; i<this.args.length; i++) {
		if(i === 0) {
			argsString = "(";
		}
		if(i === this.args.length-1) {
			argsString += this.args[0].toString() + ")";
		}
		else {
			argsString += this.args[0].toString() + ", ";
		}
	}
	return this.name + argsString;
}

// return Var as string representation (for debugging)
Var.prototype.toString = function() {
	return this.name;
}
