KangoAPI.onReady(function(){
	/*
		User defined locale set
	*/
	var locale = window.navigator.userLanguage || window.navigator.language || 'en';
	moment.locale(locale);

	/*
		Покажем как открывается страница с настройками
	*/
	$('[role="icon-settings"]').on('click', function(){
		kango.ui.optionsPage.open();
	}).tooltip();

	/*
		Add listeners
	*/
	$('#content-popup')
	.on('click', 'a', function(e){
		/*
			For all tags "a", link open on new tab
		*/
		e.stopPropagation();
		e.preventDefault();
		kango.browser.tabs.create({'url': $(this).attr('href')});
	})
	.on('click', '[role="next"]', function(){
		var el = $(this).closest('.panel'), next = el.next('.panel');
		if (next.length === 0) {
			next = el.parent().find('.panel:first');
		}
		el.hide();
		next.show();
	})
	.on('click', '[role="prev"]', function(){
		var el = $(this).closest('.panel'), next = el.prev('.panel');
		if (next.length === 0) {
			next = el.parent().find('.panel:last');
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
				new Field({
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
				new Field({
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

function Field(opt){
	var VIEW = app.storage.view(),
		errors = opt.errors || [],
		items = opt.items || [],
		itemsContainer = $('#mantis'),
		errorsContainer = $('#errors');

	/*
		Apply page view
	*/
	$('body').addClass('body-' + VIEW);
	app.hidePreloader();
	itemsContainer.empty();
	errorsContainer.empty();

	itemsContainer
		.append(items.map(function(o){ return o.write(); }))
		.find('[data-toggle="tooltip"]').tooltip().end()
		.find('.page-number').each(function(idx, el){
			$(el).text((idx+1) + ' of ' + items.length);
		});

	errorsContainer
		.append(errors.map(function(o){ return o.write(); }));
}
function Item(data, opt) {
	$.extend(true, this, data);

	this.html = function(){
		var template = 'template_mantis__' + app.storage.view();
		// todo: forbidden html tags filter
		var description = $('<div>').html(typeof this.description === 'string' ? this.description : this.description['#cdata']).text();
		return tmpl(template, {
			'title': this.title,
			'href': this.link,
			'date': moment(this.pubDate).calendar(),
			'category': this.category,
			'description': description,
			'feed': this.feed.title,
			'feedHref': this.feed.link,
			'bgColor': this.bgColor
		});
	};
	this.write = function(el){
		var html = $(this.html());
		$('img', html).addClass('img-responsive');
		(el || $('#mantis')).append(html);
	};
}
function Err(data){
	$.extend(true, this, data);

	this.html = function(){
		return tmpl('template_error', this);
	};
	this.write = function(el){
		(el || $('#errors')).append(this.html());
	};
}
