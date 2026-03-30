const { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'default',
  service: 'jumppeace-7c331-service',
  location: 'northamerica-northeast2'
};
exports.connectorConfig = connectorConfig;

const createSearchRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateSearch', inputVars);
}
createSearchRef.operationName = 'CreateSearch';
exports.createSearchRef = createSearchRef;

exports.createSearch = function createSearch(dcOrVars, vars) {
  return executeMutation(createSearchRef(dcOrVars, vars));
};

const getMySearchesRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetMySearches');
}
getMySearchesRef.operationName = 'GetMySearches';
exports.getMySearchesRef = getMySearchesRef;

exports.getMySearches = function getMySearches(dc) {
  return executeQuery(getMySearchesRef(dc));
};

const getAllSearchesRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetAllSearches');
}
getAllSearchesRef.operationName = 'GetAllSearches';
exports.getAllSearchesRef = getAllSearchesRef;

exports.getAllSearches = function getAllSearches(dc) {
  return executeQuery(getAllSearchesRef(dc));
};

const getSpecificSearchRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetSpecificSearch', inputVars);
}
getSpecificSearchRef.operationName = 'GetSpecificSearch';
exports.getSpecificSearchRef = getSpecificSearchRef;

exports.getSpecificSearch = function getSpecificSearch(dcOrVars, vars) {
  return executeQuery(getSpecificSearchRef(dcOrVars, vars));
};

const deleteSearchRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeleteSearch', inputVars);
}
deleteSearchRef.operationName = 'DeleteSearch';
exports.deleteSearchRef = deleteSearchRef;

exports.deleteSearch = function deleteSearch(dcOrVars, vars) {
  return executeMutation(deleteSearchRef(dcOrVars, vars));
};
