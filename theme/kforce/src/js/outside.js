// Thanks jAndy
// http://stackoverflow.com/a/3440036/1136593
(function($){
   $.fn.outside = function(ename, cb){
      return this.each(function(){
         var $this = $(this),
              self = this;
         $(document.body).bind(ename, function tempo(e){
             if(e.target !== self && !$.contains(self, e.target)){
                cb.apply(self, [e]);
                if(!self.parentNode) $(document.body).unbind(ename, tempo);
             }
         });
      });
   };
}(jQuery));
