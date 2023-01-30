
try {
  var conn = $.db.getConnection();
  var cs_procedure = conn.prepareCall('{call "com.sap.xs2.tests::sum" (?, ?, ?)}');
  cs_procedure.setInteger(1, 2);
  cs_procedure.setInteger(2, 3);
  cs_procedure.execute();
  var result = cs_procedure.getInteger(3);
  var display = 'call result: ' + result
  $.response.setBody(display);
  console.log('call result', result);
} catch (error) {
  console.log('Error', error)
} finally {
  if (conn) {
    conn.commit();
    conn.close();
  }
}



