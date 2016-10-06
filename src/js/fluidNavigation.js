"use strict";

//settings libraray
//------------------
//******************** Tag names used ********************
var fl_anchor ="a",
    fl_menuTag = "ul",
    fl_menuElementTag = "li",
//******* Settings for inline anchors ********************
	//class used to identify anchors in page (inline anchors) from which menu will be constructed
    fl_anchorClass="fl-inline-anchors",
	//attribute used to identify parent inline anchor element (by parent's id ) for any given inline anchor
    fl_parentAttributeName = "fl-parent",
    //the attribute in the constructed menu list elements that identifies the id of the associated anchor in the page
//******* Compilation storage properties **************
    fl_childReferenceArray ="children_elements",
    fl_parentReferenceVariable ="parent_element",
// ******************** Regexes ***********************
    fl_Regex_anchorIdSpacer = /_|-/i,
// ****************************** Settings for constructed menu element's attributes *********************************
    fl_liPositionAttributeName = "fl-id",
    fl_liStyleClass = "fl-li",
    fl_liActiveClass = "fl-active",
    fl_aStyleClass = "fl-a",
    fl_ulStyleClass = "fl-ul",
    fl_styleHolderId = "fl-style",
    //arrays that store attribute/value pairs for each type of element in menu. This is where property/value pairs desired in html are declared
    fl_menuTagAttrValPairs = {
		[fl_anchor]: { "class": fl_aStyleClass },
		[fl_menuTag]: {"class": fl_ulStyleClass },
		[fl_menuElementTag]: { [fl_liPositionAttributeName]: "", "class": fl_liStyleClass }
			
	},
//******************************** Applied Styles *******************************************
	fl_defaultStyles = {
	// v These are esential defaults
		defaults: "."+fl_aStyleClass+" { text-decoration: none; } ."
					 +fl_ulStyleClass+" {	list-style-type: none; display: none; } ."
					 +fl_liActiveClass+" > "+fl_menuTag+" { display: block; } ."
					 +fl_liActiveClass+" { display: block; } ",
		parentElementDefault: "position: fixed;",
		highestListHolderDefault: "display: block;",
	// v These are use changeable styles 
		listElementOnHover: "padding-left: 3px; border-left: 1px solid purple;",
		listElementOnHoverCssSelector: "."+fl_liStyleClass+":hover > "+fl_anchor,
		listElementActivated: "padding-left: 2px; border-left: 2px solid purple;",
		listElementActivatedCssSelector: "."+fl_liActiveClass+" > "+fl_anchor,
		listElementDeactivated: "padding: 4px;",
		listElementDeactivatedCssSelector: "."+fl_liStyleClass+" > "+fl_anchor
	};
        
//object library
//--------------
var MenuFluidicity = function( parentId, settings ){
	
		this.parentId = typeof parentId == "string" ? parentId : null;
		
		this.settings = fl_isObj( settings ) ? settings : null;
	},
	MenuModelConstructionEngine = function() {},
	MenuConstructionEngine = function() {},
	MenuTagBuilder = function() {},
	MenuEventHub = function() {},
	MenuActivator = function() {};
	
//Top level ul for menu created. This is the element that is appended to the menu holding element specified by parentId argument in MenuFluidicity.create
var FlMenu;
		
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

/**
 * Checks to see if argument string matches the primary identifier class searched for be menu builder
 */
function fl_hasClass( _class ) {
	return _class == fl_anchorClass;
}

//object prototype definitions

//******************************************** ALIASES: MenuFluidicity prototype ******************************************8
var MProto = MenuFluidicity.prototype;

/**
 * Primary function that builds menu and calls onSuccess callback if menu built successfully and onFailure callback otherwise
 * 
 */
