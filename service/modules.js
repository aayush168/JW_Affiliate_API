let service = {}
const path = require('path');
let db = require(path.join(rootPath, 'db', 'index.js'));
let _ = require('underscore');

service.getModuleListByRole = async (roleId) => {
  try {
    let conn = await db.getConn('read')
    let result = (await conn.execute(db.sql('modules/getModuleAuthorityListByRoleId.sql'), [ roleId ]))[0]
    result = result.map(x => x.Name)
    return { code: 'common.success', list: result }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

service.getModuleList = async (roleId) => {
  try {
    let conn = await db.getConn('read')
    let moduleList = (await conn.execute(db.sql('modules/getModuleList.sql')))[0]
    let allowAccess = (await conn.execute(db.sql('modules/getAllowedAccessModules.sql'), [ roleId ]))[0]
    allowAccess = allowAccess.map(x => x.ModuleId)
    moduleList = treeViewArray(moduleList, 'ParentIdx')
    return { list: moduleList, allowAccess: allowAccess }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

service.setModuleAuthority = async (roleId, moduleItems) => {
  try {
    let conn = await db.getConn('write')
    await conn.execute(db.sql('modules/removeModuleAuthority.sql'), [ roleId ])
    if (moduleItems.length > 0) {
      let insertData = _.reduce(moduleItems, function (prev, next) {
        return prev + `(${roleId}, ${next}), \n`
      }, "")
      insertData = insertData.slice(0, insertData.lastIndexOf(','))
      let sql = db.sql('modules/setModuleAuthority.sql').replace("${ModuleAuthorityData}", insertData)
      await conn.query({ sql: sql })
    }
    return { code: 'common.success' }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}


function treeViewArray(arr, parentIdKey) {
  var tree = [], mappedArr = {}, arrElem, mappedElem, len = arr.length;
  // First map the nodes of the array to an object -> create a hash table.
  for (var i = 0; i < len; i++) {
    arrElem = arr[i];
    mappedArr[arrElem.Id] = arrElem;
    mappedArr[arrElem.Id]['children'] = [];
  }

  for (var Id in mappedArr) {
    if (mappedArr.hasOwnProperty(Id)) {
      mappedElem = mappedArr[Id];
      // If the element is not at the root level, add it to its parent array of children.
      if (mappedElem[parentIdKey]) {
        mappedArr[mappedElem[parentIdKey]]['children'].push(mappedElem);
      } else {
        // If the element is at the root level, add it to first level elements array.
        tree.push(mappedElem)
      }
    }
  }
  return _.sortBy(tree, 'Order')
}

module.exports = service; 