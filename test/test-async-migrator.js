const chai = require('chai');
const expect = chai.expect;
const { exec } = require('child_process');
const fs = require('fs');
const util = require('util');
const execP = util.promisify(exec);
const filepath = './src/index.js';
const testDir = './test';
let functionMap;
let asyncJS;

const setupTestEnvironment = () => {
    try {
        fs.mkdirSync(`${testDir}/source`, { recursive: true });
        asyncJS = `function testasync() {
                var conn = $.hdb.getConnection();
                var result = conn.execute('select * from MY_TABLE');
              }`;
        fs.writeFileSync(`${testDir}/source/source.js`, asyncJS);
        fs.writeFileSync(`${testDir}/source/myfile.txt`, 'Hello World');
        functionMap = { "getConnection": "getConnection", "execute": "execute" };
        fs.writeFileSync(`${testDir}/source/functionMap.json`, JSON.stringify(functionMap));
    } catch(error){
        console.error(error);
    }
}

const cleanupTestEnvironment = () => {
    try {
        if (fs.existsSync(`${testDir}/target`)) {
            fs.rmSync(`${testDir}/target`, { recursive: true, force: true });
        }
        if (fs.existsSync(`${testDir}/source`)) {
            fs.rmSync(`${testDir}/source`, { recursive: true, force: true });
        }

    } catch(error){
        console.error(error);
    }
}

describe('parameter tests', function () {
    it('should throw an error when source not specified', async function () {
        const { stdout, stderr } = await execP(`node ${filepath}`);
        expect(stderr).to.include('Source not specified. Usage <source> <target> -m <function map.json>');
    });

    it('should throw an error when target not specified', async function () {
        const { stdout, stderr } = await execP(`node ${filepath} testSrc`);
        expect(stderr).to.include('Target not specified. Usage <source> <target> -m <function map.json>');
    });

    it('should throw an error when function map not specified', async function () {
        const { stdout, stderr } = await execP(`node ${filepath} testSrc testTarget`);
        expect(stderr).to.include('Function map not specified. Usage <source> <target> -m <function map.json>');
    });
});

describe('transformation tests', function () {

    before(() => setupTestEnvironment());

    it('should transform a javascript file', async function () {
        const { stdout, stderr } = await execP(`node ${filepath} ${testDir}/source ${testDir}/target -m ${testDir}/source/functionMap.json`);
        expect(stderr).to.be.empty;
        expect(stdout.replace(/\s+/g, ' ')).to.include('migrated file: source.js');
        const output = fs.readFileSync(`${testDir}/target/source.js`, 'utf-8');
        expect(output).to.include('async function testasync() {')
        expect(output).to.include('var conn = await $.hdb.getConnection();');
        expect(output).to.include('var result = await conn.execute(\'select * from MY_TABLE\');');
    });

    it('should ignore non-JS files', async function () {
        const { stdout, stderr } = await execP(`node ${filepath} ${testDir}/source ${testDir}/target -m ${testDir}/source/functionMap.json`);
        expect(fs.existsSync(`${testDir}/target/myfile.txt`)).to.be.true;
        expect(fs.readFileSync(`${testDir}/target/myfile.txt`, 'utf-8')).to.equal('Hello World');
    });

    after(() => cleanupTestEnvironment());
});

describe('debug mode tests', function () {

    before(() => setupTestEnvironment());

    it('should not throw an error when debug option is specified', async function () {
        const { stdout, stderr } = await execP(`node ${filepath} -d ${testDir}/source ${testDir}/target -m ${testDir}/source/functionMap.json`);
        expect(stderr).to.be.empty;
    });

    it('should not throw an error when long form debug option is specified', async function () {
        const { stdout, stderr } = await execP(`node ${filepath} --debug ${testDir}/source ${testDir}/target -m ${testDir}/source/functionMap.json`);
        expect(stderr).to.be.empty;
    });

    it('should delete .ast.json files when debug mode is off', async function () {
        await execP(`node ${filepath} ${testDir}/source ${testDir}/target -m ${testDir}/source/functionMap.json`);
        const astFilesExist = fs.existsSync(`${testDir}/target/source.ast.json`);
        expect(astFilesExist).to.be.false;
    });
    
    it('should not delete .ast.json files when debug mode is on', async function () {
        await execP(`node ${filepath} --debug ${testDir}/source ${testDir}/target -m ${testDir}/source/functionMap.json`);
        const astFilesExist = fs.existsSync(`${testDir}/target/source.js.ast.json`);
        expect(astFilesExist).to.be.true;
    });

    after(() => cleanupTestEnvironment());
});
