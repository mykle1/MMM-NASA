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
		rotateInterval: 5 * 60 * 1000, // New Image Appears
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
        this.url = this.getNASAUrl();
        this.collection = {};  // collection is from the data path
	//	this.nasa = {};        // nasa because it was "event" from my Events module
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
        var keys = Object.keys(this.collection); 
        if (keys.length > 0) {
            if (this.activeItem >= keys.length) {
                this.activeItem = 0;
            }

           // again, I don't know if I should use nasa or collection
            var collection = this.collection[keys[this.activeItem]];
            var top = document.createElement("div");
            top.classList.add("list-row");

            // Title
            var nasaTitle = document.createElement("div");
            nasaTitle.classList.add("small", "bright");
            nasaTitle.innerHTML = collection.title; // path from data
            wrapper.appendChild(nasaTitle);

            
			// Picture
			var nasaLogo = document.createElement("div");
			var nasaIcon = document.createElement("img");
			nasaIcon.classList.add("list-left", "photo"); 
			nasaIcon.src = collection.links.href;  // path from data
				
			nasaLogo.appendChild(nasaIcon);
			wrapper.appendChild(nasaLogo);	
				
			
		
			// Description of Picture
            var nasaDescription = document.createElement("div");
            nasaDescription.classList.add("xsmall", "bright", "list-title");
            nasaDescription.innerHTML = collection.description_508;
            wrapper.appendChild(nasaDescription);


        }
        return wrapper;
    },

    processNASA: function(data) {
        this.collection = data.collection;
		this.nasa = data.nasa;
        this.links = data.links;
        this.loaded = true;
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

    getNASAUrl: function() {

        var url = null;
        var search = this.config.search;
     //   var today = new Date();				// Removed these. Don't think I need them
     //   var eventsYear = today.getMonth() + 1;
     //   var city = this.config.city.toLowerCase();
     //   var apikey = this.config.apikey;
	//	var eventType = this.config.eventType;
	//	var when = this.config.when;

       // Only this will change in the url as a config option
        if (search != "") {
            url = "https://images-api.nasa.gov/search?q=" + search + "&media_type=image";
        }
		
        return url;
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
