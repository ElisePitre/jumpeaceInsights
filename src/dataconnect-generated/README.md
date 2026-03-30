# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `default`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*GetMySearches*](#getmysearches)
  - [*GetAllSearches*](#getallsearches)
  - [*GetSpecificSearch*](#getspecificsearch)
- [**Mutations**](#mutations)
  - [*CreateSearch*](#createsearch)
  - [*DeleteSearch*](#deletesearch)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `default`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@dataconnect/generated` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `default` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## GetMySearches
You can execute the `GetMySearches` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getMySearches(): QueryPromise<GetMySearchesData, undefined>;

interface GetMySearchesRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetMySearchesData, undefined>;
}
export const getMySearchesRef: GetMySearchesRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getMySearches(dc: DataConnect): QueryPromise<GetMySearchesData, undefined>;

interface GetMySearchesRef {
  ...
  (dc: DataConnect): QueryRef<GetMySearchesData, undefined>;
}
export const getMySearchesRef: GetMySearchesRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getMySearchesRef:
```typescript
const name = getMySearchesRef.operationName;
console.log(name);
```

### Variables
The `GetMySearches` query has no variables.
### Return Type
Recall that executing the `GetMySearches` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetMySearchesData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetMySearchesData {
  searches: ({
    id: UUIDString;
    word: string;
    startYear: number;
    endYear: number;
    createdAt: TimestampString;
  } & Search_Key)[];
}
```
### Using `GetMySearches`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getMySearches } from '@dataconnect/generated';


// Call the `getMySearches()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getMySearches();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getMySearches(dataConnect);

console.log(data.searches);

// Or, you can use the `Promise` API.
getMySearches().then((response) => {
  const data = response.data;
  console.log(data.searches);
});
```

### Using `GetMySearches`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getMySearchesRef } from '@dataconnect/generated';


// Call the `getMySearchesRef()` function to get a reference to the query.
const ref = getMySearchesRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getMySearchesRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.searches);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.searches);
});
```

## GetAllSearches
You can execute the `GetAllSearches` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getAllSearches(): QueryPromise<GetAllSearchesData, undefined>;

interface GetAllSearchesRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetAllSearchesData, undefined>;
}
export const getAllSearchesRef: GetAllSearchesRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getAllSearches(dc: DataConnect): QueryPromise<GetAllSearchesData, undefined>;

interface GetAllSearchesRef {
  ...
  (dc: DataConnect): QueryRef<GetAllSearchesData, undefined>;
}
export const getAllSearchesRef: GetAllSearchesRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getAllSearchesRef:
```typescript
const name = getAllSearchesRef.operationName;
console.log(name);
```

### Variables
The `GetAllSearches` query has no variables.
### Return Type
Recall that executing the `GetAllSearches` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetAllSearchesData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `GetAllSearches`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getAllSearches } from '@dataconnect/generated';


// Call the `getAllSearches()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getAllSearches();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getAllSearches(dataConnect);

console.log(data.searches);

// Or, you can use the `Promise` API.
getAllSearches().then((response) => {
  const data = response.data;
  console.log(data.searches);
});
```

### Using `GetAllSearches`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getAllSearchesRef } from '@dataconnect/generated';


// Call the `getAllSearchesRef()` function to get a reference to the query.
const ref = getAllSearchesRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getAllSearchesRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.searches);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.searches);
});
```

## GetSpecificSearch
You can execute the `GetSpecificSearch` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getSpecificSearch(vars: GetSpecificSearchVariables): QueryPromise<GetSpecificSearchData, GetSpecificSearchVariables>;

interface GetSpecificSearchRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetSpecificSearchVariables): QueryRef<GetSpecificSearchData, GetSpecificSearchVariables>;
}
export const getSpecificSearchRef: GetSpecificSearchRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getSpecificSearch(dc: DataConnect, vars: GetSpecificSearchVariables): QueryPromise<GetSpecificSearchData, GetSpecificSearchVariables>;

interface GetSpecificSearchRef {
  ...
  (dc: DataConnect, vars: GetSpecificSearchVariables): QueryRef<GetSpecificSearchData, GetSpecificSearchVariables>;
}
export const getSpecificSearchRef: GetSpecificSearchRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getSpecificSearchRef:
```typescript
const name = getSpecificSearchRef.operationName;
console.log(name);
```

