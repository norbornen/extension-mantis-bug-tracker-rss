KangoAPI.onReady(function(){
	app.field = new Field();
	/*
		User defined locale set
	*/
	var locale = window.navigator.userLanguage || (window.navigator.languages ? window.navigator.languages[0] : undefined) || window.navigator.language || 'en';
	moment.locale(locale);

	/*
		Покажем как открывается страница с настройками
	*/
	$('[role="icon-settings"]').on('click', function(){
		kango.ui.optionsPage.open();
	}).tooltip();

	/*
		Add listeners
			For all tags "a", link open on new tab
	*/
	$('#content-popup').on('click', 'a', function(e){
		e.stopPropagation();
		e.preventDefault();
		kango.browser.tabs.create({'url': $(this).attr('href')});
	})
	.on('click', '[role="next"]', function(){
		var el = $(this).closest('[role="item"]'), next = el.next('[role="item"]');
		if (next.length === 0) {
			next = el.parent().find('[role="item"]:first');
		}
		el.hide();
		next.show();
	})
	.on('click', '[role="prev"]', function(){
		var el = $(this).closest('[role="item"]'), next = el.prev('[role="item"]');
		if (next.length === 0) {
			next = el.parent().find('[role="item"]:last');
		}
		el.hide();
		next.show();
	});



	/*
		Make tasks for urls polling
	*/
	var tasks = app.storage.urls().map(function(url){
						return app.ajax(url);
				}),
		tasksLength = tasks.length;
	if (tasksLength > 0) {
		/*
			Show preloader
		*/
		app.showPreloader();

		/*
			Calculate colors for panels
		*/
		var colors = [];
		if (tasksLength > 1) {
			var rainbow = new Rainbow();
	        rainbow.setSpectrum('eaeaea', 'ffffff');
	        rainbow.setNumberRange(1, tasksLength);
	        for (var i = 1; i <= tasksLength; i++) {
	            colors.push('#' + rainbow.colourAt(i));
	        }
		}

		Q.all(tasks)
		.then(
			function(results){
				var items = [], dates =[], errors = [];
				results.forEach(function(n, idx){
					if (n.error) {
						errors.push(new Err(n));
					} else {
						var list = !n.item ? [] : !Array.isArray(n.item) ? [n.item] : n.item; delete n.item;
						(list || []).forEach(function(item){
							item.feed = n;
							item.bgColor = colors[idx];
							items.push(new Item(item));
							dates.push(Date.parse(item.pubDate));
						});
					}
				});
				/*
					items collected from several feeds. sort this array by pubDate,
					store items to localStorage
				*/
				items = items.sort(function(a, b){ return Date.parse(b.pubDate) - Date.parse(a.pubDate); });
				if (items.length > 0) {
					app.storage.saveItems(items);
				}

				/*
					display items and errors
				*/
				app.field.write({
					'items'		: items,
					'errors'	: errors
				});

				/*
					renew badge
				*/
				app.badge.handle(Math.max.apply(Math, dates), 1);
			},
			function(err){
				console.error(err);
				app.field({
					'items'		: app.storage.items(),
					'errors'	: [new Err({'error': err})]
				});
			}
		);
	} else {
		app.badge.touch('?');
		window.close();
		kango.ui.optionsPage.open();
	}
});

/**
 *
 */
function Field(){
	var itemsContainer = $('#mantis'),
		errorsContainer = $('#errors');

	this.write = function(data){
		var view = app.storage.view(),
			errors = data.errors || [],
			items = data.items || [];

		$('body').removeClass().addClass('body-' + view);
		app.hidePreloader();

		/*
			Write items and erros
		*/
		errorsContainer.empty()
			.append(errors.map(function(o){ return o.html(); }));
		itemsContainer.empty()
			.append(items.map(function(o){ return o.html(); }));

		/*
			Correction faces
		*/
		itemsContainer
			.find('[data-toggle="tooltip"]').tooltip().end()
			.find('.page-number').each(function(idx, el){
				$(el).text((idx+1) + ' of ' + items.length);
			});
		if (view === 'th') {
			itemsContainer.addClass('row');
			var array = itemsContainer.find('[role="item"]');
			array.addClass('col-xs-6');
			for (var i = 0; i < array.length; i+= 2) {
				var a = array.eq(i), b = array.eq(i + 1);
				if (!b || b.length === 0) {
					break;
				}
				var aH = a.height(), bH = b.height(), max = Math.max(aH, bH);
				(aH !== max) && a.height(max);
				(bH !== max) && b.height(max);
			}
		}
	};
}
/**
 *
 */
function Item(data, opt) {
	$.extend(true, this, data);

	this.template = function(){
		var view = app.storage.view();
		return view === 'th' ? 'template_mantis__simple' : 'template_mantis__' + view;
	};
	this.html = function(){
		var description = (typeof this.description === 'string' ? this.description : this.description['#cdata']) || '';
		if (description !== undefined && /\S/.test(description)) {
			description = (new DOMParser()).parseFromString(description, 'text/html').body.innerText;
			description = description.replace(/<script.+?script>/gm, '')
									.replace(/<style.+?style>/gm, '')
									.replace(/<(meta|link).+?\/\s*>/gm, '')
									.replace(/class=".+?"/gm, '').replace(/class='.+?'/gm, '')
									.replace(/style=".+?"/gm, '').replace(/style='.+?'/gm, '')
									.replace(/<img /g, '<img class="img-responsive" ');
		}

		return tmpl(this.template(), {
			'item' : {
				'title': this.title,
				'href': this.link,
				'date': moment(this.pubDate).calendar(),
				'category': this.category,
				'description': description,
				'feed': this.feed.title,
				'feedHref': this.feed.link,
				'bgColor': this.bgColor
			}
		});
	};
	this.write = function(el){
		el.append(this.html());
	};
}
/**
 *
 */
function Err(data){
	$.extend(true, this, data);

	this.html = function(){
		return tmpl('template_error', this);
	};
	this.write = function(el){
		el.append(this.html());
	};
}
