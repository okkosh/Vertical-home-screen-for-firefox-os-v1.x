'use strict';
/* global Divider */
/* global DragDrop */
/* global Icon */
/* global Zoom */
(function(exports) {

  // For now we inject a divider every few icons for testing.
  var tempDivideEvery = 10;
  var tempCurrent = 0;
  // FIXME : Default Order in which Icons Should Be Placed (Permanant Saving Required)
  const ORDER = ["Phone","Contacts","Messages","E-Mail","Camera","Browser","Gallery","Music","Video","XYZ","Settings","Marketplace","Clock","Calendar","FM-Radio","Calculator"];
  // "XYZ" for Div
  // Hidden manifest roles that we do not show
  const HIDDEN_ROLES = ['system', 'keyboard', 'homescreen', 'search'];

  function App() {
    this.zoom = new Zoom();
    this.dragdrop = new DragDrop();
    var container = document.getElementById('icons');
    container.addEventListener('click', this.clickIcon.bind(this));
    var searchbox = document.getElementById('search');
    searchbox.onkeypress= OnSubmit;
    var searchproper = document.getElementById('search-input');
    searchproper.onfocus=hideEverything;
    searchproper.onblur=showEverything;
    window.addEventListener('contextmenu', this.change.bind(this));
  }
    function OnSubmit(e){
    if (e.keyCode == 13) {
        searchRelevant();
        return false;
       }
      }
    function searchRelevant(){
        // Hide Keyboard
        document.getElementById("vaguesapce").click();
        if(document.getElementById("search-input").value=="r:m")
        window.location.reload(false);
        else if(document.getElementById("search-input").value.search("http")==0)
        window.open(document.getElementById("search-input").value,'_blank');
        else if(document.getElementById("search-input").value.search("www.")==0)
        window.open("http://"+document.getElementById("search-input").value,'_blank');
        else
        window.open("https://duckduckgo.com/?q="+(document.getElementById("search-input").value.replace(/ /g,"+")),'_blank');
        document.getElementById("search-input").value="";
    }
  
   function hideEverything(){
     document.getElementById('icons').style.visibility = 'hidden';
//     document.getElementById('search').style.height = (document.getElementById('search').offsetHeight + 300) + "px";
   }
  
     function showEverything(){
     document.getElementById('icons').style.visibility = 'visible';
//     document.getElementById('search').style.height = (document.getElementById('search').offsetHeight - 300) + "px";
     
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
      
      // Adding New Components To the Screen (On Installation)
      
      apMgr.oninstall = function(event) {
        apMgr.getAll().onsuccess = function(event) {
        event.target.result.forEach(this.makeIcons.bind(this));
        window.location.reload(false);
      }.bind(this);
      }.bind(this);
      
      // Removing Components from the Screen (On Uninstall)
      
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
     
      
    /**
     * Creates icons for an app based on hidden roles and entry points.
     */
    makeIcons: function(app) {
      if (HIDDEN_ROLES.indexOf(app.manifest.role) !== -1) {
        return;
      }

      function eachIcon(icon) {
        /* jshint validthis:true */

        // If there is no icon entry, do not push it onto items.
        if (!icon.icon) {
          return;
        }

        // FIXME: Remove after we have real divider insertion/remembering.
        tempCurrent++;
        if (tempCurrent >= tempDivideEvery) {
          this.items.push(new Divider());
          tempCurrent = 0;
          tempDivideEvery= 6;
        }
        
        this.items.push(icon);
        this.icons[icon.identifier] = icon;
        var total = this.items.length;
        if(total >= 16)
          {
            for(i=0;i<total;i++){
              if(ORDER.indexOf(this.items[i].name)>=0)
                {
                  swap(i,ORDER.indexOf(this.items[i].name),this.items);
                  //console.log(ORDER.indexOf(this.items[i].name));
                }
                
            }
          }
        
        function swap(a,b,items){
          var temp = items[a];
          items[a] = items[b];
          items[b] = temp;
        }
        
      }

      if (app.manifest.entry_points) {
        for (var i in app.manifest.entry_points) {
          eachIcon.call(this, new Icon(app, i));
        }
      } else {
        eachIcon.call(this, new Icon(app));
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
    
    change: function(e) {
       
      if (this.canceled)
         return;
      e.preventDefault();
      var container = e.target;
      var identifier = container.dataset.identifier;
      var icon = this.icons[identifier];

      if (icon) {
        return;
      }
      
      // Ask for the locked content key first, because if it does not exist
      // we know there is no locked content on the phone and we don't have
      // to show the Locked Content app in the activity request.
        var activity = new MozActivity({
          name: 'pick',
          data: {
            type: ['wallpaper', 'image/*'],
            // XXX: This will not work with Desktop Fx / Simulator.
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
    
    /**
     * Launches an app.
     */
    clickIcon: function(e) {
      var container = e.target;
      var identifier = container.dataset.identifier;
      var icon = this.icons[identifier];

      if (!icon) {
        return;
      }

      icon.launch();
    }
  };

  exports.app = new App();
  exports.app.init();

}(window));