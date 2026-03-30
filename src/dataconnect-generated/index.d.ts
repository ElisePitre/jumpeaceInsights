import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, MutationRef, MutationPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface CreateSearchData {
  search_insert: Search_Key;
}

export interface CreateSearchVariables {
  userId: string;
  word: string;
  startYear: number;
  endYear: number;
}

export interface DeleteSearchData {
  search_delete?: Search_Key | null;
}

export interface DeleteSearchVariables {
  id: UUIDString;
}

export interface GetAllSearchesData {
  searches: ({
    id: UUIDString;
    userId: string;
    word: string;
    startYear: number;
    endYear: number;
    createdAt: TimestampString;
  } & Search_Key)[];
}

export interface GetMySearchesData {
  searches: ({
    id: UUIDString;
    word: string;
    startYear: number;
    endYear: number;
    createdAt: TimestampString;
  } & Search_Key)[];
}

export interface GetSpecificSearchData {
  search?: {
    id: UUIDString;
    userId: string;
    word: string;
    startYear: number;
    endYear: number;
    createdAt: TimestampString;
  } & Search_Key;
}

export interface GetSpecificSearchVariables {
  id: UUIDString;
}

export interface Search_Key {
  id: UUIDString;
  __typename?: 'Search_Key';
}

interface CreateSearchRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateSearchVariables): MutationRef<CreateSearchData, CreateSearchVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateSearchVariables): MutationRef<CreateSearchData, CreateSearchVariables>;
  operationName: string;
}
export const createSearchRef: CreateSearchRef;

export function createSearch(vars: CreateSearchVariables): MutationPromise<CreateSearchData, CreateSearchVariables>;
export function createSearch(dc: DataConnect, vars: CreateSearchVariables): MutationPromise<CreateSearchData, CreateSearchVariables>;

interface GetMySearchesRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetMySearchesData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<GetMySearchesData, undefined>;
  operationName: string;
}
export const getMySearchesRef: GetMySearchesRef;

export function getMySearches(): QueryPromise<GetMySearchesData, undefined>;
export function getMySearches(dc: DataConnect): QueryPromise<GetMySearchesData, undefined>;

interface GetAllSearchesRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetAllSearchesData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<GetAllSearchesData, undefined>;
  operationName: string;
}
export const getAllSearchesRef: GetAllSearchesRef;

export function getAllSearches(): QueryPromise<GetAllSearchesData, undefined>;
export function getAllSearches(dc: DataConnect): QueryPromise<GetAllSearchesData, undefined>;

interface GetSpecificSearchRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetSpecificSearchVariables): QueryRef<GetSpecificSearchData, GetSpecificSearchVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetSpecificSearchVariables): QueryRef<GetSpecificSearchData, GetSpecificSearchVariables>;
  operationName: string;
}
export const getSpecificSearchRef: GetSpecificSearchRef;

export function getSpecificSearch(vars: GetSpecificSearchVariables): QueryPromise<GetSpecificSearchData, GetSpecificSearchVariables>;
export function getSpecificSearch(dc: DataConnect, vars: GetSpecificSearchVariables): QueryPromise<GetSpecificSearchData, GetSpecificSearchVariables>;

interface DeleteSearchRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteSearchVariables): MutationRef<DeleteSearchData, DeleteSearchVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeleteSearchVariables): MutationRef<DeleteSearchData, DeleteSearchVariables>;
  operationName: string;
}
export const deleteSearchRef: DeleteSearchRef;

export function deleteSearch(vars: DeleteSearchVariables): MutationPromise<DeleteSearchData, DeleteSearchVariables>;
export function deleteSearch(dc: DataConnect, vars: DeleteSearchVariables): MutationPromise<DeleteSearchData, DeleteSearchVariables>;

