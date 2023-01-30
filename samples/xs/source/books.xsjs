const dataaccess = $.import('lib', 'dataaccess');

if ($.request.method === $.net.http.GET) {
  var entities = dataaccess.select("com.sap.xs2.tests::AddressBook.Book");
  $.response.setBody(entities);
} else {
  $.response.setBody('Not supported method ' + $.request.method);
}
