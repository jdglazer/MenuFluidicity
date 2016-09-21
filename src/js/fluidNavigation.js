"use strict";

var fl_anchor ="a",
    fl_anchorClass="fl-inline-anchors",
    fl_parentAttributeName = "fl-parent", 
    fl_childReferenceArray ="children_elements",
    fl_Regex_anchorIdSpacer = /_|-/i;
//object library
var MenuFluidicity = function(){},
	MenuConstructionEngine = function() {};
		
//general function library

/**
 * determines if argument is of object type
 */
function fl_isObj( obj ) {
    return typeof obj == "object";
}

/**
 * Determined if argument can be accessed like an array
 */
function fl_arrayLike( array ) {
    return fl_isObj( array ) && "length" in array;
}

//object prototype definitions
var MProto = MenuFluidicity.prototype = {
};
  
var MCEProto = MenuConstructionEngine.prototype = {

/**
 * Returns an array of all anchor ("a") elements in a document object
 */
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
    },
    
/**
 * returns the id string value for the anchor element. This is the naming convention for the menu element
 */
    getAnchorId: function( anchorElement ) {
    
        if ( !fl_isObj(anchorElement) ) 
            return null;
        
        if( "getAttribute" in anchorElement )
            return anchorElement.getAttribute("id");
        
        if( "id" in anchorElement )
            return (typeof anchorElement.id == "string" ? anchorElement.id : null );
        
        return null;
        
    },
    
/**
 * replaces all slashes and underscores from anchor ids with spaces so that id can be used
 */
    anchorIdToTitle: function ( id ) {
    
        if( typeof id != "string" )
            return null;
            
         return id.split(fl_Regex_anchorIdSpacer).join(" ");
    },
    
/**
 * gets the parent element attribute value
 */
    getAnchorParent: function( anchorElement ) {
    
        if ( !fl_isObj( anchorElement ) ) 
            return null;
            
        if( "getAttribute" in anchorElement )
            return anchorElement.getAttribute(fl_parentAttributeName);
            
        return null;
        
    },
    
/**
 * adds a child element array to store references to an anchors' child elements and returns true if successful
 */
    anchorChildrenInit: function( anchorArray ) {
    
        if( !fl_arrayLike( anchorArray) )
            return false;
        
        for( var i = 0 ; i < anchorArray.length; i++ ) 
            anchorArray[i][fl_childReferenceArray] = [];
        
        return true;
    },
    
/**
 * Function to populate children arrays for each anchor element with references to all it's parent elements
 */
    anchorChildrenPopulate: function( anchorArray ) {
    
        if( !fl_arrayLike( anchorArray ) )
            return false;
            
        //code to go through anchors pulling out parent title and filling subsequent children submember arraylists
    }
  
}	

