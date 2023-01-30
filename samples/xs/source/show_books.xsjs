var conn = $.hdb.getConnection();
var result = conn.executeQuery('SELECT * FROM "com.sap.xs2.tests::AddressBook.Book"')

$.response.setBody(result);