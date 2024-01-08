#!/usr/bin/env node

const fsp = require('fs').promises;
const path = require('path');
const util = require('util');
const esprima = require('esprima');
const escodegen = require('escodegen');

const TRANSFORMING_EXTENTIONS = {
  '.js': {},
  '.cjs': {},
  '.xsjs': {},
  '.xsjslib': {}
}

var DEBUG = false;

async function main() {
  var args = process.argv.slice(2);
  var source = null;
  var target = null;
  var ffunctionMap = null;
  
  for(var i=0; i<args.length; i++){
    if (['-d', '--debug'].includes(args[i])) {
	  DEBUG = true;
	} else if (['-m', '--map'].includes(args[i])) {
	  i++;
	  ffunctionMap = args[i]
	} else if (source) {
	  target = args[i];
	} else {
	  source = args[i];
	}
  }
  if (source == null){
    throw new Error('Source not specified. Usage <source> <target> -m <function map.json>');
  }
  if (target == null){
	throw new Error('Target not specified. Usage <source> <target> -m <function map.json>');
  }
  if (ffunctionMap == null){
	throw new Error('Function map not specified. Usage <source> <target> -m <function map.json>');
  }
  //TODO: read FUNCTION MAP file and parse JSON
  var controller = {
	"asyncs": 0,
	"awaits": 0,
	functionMap: JSON.parse(await fsp.readFile(ffunctionMap, 'utf-8'))
  }
  
  var parsedFiles = await copyAst(source, target);
  
  while (true) {
	var nAsyncs = controller.asyncs;
	for (var parsedFile of parsedFiles) {
	  await promisifyWorkFile(parsedFile.work, controller);
	}
	if (controller.asyncs == nAsyncs) {
	  break;
	}
  }
  
  await Promise.all(parsedFiles.map(generateJS));

  if (!DEBUG) {
    var astFiles = parsedFiles.map((file) => file.work);
    await deleteASTFiles(astFiles);
  }
  
}

/* istanbul ignore next */
async function copy(source, sourceEnt, target) {
	console.log('copy', source, '-->', target);
	if (sourceEnt.isFile()) {
	  await fsp.copyFile(source, target);
	} else if (sourceEnt.isDirectory()) {
	  await fsp.mkdir(target, {recursive: true});
	  //await copy(source, resolvedTarget, controller);
	  const dirents = await fsp.readdir(source, { withFileTypes: true });
	  for (const dirent of dirents) {
		var subSource = path.resolve(source, dirent.name);
	    var subTarget = path.resolve(target, dirent.name);
		await copy(subSource, dirent, subTarget);
	  }
	} else {
	  throw new Error('Not a file or directory/cannot stat/: ' + source);
	}
}

async function copyAst(source, target) {
  await fsp.mkdir(target, {recursive: true});
  
  var parsedFiles = [];
  const dirents = await fsp.readdir(source, { withFileTypes: true });
  for (const dirent of dirents) {
	const resolvedSource = path.resolve(source, dirent.name);
	const resolvedTarget = path.resolve(target, dirent.name);
    if (dirent.isDirectory()) {
      var dirParsedFiles = await copyAst(resolvedSource, resolvedTarget);
	  parsedFiles = parsedFiles.concat(dirParsedFiles);
    } else if (dirent.isFile()) {
	  let ast;
	  var fileContent = await fsp.readFile(resolvedSource, 'utf-8');
      var parsed = path.parse(resolvedSource);
	  if (parsed.ext in TRANSFORMING_EXTENTIONS) {
		try {
	      	ast = esprima.parse(fileContent, {range: true, tokens: true, comment: true});
			console.log("migrated file: ", parsed.base,"\n");
		} catch(err){
		  	console.error('Parse error, ignoring', resolvedSource);
		  	console.error(err);
		}
	  } 
	 // else {
	 //   console.log('Not a JS, ignoring', resolvedTarget);
	 // }
	  
	  if (ast) {
		var workFile = resolvedTarget + '.ast.json';
		await fsp.writeFile(workFile, JSON.stringify(ast, null, 2), 'utf-8');
		parsedFiles.push({
			source: resolvedSource,
			work: workFile,
			target: resolvedTarget
		})
	  } else {
		await fsp.writeFile(resolvedTarget, fileContent, 'utf-8');
	  }
    }
  }
  return parsedFiles;
}

