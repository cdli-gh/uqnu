import * as C from 'jtf-lib';

//var DelimiterStream = require('delimiter-stream');
var StringDecoder = require('string_decoder').StringDecoder;
var decoder = new StringDecoder('utf8');
//var toStream = require('blob-to-stream');
const {ReadableWebToNodeStream} = require('readable-web-to-node-stream');

/* var es = require('event-stream');
var inspect = require('util').inspect;
 */
var _ = require('highland');

const chunk2TableData = (
	chunk, chunkDecoded, PNumber, linesCount, beginsAtLine, 
	chunkStartsAt, chunkEndsAt, options) => {
	//
	return {
			//string: chunkDecoded,
			PNumber: PNumber,
			chunkStartsAt: chunkStartsAt,
			chunkEndsAt: chunkStartsAt+chunk.length,
			beginsAtLine: beginsAtLine,
			endsAtLine: beginsAtLine+linesCount,
			...options
		};
};

const mapTextsInBuffer = function(arrBuff, offset, push, size) {
	//
	let Uint8Arr = new Uint8Array(arrBuff);
	Uint8Arr.forEach(function(x, i) {
		let delim = [];
		if (offset+i===0) { //first line
			if (i+1 < Uint8Arr.length){
				delim = Array.from(Uint8Arr.slice(i, i+2))
			}
		} else if (x===10) { //every new line
			if (i+2 < Uint8Arr.length){
				i++
				delim = Array.from(Uint8Arr.slice(i, i+2))
			};
		};
		if (delim[0]===38 && delim[1]===80){ //i.e. '&P'
			push(null, offset+i);
		};
		if (offset+i+1===size){ 
			push(null, _.nil)
		};
	});
};

const file2textsMap = function(file) {
	//
	return _(function (push, next) {
		let size = file.size;
		//let delimiter = Buffer.from('\n&P');
		let last = false;
		let fSlice = null;
		for (let begin = 0; begin < size; begin+=100000){
			if (begin+100000 >= size ){
				last = true
				fSlice = file.slice(begin, size)
			} else {
				fSlice = file.slice(begin, begin+100002);
			}
			fSlice.arrayBuffer()
			.then(
				(arrBuff) => {
					mapTextsInBuffer(arrBuff, begin, push, size);
				}
			);
			if (last){ break };
		};
	});
};

export const stream = (file, callback, callbackEnd) => {
	//
	//var input = toStream(file, { highWaterMark: 1024 }); //!!! This causes memory crash with large files
	const input = new ReadableWebToNodeStream(file.stream());
	var beginsAtLine = 1;
	var chunksCounter = 0;
	var fileTextsMap = [];
	var delimiter = '\n&P';
	var splitter = file2textsMap(file); // that's a nodeJS stream
	
	splitter.on('data', function(chunk) {
		splitter.pause();
		fileTextsMap.push(chunk);
		chunksCounter++
		if (chunksCounter%1000===0){ 
			console.log('so far:', chunksCounter)
		}
		splitter.resume();
	});
	
	splitter.on('end', () => {
		fileTextsMap.push(file.size);
		console.log('total:', chunksCounter);
		let ATFMap = {
			file: file,
			fileTextsMap: fileTextsMap,
			textsCount: chunksCounter,
		};
		callbackEnd( ATFActions2Map( ATFMap ) );
	});
};

export const ATFActions2Map = function( map ){
	//
	let { file, fileTextsMap, textsCount } = map;
	console.log('making ATF functions for file', file);
	const getCoordinates = function(i){
		//
		return [fileTextsMap[i], fileTextsMap[i+1]]
	};
	
	const getTextObject = function(string, index){
		//
		let getJTF = C.ATF2JTF.bind(this, string, map.file.name);
		console.log('! atf2jtf at index', index)
		return {
			PNumber: string.slice(1, 8),
			string: string,
			//map: map,
			index: index,
			JTFResponse: getJTF(),
		};
	};
	
	const ATFAtIndex = (index, callback=null) => {
		//
		console.log( 'requesting ATF at index', index )
		if (index<=textsCount){
			let [start, end] = getCoordinates(index);
			return file.slice(start, end).text().then(
				(string) => {
					let atfObj = getTextObject(string, index)
					if (callback){
						callback(atfObj)
					};
					return atfObj;
				}
			);
		} else {
			if (callback){
				callback(null);
			};
			return null;
		};
	};
	
	const arrToFile = (arr) => {
		//
		let { name, webkitRelativePath, type } = file;
		return new File(arr, name, {type: type,});
	};
	
	const rewriteAtIndex = (index, string, callback, callbackEnd) => {
		// 
		if (index<=textsCount){
			let [start, end] = getCoordinates(index);
			let first = file.slice(0, start);
			let last = file.slice(end, file.size);
			Promise.resolve(first).then(first => {
				Promise.resolve(last).then(last => {
					let newFile = arrToFile([first, string, last]);
					stream(newFile, callback, callbackEnd);
				})
			});
		} else {
			return null;
		};
	};
	
	let actions = { 
			ATFAtIndex: ATFAtIndex, 
			rewriteAtIndex: rewriteAtIndex,
	};
	return {...map, actions: actions}
};

