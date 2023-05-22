import assert from 'node:assert';
import mongoose from 'mongoose';

import { fixtures } from '../src/fixtures.js';

describe('Fixtures', () => {
  before(async () => {
    /*
      mongoose.connection.once('open', () => {
        // eslint-disable-next-line no-console
        console.log(`Mongoose connected to ${mongoose.connection.host}`);
      });

      mongoose.connection.on('error', (err) => {
        // eslint-disable-next-line no-console
        console.log(`Mongoose connection error, ${err}`);
      });
      */

    await mongoose.connect('mongodb://localhost:27017/testing');

    mongoose.model(
      'tests',
      new mongoose.Schema({
        name: String,
      })
    );

    mongoose.model(
      'others',
      new mongoose.Schema({
        name: String,
      })
    );
  });

  after(async () => {
    await mongoose.model('tests').deleteMany();
    await mongoose.model('others').deleteMany();
    await mongoose.model('anothers').deleteMany();

    // await mongoose.connection.removeAllListeners();
    await mongoose.connection.close();
  });

  describe('with new mongoose instance', async () => {
    it('should create a dataset', async () => {
      let data = await fixtures(
        {
          tests: [{ name: 'one' }, { name: 'two' }, { name: 'three' }],
          others: [{ name: 'other' }],
        },
        mongoose
      );

      assert.equal(4, data.length);
      assert.equal('one', data[0].name);
      assert.equal('two', data[1].name);
      assert.equal('three', data[2].name);
      assert.equal('other', data[3].name);

      // Just in case, let's super make sure it's within mongoose
      const model = mongoose.model('tests');
      data = await model.find();

      assert.equal(3, data.length);
      assert.equal('one', data[0].name);
      assert.equal('two', data[1].name);
      assert.equal('three', data[2].name);
    });

    it('should error when passing in a string as dataset', async () => {
      try {
        await fixtures('faulty!', mongoose);
      } catch (err) {
        assert.ok(err); // Error should exist
        assert.equal(
          'Dataset not a valid object or does not exist as a named fixture.',
          err.message
        );
      }
    });

    it('should error when passing in a non existent mongoose model', async () => {
      try {
        await fixtures({ faulty: [{ name: 'fault' }] }, mongoose);
      } catch (err) {
        assert.ok(err); // Error should exist
        assert.equal('faulty model does not exist', err.message);
      }
    });

    it('should save a named fixture and then create that dataset', async () => {
      // Save the dataset as a named fixture
      await fixtures.save('tests:one', {
        tests: [{ name: 'one-one' }, { name: 'one-two' }, { name: 'one-three' }],
      });

      // Create the dataset
      let data = await fixtures('tests:one', mongoose);
      assert.ok(data);
      assert.ok(data.length);
      assert.equal(3, data.length);
    });

    // Dependant on the previous test
    it('should replace a named fixture', async () => {
      // Save the dataset as a named fixture
      let data = fixtures.save('tests:one', {
        tests: [{ name: 'one' }],
      });

      assert.ok(data);
      assert.ok(data.tests);
      assert.equal(3, data.tests.length);
    });

    // Dependant on the previous previous test
    it('should clear a named fixture', async () => {
      fixtures.clear('tests:one');

      let dataset = fixtures.get('tests:one');

      assert.ok(!dataset); // Should be empty!
    });

    // Dependant on the previous previous previous test
    it('should clear all named fixture', async () => {
      fixtures.save('tests:two', {
        tests: [{ name: 'two' }],
      });

      fixtures.clear();

      let datasetOne = fixtures.get('tests:one');
      let datasetTwo = fixtures.get('tests:two');

      assert.ok(!datasetOne); // Should be empty!
      assert.ok(!datasetTwo); // Should be empty!
    });

    it('should delete a particular model', async () => {
      const model = mongoose.model('tests');

      let data = await model.find();
      assert.ok(data.length); // make sure documents exist

      await fixtures.reset('tests', mongoose);

      data = await model.find();
      assert.equal(0, data.length);
    });

    it('should delete all models', async () => {
      const model = mongoose.model('tests');
      const anotherModel = mongoose.model(
        'anothers',
        new mongoose.Schema({
          name: String,
        })
      );

      let data = await anotherModel.create({
        name: 'test',
      });

      assert.ok(data);

      fixtures.reset(mongoose);

      data = await model.count();
      assert.equal(0, data);

      data = await anotherModel.count();
      assert.equal(0, data);
    });
  });

  describe('with global mongoose instance', async () => {
    before(async () => {
      // just in case
      await mongoose.model('tests').deleteMany();
      await mongoose.model('others').deleteMany();
      await mongoose.model('anothers').deleteMany();
    });

    it('should create a dataset', async () => {
      let data = await fixtures({
        tests: [{ name: 'one' }, { name: 'two' }, { name: 'three' }],
        others: [{ name: 'other' }],
      });

      assert.equal(4, data.length);
      assert.equal('one', data[0].name);
      assert.equal('two', data[1].name);
      assert.equal('three', data[2].name);
      assert.equal('other', data[3].name);

      // Just in case, let's super make sure it's within mongoose
      const model = mongoose.model('tests');
      data = await model.find();

      assert.equal(3, data.length);
      assert.equal('one', data[0].name);
      assert.equal('two', data[1].name);
      assert.equal('three', data[2].name);
    });

    it('should not fail when calling reset() without parameters', async () => {
      const model = mongoose.model('tests');
      let data = await model.create({
        name: 'test',
      });

      assert.ok(data);

      fixtures.reset();

      data = await model.count();
      assert.equal(0, data);
    });
  });
});
