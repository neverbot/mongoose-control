#!/usr/bin/env node

/* eslint-disable no-console */

import mongoose from 'mongoose';

import { fixtures } from '../src/fixtures.js';
import path from 'path';
import fs from 'fs/promises';

import colors from 'colors/safe.js';

/**
 * Arguments.
 */
let args = process.argv.slice(2);

/**
 * Option defaults.
 */
let options = { args: [] };

/**
 * Usage information.
 */
let usage = [
  '  Usage: mongoose-control [options] [command]',
  '',
  '  Options:',
  '     --url <path>            mongodb url to use',
  '     --models <path>         path to mongoose models directory',
  // '     -c, --chdir <path>      change the working directory',
  // '     --state-file <path>     set path to state file (migrations/.migrate)',
  // '     --template-file <path>  set path to template file to use for new migrations',
  // '     --date-format <format>  set a date format to use for new migration filenames',
  // '     --state-mongo <format>  name of env letiable containing the mongo connection string',
  '     --help                  show this help message',
  '',
  '  Commands:',
  '     seed [file]             load initial data from file in a database',
  // '     down   [name]    migrate down till given migration',
  // '     rollback         migrate down the last applied migration',
  // '     up     [name]    migrate up till given migration (the default command)',
  // '     create [title]   create a new migration file with optional [title]',
  '',
].join('\n');

// abort with a message
function abort(msg) {
  console.log(colors.red(msg));
  process.exit(1);
}

function parseArguments() {
  let currentArg = '';

  // require an argument
  function requireValue() {
    if (args.length) return args.shift();
    abort(currentArg + ' requires an argument');
  }

  // parse arguments
  while (args.length) {
    currentArg = args.shift();
    switch (currentArg) {
      case '-h':
      case '--help':
      case 'help':
        console.log(usage);
        process.exit();
        break;
      case '--url':
        options.mongoUrl = requireValue();
        break;

      case '--models':
        options.modelPath = requireValue();
        break;

      // case '-c':
      // case '--chdir':
      //   process.chdir(requireValue());
      //   break;
      // case '--state-file':
      //   options.stateFile = requireValue();
      //   break;
      // case '--template-file':
      //   template = fs.readFileSync(requireValue());
      //   break;
      // case '--date-format':
      //   options.dateFormat = requireValue();
      //   break;
      // case '--state-mongo':
      //   options.stateMongo = requireValue();
      //   break;
      default:
        if (options.command) {
          options.args.push(currentArg);
        } else {
          options.command = currentArg;
        }
    }
  }
}

async function connect(url) {
  mongoose.connection.once('open', () => {
    console.log(` ... Mongoose connected to ${mongoose.connection.host}\n`);
  });

  mongoose.connection.on('error', (err) => {
    console.log(colors.red(` ... Mongoose connection error, ${err}`));
  });

  try {
    await mongoose.connect(url);
  } catch (err) {
    console.log(err);
    abort(colors.red('Connection error trying to connect to ' + url));
  }
}

async function disconnect() {
  await mongoose.disconnect();
}

async function loadModels() {
  if (!options.modelPath) {
    abort(colors.red('No models path specified'));
  }

  let modelsPath = path.join(process.cwd(), options.modelPath);

  // loop every file in options.modelPath directory
  const files = await fs.readdir(modelsPath);

  for (const file of files) {
    try {
      // importing the file the mongoose model will be loaded
      await import(path.join(modelsPath, file));
    } catch (_) {
      console.log(colors.red('Error importing file ' + file));
    }
  }

  console.log(' ... ' + colors.cyan('Models loaded') + ': ' + mongoose.modelNames().join(', '));
}

// Slugify the given `str`.
// function slugify(str) {
//   return str.replace(/\s+/g, '-');
// }

// check ./migrations
// try {
//   if (!fs.existsSync('migrations')) {
//     console.log('error', 'migrations directory does not exist');

//     // create?
//     // fs.mkdirSync('migrations', 0o774);

//     process.exit(1);
//   }
// } catch (err) {
//   // ignore
// }

// commands
var commands = {
  seed: cmdSeed,

  up: async () => {
    // performMigration('up', migrationName);
  },

  down: async () => {
    // performMigration('down', migrationName);
  },
};

/**
 * Seed data into the database, from a given file.
 */
async function cmdSeed() {
  console.log(' ... ' + colors.cyan('Loading fixtures from') + ': ' + options.args[0]);

  const { default: data } = await import(path.join(process.cwd(), options.args[0]));

  try {
    await fixtures(data, mongoose);
  } catch (_) {
    console.log(colors.red('Error loading fixtures from file ' + options.args[0]));
  }
}

/**
 * Create a migration with the given `name`.
 *
 * @param {String} name
 */
// function create(name) {
//   var path = join('migrations', name + '.js');
//   console.log('create', join(process.cwd(), path));
//   fs.writeFileSync(path, template);
// }

/**
 * Perform a migration in the given `direction`.
 *
 * @param {Number} direction
 */
// function performMigration(direction, migrationName) {
//   var type = options.stateMongo ? 'mongo' : 'file';
//   var state = options.stateMongo || options.stateFile || join('migrations', '.migrate');
//   var set = migrate.load(state, 'migrations', type, options.stateFile);

//   set.on('migration', function (migration, direction) {
//     console.log(direction, migration.title);
//   });

//   var migrationPath = migrationName ? join('migrations', migrationName) : migrationName;

//   set[direction](migrationName, function (err) {
//     if (err) {
//       console.log('error', err);
//       process.exit(1);
//     }

//     console.log('migration', 'complete');
//     process.exit(0);
//   });
// }

console.log(colors.green.underline('mongoose-control') + '\n');

parseArguments();

// connect to the database
if (options.mongoUrl) {
  await connect(options.mongoUrl);
}

// check the command exists
let command = options.command || abort('Use mongoose-control --help to see available commands');
if (!(command in commands)) abort('Unknown command "' + command + '"');

// load every mongoose model
await loadModels();

// run command
await commands[command].apply(this, options.args);

// disconnect from the database
await disconnect();

console.log('\n' + colors.green.underline('mongoose-control ended') + '\n');
