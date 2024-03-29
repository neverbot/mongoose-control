import mongoose from 'mongoose';

// you can have relations using the same ObjectIds in different collections
const userId1 = new mongoose.Types.ObjectId();
const userId2 = new mongoose.Types.ObjectId();
const bookId1 = new mongoose.Types.ObjectId();

const Users = [
  {
    _id: userId1,
    name: 'Awesome User 1',
    books: [bookId1],
  },
  {
    _id: userId2,
    name: 'Awesome User 2',
    books: [],
  },
];

const Books = [
  {
    _id: bookId1,
    title: 'Awesome Book 1',
  },
];

export default {
  Users,
  Books,
};
