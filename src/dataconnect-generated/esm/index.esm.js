import { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } from 'firebase/data-connect';

export const connectorConfig = {
  connector: 'default',
  service: 'jumppeace-7c331-service',
  location: 'northamerica-northeast2'
};

export const createSearchRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateSearch', inputVars);
}
createSearchRef.operationName = 'CreateSearch';

export function createSearch(dcOrVars, vars) {
  return executeMutation(createSearchRef(dcOrVars, vars));
}

export const getMySearchesRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetMySearches');
}
getMySearchesRef.operationName = 'GetMySearches';

export function getMySearches(dc) {
  return executeQuery(getMySearchesRef(dc));
}

export const getAllSearchesRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetAllSearches');
}
getAllSearchesRef.operationName = 'GetAllSearches';

export function getAllSearches(dc) {
  return executeQuery(getAllSearchesRef(dc));
}

export const getSpecificSearchRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetSpecificSearch', inputVars);
}
getSpecificSearchRef.operationName = 'GetSpecificSearch';

export function getSpecificSearch(dcOrVars, vars) {
  return executeQuery(getSpecificSearchRef(dcOrVars, vars));
}

export const deleteSearchRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeleteSearch', inputVars);
}
deleteSearchRef.operationName = 'DeleteSearch';

export function deleteSearch(dcOrVars, vars) {
  return executeMutation(deleteSearchRef(dcOrVars, vars));
}

