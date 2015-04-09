(function(root){
	var app = root.app = {};

	/**
	 * Application utils
	 */
	app.ajax = function (url) {
		return new Promise(function(resolve, reject) {
			kango.xhr.send(
				{
					'url'			: url,
					'method'		: 'GET',
					'async'			: true
				},
				function(data) {
					if (data.status == 200 && data.response != null) {
						var txt = data.response, result;
						txt = txt.replace(/^\s+/g, '');
						if (/\.json$/.test(url) || txt.indexOf('{') === 0) {
							result = JSON.parse(txt);
						} else if (/\.xlm$/.test(url) || /\.rss$/.test(url) || txt.indexOf('<') === 0) {
							var xml = (new window.DOMParser()).parseFromString(txt, "text/xml");
							var json = JSON.parse(xml2json(xml, ''));
							result = json.hasOwnProperty('rss') ? json.rss.channel : json;
						} else {
							result = {'error': 'Could not detect content type for ' + url, 'txt': txt};
						}
						return resolve(result);
					} else {
						return resolve({'url': url, 'status': data.status, 'error': data.response || 'Could not load ' + url});
					}
				}
			);
		});
	};
	app._extend = function(o, param){
		Object.keys(param || {}).forEach(function(key){
			o[key] = param[key];
		});
	};
	app._sanitize = function(txt){
		if (txt) {
			txt = (typeof txt === 'string' ? txt : txt[ '#cdata' ]) || '';
			if (txt !== undefined && /\S/.test(txt)) {
				txt = (new DOMParser()).parseFromString(txt, 'text/html').body.innerText;
				txt = txt.replace(/<script.+?script>/gm, '')
										.replace(/<style.+?style>/gm, '')
										.replace(/<(meta|link).+?\/\s*>/gm, '')
										.replace(/class=".+?"/gm, '').replace(/class='.+?'/gm, '')
										.replace(/style=".+?"/gm, '').replace(/style='.+?'/gm, '')
										.replace(/<img /g, '<img class="img-responsive" ');
			}
		}
		return txt;
	};

	// Singletons
	app.storage = new Storage();
	app.badge = new Badge();

	// Handlers
	app.showPreloader = function(el){
		if (!this.preloader) {
			this.preloader = new Preloader();
		}
		if (!el || el.length === 0) {
			el = $('body').first();
		}
		el.prepend(this.preloader.run());
	};
	app.hidePreloader = function(){
		if (this.preloader) {
			this.preloader.hide();
		}
	};


	/**
	 * Data storage
	 */
	function Storage(){
		var self = this,
			urlsName = 'urls',
			badgeName = 'badge',
			itemsName = 'items',
			viewName = 'view';

		app._extend(this, {
			/*
				Urls
			*/
			'_rawUrls': function(){
				return kango.storage.getItem(urlsName) || {};
			},
			'urls': function(){
				return Object.keys(self._rawUrls());
			},
			'saveUrls' : function(data){
				kango.storage.setItem(urlsName, data);
			},
			'renewUrls' : function(urls){
				var data = self._rawUrls(),
					newData = {};
				urls.forEach(function(url){
					url = url.replace(/^\s+|\s+$/g, '');
					if (url.indexOf('//') === 0) {
						url = 'http:' + url;
					} else if (url.indexOf('http') !== 0) {
						url = 'http://' + url;
					}
					newData[ url ] = data[ url ] || {};
				});
				self.saveUrls(newData);
			},

			/*
				Badge
			*/
			'badge' : function (){
				var badge = kango.storage.getItem(badgeName);
				return parseInt(badge || 0, 10);
			},
			'saveBadge' : function(n) {
				if (n > 0) {
					kango.storage.setItem(badgeName, parseInt(n, 10));
				}
			},

			/*
				Items
			*/
			'items' : function (){
				return kango.storage.getItem(itemsName) || [];
			},
			'saveItems' : function(items) {
				kango.storage.setItem(itemsName, items || []);
			},

			/*
				View
			*/
			'view' : function (){
				return kango.storage.getItem(viewName) || 'simple';
			},
			'saveView' : function(n) {
				kango.storage.setItem(viewName, n);
			}
		});
	}

	/**
	 * Browser button handler
	 */
	function Badge(){
		var self = this;
		app._extend(this, {
			'touch' : function(n){
				kango.ui.browserButton.setBadgeValue(n || '!');
			},
			'blank' : function(){
				kango.ui.browserButton.setBadgeValue();
			},
			'handle' : function(max, makeHide){
				var sign = 0;
				if (max > 0 && parseInt(max, 10) > app.storage.badge()) {
					app.storage.saveBadge(max);
					sign++;
				}
				if (sign > 0 && !makeHide) {
					self.touch();
				} else {
					self.blank();
				}
			}
		});
	}

	/*
		Waiter
			http://codepen.io/zachernuk/details/myQpBO
	*/
	function Preloader(opt){
		app._extend(this, opt);

		var requestAnimationFrame = window.requestAnimationFrame ||
									window.mozRequestAnimationFrame ||
	                        		window.webkitRequestAnimationFrame ||
									window.msRequestAnimationFrame,
			c = document.createElement('canvas'),
			g = c.getContext('2d');
		c.className = 'preloader';
		c.width = this.width || (this.width = 50);
		c.height = this.height || (this.height = 50);
		var TOTALRAD = this.height/5;

		this.run = function(){
			var self = this;
			this.update();
			requestAnimationFrame(function(){
				self.run();
			});
			return c;
		};
		this.hide = function(){
			$(c).hide();
		};
		this.update = function() {
			var DURATION = 3.5;
			var LAYERS = 7;

			c.width= this.width;
			g.translate(this.width/2, this.height/2);
			g.strokeStyle = this.color || (this.color = "#808080");
			g.lineWidth= TOTALRAD/LAYERS+0.2;

			var now = (new Date().getTime()/1000)%DURATION;
			g.rotate(-now*Math.PI/DURATION-0.5);

			for (var i = 0; i < LAYERS; i++) {
				var pi = now/DURATION;
				pi = ease(pi);
				pi = Math.max(0,Math.min(0.999, pi+i/20));
				pi = ease(pi);
				pi = ease(pi);
				pi = ease(pi);
				pi = ease(pi);
				pi = ease(pi);
				pi +=1;
				g.globalAlpha = 0.9-i/LAYERS;
				g.beginPath();
				g.arc(0, 0, TOTALRAD+TOTALRAD*i/LAYERS, Math.PI*pi, Math.PI*pi+Math.PI);
				g.stroke();
			}
		};
		function ease(pi, a, b) {
			var ip = 1 - pi;
			return 3*ip*ip*pi*(a||0.05) + 3*ip*pi*pi*(b||0.95) + 1*pi*pi*pi;
		}
	}


})(window);
