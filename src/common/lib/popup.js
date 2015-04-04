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
		Навесим обработчики на ссылки
	*/
	$('#content-popup').on('click', 'a', function(e){
		e.stopPropagation();
		e.preventDefault();
		kango.browser.tabs.create({'url': $(this).attr('href')});
	});



	/*
		Show preloader
	*/
	var preloader = new Preloader();
	$('body').prepend(preloader.run());

	/*
		Poll urls
	*/
	var storage = new Storage(),
		tasks = storage.urls().map(function(url){ return ajax(url); }),
		tasksLength = tasks.length;
	if (tasksLength > 0) {
		var colors = [];
		if (tasksLength > 1) {
			var rainbow = new Rainbow();
	        rainbow.setSpectrum('e1e1e1', 'ffffff');
	        rainbow.setNumberRange(1, tasksLength);
	        for (var i = 1; i <= tasksLength; i++) {
	            colors.push('#' + rainbow.colourAt(i));
	        }
		}

		Q.all(tasks)
		.then(function(results){
			preloader.hide();
			return results;
		})
		.then(
			function(results){
				console.log(results);
				var items = [],
					dates =[],
					errors = [];
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
					renew badge
				*/
				(new Badge()).handle(Math.max.apply(Math, dates), 1);

				/*
					items collected from several feeds. sort this array by pubDate
				*/
				items = items.sort(function(a, b){ return Date.parse(b.pubDate) - Date.parse(a.pubDate); });

				/*
					display items and errors
				*/
				$('#mantis').empty()
					.append(items.map(function(o){ return o.write(); }))
					.find('[data-toggle="tooltip"]').tooltip();
				$('#errors').empty()
					.append(errors.map(function(o){ return o.write(); }));

				/*
					store items to localStorage
				*/
				if (items.length > 0) {
					storage.saveItems(items);
				}
			},
			function(err){
				console.error(err);
			}
		);
	} else {
		(new Badge()).touch('?');
		window.close();
		kango.ui.optionsPage.open();
	}
});

function Item(data) {
	var self = this;
	$.extend(true, this, data);

	this.write = function(el){
		var html = tmpl('template_mantis', {
			'title': self.title,
			'href': self.link,
			'date': moment(self.pubDate).calendar(),
			'category': self.category,
			'feed': self.feed.title,
			'feedHref': self.feed.link,
			'bgColor': self.bgColor
		});
		if (el) {
			el.append(html);
		}
		return html;
	};
}
function Err(data){
	var self = this;
	$.extend(true, this, data);

	this.write = function(el){
		var html = tmpl('template_error', self);
		if (el) {
			el.append(html);
		}
		return html;
	};
}
