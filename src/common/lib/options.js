KangoAPI.onReady(function(){
	/**
	*
	*/
	var storage = new Storage(),
		optionsBody = $('#options .panel .panel-body'),
		badge = new Badge();

	/**
	 *	onLoad page
	 */
	storage.urls().forEach(function(url){
		newString(url);
	});

	/**
	 *	clicks and change events
	 */
	$('#options')
	.on('change', 'input', function(e){
		save();
	})
	.on('click', 'button[role="delete"]', function(e){
		$(this).closest('.input-group').remove();
		save();
	})
	.on('click', 'button[role="add"]', function(e){
		newString();
	});

	/**
	 *	create new string from template
	 */
	function newString(url){
		optionsBody.append(tmpl('template_string', {'url': url}));
	}
	/**
	 *	store all data
	 */
	function save() {
		var array = [];
		$('input', optionsBody).each(function(idx, el){
			if (/\S/.test(el.value)) {
				array.push(el.value);
			}
		});
		storage.renew(array);
		badge.touch('…');
	}
});
