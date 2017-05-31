/* Magic Mirror
 * Module: MMM-NASA
 *
 * By Mykle1
 *
 */
Module.register("MMM-NASA", {

    // Module config defaults.
    defaults: {
        search: "nebula",             // See NASA Search List in ReadMe  
		rotateInterval: 5 * 1000, // New Image Appears
		useHeader: false,
        header: "",
		maxWidth: "195px",             // adjust to your liking 
		animationSpeed: 3000,          // Image fades in and out
        initialLoadDelay: 4250,
        retryDelay: 2500,
		updateInterval: 60 * 60 * 1000, // 60 minutes. No need to change!
		
    },

    getStyles: function() {
        return ["MMM-NASA.css"];
    },

    start: function() {
        Log.info("Starting module: " + this.name);

        requiresVersion: "2.1.0",

        // Set locale.
        this.url = "https://images-api.nasa.gov/search?q=" + this.config.search + "&media_type=image";
        //this.collection = {};  // collection is from the data path
	    this.nasa = {};        // beacause this.nasa=data.items ;)
        this.activeItem = 0;
        this.rotateInterval = null;
        this.scheduleUpdate();
    },

    getDom: function() {

        var wrapper = document.createElement("div");
        wrapper.className = "wrapper";
        wrapper.style.maxWidth = this.config.maxWidth;

        if (!this.loaded) {
            wrapper.innerHTML = "Hello Universe...";
            wrapper.classList.add("bright", "light", "small");
            return wrapper;
        }

        if (this.config.useHeader != false) {
            var header = document.createElement("header");
            header.classList.add("xsmall", "bright");
            header.innerHTML = this.config.header;
            wrapper.appendChild(header);
        }

        // should I use collection or nasa here????  collection from data path
        var keys = Object.keys(this.nasa); 
        if (keys.length > 0) {
            if (this.activeItem >= keys.length) {
                this.activeItem = 0;
            }

           // again, I don't know if I should use nasa or collection
            var nasa = this.nasa[keys[this.activeItem]];
   
            
            for(var i = 0; i < nasa.links.length; i++){ 
			var nasalinks = nasa.links[i];
			
console.log(nasalinks);
console.log(nasa.data[0].description);    
            var top = document.createElement("div");
            top.classList.add("list-row");
            
            var title = document.createElement("div");
           
			title.classList.add("xsmall", "bright");
			title.innerHTML = nasa.data[0].title;
			wrapper.appendChild(title);
			// Picture
			var nasaLogo = document.createElement("div");
			var nasaIcon = document.createElement("img");
			nasaIcon.classList.add("list-left", "photo"); 
			nasaIcon.src = nasalinks.href;  // path from data
				
			nasaLogo.appendChild(nasaIcon);
			wrapper.appendChild(nasaLogo);
			
			var nasaDes = document.createElement("div");
			nasaDes.classList.add("xsmall", "bright");
			nasaDes.innerHTML = this.sTrim(nasa.data[0].description, 125, ' ', ' ...');
			wrapper.appendChild(nasaDes);
				}
        }
        return wrapper;
    },

    processNASA: function(data) {
        //no such thing
		//this.nasa = data.nasa;
       this.nasa=data.items
        this.loaded = true;
    },
    
    sTrim: function (str, length, delim, appendix) {
    if (str.length <= length) return str;
    var trimmedStr = str.substr(0, length+delim.length);
    var lastDelimIndex = trimmedStr.lastIndexOf(delim);
    if (lastDelimIndex >= 0) trimmedStr = trimmedStr.substr(0, lastDelimIndex);
    if (trimmedStr) trimmedStr += appendix;
    return trimmedStr;
    },

    scheduleCarousel: function() {
        console.log("Hailing NASA");
        this.rotateInterval = setInterval(() => {
            this.activeItem++;
            this.updateDom(this.config.animationSpeed);
        }, this.config.rotateInterval);
    },

    scheduleUpdate: function() {
        setInterval(() => {
            this.getNASA();
        }, this.config.updateInterval);
        this.getNASA(this.config.initialLoadDelay);
        var self = this;
    },

    getNASA: function() {
        this.sendSocketNotification('GET_NASA', this.url);
    },

    socketNotificationReceived: function(notification, payload) {
        if (notification === "NASA_RESULT") {
            this.processNASA(payload);
            if (this.rotateInterval == null) {
                this.scheduleCarousel();
            }
            this.updateDom(this.config.animationSpeed);
        }
        this.updateDom(this.config.initialLoadDelay);
    },
});
