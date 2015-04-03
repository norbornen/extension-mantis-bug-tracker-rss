function Badge(){
	this.storage = new Storage();
}
Badge.prototype = {
	'touch' : function(n){
		kango.ui.browserButton.setBadgeValue(n || '!');
	},
	'blank' : function(){
		kango.ui.browserButton.setBadgeValue();
	},
	'handle' : function(max, makeHide){
		var sign = 0;
		if (max > 0 && parseInt(max, 10) > this.storage.badge()) {
			this.storage.saveBadge(max);
			sign++;
		}
		if (sign > 0 && !makeHide) {
			this.touch();
		} else {
			this.blank();
		}
	}
};
