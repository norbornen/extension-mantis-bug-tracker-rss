KangoAPI.onReady(function(){
	var optionsBody = $('#options .panel .panel-body');

	/**
	 *	onLoad page
	 */
	app.storage.urls().forEach(function(url){
		newString(url);
	});
	$('.panel-heading .btn-group input[value="' + app.storage.view() + '"]')
		.prop('checked', true).closest('label').addClass('active');
	$('#header h1').append($('<span> ' + kango.getExtensionInfo().version + '</span>').css({'font-size': '.8em'}));


	/**
	 *	clicks and change events
	 */
	$('#options')
	.on('change', '.panel-body input', function(e){
		save();
	})
	.on('click', 'button[role="delete"]', function(e){
		$(this).closest('.input-group').remove();
		save();
	})
	.on('click', 'button[role="add"]', function(e){
		newString();
	})
	.on('change', '.panel-heading .btn-group input', function(){
		var val = $(this).val(), label = $(this).closest('label');
		label.siblings().removeClass('active').end().addClass('active');
		app.storage.saveView(val);
		return true;
	});

	/**
	 *	create new string from template
	 */
	function newString(url){
		var html = $(tmpl('template_string', {'url': url}));
		optionsBody.append(html);
		$('input', html).trigger('focus');
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
		app.storage.renewUrls(array);
		app.badge.touch('…');
	}
});
