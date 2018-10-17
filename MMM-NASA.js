/* Magic Mirror
 * Module: MMM-NASA
 *
 * By Mykle1
 * MIT License
 */
Module.register("MMM-NASA", {

    // Module config defaults.
    defaults: {
        infoLength: 187,
        scroll: "yes", // yes= scrolling info, no = static info
        search: "nebula", // See Search List in ReadMe
        rotateInterval: 5 * 60 * 1000, // New Image Appears
        useHeader: false,
        header: "",
        maxWidth: "195px", // adjust to your liking
        animationSpeed: 3000, // Image fades in and out
        initialLoadDelay: 4250,
        retryDelay: 2500,
        updateInterval: 60 * 60 * 1000, // NASA limitation = 50 calls per day. Do NOT change!

    },

    getStyles: function() {
        return ["MMM-NASA.css"];
    },

    start: function() {
        Log.info("Starting module: " + this.name);

        requiresVersion: "2.1.0",

        // Set locale.
        this.url = "https://images-api.nasa.gov/search?q=" + this.config.search + "&media_type=image";
        this.nasa = {};
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


        var keys = Object.keys(this.nasa);
        if (keys.length > 0) {
            if (this.activeItem >= keys.length) {
                this.activeItem = 0;
            }
            var nasa = this.nasa[keys[this.activeItem]];


            for (var i = 0; i < nasa.links.length; i++) {
                var nasalinks = nasa.links[i];


                var top = document.createElement("div");
                top.classList.add("list-row");


                var title = document.createElement("div");
                title.classList.add("small", "bright");
                title.innerHTML = nasa.data[0].title;
                wrapper.appendChild(title);


                var nasaLogo = document.createElement("div");
                var nasaIcon = document.createElement("img");
                nasaIcon.classList.add("photo");
                nasaIcon.src = nasalinks.href;
                nasaLogo.appendChild(nasaIcon);
                wrapper.appendChild(nasaLogo);

                // scrolling or static information
              if (this.config.scroll == "no"){
                  var nasaDes = document.createElement("div");
                  nasaDes.classList.add("xsmall", "bright");
                  nasaDes.innerHTML = this.sTrim(nasa.data[0].description, + this.config.infoLength, ' ', ' ...');
                  wrapper.appendChild(nasaDes);
       } else if (this.config.scroll == "yes"){
                  var nasaDes = document.createElement("div");
                  nasaDes.classList.add("small", "bright");
                  nasaDes.innerHTML = '<marquee behavior="scroll" direction ="left" scrollamount="3">' + this.sTrim(nasa.data[0].description, + this.config.infoLength, ' ', ' ...') + '</marquee>';
                  wrapper.appendChild(nasaDes);
                }
            }
        }
        return wrapper;
    },

	notificationReceived: function(notification, payload) {
        if (notification === 'HIDE_NASA') {
            this.hide();
        }  else if (notification === 'SHOW_NASA') {
            this.show(1000);
        }

    },

    processNASA: function(data) {
        this.nasa = data.items
        this.loaded = true;
    },

    sTrim: function(str, length, delim, appendix) {
        if (str.length <= length) return str;
        var trimmedStr = str.substr(0, length + delim.length);
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
