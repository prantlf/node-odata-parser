var assert = require('assert');
var parser = require("../lib/odata-path-parser");

describe('odata.path-parser grammar', function () {

    it('should parse single resource', function () {
        var ast = parser.parse('Customers');
        assert.equal(ast[0].name, 'Customers');
    });

    it('should parse resource with literal predicate', function () {
        var ast = parser.parse('Customers(1)');
        assert.equal(ast[0].name, 'Customers');
        assert.equal(ast[0].predicates[0].type, 'literal');
        assert.equal(ast[0].predicates[0].value, 1);
    });

    it('should parse resource with property predicate', function () {
        var ast = parser.parse('Customers(CustomerID=1)');
        assert.equal(ast[0].name, 'Customers');
        assert.equal(ast[0].predicates[0].type, 'property');
        assert.equal(ast[0].predicates[0].name, 'CustomerID');
        assert.equal(ast[0].predicates[0].value, 1);
    });

    it('should parse resource with two property predicates', function () {
        var ast = parser.parse('Customers(CustomerID=1,ContactName=\'Joe\')');
        assert.equal(ast[0].name, 'Customers');
        assert.equal(ast[0].predicates[0].type, 'property');
        assert.equal(ast[0].predicates[0].name, 'CustomerID');
        assert.equal(ast[0].predicates[0].value, 1);
        assert.equal(ast[0].predicates[1].type, 'property');
        assert.equal(ast[0].predicates[1].name, 'ContactName');
        assert.equal(ast[0].predicates[1].value, 'Joe');
    });

    it('should parse two resources', function () {
        var ast = parser.parse('Customers(1)/ContactName');
        assert.equal(ast[0].name, 'Customers');
        assert.equal(ast[1].name, 'ContactName');
    });

});