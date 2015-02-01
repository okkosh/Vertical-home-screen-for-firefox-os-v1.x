'use strict';
/* global Divider */
/* global DragDrop */
/* global Icon */
/* global Zoom */
(function(exports) {

  // For now we inject a divider every few icons for testing.
    var totalDividers = 0;
    var currentIco = 0;
    var ORDER = ["Phone","Contacts","Messages","E-Mail","-Divider-","Camera","Browser","Gallery","-Divider-","Music","Video","Settings","Marketplace","Clock","Calendar","FM-Radio","Usage","-Divider-"];
  // Hidden manifest roles that we do not show
    const HIDDEN_ROLES = ['system', 'keyboard', 'homescreen', 'search'];

  
  function App() {
    console.log('In App()');
    this.zoom = new Zoom();
    this.dragdrop = new DragDrop();
    var container = document.getElementById('icons');
    container.addEventListener('click', this.clickIcon.bind(this));
     
    var searchbox = document.getElementById('search');
    searchbox.onkeypress= OnSubmit;
    searchbox.onclick=focusSearchInput;     // Clicking the search area should focus the search field
    
    var doneButton = document.getElementById('exit-edit-mode');
    doneButton.addEventListener('click', this.arrangeStopped.bind(this));
    
    var searchproper = document.getElementById('search-input');
    searchproper.onfocus=hideEverything; 
    searchproper.onblur=showEverything;
    
    window.addEventListener('contextmenu', this.changeBg.bind(this));
  }
    
    
  App.prototype = {

    /**
     * List of all application icons.
     * Maps an icon identifier to an icon object.
     */
    icons: {},
     
    /**
     * Lists of all displayed objects in the homescreen.
     * Includes app icons, dividers, and bookmarks.
     */
    items: [],
    
    /**
     * Fetch all icons and render them.
     */
    init: function() {
      var apMgr = navigator.mozApps.mgmt;
      
      // Adding New Components To the Screen (On Installation of new apps)
      
      apMgr.oninstall = function(event) {
         apMgr.getAll().onsuccess = function(event) {
             event.target.result.forEach(this.makeIcons.bind(this));
             window.location.reload(false);
            }.bind(this);
      }.bind(this);
      
      // Removing Components from the Screen (On Uninstall of any app)
      
     apMgr.onuninstall = function(event) {
       apMgr.getAll().onsuccess = function(event) {
          event.target.result.forEach(this.makeIcons.bind(this));
          window.location.reload(false);
          }.bind(this);
      }.bind(this);

      apMgr.getAll().onsuccess = function(event) {
         event.target.result.forEach(this.makeIcons.bind(this));
         this.render();
       }.bind(this);
     },

    /**
     * Return Search Results. Yet to come     */  
    adaptiveSearch: function(){
      
    },
      
   /**
     * Creates icons for an app based on hidden roles and entry points.
     */
    makeIcons: function(app) {
      if (HIDDEN_ROLES.indexOf(app.manifest.role) !== -1) {
        return;
      }

      function eachIcon(icon) {
        // If there is no icon entry, do not push it onto items.
        if (!icon.icon) {
          return;
        }
        
          this.items.push(icon);
         
        this.icons[icon.identifier] = icon;

      }
     
      if (app.manifest.entry_points) {
        for (var i in app.manifest.entry_points){
          eachIcon.call(this, new Icon(app, i)); // Set the icon
          if(ORDER[currentIco]==='-Divider-'){  // Check if ORDER states that there should be a Divider in Here
            totalDividers++; // Increase the no. of dividers
             this.items.splice(currentIco,0,new Divider()); //Insert the divider
          }
            currentIco++;
        }
      } else {  // if app is not included in manifest entry point 
        eachIcon.call(this, new Icon(app));
           if(ORDER[currentIco]==='-Divider-'){ // Same as Above
             totalDividers++;
             this.items.splice(currentIco,0,new Divider());
          }
        currentIco++;
      }
      
       var totalItems = currentIco+totalDividers-1; // Total no of items including dividers
      
      // This Algorithm can be improved Using some good sorting amd swapping Algorithm
      if(totalItems == (ORDER.length)){  // if this is the last entry (of ORDER Array)
        for(var k=0;k<ORDER.length;k++){  
          if((ORDER[k]!='-Divider-') && (ORDER[k]!==undefined)){ //Ignore Divider order (Because they are already sorted above while splicing)
             for(var l=0;l<this.items.length;l++){ 
               if(ORDER[k]==this.items[l].name){ // Check if any entry between ORDER and items Matches 
                  swap(l,k,this.items); // Swap on Match
              }
            }  
          }
        }
      }
      
       function swap(a,b,itemToSwap){
        itemToSwap[a] = itemToSwap.splice(b, 1, itemToSwap[a])[0];
      }
    },
   
    /**
     * Scrubs the list of items, removing empty sections.
     */
    cleanItems: function() {
      var appCount = 0;
      var toRemove = [];
     
      this.items.forEach(function(item, idx) {
        if (item instanceof Divider) {
          if (appCount === 0) {
            toRemove.push(idx);
          }
          appCount = 0;
        } else {
          appCount++;
        }
      }, this);

      toRemove.reverse();
      toRemove.forEach(function(idx) {
        var removed = this.items.splice(idx, 1)[0];
        removed.remove();
      }, this);

      // There should always be a divider at the end, it's hidden in CSS when 
      // not in edit mode.
      var lastItem = this.items[this.items.length - 1];
      if (!(lastItem instanceof Divider)) {
        this.items.push(new Divider());
      }
    },

    /**
     * Renders all icons.
     * Positions app icons and dividers accoriding to available space
     * on the grid.
     */
    render: function() {
      
      app.cleanItems();
      // Reset offset steps
      this.zoom.offsetY = 0;

      // Grid render coordinates
      var x = 0;
      var y = 0;

      /**
       * Steps the y-axis.
       * @param {Object} item
       */
      function step(item) {
        app.zoom.stepYAxis(item.pixelHeight);
        x = 0;
        y++;
      }
     
      this.items.forEach(function(item, idx) {

        // If the item would go over the boundary before rendering,
        // step the y-axis.
        if (x > 0 && item.gridWidth > 1 &&
            x + item.gridWidth >= this.zoom.perRow) {
          // Step the y-axis by the size of the last row.
          // For now we just check the height of the last item.
          var lastItem = this.items[idx - 1];
          step(lastItem);
        }
        item.render({
          x: x,
          y: y
        }, idx);
     
        // Increment the x-step by the sizing of the item.
        // If we go over the current boundary, reset it, and step the y-axis.
        x += item.gridWidth;
        if (x >= this.zoom.perRow) {
          step(item);
        }
      }, this);
    },
      
    /**
     * Changes Wallpaper.
     */
    
    changeBg: function(e) {
       
      if (this.canceled || document.getElementById('curtain').getAttribute('isopen') == 'true')
         return;
      e.preventDefault();
      var container = e.target;
      var identifier = container.dataset.identifier;
      var icon = this.icons[identifier];
      
      // if user holds the icon not background then return
      if (icon) {
        return;
      }
      
      // Else Start a Pick Activity
        var activity = new MozActivity({
          name: 'pick',
          data: {
            type: ['wallpaper', 'image/*'],
            width: Math.ceil(window.screen.width * window.devicePixelRatio),
            height: Math.ceil(window.screen.height * window.devicePixelRatio)
          }
        });

        activity.onsuccess = function onWallpaperSuccess() {
          var blob = activity.result.blob;
          if (!blob) {
            return;
          } 
            var url = URL.createObjectURL(blob);
        console.log("wallpaper", url);
        document.body.style.backgroundImage = "url(" + url + ")";
            navigator.mozSettings.createLock().set({
              'wallpaper.image': blob
            });
          window.location.reload(false);
        };

        activity.onerror = function onWallpaperError() {
          console.warn('pick failed!');
        };
    },
    
    arrangeStopped: function(){
      
       var removeIcon = document.getElementsByClassName('icon'); //User Finalized his/her Settings
       for (var k = 0; k < removeIcon.length; k++) {
              removeIcon[k].setAttribute('removeable','false');
             }
         document.getElementById('curtain').setAttribute('isopen','false');
         document.getElementById('search').style.visibility = 'visible';
         
      var myStringArray = [];  //  Create an Empty Array for saving Current Items
         for(var dbIndex in this.items) 
              {
               if(this.items[dbIndex].name == undefined)
                 myStringArray.push("-Divider-");  
                else
                 myStringArray.push(this.items[dbIndex].name);
              }
          asyncStorage.setItem('MyHomScn',myStringArray);  // IMPORTANT --> Saving the User Data/ Icon Positioning into IndexedDB
    },
    
    /**
     * Launches an app.
     */
    clickIcon: function(e) {
        
      var container = e.target;
      var identifier = container.dataset.identifier;
      var icon = this.icons[identifier];

      if (!icon ||  document.getElementById('curtain').getAttribute('isopen') == 'true') {
        return;
      }
      icon.launch();
    }
    
    
  };

    // Submitting Edit Box Fields  
    function OnSubmit(e){
    if (e.keyCode == 13) {
        searchRelevant();
        return false;
       }
     }

    
    function searchRelevant(){
        // Hide Keyboard By clicking in Vague Space
       document.getElementById("vaguesapce").click();
      
      var searchQuery = document.getElementById("search-input").value;
      // If Refresh Required During any Bug Event then, just type r:m in search
        if(searchQuery == "r:m"){
          window.location.reload(false);
        }else if(searchQuery.search("http")==0){       // if User Query contains http at front => A link
          window.open(searchQuery);            
        }else if(searchQuery.search("www.")==0){        // Else Append http if string is www 
          window.open("http://"+searchQuery);  
        }else // Just search what user types onto Duckduckgo
            window.open("https://duckduckgo.com/?q="+(searchQuery.replace(/ /g,"+")), '_blank');
              document.getElementById("search-input").value="";
      
      }
  
    function focusSearchInput(){
     document.getElementById('search-input').focus();
   }
  
         // Hides icons During User Search for unintentional launch prevention
    function hideEverything(){
     document.getElementById('icons').style.visibility = 'hidden';
    }  
  
          // Shows them back on Search complete or cancel 
    function showEverything(){
     document.getElementById('icons').style.visibility = 'visible';
    }



  console.log("Waiting for DB....");
  asyncStorage.getItem('MyHomScn',function(value){
   if(value == null){
     ready();
     console.log('Loading Default Configurations...');
   }else{
      while(ORDER.length) {
         ORDER.pop();
      }
     for( var orderIndex in value){
          ORDER.push(value[orderIndex]);
                                           //console.log(value[orderIndex]);
        }
     console.log('Loading Previously Saved Configurations...');
     ready();
   }       
 });
  
  function ready(){
    exports.app = new App();
    exports.app.init();
  }
  
}(window));