async function promisifyWorkFile(workFile, controller){
	let ast = JSON.parse(await fsp.readFile(workFile, 'utf-8'));
	var initAwaits = controller.awaits;
	
	while (true) {
	  var nAwaits = controller.awaits;
	  promisifyAst(ast, null, null, controller);
	  if (controller.awaits == nAwaits) {
		break;
	  }
	}
	
	if (controller.awaits > initAwaits){
	  await fsp.writeFile(workFile, JSON.stringify(ast, null, 2), 'utf-8')	
	}
}

async function generateJS(parsedFile){
  let sourceCode = await fsp.readFile(parsedFile.source, 'utf-8');
  let ast = JSON.parse(await fsp.readFile(parsedFile.work, 'utf-8'));
  try {
	ast = escodegen.attachComments(ast, ast.comments, ast.tokens);  
  } catch(x){
	//Fallback: try attach comments one by one 
	for(let comment of ast.comments){
	  try{
	    ast = escodegen.attachComments(ast, comment, ast.tokens); 
	  } catch(x) {
	    console.log(parsedFile.target,':Failed to attach comment', comment);	  
	  }
	}
  }
  let transformedContent = escodegen.generate(ast, {
		comment: true,
		sourceCode: sourceCode,
		format:{
			quotes: 'auto',
			escapeless: true,
			preserveBlankLines: true
		}
  });
  var exportNames = getExportNames(ast);
  transformedContent += '\n'; 
  transformedContent += 'export default {' + exportNames.toString() + "};\n";
  await fsp.writeFile(parsedFile.target, transformedContent, 'utf-8');
}

function promisifyAst(ast, parentAst, contextFunction, controller){
	if(typeof(ast)!=='object'){
		return;
	}
	if(!ast){
		return;
	}
	
	var currentContextFunction = contextFunction;
	
	switch(ast.type){
		case 'FunctionDeclaration':
		case 'FunctionExpression':
			currentContextFunction = ast;
			break;
		case 'CallExpression':
		case 'NewExpression':
			var fnName = null;
			var callee = ast.callee;
			if(callee.type === 'Identifier'){
				fnName = callee.name;
			}else if(callee.type === 'MemberExpression'){
				fnName = callee.property.name;
			}else{
				console.log('Uncategorized callee');
				console.log(callee);
			}
			var ignoreMethods = [
				'toString',
				'valueOf',
				'toLocaleString',
				'hasOwnProperty',
				'isPrototypeOf',
				'propertyIsEnumerable',
				'constructor'
			];
            if (ignoreMethods.includes(fnName)) {
                break;
            }
			var mappedFunctionName = controller.functionMap[ fnName ];
			if(fnName && mappedFunctionName && parentAst.type !== 'AwaitExpression'){
				if(callee.type === 'Identifier'){
					callee.name = mappedFunctionName;
				}else if(callee.type === 'MemberExpression'){
					callee.property.name = mappedFunctionName;
				}
				var awaitCall = {
					"type": "AwaitExpression",
					"argument": ast
				}
				controller.awaits++;
				if(contextFunction && !contextFunction['async']){
					contextFunction['async'] = true;
					if(contextFunction.id){
						let funcName = contextFunction.id.name;
						controller.functionMap[contextFunction.id.name] = contextFunction.id.name;
						console.log(funcName + ' has been made async\n');
						controller.asyncs++;	
					}
				}
				
				return awaitCall;
			}
			break;
		default:
			break;
	}
	
	for(var k in ast){
		var replacement = promisifyAst(ast[k], ast, currentContextFunction, controller);
		if(replacement){
			ast[k] = replacement;
		}
	};
}

function getExportNames(ast){
  var names = [];
  for(var o of ast.body){
    switch(o.type){
    case 'VariableDeclaration':
	  names = names.concat(o.declarations.map((d)=>d.id.name));
      break;
    case 'FunctionDeclaration':
      names.push(o.id.name);
      break;
	}
  }
  return names;
}

async function deleteASTFiles(filePaths) {
	for (let filePath of filePaths) {
	  try {
		await fsp.unlink(filePath);
		console.log(`Deleted: ${filePath}\n`);
	  } catch (error) {
		console.error(`Error deleting file ${filePath}: `, error);
	  }
	}
}


main().catch((err)=>{
  console.error(err);
});
