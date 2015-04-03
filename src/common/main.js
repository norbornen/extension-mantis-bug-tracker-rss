function MantisBTExtension() {
    this.storage = new Storage();

    this.go();
}

MantisBTExtension.prototype = {
    'go' : function(){
        var self = this,
            storage = this.storage,
            tasks = storage.urls().map(function(url){ return ajax(url); });

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
                (new Badge()).handle(Math.max.apply(Math, dates));
    		},
    		function(err){
    			console.error(err);
    		}
    	);

        setTimeout(function(){
            self.go();
        }, 10*60*1000);
    }
};

var extension = new MantisBTExtension();
