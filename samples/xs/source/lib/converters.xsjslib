
function _row_to_entity(row, cols){
  let entity = {};
  for( var i=0; i<cols.length; i++) {
    entity[cols[i]] = row[i];
  }
  return entity
}

function resultSet_to_Entities(resultSet, cols){
  var entities = [];
  for(var row of resultSet){
    var entity = _row_to_entity(row, cols);
    entities.push(entity);
  }
  return entities;
}
