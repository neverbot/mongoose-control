import mongoose from 'mongoose';

let savedFixtures = {};

// Create documents
async function fixtures(dataset, db) {
  if (typeof db === 'undefined') {
    db = mongoose;
  }

  // Load fixture
  if (typeof dataset === 'string') {
    dataset = savedFixtures[dataset];
  }

  // Error handling
  if (typeof dataset !== 'object') {
    throw new Error('Dataset not a valid object or does not exist as a named fixture.');
  }

  let results = await Promise.all(
    Object.keys(dataset).map(async (tableName) => {
      var model = db.model(tableName);

      if (model) {
        try {
          return await model.insertMany(dataset[tableName]);
        } catch (e) {
          throw new Error(`Error inserting data: ${e}`);
        }
      }

      // there is no mognoose model
      throw new Error(tableName + ' model does not exist');
    })
  );

  return results.flat();

  // async.map(
  //   Object.keys(dataset),
  //   function (tableName, done) {
  //     var model = db.model(tableName);

  //     if (model) {
  //       model.insertMany(dataset[tableName], function (err) {
  //         done(err, Array.prototype.slice.call(arguments, 1));
  //       });
  //     } else {
  //       done(new Error(tableName + ' does not exist'));
  //     }
  //   },
  //   function (err, documentSet) {
  //     if (callback) {
  //       callback.call(fixtures, err, Array.prototype.concat.apply([], documentSet));
  //     }
  //   }
  // );
}

// Save named fixture (for later)
fixtures.save = (name, data) => {
  var oldFixture = savedFixtures[name];

  savedFixtures[name] = data;

  return oldFixture;
};

// Get a particular fixture
fixtures.get = (name) => {
  return savedFixtures[name];
};

// Clear named fixture
fixtures.clear = (name) => {
  if (name) {
    delete savedFixtures[name];
  } else {
    savedFixtures = {};
  }
};

// Reset collection
fixtures.reset = async (modelName, db) => {
  if (modelName instanceof mongoose.Mongoose) {
    db = modelName;
    modelName = null;
  }

  if (typeof modelName === 'undefined') {
    db = mongoose;
  }

  let deleteModel = async (modelName) => {
    return await db.model(modelName).deleteMany();
  };

  if (modelName) {
    return await deleteModel(modelName);
  } else {
    return await Promise.all(
      db.modelNames().map(async (model) => {
        await deleteModel(model);
      })
    );
    // async.map(db.modelNames(), deleteModel, callback);
  }
};

export { fixtures };
