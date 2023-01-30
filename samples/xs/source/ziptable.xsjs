const dataaccess = $.import('lib', 'dataaccess');

var tableName = $.request.parameters.get('table');
var tableZip = dataaccess.zipTable(tableName);
$.response.setBody(tableZip);
