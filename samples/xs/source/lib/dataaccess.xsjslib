$.import('lib', 'converters');

function select(tableName){
  let conn;
  try {
	conn = connect();
    let resultSet = conn.executeQuery('SELECT * FROM "' + tableName + '"');
    return $.lib.converters.resultSet_to_Entities(resultSet, ["id", "name"]);
  } finally {
    if (conn) {
      conn.commit();
      conn.close();
    }
  }
}

function zipTable(tableName){
  let conn;
  try {
	conn = connect();
    let resultSet = conn.executeQuery('SELECT * FROM "' + tableName + '"');
	return new $.util.Zip(resultSet);
  } finally {
    if (conn) {
      conn.commit();
      conn.close();
    }
  }
}

function connect(){
  return $.hdb.getConnection();
}
