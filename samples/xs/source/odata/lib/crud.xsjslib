function createEntry(params){
  var conn = params.connection
  var entry = getEntry(params);
  try {
    var stmt = conn.prepareStatement('INSERT INTO "com.sap.xs2.tests::AddressBook.Book" VALUES(?,?)');
    stmt.setInteger(1, entry.id);
    stmt.setString(2, entry.name);
    stmt.execute();
  } catch (error) {
    throw(error)
  } finally {
    stmt && stmt.close();
  }

};

function updateEntry(params){
  var conn = params.connection
  var entry = getEntry(params);
  try {
    var stmt = conn.prepareStatement('UPDATE "com.sap.xs2.tests::AddressBook.Book" SET "name"=? WHERE "id"=?');
    stmt.setString(1, entry.name)
    stmt.setInteger(2, entry.id)
    stmt.execute();
  } catch (error) {
    throw(error)
  } finally {
    stmt && stmt.close();
  }
};

function deleteEntry(){

};

function getEntry(params) {
	try {
		var stmt = params.connection.prepareStatement('SELECT * FROM "' + params.afterTableName + '"')
		var rs = stmt.executeQuery()
	    rs.next()
		return { id: rs.getInteger(1), name: rs.getString(2) }
	} finally {
		rs && rs.close()
		stmt && stmt.close()
	}
}
