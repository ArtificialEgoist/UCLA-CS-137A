// Initialize the class table!

OO.initializeCT();

// Tests for Part II

tests(O,
  {
    name: 'arithmetic',
    code: '1 + 2 * 3',
    expected: 7
  },
  {
    name: 'var decls + access',
    code: 'var x = 1, y = 2;\n' +
          'x * 10 + y',
    expected: 12
  },
  {
    name: 'var decl + assignment',
    code: 'var x = 1;\n' +
          'x = 2;\n' +
          'x * 3',
    expected: 6
  },
  {
    name: 'method decl, new, and send',
    code: 'def Object.m() { return 42; }\n' +
          'new Object().m()',
    expected: 42
  },
  {
    name: 'method decl (with args), new, and send',
    code: 'def Object.m(x, y) { return x + y; }\n' +
          'new Object().m(1, 2)',
    expected: 3
  },
  {
    name: 'class decl + method decl + inst var ops + new',
    code: 'class RefCell with value;\n' +
          'def RefCell.initialize(value) { this.value = value; }\n' +
          'def RefCell.get() = this.value;\n' +
          'new RefCell(3).get()',
    expected: 3
  },
  {
    name: 'class decl + method decls + super send (1/2)',
    code: 'class C;\n' +
          'def Object.foo() = 1;\n' +
          'def C.foo() = super.foo() + 41;\n' +
          'new C().foo()',
    expected: 42
  },
  {
    name: 'method decls + super send (2/2)',
    code: 'def Boolean.foo() = 1;\n' +
          'def True.foo() = super.foo() + 41;\n' +
          'true.foo()',
    expected: 42
  },
	{
		name: 'method decls + super send (3/3)',
		code: 'class Point with x, y;\n' +
		'def Point.initialize(x, y) { super.initialize(); this.x = x; this.y = y; }\n' +
		'class ThreeDeePoint extends Point with z;\n' +
		'def ThreeDeePoint.initialize(x, y, z) { super.initialize(x, y); this.z = z; }\n' +
		'def ThreeDeePoint.m() = this.x * 100 + this.y * 10 + this.z;\n' +
		'new ThreeDeePoint(1, 2, 3).m()',
		expected: 123
	},
  {
	name: 'class init inside method decl (v. 1)',
	code: 'var external = 1;\n' +
	'class Math extends Object;\n' +
	'def Math.sum(x, y) { return x+y; }\n' +
	'class NewObject with internal;\n' + 
	'def NewObject.initialize(internal) { this.internal = internal; }\n' + 
	'def NewObject.m(external) { return this.internal + external; }\n' + 
	'var obj = new NewObject(100);\n' + 
	'obj.m(55);\n',
	expected: 155
  },
  {
	name: 'class init inside method decl (v. 2)',
	code: 'var external = 1;\n' +
	'class Math extends Object;\n' +
	'def Math.sum(x, y) { return x+y; }\n' +
	'class NewObject with internal;\n' + 
	'def NewObject.initialize(internal) { this.internal = internal; }\n' + 
	'def NewObject.m(external) { var m = new Math(); return m.sum(this.internal, external); }\n' + 
	'var obj = new NewObject(100);\n' + 
	'obj.m(66);\n',
	expected: 166
  },
  {
	name: 'simplified class inside class (v. 1)',
	code: 'class Test extends Object;\n' + 
	'def Test.sum(a,b) { return a+b; }\n' + 
	'class Other extends Object;\n' + 
	'def Other.blah() {\n' + 
	'	var test = new Test();\n' + 
	'	return test.sum(101, 2);\n' + 
	'}\n' + 
	'new Other().blah();\n',
    expected: 103
  },
  {
	name: 'simplified class inside class (v. 2)',
	code: 'class Test extends Object;\n' + 
	'def Test.sum(a,b) { return a+b; }\n' + 
	'class Other extends Object with x;\n' + 
	'def Other.initialize(value) { this.x = value; }\n' + 
	'def Other.blah(y) {\n' + 
	'	var test = new Test();\n' + 
	'	return test.sum(y, this.x);\n' + 
	'}\n' + 
	'new Other(3).blah(111);\n',
    expected: 114
  }
);

