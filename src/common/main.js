function MantisBTExtension() {
    this.storage = new Storage();

    this.poll();
}

MantisBTExtension.prototype = {
    'poll' : function(){
        var self = this,
            storage = this.storage,
            tasks = storage.urls().map(function(url){ return ajax(url); }),
            badge = new Badge();

    	if (tasks.length > 0) {
            Q.all(tasks).then(
        		function(results){
        			var dates = [];
        			results.forEach(function(n){
        				if (!n.error) {
                            var list = !n.item ? [] : !Array.isArray(n.item) ? [n.item] : n.item; delete n.item;
                            list.forEach(function(item){
                                dates.push(Date.parse(item.pubDate));
                            });
        				}
        			});
                    badge.handle(Math.max.apply(Math, dates));
        		},
        		function(err){
        			console.error(err);
        		}
        	);
        } else {
            badge.touch('?');
        }

        setTimeout(function(){
            self.poll();
        }, 10*60*1000);
    }
};

var extension = new MantisBTExtension();
