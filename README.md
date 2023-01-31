# async migrator
[![REUSE status](https://api.reuse.software/badge/github.com/SAP/async-migrator)](https://api.reuse.software/info/github.com/SAP/async-migrator)

## About this project
Use it to migrate a JavaScript project source code to **async-await** model by replacing _sync_ function calls to _await_ statements.
The list of functions that must be replaced is configurable. 

Example source code:

```
var conn = $.hdb.getConnection();
var result = conn.execute('select * from MY_TABLE');
```

It will be migrated to:

```
var conn = await $.hdb.getConnection();
var result = await conn.execute('select * from MY_TABLE');
```


## Use cases
A typical use case, for example, is a sync program using _fibers_ or _fibrous_. Since they are not working in Node 16+, this implies a big problem to JS projects willing to run on Node 16+. There's a good logical reason for these packages to not be supported by Node.js anymore: the **async-await** programming model is implemented in Node 16+ and works like a charm.

The **async-await** programming model gives the development experience of a sync programs - short, logical workflow, no callbacks, without complex workarounds like using _fibers_/_fibrous_, and without killing performace with blocking sync functions. 

Another use case could be to replace a blocking sync function (which is blocking in C-layer) with an async-await function. For example:
* *fs.readFile* - this function has a callback
* *fs.readFileSync* - this function is convenient but blocking 
* *fs.promises.readFile* - this function is both convenient and non-blocking, i.e. based on the **async-await** programming model 

## How to use the migrator
In the command line, execute:

```
node src/index.js <source directory> <target directory> --map <function map JSON>
```

The function map JSON is a simple string (string map), which maps a sync function name to an async function name. 
There is no "default" function map, since that is very project specific.

## Samples 

Each sample migration shall have a specific functionmap.json
Check sampes in the samples/ folder.

## Requirements and Setup
Required is Node.js runtime version 14 or higher. 

```
git clone https://github.com/SAP/async-migrator.git
cd async-migrator
npm install . 
```

## Support, Feedback, Contributing

This project is open to feature requests/suggestions, bug reports etc. via [GitHub issues](https://github.com/SAP/async-migrator/issues). Contribution and feedback are encouraged and always welcome. For more information about how to contribute, the project structure, as well as additional contribution information, see our [Contribution Guidelines](CONTRIBUTING.md).

## Code of Conduct

We as members, contributors, and leaders pledge to make participation in our community a harassment-free experience for everyone. By participating in this project, you agree to abide by its [Code of Conduct](CODE_OF_CONDUCT.md) at all times.

## Licensing

Copyright (c)2023 SAP SE or an SAP affiliate company and <your-project> contributors. Please see our [LICENSE](LICENSE) for copyright and license information. Detailed information including third-party components and their licensing/copyright information is available [via the REUSE tool](https://api.reuse.software/info/github.com/SAP/<your-project>).