### Variables
The `GetSpecificSearch` query requires an argument of type `GetSpecificSearchVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetSpecificSearchVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `GetSpecificSearch` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetSpecificSearchData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `GetSpecificSearch`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getSpecificSearch, GetSpecificSearchVariables } from '@dataconnect/generated';

// The `GetSpecificSearch` query requires an argument of type `GetSpecificSearchVariables`:
const getSpecificSearchVars: GetSpecificSearchVariables = {
  id: ..., 
};

// Call the `getSpecificSearch()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getSpecificSearch(getSpecificSearchVars);
// Variables can be defined inline as well.
const { data } = await getSpecificSearch({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getSpecificSearch(dataConnect, getSpecificSearchVars);

console.log(data.search);

// Or, you can use the `Promise` API.
getSpecificSearch(getSpecificSearchVars).then((response) => {
  const data = response.data;
  console.log(data.search);
});
```

### Using `GetSpecificSearch`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getSpecificSearchRef, GetSpecificSearchVariables } from '@dataconnect/generated';

// The `GetSpecificSearch` query requires an argument of type `GetSpecificSearchVariables`:
const getSpecificSearchVars: GetSpecificSearchVariables = {
  id: ..., 
};

// Call the `getSpecificSearchRef()` function to get a reference to the query.
const ref = getSpecificSearchRef(getSpecificSearchVars);
// Variables can be defined inline as well.
const ref = getSpecificSearchRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getSpecificSearchRef(dataConnect, getSpecificSearchVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.search);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.search);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `default` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## CreateSearch
You can execute the `CreateSearch` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createSearch(vars: CreateSearchVariables): MutationPromise<CreateSearchData, CreateSearchVariables>;

interface CreateSearchRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateSearchVariables): MutationRef<CreateSearchData, CreateSearchVariables>;
}
export const createSearchRef: CreateSearchRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createSearch(dc: DataConnect, vars: CreateSearchVariables): MutationPromise<CreateSearchData, CreateSearchVariables>;

interface CreateSearchRef {
  ...
  (dc: DataConnect, vars: CreateSearchVariables): MutationRef<CreateSearchData, CreateSearchVariables>;
}
export const createSearchRef: CreateSearchRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createSearchRef:
```typescript
const name = createSearchRef.operationName;
console.log(name);
```

### Variables
The `CreateSearch` mutation requires an argument of type `CreateSearchVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateSearchVariables {
  userId: string;
  word: string;
  startYear: number;
  endYear: number;
}
```
### Return Type
Recall that executing the `CreateSearch` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateSearchData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateSearchData {
  search_insert: Search_Key;
}
```
### Using `CreateSearch`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createSearch, CreateSearchVariables } from '@dataconnect/generated';

// The `CreateSearch` mutation requires an argument of type `CreateSearchVariables`:
const createSearchVars: CreateSearchVariables = {
  userId: ..., 
  word: ..., 
  startYear: ..., 
  endYear: ..., 
};

// Call the `createSearch()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createSearch(createSearchVars);
// Variables can be defined inline as well.
const { data } = await createSearch({ userId: ..., word: ..., startYear: ..., endYear: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createSearch(dataConnect, createSearchVars);

console.log(data.search_insert);

// Or, you can use the `Promise` API.
createSearch(createSearchVars).then((response) => {
  const data = response.data;
  console.log(data.search_insert);
});
```

### Using `CreateSearch`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createSearchRef, CreateSearchVariables } from '@dataconnect/generated';

// The `CreateSearch` mutation requires an argument of type `CreateSearchVariables`:
const createSearchVars: CreateSearchVariables = {
  userId: ..., 
  word: ..., 
  startYear: ..., 
  endYear: ..., 
};

// Call the `createSearchRef()` function to get a reference to the mutation.
const ref = createSearchRef(createSearchVars);
// Variables can be defined inline as well.
const ref = createSearchRef({ userId: ..., word: ..., startYear: ..., endYear: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createSearchRef(dataConnect, createSearchVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.search_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.search_insert);
});
```

## DeleteSearch
You can execute the `DeleteSearch` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
deleteSearch(vars: DeleteSearchVariables): MutationPromise<DeleteSearchData, DeleteSearchVariables>;

interface DeleteSearchRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteSearchVariables): MutationRef<DeleteSearchData, DeleteSearchVariables>;
}
export const deleteSearchRef: DeleteSearchRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
deleteSearch(dc: DataConnect, vars: DeleteSearchVariables): MutationPromise<DeleteSearchData, DeleteSearchVariables>;

interface DeleteSearchRef {
  ...
  (dc: DataConnect, vars: DeleteSearchVariables): MutationRef<DeleteSearchData, DeleteSearchVariables>;
}
export const deleteSearchRef: DeleteSearchRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the deleteSearchRef:
```typescript
const name = deleteSearchRef.operationName;
console.log(name);
```

### Variables
The `DeleteSearch` mutation requires an argument of type `DeleteSearchVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface DeleteSearchVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `DeleteSearch` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `DeleteSearchData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface DeleteSearchData {
  search_delete?: Search_Key | null;
}
```
### Using `DeleteSearch`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, deleteSearch, DeleteSearchVariables } from '@dataconnect/generated';

// The `DeleteSearch` mutation requires an argument of type `DeleteSearchVariables`:
const deleteSearchVars: DeleteSearchVariables = {
  id: ..., 
};

// Call the `deleteSearch()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await deleteSearch(deleteSearchVars);
// Variables can be defined inline as well.
const { data } = await deleteSearch({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await deleteSearch(dataConnect, deleteSearchVars);

console.log(data.search_delete);

// Or, you can use the `Promise` API.
deleteSearch(deleteSearchVars).then((response) => {
  const data = response.data;
  console.log(data.search_delete);
});
```

### Using `DeleteSearch`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, deleteSearchRef, DeleteSearchVariables } from '@dataconnect/generated';

// The `DeleteSearch` mutation requires an argument of type `DeleteSearchVariables`:
const deleteSearchVars: DeleteSearchVariables = {
  id: ..., 
};

// Call the `deleteSearchRef()` function to get a reference to the mutation.
const ref = deleteSearchRef(deleteSearchVars);
// Variables can be defined inline as well.
const ref = deleteSearchRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = deleteSearchRef(dataConnect, deleteSearchVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.search_delete);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.search_delete);
});
```

