const { queryRef, executeQuery, validateArgsWithOptions, mutationRef, executeMutation, validateArgs } = require('firebase/data-connect');

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
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createSearchRef(dcInstance, inputVars));
}
;

const getMySearchesRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetMySearches');
}
getMySearchesRef.operationName = 'GetMySearches';
exports.getMySearchesRef = getMySearchesRef;

exports.getMySearches = function getMySearches(dcOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrOptions, options, undefined,false, false);
  return executeQuery(getMySearchesRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}
;

const getAllSearchesRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetAllSearches');
}
getAllSearchesRef.operationName = 'GetAllSearches';
exports.getAllSearchesRef = getAllSearchesRef;

exports.getAllSearches = function getAllSearches(dcOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrOptions, options, undefined,false, false);
  return executeQuery(getAllSearchesRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}
;

const getSpecificSearchRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetSpecificSearch', inputVars);
}
getSpecificSearchRef.operationName = 'GetSpecificSearch';
exports.getSpecificSearchRef = getSpecificSearchRef;

exports.getSpecificSearch = function getSpecificSearch(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getSpecificSearchRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}
;

const deleteSearchRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeleteSearch', inputVars);
}
deleteSearchRef.operationName = 'DeleteSearch';
exports.deleteSearchRef = deleteSearchRef;

exports.deleteSearch = function deleteSearch(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(deleteSearchRef(dcInstance, inputVars));
}
;
