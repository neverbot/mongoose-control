import mongoose from 'mongoose';

mongoose.model(
  'Users',
  new mongoose.Schema({
    name: String,
    books: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Books' }],
  }),
);

mongoose.model(
  'Books',
  new mongoose.Schema({
    title: String,
  }),
);
