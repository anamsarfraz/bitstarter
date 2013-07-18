#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development and
basic DOM parsing.
*/
var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var rest = require ('restler');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1);
    }
    return instr;
};

var cheerioHtmlFile = function(htmlfile, is_url) {
    if (is_url) {
        return cheerio.load(htmlfile);
    } else {
        return cheerio.load(fs.readFileSync(htmlfile));
    }
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile, is_url) {
    $ = cheerioHtmlFile(htmlfile, is_url);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for (var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    console.log(JSON.stringify(out, null, 4));
};

var checkUrlData = function(url, checksfile) {
    rest.get(url).on('complete', function(data) {
        checkHtmlFile(data, checksfile, true);
    });
};

var clone = function(fn) {
    // Workaround for commandder.js issue
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

if (require.main == module) {
    program
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
        .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
        .option('-u, --url <url>', 'Url to download index from')
        .parse(process.argv);

    if (program.url) {
        checkUrlData(program.url, program.checks);
    } else {
        checkHtmlFile(program.file, program.checks, false);
    } 
} else {
    exports.checkHtmlFile = checkHtmlFile;
}               
