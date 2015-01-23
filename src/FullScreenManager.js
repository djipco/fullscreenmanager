(function (scope) {

    'use strict';

    /**
     * #### Overview ####
     *
     * The `FullScreenManager` object offers a unified API for working with the
     * experimental "fullscreen" mode of various modern browsers. It allows the user to
     * view an element or the whole document in full screen without any visible UI
     * elements.
     *
     * The W3C abandoned work on its "Fullscreen API" in 2014 but the WHATWG still
     * maintains a living standard at https://fullscreen.spec.whatwg.org/
     *
     * #### Compatibility ####
     *
     * The `FullScreenManager` library should work in Chrome 15+, Safari 5.1+, Opera 12.1+,
     * Internet Explorer 11+ and Firefox 10+. It can also be manually enabled in Firefox 9
     * by setting `fullscreen-api.enabled` to `true` in `about:config`.
     *
     * #### Usage ####
     *
     * Full screen mode can only be triggered from within an event listener tied to a user
     * interaction. In other words, it can only be activated as a result of a mouse or
     * keyboard event.
     *
     * For example, this code will listen for a click anywhere on the document and toggle
     * full screen mode for the whole page:
     *
     *     document.documentElement.onclick = function() {
     *         FullScreenManager.toggle();
     *     }
     *
     * You can also specify which element should be made full screen. To do that, you
     * simply pass the element or its id to the `FullScreenManager.request()` or
     * `FullScreenManager.toggle()` method:
     *
     *     FullScreenManager.request(document.getElementById("myElement"));
     *
     * You can also listen for events. For instance, if you wanted to do something after
     * full screen mode was engaged, you could do that:
     *
     *     FullScreenManager.on('activation', onActivated);
     *
     *     function onActivated(e) {
     *         console.log("We are now in full screen mode!");
     *     }
     *
     * #### Caveat ####
     *
     * By design, navigating to another page, changing tabs, reloading the page, or
     * switching to another application will exit full screen mode.
     *
     * To enter fullscreen mode from *within* an `iframe`, you need to add some attributes
     * on the `iframe tag`.
     *
     *     <iframe src="x.html" webkitAllowFullScreen mozAllowFullScreen allowFullScreen></iframe>
     *
     * @class FullScreenManager
     * @static
     *
     * @version @@version
     * @author @@author
     *
     * @todo Test on mobile (Chrome et Firefox devraient être supportés)
     * @todo Test hosted vs local
     * @todo Make sure that everything works as it should when the user uses F11 and ESC to enter and leave full screen mode
     * @todo Normalize scrollbar behaviour
     * @todo For unsupported browsers, fall back to a fullscreen window with minimal chrome ?
     * @todo In Firefox and IE (on Windows only), the browser changes the background-color
     * of an element to black if this element is not the root and does not already have an
     * assigned background-color. We should assign
     * @todo listen for key combos to trigger fullscreen ?
     * @todo make it jquery-compatible
     *
     *
     * the following rule changes the background color of the element if it's not the root element:
     *
     * :-moz-full-screen:not(:root)
     *
     *
     *

  *|*:not(:root):-moz-full-screen {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      right: 0 !important;
      bottom: 0 !important;
      z-index: 2147483647 !important;
      background: black;
      width: 100% !important;
      height: 100% !important;
      margin: 0 !important;
      min-width: 0 !important;
      max-width: none !important;
      min-height: 0 !important;
      max-height: none !important;
      box-sizing: border-box !important;
  }

     // If there is a full-screen element that is not the root then
     //we should hide the viewport scrollbar. We exclude the chrome
     //document to prevent reframing of contained plugins.
    :not(xul|*):root:-moz-full-screen-ancestor {
        overflow: hidden !important;
    }



     *
     * One other thing to note is that these "full screen" commands don't have a vertical
     * scrollbar, you need to specify this within the CSS:

     :fullscreen
     :-ms-fullscreen,
     :-webkit-full-screen,
     :-moz-full-screen {
            overflow: auto !important;
        }




     It's not guaranteed that you'll be able to switch into fullscreen mode. For example,
     <iframe> elements have the mozallowfullscreen attribute (webkitallowfullscreen, etc)
     in order to opt-in to allowing their content to be displayed in fullscreen mode. In
     addition, certain kinds of content, such as windowed plug-ins, cannot be presented in
     fullscreen mode. Attempting to put an element which can't be displayed in fullscreen
     mode (or the parent or descendant of such an element) won't work. Instead, the element
     which requested fullscreen will receive a mozfullscreenerror event. When a fullscreen
     request fails, Firefox will log an error message to the Web Console explaining why
     the request failed. In Chrome and newer versions of Opera however, no such warning
     is generated.


     :-webkit-full-screen {}
     :-moz-full-screen {}
     :-ms-fullscreen {}
     :full-screen { } //pre-spec
     :fullscreen { } // spec

    :-webkit-full-screen video {
        width: 100%;
        height: 100%;
    }

    ::backdrop {}
    ::-ms-backdrop {}



     **/


    /**
     * Event triggered once fullscreen mode has been fully activated. You can watch
     * this event by using the `FullScreenManager.addEventListener()` method.
     *
     * @event activation
     * @param event {Object}
     * @param event.type {String} The type of event that occurred.
     * @param event.target {Element} The target element that triggered the event,
     * @param event.data {Object} The actual custom data that was specified when
     * attaching the listener.
     * @final
     */

    /**
     * Event triggered once fullscreen mode has been fully deactivated. You can
     * watch this event by using the `FullScreenManager.addEventListener()`
     * method.
     *
     * @event deactivation
     * @param event {Object}
     * @param event.type {String} The type of event that occurred.
     * @param event.target {Element} The target element that triggered the event,
     * @param event.data {Object} The actual custom data that was specified when
     * attaching the listener.
     * @final
     */

    /**
     * Event triggered when an error occurs. You can watch this event by using the
     * `FullScreenManager.addEventListener()` method.
     *
     * @event error
     * @param event {Object}
     * @param event.type {String} The type of event that occurred.
     * @param event.target {Element} The target element that triggered the event,
     * @param event.error {Object} The actual error.
     * @param event.data {Object} The actual custom data that was specified when
     * attaching the listener.
     * @final
     */

    function FullScreenManager() {

        Object.defineProperties(this, {

            // CSS class to assign to fullscreen element
            _cssClass: {
                enumerable: false,
                writable: true,
                value: 'fullscreen'
            },

            // Fullscreen element
            _element: {
                enumerable: false,
                writable: true,
                value: null
            },

            // Available event handlers
            _handlers : {
                enumerable: false,
                value: {
                    'activation': [],
                    'deactivation': [],
                    'error': []
                }
            },

            // Values reflecting the state of the element before it was modified by the
            // FullScreenManager
            _savedState : {
                enumerable: false,
                value: {
                    'height': '',
                    'width': '',
                    'display': '',
                    '-webkit-margin-before': 0,
                    '-webkit-margin-after': 0
                }
            },

            // Mapping of the W3C function an event names to browser-specific ones. This
            // map will be reduced to only the working ones after detection.
            _apiMap: {
                enumerable: false,
                value: {
                    'requestFullscreen': [
                        'requestFullscreen',          // 1. W3C
                        'webkitRequestFullscreen',    // 2. WebKit (Chrome, Firefox and Opera ?!)
                        'mozRequestFullScreen',       // 3. Mozilla (Firefox)
                        'msRequestFullscreen',        // 4. Internet Explorer
                        'oRequestFullScreen',         // 5. Opera ?!
                        'webkitRequestFullScreen'     // 6. Safari 5.1x exception
                    ],
                    'exitFullscreen': [
                        'exitFullscreen',
                        'webkitExitFullscreen',
                        'mozCancelFullScreen',
                        'msExitFullscreen',
                        'oExitFullscreen',
                        'webkitCancelFullScreen'
                    ],
                    'fullscreenElement': [
                        'fullscreenElement',
                        'webkitFullscreenElement',
                        'mozFullScreenElement',
                        'msFullscreenElement',
                        'oFullscreenElement',
                        'webkitCurrentFullScreenElement'
                    ],
                    'fullscreenEnabled': [
                        'fullscreenEnabled',
                        'webkitFullscreenEnabled',
                        'mozFullScreenEnabled',
                        'msFullscreenEnabled',
                        'oFullscreenEnabled',
                        'webkitCancelFullScreen'        // ???
                    ],
                    'fullscreenchange': [
                        'fullscreenchange',
                        'webkitfullscreenchange',
                        'mozfullscreenchange',
                        'MSFullscreenChange',
                        'oFullscreenChange',
                        'webkitfullscreenchange'
                    ],
                    'fullscreenerror': [
                        'fullscreenerror',
                        'webkitfullscreenerror',
                        'mozfullscreenerror',
                        'MSFullscreenError',
                        'oFullscreenError',
                        'webkitfullscreenerror'
                    ]
                }
            },

            /**
             * [read-only] Indicates whether full screen mode is currently activated or
             * not.
             *
             * @property active
             * @default false
             * @type Boolean
             **/
            active: {
                enumerable: true,
                get: function () {
                    //return (document[fs._apiMap.fullscreenElement] !== null);
                    return (this._element !== null);
                }
            },

            /**
             * [read-only] Indicates whether full screen mode is available in the current
             * environment or not. Typically, full screen mode is available only for a
             * page that has no windowed plugins, and if all `<iframe>` elements which
             * contain the document have their `allowfullscreen` attribute set.
             *
             * @property available
             * @type Boolean
             */
            available: {
                enumerable: true,
                get: function () {
                    return document[this._apiMap.fullscreenEnabled];
                }
            },

            /**
             * The CSS class that is applied to the fullscreen element. If this property
             * is changed while in fullscreen mode, the fullscreen element will have its
             * class changed.
             *
             * @property cssClass
             * @default fullscreen
             * @type String
             */
            cssClass: {
                enumerable: true,
                get: function () {
                    return this._cssClass;
                },
                set: function(value) {
                    if (this.active) {
                        this.element.classList.remove(this._cssClass);
                        this.element.classList.add(value);
                    }
                    this._cssClass = value;
                }
            },

            /**
             * Controls whether the `FullScreenManager` will alter the CSS to include a
             * class on the fullscreen element and modify its CSS properties to normalize
             * behaviour between different browsers.
             *
             * @property doNotAlterCss
             * @default false
             * @type Boolean
             */
            doNotAlterCss: {
                enumerable: true,
                writable: true,
                value: false
            },

            /**
             * [read-only] The `Element` that is currently being shown full screen. If no
             * element is currently full screen, this property will be null.
             *
             * @property element
             * @default null
             * @type Element
             */
            element: {
                enumerable: true,
                get: function () {
                    //return document[fs._apiMap.fullscreenElement];
                    return this._element;
                }
            },

            /**
             * [read-only] Indicates whether the keyboard can be used for input while in
             * fullscreen. This is useful because not all platforms/versions support this.
             *
             * @property keyboardInputAllowed
             * @type Boolean
             */
            keyboardInputAllowed: {
                enumerable: true,
                get: function() {
                    return (
                    typeof Element !== 'undefined' && 'ALLOW_KEYBOARD_INPUT' in Element
                    );
                }
            },

            /**
             * [read-only] Version of the `FullScreenManager` class.
             *
             * @property version
             * @type {String}
             * @static
             */
            version: {
                enumerable: false,
                get: function() {
                    return '@@version';
                }
            }

        });

        // Reduce _apiMap to only keep properties available on the current platform
        function _selectBrowserApi(index) {
            Object.keys(that._apiMap).forEach(function(key) {
                that._apiMap[key] = that._apiMap[key][index];
            });
        }

        function _onDocumentChange() {

            // If _element is null then we just switched to full screen and must save the
            // element. Otherwise, we are getting out of full screen
            if (that._element === null) {

                that._element = document[that._apiMap.fullscreenElement];
                that.element.classList.add(that.cssClass);

                if (!that.doNotAlterCss) {


                    // WE PROBABLY SHOULD DO THAT WITH A STYLE SHEET INJECTION: http://davidwalsh.name/add-rules-stylesheets

                    // Save original state for later
                    that._savedState.height = that._element.style.height;
                    that._savedState.width = that._element.style.width;
                    that._savedState.display = that._element.style.display;
                    that._savedState['-webkit-margin-before'] = that._element.style['-webkit-margin-before'];
                    that._savedState['-webkit-margin-after'] = that._element.style['-webkit-margin-after'];

                    // Make sure elements stretches to fit
                    that._element.style.height = "100%";
                    that._element.style.width = "100%";
                    that._element.style.display = "block";

                    // Remove annoying margin added by Webkit
                    that._element.style['-webkit-margin-before'] = 0;
                    that._element.style['-webkit-margin-after'] = 0;

                    // Normalize the background color of elements that do not have a
                    // declared background-color (for IE and Firefox on Windows)
                    //if (that._element.style['background-color'])
                    //console.log('coucou' + that._element.style['background-color']);
                    console.log('coucou' + getComputedStyle(that._element)['background-color']);

                }

            } else {

                if (!that.doNotAlterCss) {

                    // Return element to original state
                    that._element.style.height = that._savedState.height;
                    that._element.style.width = that._savedState.width;
                    that._element.style.display = that._savedState.display;

                    // Reset saved state object
                    that._savedState.height = '';
                    that._savedState.width = '';
                    that._savedState.display = '';
                    that._element.style['-webkit-margin-before'] = that._savedState['-webkit-margin-before'];
                    that._element.style['-webkit-margin-after'] = that._savedState['-webkit-margin-after'];

                }

                that.element.classList.remove(that.cssClass);
                that._element = null;

            }

            var state = that.active ? that.ACTIVATION : that.DEACTIVATION;

            // Execute user-defined handlers (if any)
            if (that._handlers[state] && that._handlers[state].length > 0) {

                for (var i = 0; i < that._handlers[state].length; i++) {
                    var h = that._handlers[state][i];
                    h.listener({
                        "type": state,
                        'target': that,
                        "data": h.data
                    });
                }

            }

        }

        function _onDocumentError(e) {

            for (var i = 0; i < that._handlers.error.length; i++) {
                var h = that._handlers.error[i];
                h.listener({
                    "type": that.ERROR,
                    'target': that,
                    "error": e,
                    "data": h.data
                });
            }

        }

        /*

         If you exit full screen mode after entering it programmatically, the fullscreenchange
         event will be fired.

         However, if you enter fullscreen mode through F11 (or the equivalents), the
         fullscreenchange event is not fired nor will it be when exiting with ESC.

         This is why we use the resize event to mimick what's happening when the user chooses to
         go fullscreen by pressing F11

         * F11 and fullscreen api are not the same
         * https://bugzilla.mozilla.org/show_bug.cgi?id=794468
         *
         * Issues:
         1: You can't cancel fullscreen mode programmaticaly if it has been toggled on with F11
         2: When triggered with F11 no event is fired and CSS ':-moz-full-screen' is not supported.
         3: You can toggle fullscreen mode with the JS API when F11 fullscreen is already on. This leads to confusion for developers as well as for users.
         4: To cancel fullscreen mode with their keyboard, users need to press either ESC or F11 depending on how they enabled fullscreen mode. This is confusing.
         5: Lets say you are creating a game and would like to offer fullscreen mode to your players. As far as i am aware, you cannot keep track of whether the fullscreen mode is enabled or not since F11 fullscreen doesn't trigger events. So for instance you can not reliably change the visual aspect of your fullscreen button accordingly (like with a 'toggle on' icon and a 'toggle off' icon).

         */
        function _onResize(e) {

            ////console.log(fs.element);
            //
            //if (window.innerHeight === screen.height && window.innerWidth === screen.width) {
            //    //fs.element.classList.add(fs.cssClass);
            //    console.log("FULL");
            //    //fs.activate();
            //} else {
            //    console.log("NOT");
            //    //fs.deactivate();
            //    //fs.element.classList.remove(fs.cssClass);
            //}

        }

        function _initialize() {


            // SEE http://www.useragentstring.com/

            // Check if we are stuck with Safari 5.1 which behaves differently from other
            // browsers in some regards. Otherwise, pick the first one that matches.
            //if ( /5\.1[\.\d]* Safari/.test(navigator.userAgent) ) {
            //
            //    // THIS DOES NOT WORK !!! CHROME HAS BOTH SAFARI AND CHROME IN USER-AGETN STRING:
            //    // Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/38.0.2125.122 Safari/537.36
            //    _selectBrowserApi(5);
            //    console.log(navigator.userAgent)
            //} else {

            for (var i = 0; i < that._apiMap.requestFullscreen.length; i++) {

                if ( document.documentElement[that._apiMap.requestFullscreen[i]] ) {
                    _selectBrowserApi(i);
                    break;
                }

            }

            // If _apiMap.requestFullscreen is still an array, this means that we couldn't
            // find a suitable match.
            if (
                typeof that._apiMap.requestFullscreen === 'string' ||
                that._apiMap.requestFullscreen instanceof String
            ) {
                document.addEventListener(that._apiMap.fullscreenchange, _onDocumentChange);
                document.addEventListener(that._apiMap.fullscreenerror, _onDocumentError);
                window.addEventListener('resize', _onResize);
            } else {
                throw "The FullScreenManager library is not supported on this browser.";
            }


        }

        // Initialize the object. 'that' will be used inside private methods so they can
        // gain access to the 'this' context
        var that = this;
        _initialize();

    }

    /**
     * Tries to activate full screen mode for the specified element. If no element is
     * specified or the specified element is not found, the whole document will be used
     * instead. The function accepts an actual `Element` or an element id.
     *
     * If full screen mode cannot be activated, `false` will be returned.
     *
     * @method activate
     * @static
     * @chainable
     * @param [element] {Element|String}  The id of the element or the actual `Element` to
     * make fullscreen.
     * @param [options] {Object} An object holding options to pass to `FullScreenManager`
     * @param [options.cssClass=fullscreen] {String} The CSS Class to add to a fullscreen
     * element
     * @param [options.scaleMode=???] {String} The scaling mode to use
     * @return {FullScreenManager|null} The FullScreen object (to allow chaining)
     */
    FullScreenManager.prototype.activate = function(element, options) {

        if (!this.available) return null;

        // If element is a string, find the element with the matching id. If empty or
        // invalid, use the whole document.
        if (
            (typeof element === 'string' || element instanceof String) &&
            document.getElementById(element)
        ) {
            element = document.getElementById(element);
        } else if ( !(element instanceof Element) ) {
            element = document.documentElement;
        }

        //element.style.width = "100%";
        //element.style.height = "100%";

        // Execute request and allow (if appropriate) fullscreen keyboard interaction. In
        // Safari 5.1, we cannot use the keyboard. We cannot even pass that parameter (it
        // triggers an error if we do).
        if (/5\.1[\.\d]* Safari/.test(navigator.userAgent)) {

            element[this._apiMap.requestFullscreen]();

        } else {

            element[this._apiMap.requestFullscreen](
                this.keyboardInputAllowed &&
                typeof Element !== 'undefined' &&
                'ALLOW_KEYBOARD_INPUT' in Element
            );

        }

        return this;

    };

    /**
     * Attaches an event listener function that will be executed when the specified event
     * occurs. The third parameter makes it possible to pass arbitrary data to the event
     * handling function.
     *
     * @method addEventListener
     * @static
     * @chainable
     * @param type {String} A string identifying the event to attach to. Check the
     * "Events" section of the documentation for a list of supported events.
     * @param listener {Function} The function that will be executed when the matching
     * event occurs.
     * @param [data] {Object} Arbitrary data to pass to the listener function when
     * triggered.
     * @return {FullScreenManager} The `FullScreenManager` object (to allow chaining)
     */
    FullScreenManager.prototype.addEventListener = function(type, listener, data) {

        // Sanity check
        //type = (type === 'deactivation') ? 'deactivation' : 'activation';

        // HERE WE NEED TO LOOP IN THE LIST OF VALID EVENTS TO CHECK IF IT MATCHES

        var handler = {
            "listener": listener,
            "data": data
        };
        this._handlers[type].push(handler);

        return this;

    };

    /**
     * Deactivates full screen mode and returns the browser and document to their normal
     * viewing state.
     *
     * @method deactivate
     * @chainable
     * @static
     * @return {FullScreenManager} The `FullScreenManager` object (to allow chaining)
     */
    FullScreenManager.prototype.deactivate = function() {
        //if (!this.available) return;

        // Remove CSS class from fullscreen element [must be done before calling
        // exitFullScreen()]
        //fs.element.classList.remove(fs.cssClass);

        document[this._apiMap.exitFullscreen]();
        return this;
    };

    /**
     * Returns `true` if the specified event listener has been previously attached to the
     * specified event. Returns `false `otherwise. If only the `type` is specified, it
     * returns `true`, if there is at least one listener defined for that `type`. If no
     * parameters are defined, it returns `true` if at least one listener has been defined
     * without regards the which type it was attached to.
     *
     * @method hasEventListener
     * @static
     * @param [type] {String} The event type. Check the "Events" section of the
     * documentation for a list of supported events.
     * @param [listener] {Function} The listener function that was previously attached
     */
    FullScreenManager.prototype.hasEventListener = function(type, listener) {

        if (type && listener) {

            for (var i = 0; i < this._handlers[type].length; i++) {
                if(this._handlers[type][i].listener === listener) {
                    return true;
                }
            }

        } else if (type) {
            return (this._handlers[type].length > 0);
        } else {

            for (var prop in this._handlers) {
                if (this._handlers.hasOwnProperty(prop)) {
                    if (this._handlers[prop].length > 0) return true;
                }
            }

        }

        return false;

    };

    /**
     * Removes a previously set event listener. If no parameters are specified, all
     * listeners will be removed. If only the `type` is specified, all listeners attached
     * to that type will be removed. Finally, if both parameters are specified only a
     * specific listener attached to a specific event type will be removed.
     *
     * @method removeEventListener
     * @chainable
     * @static
     * @param [type] {String} The event type. Check the "Events" section of the
     * documentation for a list of supported events.
     * @param [listener] {Function} The listener function to remove.
     * @return {FullScreenManager} The `FullScreenManager` object (to allow chaining)
     */
    FullScreenManager.prototype.removeEventListener = function(type, listener) {

        if (type && listener) {

            for(var i = this._handlers[type].length - 1; i >= 0; i--) {
                if(this._handlers[type][i].listener === listener) {
                    this._handlers[type].splice(i, 1);
                }
            }

        } else if (type) {

            this._handlers[type] = [];

        } else {

            for (var prop in this._handlers) {
                if (this._handlers.hasOwnProperty(prop)) {
                    this._handlers[prop] = [];
                }
            }

        }

        return this;

    };

    /**
     * Toggles full screen mode on and off for the specified element. If no element is
     * specified, full screen mode is toggled for the whole document.
     *
     * @method toggle
     * @static
     * @chainable
     * @param [element] {Element | String} The id of the element or the actual `Element`
     * to make fullscreen.
     * @return {FullScreenManager} The `FullScreenManager` object (to allow chaining)
     */
    FullScreenManager.prototype.toggle = function(element) {
        return (this.active ? this.deactivate() : this.activate(element));
    };

    // Check if RequireJS/AMD is used. If it is, use it to define our module instead of
    // polluting the global space.
    if ( typeof define === "function" && define.amd ) {
        define([], function () {
            return new FullScreenManager();
        });
    //} else if (typeof module !== 'undefined' && module.exports) {
    //    module.exports = FullScreenManager; // UNTESTED CommonJS/Node.js
    } else {
        if (!scope.FullScreenManager) scope.FullScreenManager = new FullScreenManager();
    }

}(this));