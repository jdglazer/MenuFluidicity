"use strict";

var fl_anchor ="a",
		fl_anchorClass="fl-inline-anchors";

var MenuFluidicity = function(){},
		MenuConstructionEngine = function() {};


var MProto = MenuFluidicity.prototype = {
	
};
  
var MCEProto = MenuConstructionEngine.prototype = {

	collectInlineAnchors: function( document ) {
  	var anchors = document.getElementsByTagName( fl_anchor ),
    		iterator,
        inlines = [];
    
    for( iterator = 0; iterator < anchors.length; iterator++ ) {
    
    	if( typeof anchors[iterator] == "object" && "getAttribute" in anchors[iterator] ) {
      
        if( anchors[iterator].getAttribute("class")  === fl_anchorClass) {
        
          inlines.push( anchors[iterator] );
        }
      }
    }
    
    return inlines;
  }
  
}	

