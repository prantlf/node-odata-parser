var assert = require('assert');
var parser = require("../lib");

describe('odata query parser grammar', function () {

    it('should parse $top and return the value', function () {

        var ast = parser.parse('$top=40');

        assert.equal(ast.$top, 40);
    });

    it('should parse two params', function () {

        var ast = parser.parse('$top=4&$skip=5');

        assert.equal(ast.$top, 4);
        assert.equal(ast.$skip, 5);
    });


    it('should parse three params', function () {

        var ast = parser.parse('$top=4&$skip=5&$select=Rating');

        assert.equal(ast.$top, 4);
        assert.equal(ast.$skip, 5);
        assert.equal(ast.$select[0], "Rating");
    });

    it('should parse string params', function () {

        var ast = parser.parse('$select=Rating');

        assert.equal(ast.$select[0], 'Rating');
    });

    it('should accept * in $select', function () {

        var ast = parser.parse('$select=*');

        assert.equal(ast.$select[0], '*');
    });

    it('should accept * and , and / in $select', function () {
        
        var ast = parser.parse('$select=*,Category/Name');

        assert.equal(ast.$select[0], '*');
        assert.equal(ast.$select[1], 'Category/Name');
    });

    it('should accept more than two fields', function () {

        var ast = parser.parse('$select=Rating, Name,LastName');

        assert.equal(ast.$select[0], 'Rating');
        assert.equal(ast.$select[1], 'Name');
        assert.equal(ast.$select[2], 'LastName');
    });

    // This select parameter is not currently supported.
    it('should accept * after . in $select', function () {

        var ast = parser.parse('$select=DemoService.*');

        assert.equal(ast.$select[0], 'DemoService.*');
    });
    
    it('should parse order by', function () {

        var ast = parser.parse('$orderby=ReleaseDate desc, Rating');

        assert.equal(ast.$orderby[0].ReleaseDate, 'desc');
        assert.equal(ast.$orderby[1].Rating, 'asc');

    });

    it('should parse $filter', function () {

        var ast = parser.parse("$filter=Name eq 'Jef'");

        assert.equal(ast.$filter.type, "eq");
        assert.equal(ast.$filter.left.type, "property");
        assert.equal(ast.$filter.left.name, "Name");
        assert.equal(ast.$filter.right.type, "literal");
        assert.equal(ast.$filter.right.value, "Jef");
    });
    
    it('should parse multiple conditions in a $filter', function () {

        var ast = parser.parse("$filter=Name eq 'John' and LastName lt 'Doe'");

        assert.equal(ast.$filter.type, "and");
        assert.equal(ast.$filter.left.type, "eq");
        assert.equal(ast.$filter.left.left.type, "property");
        assert.equal(ast.$filter.left.left.name, "Name");
        assert.equal(ast.$filter.left.right.type, "literal");
        assert.equal(ast.$filter.left.right.value, "John");
        assert.equal(ast.$filter.right.type, "lt");
        assert.equal(ast.$filter.right.left.type, "property");
        assert.equal(ast.$filter.right.left.name, "LastName");
        assert.equal(ast.$filter.right.right.type, "literal");
        assert.equal(ast.$filter.right.right.value, "Doe");
    });

    it('should parse substringof $filter', function () {

        var ast = parser.parse("$filter=substringof('nginx', Data)");

        assert.equal(ast.$filter.type, "functioncall");
        assert.equal(ast.$filter.func, "substringof");
        
        assert.equal(ast.$filter.args[0].type, "literal");
        assert.equal(ast.$filter.args[0].value, "nginx");

        assert.equal(ast.$filter.args[1].type, "property");
        assert.equal(ast.$filter.args[1].name, "Data");

    });

    it('should parse substringof $filter with empty string', function () {

        var ast = parser.parse("$filter=substringof('', Data)");
        
        assert.equal(ast.$filter.args[0].type, "literal");
        assert.equal(ast.$filter.args[0].value, "");

    });

    it('should parse substringof eq true in $filter', function () {

        var ast = parser.parse("$filter=substringof('nginx', Data) eq true");

        assert.equal(ast.$filter.type, "eq");
        

        assert.equal(ast.$filter.left.type, "functioncall");
        assert.equal(ast.$filter.left.func, "substringof");
        assert.equal(ast.$filter.left.args[0].type, "literal");
        assert.equal(ast.$filter.left.args[0].value, "nginx");
        assert.equal(ast.$filter.left.args[1].type, "property");
        assert.equal(ast.$filter.left.args[1].name, "Data");

        assert.equal(ast.$filter.right.type, "literal");
        assert.equal(ast.$filter.right.value, true);
    });

    it('should parse startswith $filter', function () {

        var ast = parser.parse("$filter=startswith('nginx', Data)");

        assert.equal(ast.$filter.type, "functioncall");
        assert.equal(ast.$filter.func, "startswith");
        
        assert.equal(ast.$filter.args[0].type, "literal");
        assert.equal(ast.$filter.args[0].value, "nginx");

        assert.equal(ast.$filter.args[1].type, "property");
        assert.equal(ast.$filter.args[1].name, "Data");

    });

    ['tolower', 'toupper', 'trim'].forEach(function (func) {
      it('should parse ' + func + ' $filter', function () {
          var ast = parser.parse("$filter=" + func + "(value) eq 'test'");

          assert.equal(ast.$filter.type, "eq");

          assert.equal(ast.$filter.left.type, "functioncall");
          assert.equal(ast.$filter.left.func, func);
          assert.equal(ast.$filter.left.args[0].type, "property");
          assert.equal(ast.$filter.left.args[0].name, "value");

          assert.equal(ast.$filter.right.type, "literal");
          assert.equal(ast.$filter.right.value, "test");
      });
    });

    ['year', 'month', 'day', 'hour', 'minute', 'second'].forEach(function (func) {
      it('should parse ' + func + ' $filter', function () {
        var ast = parser.parse("$filter=" + func + "(value) gt 0");

          assert.equal(ast.$filter.type, "gt");

          assert.equal(ast.$filter.left.type, "functioncall");
          assert.equal(ast.$filter.left.func, func);
          assert.equal(ast.$filter.left.args[0].type, "property");
          assert.equal(ast.$filter.left.args[0].name, "value");

          assert.equal(ast.$filter.right.type, "literal");
          assert.equal(ast.$filter.right.value, "0");
      });
    });

    ['indexof', 'concat', 'substring', 'replace'].forEach(function (func) {
      it('should parse ' + func + ' $filter', function () {
        var ast = parser.parse("$filter=" + func + "('haystack', needle) eq 'test'");

        assert.equal(ast.$filter.type, "eq");

        assert.equal(ast.$filter.left.type, "functioncall");
        assert.equal(ast.$filter.left.func, func);
        assert.equal(ast.$filter.left.args[0].type, "literal");
        assert.equal(ast.$filter.left.args[0].value, "haystack");
        assert.equal(ast.$filter.left.args[1].type, "property");
        assert.equal(ast.$filter.left.args[1].name, "needle");

        assert.equal(ast.$filter.right.type, "literal");
        assert.equal(ast.$filter.right.value, "test");
      });
    });

    it('should return an error if invalid value', function() {

        var ast = parser.parse("$top=foo");

        assert.equal(ast.error, "invalid $top parameter");
    });
    

    it('should convert dates to javascript Date', function () {
        var ast = parser.parse("$top=2&$filter=Date gt datetime'2012-09-27T21:12:59'");
        assert.ok(ast.$filter.right.value instanceof Date);
    });

    it('should parse boolean okay', function(){
        var ast = parser.parse('$filter=status eq true');
        assert.equal(ast.$filter.right.value, true);
        var ast = parser.parse('$filter=status eq false');
        assert.equal(ast.$filter.right.value, false);
    });

    it('should parse numbers okay', function(){
        var ast = parser.parse('$filter=status eq 3');
        assert.equal(ast.$filter.right.value, 3);
        // Test multiple digits - problem of not joining digits to array
        ast = parser.parse('$filter=status eq 34');
        assert.equal(ast.$filter.right.value, 34);
        // Test number starting with 1 - problem of boolean rule order
        ast = parser.parse('$filter=status eq 12');
        assert.equal(ast.$filter.right.value, 12);
    });

    it('should parse negative numbers okay', function(){
        var ast = parser.parse('$filter=status eq -3');
        assert.equal(ast.$filter.right.value, -3);
        ast = parser.parse('$filter=status eq -34');
        assert.equal(ast.$filter.right.value, -34);
    });

    it('should parse decimal numbers okay', function(){
        var ast = parser.parse('$filter=status eq 3.4');
        assert.equal(ast.$filter.right.value, '3.4');
        ast = parser.parse('$filter=status eq -3.4');
        assert.equal(ast.$filter.right.value, '-3.4');
    });

    it('should parse double numbers okay', function(){
        var ast = parser.parse('$filter=status eq 3.4e1');
        assert.equal(ast.$filter.right.value, '3.4e1');
        ast = parser.parse('$filter=status eq -3.4e-1');
        assert.equal(ast.$filter.right.value, '-3.4e-1');
    });

    it('should parse $expand and return an array of identifier paths', function () {
        var ast = parser.parse('$expand=Category,Products/Suppliers');
        assert.equal(ast.$expand[0], 'Category');
        assert.equal(ast.$expand[1], 'Products/Suppliers');
    });

    it('should allow only valid values for $inlinecount', function () {
        var ast = parser.parse('$inlinecount=allpages');
        assert.equal(ast.$inlinecount, 'allpages');

        ast = parser.parse('$inlinecount=none');
        assert.equal(ast.$inlinecount, 'none');

        ast = parser.parse('$inlinecount=');
        assert.equal(ast.error, 'invalid $inlinecount parameter');

        ast = parser.parse('$inlinecount=test');
        assert.equal(ast.error, 'invalid $inlinecount parameter');
    });

    it('should parse $format okay', function () {
        var ast = parser.parse('$format=application/atom+xml');
        assert.equal(ast.$format, 'application/atom+xml');

        ast = parser.parse('$format=');
        assert.equal(ast.error, 'invalid $format parameter');
    });

    it('should parse $count okay', function () {
        var ast = parser.parse('test?$count=true');
        assert.equal(ast.$count, 'true');

        ast = parser.parse('test?$count=false');
        assert.equal(ast.$count, 'false');

        ast = parser.parse('test?$count=');
        assert.equal(ast.error, 'invalid $count parameter');

        ast = parser.parse('test?$count=test');
        assert.equal(ast.error, 'invalid $count parameter');
    });

    // it('xxxxx', function () {
    //     var ast = parser.parse("$top=2&$filter=Date gt datetime'2012-09-27T21:12:59'");

    //     console.log(JSON.stringify(ast, 0, 2));
    // });
});

