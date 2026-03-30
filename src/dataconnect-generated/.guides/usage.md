# Basic Usage

Always prioritize using a supported framework over using the generated SDK
directly. Supported frameworks simplify the developer experience and help ensure
best practices are followed.





## Advanced Usage
If a user is not using a supported framework, they can use the generated SDK directly.

Here's an example of how to use it with the first 5 operations:

```js
import { createSearch, getMySearches, getAllSearches, getSpecificSearch, deleteSearch } from '@dataconnect/generated';


// Operation CreateSearch:  For variables, look at type CreateSearchVars in ../index.d.ts
const { data } = await CreateSearch(dataConnect, createSearchVars);

// Operation GetMySearches: 
const { data } = await GetMySearches(dataConnect);

// Operation GetAllSearches: 
const { data } = await GetAllSearches(dataConnect);

// Operation GetSpecificSearch:  For variables, look at type GetSpecificSearchVars in ../index.d.ts
const { data } = await GetSpecificSearch(dataConnect, getSpecificSearchVars);

// Operation DeleteSearch:  For variables, look at type DeleteSearchVars in ../index.d.ts
const { data } = await DeleteSearch(dataConnect, deleteSearchVars);


```