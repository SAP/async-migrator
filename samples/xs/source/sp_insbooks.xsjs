/**
 * Old syntax with Fibers
 
var conn = $.hdb.getConnection();
var fn_proc = conn.loadProcedure(null, 'com.sap.xs2.tests::load_books');

var books = [
{'id': 1, 'name': 'Vinetu'},
{'id': 5, 'name': 'Belia Vojd'},
{'id': 7, 'name': 'Konnika bez glava'}
]

var result = fn_proc(books);
console.log('call result', result);
console.log('resultSets', result.$resultSets);
$.response.setBody('Procedure com.sap.xs2.tests::load_books Result <br><pre> ' + JSON.stringify(result.$resultSets[0], 2)) + '</pre>';
 */

var conn = $.hdb.getConnection();

var fn_proc = conn.loadProcedure(null, 'com.sap.xs2.tests::load_books');

var books = [
{'id': 1, 'name': 'Vinetu'},
{'id': 5, 'name': 'Belia Vojd'},
{'id': 7, 'name': 'Konnika bez glava'}
]

var result = fn_proc(books);
console.log('call result', result);
console.log('resultSets', result.$resultSets);

$.response.setBody('Procedure com.sap.xs2.tests::load_books Result <br><pre> ' + JSON.stringify(result.$resultSets[0], 2)) + '</pre>';

