/**
 * Old syntax with Fibers
 * 
var conn = $.hdb.getConnection();
console.log("Connection", conn);

var fn_proc = conn.loadProcedure(null, 'com.sap.xs2.tests::sum');
console.log("proc function loaded", fn_proc.getParameterMetaData());

var result = fn_proc(2, 3);
console.log('call result', result);

// $.response.setBody('Procedure com.sap.xs2.tests::sum executed --> '  + result.SUM);
 */

var conn = $.hdb.getConnection();

var fn_proc = conn.loadProcedure(null, 'com.sap.xs2.tests::sum');


var result = fn_proc(2, 3);
$.response.setBody('Procedure com.sap.xs2.tests::sum executed --> '  + result.SUM);
console.log('call result', result.SUM);
