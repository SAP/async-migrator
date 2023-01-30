# SAP Repository Template

Default templates for SAP open source repositories, including LICENSE, .reuse/dep5, Code of Conduct, etc... All repositories on github.com/SAP will be created based on this template.

## To-Do

In case you are the maintainer of a new SAP open source project, these are the steps to do with the template files:

- Check if the default license (Apache 2.0) also applies to your project. A license change should only be required in exceptional cases. If this is the case, please change the [license file](LICENSE).
- Enter the correct metadata for the REUSE tool. See our [wiki page](https://wiki.wdf.sap.corp/wiki/display/ospodocs/Using+the+Reuse+Tool+of+FSFE+for+Copyright+and+License+Information) for details how to do it. You can find an initial .reuse/dep5 file to build on. Please replace the parts inside the single angle quotation marks < > by the specific information for your repository and be sure to run the REUSE tool to validate that the metadata is correct.
- Adjust the contribution guidelines (e.g. add coding style guidelines, pull request checklists, different license if needed etc.)
- Add information about your project to this README (name, description, requirements etc). Especially take care for the <your-project> placeholders - those ones need to be replaced with your project name. See the sections below the horizontal line and [our guidelines on our wiki page](https://wiki.wdf.sap.corp/wiki/display/ospodocs/Guidelines+for+README.md+file) what is required and recommended.
- Remove all content in this README above and including the horizontal line ;)

***

# Our new open source project
[![REUSE status](https://api.reuse.software/badge/github.com/SAP/async-migrator)](https://api.reuse.software/info/github.com/SAP/async-migrator)

## About this project
That is a command line tool to migrate a JS project source code to async-await model by replacing sync function calls to await statements.
The list of functions that must be replaced is of course configurable. 

Example source code:

```
var conn = $.hdb.getConnection();
var result = conn.execute('select * from MY_TABLE');
```

Will be migrated to:

```
var conn = await $.hdb.getConnection();
var result = await conn.execute('select * from MY_TABLE');
```


## Use cases
One typical use case is for example an sync program using fibers/fibrous. Since fibers/fibrous are not working anymore
in node 16+, that implies a big problem to JS projects willing to run on node 16+. The fiber/fibrous is not supported anymore 
for a very good reason - the well working async-await programming model in Node.js. 
The async-await programming model is giving the development experience of a sync programs - short, logical workflow, no callbacks
but without complex workarounds like fiber/fibers and without killing performace blocking Sync functions. 
Another use case would be to replace a blocking sync-function(which is blocking in C-layer) with aync-await function. 
One example is fs.readFile, fs.readFileSync and fs.promises.readFile. The first one is with callback, the second one is
blocking but conveniet, the third one is non-blocking and convenient i.e. based on async-await programming model. 

## Usage

Command line:
node src/index.js <source directory> <target directory> --map <function map JSON>
The function map JSON is a simple string->string map which maps sync function name to async function name. 
There is no "default" function map, since that is very project specific.


## Samples 

Each sample migration shall have a specific functionmap.json
Check sampes in the samples/ folder.

## Requirements and Setup
Required is Node.js runtime version 14 or higher. 
'''
git clone https://github.com/SAP/async-migrator.git
cd async-migrator
npm install . 
'''

## Support, Feedback, Contributing

This project is open to feature requests/suggestions, bug reports etc. via [GitHub issues](https://github.com/SAP/async-migrator/issues). Contribution and feedback are encouraged and always welcome. For more information about how to contribute, the project structure, as well as additional contribution information, see our [Contribution Guidelines](CONTRIBUTING.md).

## Code of Conduct

We as members, contributors, and leaders pledge to make participation in our community a harassment-free experience for everyone. By participating in this project, you agree to abide by its [Code of Conduct](CODE_OF_CONDUCT.md) at all times.

## Licensing

Copyright (20xx-)20xx SAP SE or an SAP affiliate company and <your-project> contributors. Please see our [LICENSE](LICENSE) for copyright and license information. Detailed information including third-party components and their licensing/copyright information is available [via the REUSE tool](https://api.reuse.software/info/github.com/SAP/<your-project>).
