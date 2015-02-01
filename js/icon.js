'use strict';

(function(exports) {
  // Icon container
  var container = document.getElementById('icons');
  /**
   * Represents a single app icon on the homepage.
   */
  function Icon(app, entryPoint) {
    this.app = app;
    this.entryPoint = entryPoint;
  }

  Icon.prototype = {

    /**
     * Returns the height in pixels of each icon.
     */
    get pixelHeight() {
      return app.zoom.gridItemHeight;
    },

    /**
     * Width in grid units for each icon.
     */
    gridWidth: 1,

    get name() {      
			return this.descriptor.name;
		   },
      
    get icon() {
      if (!this.descriptor.icons) {
        return '';
      }

      var lastIcon = 0;
         if (this.descriptor.name == "Browser") {
            	return this.descriptor.icons['60'];
            }
      for (var i in this.descriptor.icons) {
        if (i > lastIcon) {
          lastIcon = i;
        }
      }
      return this.descriptor.icons[lastIcon];
    },

		get descriptor() {
			if (this.entryPoint) {
				return this.app.manifest.entry_points[this.entryPoint];
			}
			return this.app.manifest;
		},

    get identifier() {
			var identifier = [this.app.origin];

			if (this.entryPoint) {
				identifier.push(this.entryPoint);
			} else {
				identifier.push(0);
			}

			return identifier.join('-');
		},

		/**
		 * Renders the icon and its label to the container.
		 */
    /**
     * Renders the icon to the container.
     * @param {Object} coordinates Grid coordinates to render to.
     * @param {Number} itemIndex The index of the items list of this item.
     */
    render: function(coordinates, itemIndex) {
      var x = coordinates.x * app.zoom.gridItemWidth;
      var y = app.zoom.offsetY;
      // Generate the tile if we need to
      if (!this.tile) {
        var tile = document.createElement('div');
        tile.className = 'icon';
        tile.dataset.identifier = this.identifier;
        if(this.descriptor.name == "Usage")
           tile.style.backgroundImage = "url('icons/costcontrol_64.png')";  
        else if(this.descriptor.name == "Phone")
           tile.style.backgroundImage = "url('icons/dialer_64.png')"; 
        else if(this.descriptor.name == "Contacts")
           tile.style.backgroundImage = "url('icons/contacts_64.png')"; 
        else if(this.descriptor.name == "Settings")
           tile.style.backgroundImage = "url('icons/settings_64.png')";
        else if(this.descriptor.name == "Video")
           tile.style.backgroundImage = "url('icons/video_64.png')"; 
        else if(this.descriptor.name == "Camera")
           tile.style.backgroundImage = "url('icons/camera_64.png')";
        else if(this.descriptor.name == "Clock")
           tile.style.backgroundImage = "url('icons/clock_64.png')";
        else if(this.descriptor.name == "Music")
           tile.style.backgroundImage = "url('icons/music_64.png')"; 
        else if(this.descriptor.name == "Gallery")
           tile.style.backgroundImage = "url('icons/gallery_64.png')"; 
        else if(this.descriptor.name == "Calendar")
           tile.style.backgroundImage = "url('icons/calendar_64.png')"; 
        else if(this.descriptor.name == "Messages")
           tile.style.backgroundImage = "url('icons/sms_64.png')"; 
        else if(this.descriptor.name == "FM Radio")
           tile.style.backgroundImage = "url('icons/fm_64.png')";
        else if(this.descriptor.name == "E-Mail")
           tile.style.backgroundImage = "url('icons/email_64.png')";
        else if(this.descriptor.name == "Marketplace")
           tile.style.backgroundImage = "url('icons/64.png')";
        else if(this.icon.search("http") == 0)   // Check if icon is already containing the address
           tile.style.backgroundImage = 'url(' + this.icon + ')';
        else                                // if no, then src = origin/icon
           tile.style.backgroundImage = 'url(' + this.app.origin + this.icon + ')';
          
     // console.log(this.app.origin + this.icon);
        var removeico = document.createElement('span');
        removeico.className = 'options';
        tile.appendChild(removeico);  
        var nameEl = document.createElement('span');
        nameEl.className = 'title';
        nameEl.textContent = this.name;
          //console.log(this.name);
        tile.appendChild(nameEl);

        this.tile = tile;

        container.appendChild(tile);
      }

      this.itemIndex = itemIndex;
      //console.log(itemIndex);
      this.x = x;
      this.y = y;
      this.scale = app.zoom.percent;

      // Avoid rendering the icon during a drag to prevent jumpiness
      if (this.noRender) {
        return;
      }
      this.transform(x, y, app.zoom.percent); //,this.descriptor.name);
    },


    /**
     * Positions and scales an icon.
     */
    transform: function(x, y, scale){ //,name) {
      scale = scale || 1;
     /* var value = "";
      asyncStorage.getItem('appOrder', function(value){
        if(value == "1") 
         {
           asyncStorage.getItem('name', function(myElement){
           this.tile.style.transform = 
           'translate(' + myElement.xp + 'px,' + myElement.yp + 'px) scale(' + scale + ')'; 
             });
          }
		  else
        {*/
           this.tile.style.transform = 
             'translate(' + x + 'px,' + y + 'px) scale(' + scale + ')';
         /*  asyncStorage.setItem(name+'x',x, function() {
     console.log('new value stored');
   });
           asyncStorage.setItem(name+'y',y);
        }
          });*/
        },

    /**
     * Launches the application for this icon.
     */
    launch: function() {
        console.log(this.entrypoint);
      if (this.entryPoint) {
        this.app.launch(this.entryPoint);
      } else {
        this.app.launch();
      }
    }
  };

  exports.Icon = Icon;

}(window));
