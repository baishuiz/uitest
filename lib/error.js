//错误代码合集
/**
 * @type {{E001: {msg: string, report: boolean}}}
 * report : do or do not report to server
 */
module.exports = {
    'E001':{'msg':'文件为空','report':true,'console':'true'},
    'E002':{'msg':'环境造成的错误','report':false,'console':'true'},
    'E404':{'msg':'找不到文件','report':true,'console':'true'},
};