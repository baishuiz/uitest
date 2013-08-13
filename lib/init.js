var readline = require('readline');
var fs = require('fs');
var util = require('util');
var path = require('path');
var glob = require('glob');

var helper = require('./helper');
var launcher = require('./launcher');
var logger = require('./logger');

var log = logger.create('init');

var CONFIG_TPL_PATH = __dirname + '/../config.template';
var CONFIG_PATH = __dirname + '/../uitest.conf.js';

var COLORS_ON = {
	END  : '\x1B[39m',
	NYAN : '\x1B[36m',
	GREEN: '\x1B[32m',
	BOLD : '\x1B[1m',
	bold : function (str) {
		return this.BOLD + str + '\x1B[22m';
	},
	green: function (str) {
		return this.GREEN + str + this.END;
	}
};

// nasty global
var colors = COLORS_ON;

var COLORS_OFF = {
	END  : '',
	NYAN : '',
	GREEN: '',
	BOLD : '',
	bold : function (str) {
		return str;
	},
	green: function (str) {
		return str;
	}
};

var validateBrowser = function (value) {
	value = value.replace(/\d*/ig, "");
	var proto = launcher[value + 'Browser'].prototype;
	var defaultCmd = proto.CMD[process.platform];
	var envCmd = process.env[proto.ENV_CMD];

	if (!fs.existsSync(defaultCmd) && (!envCmd || !fs.existsSync(envCmd))) {
		log.warn('No binary for ' + value + '.' + '\n  Create symlink at "' + defaultCmd + '", or set "' + proto.ENV_CMD + '" env variable.\n' + colors.NYAN);
	}
};

var questions = [
	{
		id      : 'browsers',
		question: 'Do you want to capture a browser automatically ?',
		hint    : 'Press tab to list possible options. Enter empty string to move to the next question.Notice that you should select which browser that REALLY exist in your system',
		options : ['IE6', 'IE7', 'IE8', 'IE9', 'IE10', 'Chrome', 'Firefox', 'Safari', ''],
		validate: validateBrowser,
		multiple: true
	}
];

var StateMachine = function (rli) {
	var currentQuestion;
	var answers;
	var currentOptions;
	var currentOptionsPointer;
	var pendingQuestionId;
	var done;

	this.onKeypress = function (key) {
		if (!currentOptions || !key) {
			return;
		}

		if (key.name === 'tab' || key.name === 'right' || key.name === 'down') {
			this.suggestNextOption();
		} else if (key.name === 'left' || key.name === 'up') {
			currentOptionsPointer = currentOptionsPointer + currentOptions.length - 2;
			this.suggestNextOption();
		}

		if (!key.ctrl && !key.meta && key.name !== 'enter' && key.name !== 'return') {
			key.name = 'escape';
		}
	};

	this.suggestNextOption = function () {
		if (!currentOptions) {
			return;
		}

		currentOptionsPointer = (currentOptionsPointer + 1) % currentOptions.length;
		rli._deleteLineLeft();
		rli._deleteLineRight();
		rli.write(currentOptions[currentOptionsPointer]);
	};

	this.onLine = function (line) {
		if (pendingQuestionId) {
			if (currentOptions) {
				currentOptionsPointer = currentOptions.indexOf(line);
				if (currentOptionsPointer === -1) {
					return;
				}
			}

			if (line && currentQuestion.validate) {
				currentQuestion.validate(line);
			}

			if (currentQuestion.boolean) line = ('on' === line || 'true' === line || 'yes' === line);

			if (currentQuestion.multiple) {
				answers[pendingQuestionId] = answers[pendingQuestionId] || [];
				if (line) {
					answers[pendingQuestionId].push(line);
					rli.prompt();

					if (currentOptions) {
						currentOptions.splice(currentOptionsPointer, 1);
						currentOptionsPointer = -1;
					}
				} else {
					this.nextQuestion();
				}
			} else {
				answers[pendingQuestionId] = line;
				this.nextQuestion();
			}
		}
	};

	this.nextQuestion = function () {
		rli.write(colors.END);
		currentQuestion = questions.shift();

		while (currentQuestion && currentQuestion.condition && !currentQuestion.condition(answers)) {
			currentQuestion = questions.shift();
		}

		if (!currentQuestion) {
			pendingQuestionId = null;
			currentOptions = null;

			// end
			done(answers);
		} else {
			rli.write('\n' + colors.bold(currentQuestion.question) + '\n');
			rli.write(currentQuestion.hint + colors.NYAN + '\n');

			currentOptions = currentQuestion.options || null;
			currentOptionsPointer = -1;
			pendingQuestionId = currentQuestion.id;
			rli.prompt();

			this.suggestNextOption();
		}
	};

	this.process = function (_questions, _done) {
		questions = _questions;
		answers = {};
		done = _done;

		this.nextQuestion();
	};
};

var quote = function (value) {
	return '\'' + value + '\'';
};

var getReplacementsFromAnswers = function (answers) {
	return {
		BROWSERS: answers.browsers.map(quote).join(', ')
	};
};

exports.init = function (config) {

	if (helper.isDefined(config.colors)) {
		colors = config.colors
			? COLORS_ON
			: COLORS_OFF;
		logger.useColors(config.colors);
	}

	if (helper.isDefined(config.logLevel)) {
		logger.setLevel(config.logLevel);
	}

	// need to be registered before creating readlineInterface
	process.stdin.on('keypress', function (s, key) {
		sm.onKeypress(key);
	});

	var rli = readline.createInterface(process.stdin, process.stdout);
	var sm = new StateMachine(rli, colors);

	rli.on('line', sm.onLine.bind(sm));

	sm.process(questions, function (answers) {
		var replacements = getReplacementsFromAnswers(answers);
		var content = fs.readFileSync(CONFIG_TPL_PATH).toString().replace(/%(.*)%/g, function (a, key) {
			return replacements[key];
		});

		var configFilePath = path.resolve(CONFIG_PATH);
		fs.writeFileSync(configFilePath, content);
		rli.write(colors.green('\nConfig file generated at "' + configFilePath + '".\n\n'));
		rli.close();
	});
};
