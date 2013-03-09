//
UT.open('http://www.taobao.com/go/rgn/sns/snsdk.php', function() {
	describe('SNSDK ~ base ~ test.js', function() {
		//it sns.js

		it('SNS.isFunction', function() {
			expect( SNS.isFunction(function(){})).toEqual(true);
		});
		it('SNS.isFunction obj', function() {
			expect( !SNS.isFunction({})).toEqual(true);
		});
		it('SNS.isPlainObject', function() {
			expect( SNS.isPlainObject({})).toEqual(true);
		});
		it('SNS.isPlainObject undefined', function() {
			expect( !SNS.isPlainObject(undefined)).toEqual(true);
		});		//IE.bug
		it('SNS.isPlainObject []', function() {
			expect( !SNS.isPlainObject([])).toEqual(true);
		});
		it('SNS.isPlainObject Date', function() {
			expect( !SNS.isPlainObject(new Date())).toEqual(true);
		});
		it('SNS.isPlainObject function', function() {
			expect( !SNS.isPlainObject(function(){})).toEqual(true);
		});
		it('SNS.isArray []', function() {
			expect( SNS.isArray([])).toEqual(true);
		});
		it('SNS.isArray [...]', function() {
			expect( SNS.isArray(['abc', function(){}])).toEqual(true);
		});
		it('SNS.isArray function', function() {
			expect( !SNS.isArray(function(){})).toEqual(true);
		});
		it('SNS.isArray arguemnts', function() {
			expect( !SNS.isArray(arguments)).toEqual(true);
		});

		it('SNS.mix', function() {
			expect( SNS.mix({a:'123'}, {a:'456'}).a === '456').toEqual(true);
		});
		it('SNS.map', function() {
			expect( SNS.map(['a','b','c'], function(n) {return n+'o'}).join('') === 'aoboco').toEqual(true);
		});
		it('SNS.isDebug', function() {
			expect( SNS.isDebug()).toEqual(false);
		});
		it('SNS.log', function() {
			expect( SNS.log('SNS.log()')).toEqual(undefined);
		});
		it('SNS.isDaily', function() {
			expect( SNS.isDaily()).toEqual(false);
		});
		it('SNS.domain.assets', function() {
			expect( SNS.domain.assets).toEqual('a.tbcdn.cn');
		});
		it('SNS.isTBDomain', function() {
			expect( SNS.isTBDomain()).toEqual(true);
		});
		it('SNS.normalize', function() {
			expect( SNS.normalize('http://assets.daily.taobao.net/p/snsdk/core.js').indexOf('a.tbcdn.cn') > -1).toEqual(true);
		});
		it('SNS.buildURI', function() {
			expect( SNS.buildURI('/abc.htm', 'g=k') === '/abc.htm?g=k').toEqual(true);
		});
		it('SNS.buildURI', function() {
			expect( SNS.buildURI('/abc.htm?d', 'g=k') === '/abc.htm?d&g=k').toEqual(true);
		});
		it('SNS.goldlog', function() {
			expect( SNS.goldlog('sns.17.2') === undefined).toEqual(true);
		});
		it('SNS.storage', function() {
			expect( SNS.storage('hello')).toEqual('haved');
		});
		it('SNS.storage', function() {
			expect( SNS.storage('hello', 'haved')).toEqual(undefined);
		});
		it('SNS.guid', function() {
			expect( SNS.guid()).not.toEqual(null);
		});


		it('SNS.config', function() {
			expect( SNS.config('hello') ).toEqual(undefined);
		});

		it('SNS.config', function() {
			SNS.config('hello', 'world');
			expect( SNS.config('hello')).toEqual('world');
		});


		//login
		it('SNS._getDOMToken', function() {
			var token = document.createElement('div');
			token.innerHTML = '<input type="hidden" name="_tb_token_" value="_snsdk_htm_token_">';
			document.body.appendChild(token);

			expect( SNS._getDOMToken()).toEqual('_snsdk_htm_token_');
		});
		it('SNS.checkLogin', function() {
			expect( SNS.checkLogin()).toEqual(true);
		});

		it('window.KISSY is null', function() {
			expect( window.KISSY === undefined).toEqual(true);
		});



	});

});