# mongoose-control

[![npm](https://img.shields.io/npm/dt/mongoose-control)](https://www.npmjs.com/package/mongoose-control)
[![npm](https://img.shields.io/npm/dw/mongoose-control)](https://www.npmjs.com/package/mongoose-control)
[![GitHub license](https://img.shields.io/github/license/neverbot/mongoose-control)](https://github.com/neverbot/mongoose-control/blob/master/LICENSE)
[![npm](https://img.shields.io/npm/v/mongoose-control)](https://www.npmjs.com/package/mongoose-control)

Migrations (pending) and seed/fixtures (already done) framework and cli for node (v16+) and mongoose (v7+).

This project is based in: 

- [`node-mongoose-fixtures`](https://github.com/kennethklee/node-mongoose-fixtures), by [Kenneth Lee](https://github.com/kennethklee).
- [`node-mongodb-migrations`](https://github.com/neverbot/node-mongodb-migrations) by [Ivan Alonso (neverbot)](https://github.com/neverbot) forked from [`ikatun/node-migrate`](https://github.com/ikatun/node-migrate) by [ikatun](https://github.com/ikatun), in turn forked from [`tj/node-migrate`](https://github.com/tj/node-migrate) by [TJ Holowaychuk](https://github.com/tj).

Both projects use the MIT license. Please check its authors files for more information.
Both projects seem to be discontinued, so I decided to merge some of their features and create this new project.

## Installation

`npm i --save-dev mongoose-control` to use from your repository.

`npm i -g mongoose-control` to use from the command line (see [CLI usage](#CLI)).

## Usage 

```javascript
import { fixtures } from 'mongoose-control';

await fixtures({
    <collection name>: [
      <record>,
      <record>
    ],
    <collection name>: [
      <record>,
      <record>
    ]
});
```

### Example

```javascript
import mongoose from 'mongoose';
import { fixtures } from 'mongoose-control';

// User
const userSchema = new mongoose.Schema({
    username: String,
    password: String
});
mongoose.model('Users', userSchema);

// Book
const bookSchema = new mongoose.Schema({
    title: String
});
mongoose.model('Books', bookSchema);

// Create dataset immediately
//   - data is an array of all the documents created
let data = await fixtures({
    Users: [
        { username: 'one', password: 'pass' },
        { username: 'two', password: 'pass' }
    ],
    Books: [
        { title: 'Enders Game' },
        { title: 'Speaker of the Dead' }
    ]
});

// Name a dataset for future use
fixtures.save('Users', {
    users: [
        { username: 'one', password: 'pass' },
        { username: 'two', password: 'pass' }
    ]
});

// Use the named dataset
//  - data is an array of all documents created
data = await fixtures('Users');
```

### Using files for fixtures and/or seeds

Create files for the data, i.e. `userFixtures.js`:

```javascript
import { ObjectId } from 'mongodb';

// you can have relations using the same ObjectIds in different collections
const userId1 = new ObjectId();
const bookId1 = new ObjectId();

const Users = [
  {
    _id: userId1,
    name: 'Awesome User 1',
    books: [bookId1],
    ...
  },
  {
    ...
  },
];

const Books = [
  {
    _id: bookId1,
    title: 'Awesome Book 1',
    ...
  },
  {
    ...
  },
];

export default {
  Users,
  Books,
};
```

Now you can use your fixtures in your tests or any other place:

```javascript
import { fixtures } from 'mongoose-control';
import fixturesData from 'userFixtures.js';

await fixtures(fixturesData);
```

Remember Mongoose have to be initialized before using `fixtures()`, and the models 
we are going to use have to be registered in Mongoose.

### CLI

You can use some of the features of this package from the command line:

```bash
# install the package globally:
npm i -g mongoose-control

# to see the available options:
mongoose-control --help

# use as seeder, with a seed file (you can use the test files):
mongoose-control --url mongodb://localhost:27017/testing --models test/models/ seed test/example.data.js
```

## API

### Create a dataset

`async fixtures(dataset, <mongoose instance>);`

Immediately creates the documents from the dataset through the mongoose connection. Returns a flat array with every inserted fixture.

* `dataset` can be a hash or a name of a named fixture.
* `mongoose instance` is optional and is a singular instance of mongoose.

### Save a named fixture

`fixtures.save(name, dataset);`

Save a fixture to be used for later. Returns previous existent fixture with the same name, if it existed.

* `name` is the name of your new named fixture.
* `dataset` is the hash of the dataset you want to save.

### Retrieve a named fixture's dataset

`fixtures.get(name);`

Retrieves a named fixture's dataset.

* `name` is the name of the named fixture you wish to retrieve.

### Clear named fixture

`fixtures.clear(<name>);`

Clears named fixtures.

* `name` is optional. It's the name of the named fixture. If omitted, all named fixtures will be cleared.

### Reset database collection(s)

`async fixtures.reset(<model name>, <mongoose instance>);`

Deletes all documents within a collection. Returns the result of the delete operations.

* `model name` is optional. It's the name of the collection. If omitted, all collections will be purged.
* `mongoose instance` is optional and is a singular instance of mongoose.
