"use strict";

//settings libraray
var fl_anchor ="a",
    fl_menuTag = "ul",
    fl_menuElementTag = "li",
    fl_anchorClass="fl-inline-anchors",
    fl_parentAttributeName = "fl-parent", 
    fl_childReferenceArray ="children_elements",
    fl_Regex_anchorIdSpacer = /_|-/i;
    
//object library
var MenuFluidicity = function(){},
	MenuModelConstructionEngine = function() {},
	MenuConstructionEngine = function() {},
	MenuTagBuilder = function() {};
		
//****************************************************** DEFINES: general global function library *****************************************8

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

// ******************************************** DEFINES, ALIASES: MenuFluidicity prototype ******************************************8
var MProto = MenuFluidicity.prototype = {
};

// ******************************************** DEFINES, ALIASES: MenuTagBuilder prototype ********************************************8
var MTSProto = MenuTagBuilder.prototype = {

/**
 * Identifies the type of object as MenuTagSpecs 
 */
    CLASS_NAME: "MenuTagSpecs",
/**
 * The tag name to be created
 */
    TAG_NAME: "",
    
/**
 * a list of attributes for the element created where the keys are attribute names and the values are attribute values
 */
    TAG_PROPERTIES: [],
    
/**
 * A function that builds element from the information stored in this objects properties
 */
    buildTag: function(document) {
    
        if( !"createElement" in document )
            return false;
        
        var newElement = document.createElement( this.TAG_NAME );
        
        if( !"setAttribute" in newElement )
            return false;
            
        if( !fl_arrayLike( this.TAG_PROPERTIES ) )
            return false;
            
        //SHOULD ADD CODE TO HERE TO MAKE SURE keys FUNCTION IS IN TAG_PROERTIES OR CODE IN fl_arrayLike GLOBAL FUNCTION TO CHECK FOR keys
        //FUNCTION UNIVERSALLY
        var property_names = this.TAG_PROPERTIES.keys();
        
        for( var i =0; i < property_names.length; i++ ) {
        
            var pn = property_names[i];
            
            if( typeof pn == "string" )         
                newElement.setAttribute( pn, this.TAG_PROPERTIES[ pn ] );
        }
        
        return newElement;
            
    }    
};

//********************************************* DEFINES, ALIASES: MenuConstructionEngine prototype **********************************8
var MCEProto = MenuConstructionEngine.prototype = {
/**
 * identifies object as menu construction engine type
 */
 
    CLASS_NAME: "MenuConstructionEngine",
/**
 * list of all anchor elements with children elements filled in
 */
    anchorModel: [],
    
/**
 * Function that builds an array of relevant anchor elements and adds to each element a list (as an indexed array ) of child elements
 *     takes, by dependency injection, an instance of the MenuModelConstructionEngine object as first argument and a document object or
 *     parent element in which to search for anchors as second argument
 */
    construct: function( menu_model_const_engine,  document ) {
    
        if( !"CLASS_NAME" in menu_model_const_engine || !"getElementsByTagName" in document )
            return false;
        
        if( menu_model_const_engine.CLASS_NAME != "MenuModelConstructionEngine" )
            return false;
            
    //aliasing long variable name to something shorter
        var mmmce = menu_model_const_engine;
        
        this.anchorModel = mmce.collectInlineAnchors( document );
        
        if( mmce.anchorChildrenInit( this.anchorModel ) )
            mmce.anchorChildrenPopulate( this.anchorModel );
        
    }
};

// ********************************************* DEFINES, ALIASES: MenuModelConstructionEngine prototype ********************************8 
var MMCEProto = MenuModelConstructionEngine.prototype = {

/**
 * identifies object as menu model construction engine type
 */
    CLASS_NAME: "MenuModelConstructionEngine",

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
            return false;
        
        if( "getAttribute" in anchorElement )
            return anchorElement.getAttribute("id");
        
        if( "id" in anchorElement )
            return (typeof anchorElement.id == "string" ? anchorElement.id : null );
        
        return false;
        
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
        
    //verifies arguments
        if( !fl_arrayLike( anchorArray ) )
            return false;
            
    //goes through list of valid anchors passing anchor reference to parent's child array
        for( var l = 0; l < anchorArray.length; l++ ) {
            
            var a = anchorArray[l];
            
        //makes sure that the child reference array is present in anchor element
            if( "push" in a[ fl_childReferenceArray ] ) {
               
            //stores string name of parent to current anchor
                var parent_ = this.getAnchorParent( a );
                
                if( parent_ != null ) {
                    
                //stores a list (as an array of course, how else? ) of parent anchor element(s) for current anchor
                    var parent_elements = this.getElementsById( anchorArray, parent_ );
                    
                //makes sure parent_elements is not null and is an array
                    if( fl_arrayLike( parent_elements) ) {
                    
                    //passes reference of anchor element to all its parents
                        for( var p = 0; p < parent_elements.length; p++ ) {
                            
                        //verifies that anchor's parent element has a child reference array
                            if( fl_arrayLike( parent_elements[p][ fl_childReferenceArray ] )  ) {
                            
                            //All checks complete -> anchor element is added to parent elements child list
                                parent_elements[p][ fl_childReferenceArray ].push( a );
                            }
                        }
                    }
                }
                
            }
        }
        
        //as long as argument is a valid type
        return true;
        
    },
    
/**
 * Function to produce an array of anchor elements by a specified id value
 */
    getElementsById: function ( anchorArray, id ) {
        
        if( !fl_arrayLike( anchorArray ) || typeof id != "string" )
            return false;
            
        var returnAnchors = [];
        
        for( var j = 0; j < anchorArray.length; j++ ) {
        
            if( this.getAnchorId( anchorArray[j] ) == id )
            
                returnAnchors.push( anchorArray[j] );
        }
        
        return returnAnchors;          
       
    }
    
}
// ******************************************************************************************************************************