describe('odata path parser grammar', function () {

    it('should parse single resource', function () {
        var ast = parser.parse('Customers');
        assert.equal(ast.$path[0].name, 'Customers');
    });

    it('should parse resource with literal predicate', function () {
        var ast = parser.parse('Customers(1)');
        assert.equal(ast.$path[0].name, 'Customers');
        assert.equal(ast.$path[0].predicates[0].type, 'literal');
        assert.equal(ast.$path[0].predicates[0].value, 1);
    });

    it('should parse resource with property predicate', function () {
        var ast = parser.parse('Customers(CustomerID=1)');
        assert.equal(ast.$path[0].name, 'Customers');
        assert.equal(ast.$path[0].predicates[0].type, 'property');
        assert.equal(ast.$path[0].predicates[0].name, 'CustomerID');
        assert.equal(ast.$path[0].predicates[0].value, 1);
    });

    it('should parse resource with two property predicates', function () {
        var ast = parser.parse('Customers(CustomerID=1,ContactName=\'Joe\')');
        assert.equal(ast.$path[0].name, 'Customers');
        assert.equal(ast.$path[0].predicates[0].type, 'property');
        assert.equal(ast.$path[0].predicates[0].name, 'CustomerID');
        assert.equal(ast.$path[0].predicates[0].value, 1);
        assert.equal(ast.$path[0].predicates[1].type, 'property');
        assert.equal(ast.$path[0].predicates[1].name, 'ContactName');
        assert.equal(ast.$path[0].predicates[1].value, 'Joe');
    });

    it('should parse two resources', function () {
        var ast = parser.parse('Customers(1)/ContactName');
        assert.equal(ast.$path[0].name, 'Customers');
        assert.equal(ast.$path[1].name, 'ContactName');
    });

    it('should parse resources starting with $', function () {
        var ast = parser.parse('Customers(1)/$value');
        assert.equal(ast.$path[1].name, '$value');
        var ast = parser.parse('Customers/$count');
        assert.equal(ast.$path[1].name, '$count');
    });

});

describe('odata path and query parser grammar', function () {

    it('should parse both path and query', function () {
        var ast = parser.parse('Customers?$top=10');
        assert.equal(ast.$path[0].name, 'Customers');
        assert.equal(ast.$top, 10);
    });

});