MProto.create = function() {
	
	var onSuccess = arguments.length > 0 ? arguments[0] : null, 
		ofFailure = arguments.length > 1 ? arguments[1] : null;
	
	var mmce = new MenuModelConstructionEngine(),
		mce = new MenuConstructionEngine(),
		meh = new MenuEventHub();
		
		if( mce.construct( mmce, document ) && this.parentId != null ) {
			
			var ul1 = mce.buildTopLevelList( mmce, document);
			
			if( ul1 ) {
// ADD MORE CODE TO FULLY APPEND MENU TO PARENT HOLDER AND TEST THIS FUNCTION!
				var parent = document.getElementById( this.parentId );
				
				if( fl_isObj( parent ) && parent != null ) {
					
					parent.appendChild( ul1 );
										
					if( meh.watch( parent, mce.anchorModel, mmce ) ) {
						
						this.applyStyles( this.parentId, this.settings );
						
						if( typeof onSuccess == "function" )
							onSuccess();
							
						return;
					}
				}
			}
		}
			
		if( typeof onFailure == "function" )
			onFailure();
}

/**
 * A function used to apply styles to created menu
 */
MProto.applyStyles = function( parentId, settings ) {
	
	settings = fl_isObj( settings ) && settings != null ? settings : {};
	
//aliasing long variable name/objects
	var f = fl_defaultStyles,
		styles = "styles" in settings ? settings.styles: {};
	
	var css = f.defaults + " #"+parentId+" { "+f.parentElementDefault+" } "
			  + "#"+parentId+" > "+fl_menuTag+" { "+f.highestListHolderDefault+" } "
			  +f.listElementOnHoverCssSelector+" { "+ ("hover" in styles? styles.hover : f.listElementOnHover )+" } "
			  + f.listElementActivatedCssSelector+" { "+("activated" in styles? styles.activated : f.listElementActivated )+" } "
			  + f.listElementDeactivatedCssSelector+" { "+("deactivated" in styles? styles.deactivated : f.listElementDeactivated )+" } ";
	
	var head = document.getElementsByTagName( "head" )[0],
		style = document.createElement( "style" );
		style.id = fl_styleHolderId,
		style.textContent = css;		
		
		head.appendChild( style );
}
//******************************************** DEFINES, ALIASES: MenuTagBuilder prototype ********************************************8
var MTSProto = MenuTagBuilder.prototype = {

/**
 * Identifies the type of object as MenuTagSpecs 
 */
    CLASS_NAME: "MenuTagBuilder",
/**
 * The tag name to be created
 */
    TAG_NAME: "",
/**
 * The text within the tag not belonging to any child elements
 */
    TEXT_CONTENT: null,
    
/**
 * a list of attributes for the element created where the keys are attribute names and the values are attribute values
 */
    TAG_PROPERTIES: [],
/**
 * A function that allows for the setting of all important properties in the object with a single line of code
 */
    setAll: function( name, txt, properties ) {
		
		this.TAG_NAME = name;
		this.TEXT_CONTENT = txt;
		this.TAG_PROPERTIES = properties;
	},
/**
 * A function that builds element from the information stored in this object's properties
 */
    buildTag: function(document) {
	//code to verify ability to create element
        if( !"createElement" in document )
            return false;
            
    //aliasing a reference to functions parent object
        var T = this;

        var newElement = document.createElement( T.TAG_NAME );
    //code to verify that element created is valud
        if( !"setAttribute" in newElement || !fl_isObj( T.TAG_PROPERTIES ) )
            return false;
	//adds properties to element
        for( var pn in T.TAG_PROPERTIES ) {
            
            if( typeof pn == "string" )         
                newElement.setAttribute( pn, T.TAG_PROPERTIES[ pn ] );
        }
	//adds text node to element
        if( typeof T.TEXT_CONTENT == "string" && "createTextNode" in document && "appendChild" in newElement ) {
			
			var txtNode = document.createTextNode( T.TEXT_CONTENT );
			
			newElement.appendChild( txtNode );

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
 * The name of the new property of anchor elements that will store the associated list element to be displayed in menu 
 */
    ANCHOR_LIST_ELEMENT_STORAGE_PROPERTY: "li_element",
    
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
        var mmce = menu_model_const_engine;
        
        this.anchorModel = mmce.collectInlineAnchors( document );
        
        if( mmce.anchorChildrenInit( this.anchorModel ) ) {

            if( mmce.anchorChildrenPopulate( this.anchorModel ) ) {

				if( this.createAnchorListElements( mmce, document ) ) {

					if( this.appendChildListElements( mmce, document ) ) {

						return true;
					}
					else {
						return false;
					}
				}
				else {
					
					return false;
				}
			} 
			else {
				return false;
			}
		}
		else {
			return false;
		}
        
    },
/**
 * creates a new html list element of format <li><a></a></li> for each anchor in anchorModel array and stores it in newly added "li_element" 
 * property of each anchor
 */ 
    createAnchorListElements: function( menu_model_const_engine, document ) {
		
		if( !"CLASS_NAME" in menu_model_const_engine || !"getElementsByTagName" in document )
            return false;
		
	//aliasing menu_model_const_engine and fl_menuTagAttrValPairs
		var mmce = menu_model_const_engine,
			mav = fl_menuTagAttrValPairs;
		
	//A pool instance of MenuTagBuilder to be re-used to build DOM elements
		var builder = new MenuTagBuilder();

		for( var iter = 0; iter < this.anchorModel.length; iter++ ) {
																											 
			var anchor = this.anchorModel[ iter ];
			
		//Skips rendering anchor as menu element if no id attribute present
			if( !"id" in anchor )
				continue;
				
		//Build li tag
			mav[ fl_menuElementTag ][ fl_liPositionAttributeName ] = anchor.id;
			
			builder.setAll( fl_menuElementTag, 
							null, 
							mav[ fl_menuElementTag ] 
						  );
						  
			var _li = builder.buildTag( document );
			
			if( !fl_isObj( _li ) || !"appendChild" in _li ) 
				continue;
			
		//Build <a> tag
			mav[fl_anchor]["href"] = "#"+anchor.id;
			
			builder.setAll( fl_anchor, 
							mmce.anchorIdToTitle( anchor.id ), 
							mav[fl_anchor] 
						  );
						  
			var _a = builder.buildTag( document );
			
			if( !fl_isObj( _a ) ) 
				continue;
				
		//Append a to li tag
			_li.appendChild( _a );
			
		//Append blank ul to li if children elements present
			if( 0 < anchor[fl_childReferenceArray].length ) {
				
				builder.setAll( fl_menuTag, null, mav[ fl_menuTag ] );
				var _ul = builder.buildTag( document );
				
				_li.appendChild( fl_isObj( _ul ) ? _ul : null );
				
			}
			
		//stores list element in anchor
			anchor[ this.ANCHOR_LIST_ELEMENT_STORAGE_PROPERTY ] = _li;
																				 
		}
		
		return true;																																 
		
	},
/**
 * Goes through anchor list, appending child anchor list elements to parent anchor ul element
 */
	appendChildListElements: function( menu_model_const_engine ) {
		
		if( !"CLASS_NAME" in menu_model_const_engine )
            return false;
            
	//aliasing long variables
		var mmce = menu_model_const_engine,
			al = this.ANCHOR_LIST_ELEMENT_STORAGE_PROPERTY;
			
	//iterated through anchorModel array
		for( var iter in this.anchorModel ) {
			
			var anchor = this.anchorModel[iter];
			
			if( !"id" in anchor || !al in anchor || !fl_childReferenceArray in anchor ) 
				continue;
//ERROR BEING CAUSED BY THIS: CLAIM IS THAT anchor[al] is undefined
			if( !fl_isObj( anchor[al] ) )
				continue;
				
			if( !"childNodes" in anchor[al] )
				continue;
				
			if( anchor[al].childNodes.length < 2 )
				continue;
				
		//aliasing for shortening
			var c = anchor[fl_childReferenceArray];
			
			if( c.length < 1 )
				continue;
				
		//iterated through anchor's child element array
			for( var i = 0; i < c.length; i++ ) {
				
				if( al in c[i] ) {
					
					if( fl_isObj( c[i][ al ] ) ) {
						
						var u = anchor[al].childNodes[1];
						
						if("appendChild" in  u ) {
							
							u.appendChild( c[i][ al ] );
						}						
					}
				}
					
			}
			
		}
		
		return true;
	},
/**
 * A function to take fully constructed list elements that are not the children of other list elements and perform the final construction
 * of the menu html DOM
 */
	buildTopLevelList: function( menu_model_const_engine, document ) {
		
		if( !"CLASS_NAME" in menu_model_const_engine || !"createElement" in document )
            return false;
            
        var builder = new MenuTagBuilder();
        
        builder.setAll( fl_menuTag, null, fl_menuTagAttrValPairs[fl_menuTag] );
        
        var ul1 = builder.buildTag( document );
        
        if( !fl_isObj( ul1 ) )
			return false;
		
		if( !"appendChild" in ul1 )
			return false;
            
        var mmce = menu_model_const_engine,
			al = this.ANCHOR_LIST_ELEMENT_STORAGE_PROPERTY;
        
		for( var iter in this.anchorModel ) {
			
			var anchor = this.anchorModel[ iter ];
			
			if( mmce.getAnchorParent( anchor ) == null && al in anchor) {
				
				if( fl_isObj( anchor[ al ] ) )
				
					ul1.appendChild( anchor[ al ] );
				
			}
		}
		
		return ul1;
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
			
			var class_str = anchors[iterator].getAttribute("class"),
				classes = class_str != null ? class_str.split(" ") : [];
			
            if( classes.find( fl_hasClass ) != null ) {
            
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
            
            if( fl_childReferenceArray in a) {
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
                                //and reference to parent element is added to child element's fl_parentReferenceVariable property
									a[ fl_parentReferenceVariable ]  =  parent_elements[p];
                                }
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
            return [];
            
        var returnAnchors = [];
        
        for( var j = 0; j < anchorArray.length; j++ ) {
        
            if( this.getAnchorId( anchorArray[j] ) == id )
            
                returnAnchors.push( anchorArray[j] );
        }
        
        return returnAnchors;          
       
    },
    
/**
 * Function to return a parent element by the current elements id
 */
    getParentElement: function ( anchorArray, id ) {
		
		if( !fl_arrayLike( anchorArray ) || typeof id != "string" )
			return {};
		
		var e = this.getElementsById( anchorArray, id);
		
		var pStr = this.getAnchorParent( e.length > 0 ? e[0] : {} );
		
		var p = this.getElementsById( anchorArray, pStr );
		
		return (p.length > 0 )
				? p[0]
				: {};
	}
    
}
//********************************************* DEFINES, ALIASES: MenuEventHub prototype **********************************8

/*********************************************************************************************************************************
 * 	NEW PARADIGM: save all data necessary in window objects callback functions in dynamically allocated properties of the window *
 * object. For instance, store anchorPositions and anchorTopPositions into window object properties                              *
 *********************************************************************************************************************************/
var MEHProto = MenuEventHub.prototype = {

/**
 * The fixed anchor positions relative to the top of the document
 */
	anchorPositions: {},
	
/**
 * The anchor positions relative to the top of the window. An associative array of indexed arrays. First value in indexed array
 * is last positions second to last position recorded for anchor element and second element is last position recorded
 */
	
	anchorTopPosition: {},
	anchorList:  null,
	menuUl: null,
	menuActivator: null,
	previousA: null,
	
/**
 * The function that is passed to the window object's onscroll event handler. This function should be thought of as a member of
 * the window object, not this object. Thus "this" will reference the window object. The method used to access members of this object
 * is first by passing a reference to this object to the window object so that this objects members are still visible in the window
 * object.
 */	
	scrollHandler: function( event ) {
						
			this.menuEventHubInstance.updateAnchorPositionFromTop();
			
			for( var iter in this.menuEventHubInstance.anchorTopPosition ) {
				
			//aliasing array
				var ap = this.menuEventHubInstance.anchorTopPosition[iter];
				
				if( ( ap[0] >= 0 && ap[1] < 0 ) || ( ap[0] < 0 && ap[1] >= 0 ) ) {
					
				//Calls anchor passage callback passing anchor id and scrollDown boolean ( true if scrolling down, false if scrolling up)
					this.menuEventHubInstance.onanchorpass( this.menuEventHubInstance.previousA, iter, (ap[1] - ap[0]) >= 0 );
					this.menuEventHubInstance.previousA = iter;
					break;
				}
			}
		},
/**
 * Gets the distance between the top of the body and the element specified by the id argument
 */
	offsetTop: function( id ) {
		
		if( !fl_isObj( document ) )
			return false;
			
		if( !"body" in document )
			return false;
			
		if( !"scrollTop" in document.body )
			return false;
			
		var elemPos = this.distanceFromWindowTop( id );
		
		if( typeof elemPos != "number" )
			return false;

		return document.body.scrollTop -  elemPos;
		
	},
/**
 * Gets the distance between the object identified by id argument and the top of the browser window
 */
	distanceFromWindowTop: function( id ) {
		
		if( !fl_isObj( document ) )
			return false;
			
		if( !"getElementById" in document )
			return false;
		
		var element =  document.getElementById( id );
		
		if( !"getBoundingClientRect" in element )
			return false;
			
		return -element.getBoundingClientRect().top;
	},
/**
 * Gets all positions of elements in document relative to the top of the body and stores them in anchorTopPositions array
 */
	compileAnchorPositions: function( anchorList ) {
		
		var anchorPos = {};
		
		if( fl_arrayLike( anchorList ) ) {
			
			for( var iter in anchorList ) {
				
				var anchor = anchorList[iter];
				
				if( !fl_isObj( anchor ) )
					continue;
					
				if( !"id" in anchor )
					continue;
				
				var off = this.offsetTop( anchor.id );
				
				anchorPos[ anchor.id ] = typeof off == "number" ? off : -9 ;
				
				var distTop = this.distanceFromWindowTop( anchor.id );
				
				distTop = typeof distTop == "number" ? distTop : -1;
				
				this.anchorTopPosition[ anchor.id ] = [ distTop, distTop ];
			}
		}
		
		return anchorPos;
	},	
	
/**
 * Updates the position of the anchor elements relative to the top of the window as they are stored in anchorTopPostion array
 */
	updateAnchorPositionFromTop: function( ) {
		
		for( var iter in this.anchorTopPosition ) {
			
			var pos = this.anchorTopPosition[ iter ];
			
			if( !fl_arrayLike( pos ) )
				continue;
				
			if( pos.length < 2 )
				continue;
				
			pos[0] = pos[1];
			
			var d = this.distanceFromWindowTop( iter );
			
			pos[1] = d ? d : pos[1];
		}
	},
	
/**
 * THe function that implements scroll watcher and detection on passing of anchor list
 */
	watch: function( menuHoldingElement, anchorList, mmce ) {
		
		if( !fl_isObj( menuHoldingElement ) || 	!fl_isObj( anchorList ) || !fl_isObj( window ) ) 
			return false;
			
		if( !"childNodes" in menuHoldingElement || !fl_arrayLike( anchorList ) )
			return false;
			
		for( var iter in menuHoldingElement.childNodes ) {
			
			var e = menuHoldingElement.childNodes[iter];
			
			if( !"tagName" in e )
				continue;
				
			if( e.tagName.toLowerCase() == fl_menuTag ) {
				this.menuUl = e;
				break;
			}
		}
	//passing an instance of this object to window object so the object's function can be called in windows callback function
		window.menuEventHubInstance = this;
			
		this.anchorPositions = this.compileAnchorPositions( anchorList );
		
		this.menuActivator = new MenuActivator();
		
		this.menuActivator.construct( menuHoldingElement.id, anchorList, mmce );
		
		window.onscroll = this.scrollHandler;
		
		return true;		
		
	},
/**
 * An callback function that is called when a registered anchor element is passes the top or bottom of the page
 */
	onanchorpass: function( previousAnchorId, anchorId, scrollDown ) {
		this.menuActivator.activateElement( previousAnchorId, anchorId, scrollDown );
	}
}
// **************************************************** DEFINES, ALIASES: MenuActivator ***************************************************

var MAProto = MenuActivator.prototype = {
	
	menuUl: null,
	
	anchorList: null,
	
	flIdMap: null,
	
	mmce: null,
	
	construct: function( menuHolderId, anchorList, menu_model_construction_engine ) {
		
		if( fl_arrayLike( anchorList ) ) {
			this.anchorList = anchorList;
		}
		
		if( typeof menuHolderId != "string" || !fl_isObj( document ) )
			return;
			
		if( !"getElementById" in document )
			return;
			
		var menu = document.getElementById( menuHolderId );
		
		if( !fl_isObj( menu ) )
			return;
			
		if( !"childNodes" in menu )
			return;
			
		for( var iter in menu.childNodes ) {
			
			if( menu.childNodes[iter].tagName.toLowerCase() == fl_menuTag ) {
				
				this.menuUl = menu.childNodes[iter];
				break;
			}
		}
		
		this.flIdMap = this.getByAttributePresence( this.menuUl, fl_liPositionAttributeName, [] );
		
		if( !"CLASS_NAME" in menu_model_construction_engine )
			return;
			
		if( menu_model_construction_engine.CLASS_NAME == "MenuModelConstructionEngine" )
			this.mmce = menu_model_construction_engine;
		
	},
	
/**
 * A function that returns a siblings list for a given element by its fl-id in order that they occur in the menuHolder
 */
	getSiblingList: function( liId ) {
		
		var siblings = [];
		
		if( typeof liId != "string" )
			return siblings;
			
		//aliasing flIdMap property
		var _li = this.getByFlId( liId );
					
		if( fl_isObj( _li ) && _li != null) {
			
			if( "previousSibling" in _li && "nextSibling" in _li ) {
				
				var element = _li;
				
				siblings.push( _li );
				
				while( element.nextSibling != null ) {
					siblings.push( element.nextSibling );
					element = element.nextSibling;
				}
				
				element = _li;
				
				while( element.previousSibling != null ) {
					
					siblings.unshift( element.previousSibling );
					element = element.previousSibling;
				}
				
			}
		}
		
		return siblings;		
	},
	
/**
 * A function to recursively go through dom node and all children nodes and return an array of nodes that all contain the a given attribute
 */	
	getByAttributePresence: function( parentElement, attributeName, attributePresenceMap ) {
		
		if( !fl_isObj( parentElement ) || typeof attributeName != "string" || !fl_arrayLike( attributePresenceMap ) )
			return attributePresenceMap;
			
		for( var i = 0; i < parentElement.childNodes.length; i++ ) {
			
			if( "hasAttribute" in parentElement.childNodes[i] ) {
				
				if( parentElement.childNodes[i].hasAttribute( attributeName ) ) {
				
					attributePresenceMap.push( parentElement.childNodes[i] );
				}
			}
			
			if ( parentElement.childNodes[i].hasChildNodes() ) {
			
				this.getByAttributePresence( parentElement.childNodes[i], attributeName, attributePresenceMap );
			}
		}
		
		return attributePresenceMap;
	},
	
/**
 * A function to return dom element by a certain fl-id value
 */
	getByFlId: function( flId ) {
		
		for( var iter in this.flIdMap ) {
			
			if( this.flIdMap[ iter ].getAttribute( fl_liPositionAttributeName ) == flId ) {
				
				return this.flIdMap[ iter ];
			}
		}
		
		return null;
	},
/**
 * Returns the active state of a given object selected by its fl-id attribute. If no element with fl-id attribute is found, it returns false
 */
	isActive: function( flId ) {
		
		var classes;
		
		if( typeof flId != "string"  )
			return false;
			
		var element = this.getByFlId( flId );
		
		if( !fl_isObj( element ) || element == null )
			return false;
			
		if( !"className" in element ) 
			return false;
			
		classes = element.className.split( " " );
		
		for( var i in classes ) {
			
			if( classes[i] ==  fl_liActiveClass ) {
				return true;
			}
		}
			
		return false;
		
	},
/**
 * Sets an elements active state( true for active, false for inactive) with the active state class. Element is selected by its fl-id attribute value
 */
	setActive: function( flId, activeStatus) {

		var classes = [];
		
		if( !typeof flId == "string" || typeof activeStatus != "boolean" )
			return false;
			
		var element = this.getByFlId( flId );
		
		if( !fl_isObj( element ) || element == null ) 
			return false;
			
		if( !"className" in element ) 
			return false;
		
		var active = this.isActive( flId );
		 		
		if( active && !activeStatus ) {
			
			classes = element.className.split( " ");
			element.className = "";
			
			for( var j in classes ) {
				
				if ( classes[j] != fl_liActiveClass ) {
					
					element.className=element.className+" "+classes[j];
				}
			}
		}
		else if( !active && activeStatus) {
			element.className = element.className+" "+fl_liActiveClass;
		}
		
		element.className = element.className.trim();
		
		if( activeStatus ) {
			
			this.setParentsActive( flId, activeStatus );
		}
		
		return true;
		
	},
/**
 * Selects an element by its fl-id attribute and sets it and all of its sibling fl-id element's active states
 */
	setSiblingsActive( flId, activeStatus ) {

		if( !typeof flId == "string" || typeof activeStatus != "boolean" )
			return false;
			
		var siblings = this.getSiblingList( flId );
		
		for( var l in siblings ) {
			
			if( "getAttribute" in siblings[ l ] ) {
				this.setActive( siblings[ l ].getAttribute( fl_liPositionAttributeName ),
								activeStatus );
			}
		}
	},
/**
 * A function to activate or deactivate all of an fl-id containing element's parent fl-id containing elements
 */
	setParentsActive: function( flId, activeStatus ) {
		
	//get parent of element
		var parent = this.getParentFlElement( flId );
		
		while ( parent != null ) {
			
			var parentId = parent.getAttribute( fl_liPositionAttributeName );
			
			if( "getAttribute" in parent )
				this.setActive( parentId , activeStatus );
				
			parent = this.getParentFlElement( parentId );
		}
	},
/**
 * checks if two elements have the same parent element structure above them
 */
	hasLikeParents: function( flId1, flId2 ) {
		//get parent of element
		var parent1 = this.getParentFlElement( flId1 ),
			parent2 = this.getParentFlElement( flId2 );
		
		while( parent1 != null && parent2 != null ) {
			
			if( parent1 != parent2 ) {
				return false;	
			}
			
			parent1 = this.getParentFlElement( parent1.getAttribute( fl_liPositionAttributeName ) );
			parent2 = this.getParentFlElement( parent2.getAttribute( fl_liPositionAttributeName ) );
		}
		
		return parent2 == parent1;
	},
	
/**
 * Returns the previous sibling element with the fl-id attribute present or null if it is the first
 */
	getPreviousFlElement: function( flId ) {
		
		if( this.flIdMap == null )
			return null;
			
		var element = this.getByFlId( flId ),
			comparator = function( elem, index, arr ) {
				return elem == element;
			};
		
		var i = this.flIdMap.findIndex( comparator ) - 1;
		
		return i >= 0 ? this.flIdMap[i]: null ;
		
	},
/**
 * Returns the next sibling element with the fl-id attribute present or null if it is the last
 */
 ///////////////////////////////////// NEVER USED /////////////////////////////////////////////////////
	getNextFlElement: function( flId) {
		
		if( this.flIdMap == null )
			return null;
			
		var element = this.getByFlId( flId ),
			comparator = function( elem, index, arr ) {
				return elem == element;
			};
		
		var i = this.flIdMap.findIndex( comparator ) + 1;
		
		return i < this.flIdMap.length ? this.flIdMap[i]: null ;
	},
/**
 * Returns the parent fl-id containing element of element with specified fl-id or null if none can be found
 */
	getParentFlElement: function( flId ) { 
		
		if( this.mmce == null ) 
			return null;
			
		var parent = this.mmce.getParentElement( this.anchorList, flId );
		
		if( !"id" in parent )
			return null;
		
		return this.getByFlId( parent.id );
		
	},
/**
 * Activates an element based on scroll activation
 */
	activateElement: function( previousFlId, flId, downScroll ) {
		
		var prevEl = this.getByFlId( previousFlId );
		
		if( fl_isObj( prevEl ) && prevEl != null ) {
			
			if( "getAttribute" in prevEl ) {
				var id = prevEl.getAttribute( fl_liPositionAttributeName );
				this.setActive( id, false );
			}
		}
		
		var pel = this.getPreviousFlElement( flId ),
			pelId = ( pel != null ? pel.getAttribute( fl_liPositionAttributeName ) : null );
		
		var activeId = downScroll? flId : pelId,
			previousActiveId = downScroll ? pelId : flId ;

		this.setSiblingsActive( activeId, false );
		this.setActive( previousActiveId, false );
		
		if( !this.hasLikeParents( flId, previousActiveId )  ) {
			this.setParentsActive( activeId, true );	
		}
		
		this.setActive( activeId, true );

	}

}
