MenuFluidicity QUICK START GUIDE
---------------------------------------------------------------------------------------------------------------------
  Menu Fluidiciy is a javaScript that constructs and activates a menu for a single page html document based on anchor 
  tags embedded within the document.
  
Formatting Embedded Anchor Tags
--------------------------------------------------------------------------------------------------------------------
  Embedded anchor tags are placeholder in the document that tell MenuFluidicity where in the document each menu 
  item is associated. In order for the MenuFluidicity's menu construction engine to register an anchor tag as the
  user desired it must have two main elements:
    
  (1) "fl-inline-anchors" class
    
  (2) An id value that specifies the title to be displayed on the constructed menu where all "-" or "_" are replaced 
        by spaces in the final menu element title
        
  If a menu item is a sub-element of another, the embedded anchor tag should be given an fl-parent attribute with a 
  value corresponding to the id of the parent element.
    
example
-------
    <div id="menuHolder"></div>
    ...
    <a id="Title-Of-Menu-Element" class="fl-inline-anchors"></a>
    ...
    <a id="Child-Of-Title-Of-Menu-Element" class="fl-inline-anchors" fl-parent="Title-Of-Menu-Element">
    </a>
    ...
       
  The menu will be rendered as follows:
       
       Title Of Menu Element
            Child Of Title Of Menu Element
           
  The menu is applied rendered and activate by incluiding in the html page fluidNavigation.js and a single 
  line of additional javascript:
  
      <script type='text/javascript' src='path/fluidNavigation.js'></script>
      <script type='text/javascript'>
        (new MenuFluidicity( "menuHolder", null ) ).create();
      </script>
      
  The second argument in MenuFluidicity is for a settings object. The only adjustable settings at this point 
  are the following:
  
  (1) styles.hover - css style for menu anchor tags when the elements are hovered over by mouse
  
  (2) styles.activated - css style for the menu element when it is activated by either clicking on it or scroll to the valid point in the page
  
  (3) styles.deactivated - css style for the menu element when it is not activated
  
  So for example:
  
     var settings = { styles: { activated:"border-right: 1px solid orange; color: grey;" } };
     
     (new MenuFluidicity( "menuHolder", settings ) ).create();
     
  Note how an id ( "menuHolder" ) is provied for a div element. This is the element that will contain the constructed menu. Additionally, 
  the create method of the MenuFluidicity object can take a success and a failure callback:
     
     var failed = function() { console.log( "Menu construction failed" ); },
         worked = function() { console.log( "Menu construction worked" ); };
         
     (new MenuFluidicity( "menuHolder", settings ) ).create( worked, failed );
    
  
  
