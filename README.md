FullScreenManager
=================

The `FullScreenManager` object offers a unified API for working with the experimental
"fullscreen" mode of various modern browsers. It allows the user to view an element or the
whole document in full screen without any visible UI elements.

The W3C abandoned work on its "Fullscreen API" in 2014 but the WHATWG still maintains a
living standard at https://fullscreen.spec.whatwg.org/

#### Compatibility ####

The `FullScreenManager` library should work in Chrome 15+, Safari 5.1+, Opera 12.1+,
Internet Explorer 11+ and Firefox 10+. It can also be manually enabled in Firefox 9
by setting `fullscreen-api.enabled` to `true` in `about:config`.

#### Usage ####

Full screen mode can only be triggered from within an event listener tied to a user
interaction. In other words, it can only be activated as a result of a mouse or
keyboard event.

For example, this code will listen for a click anywhere on the document and toggle
full screen mode for the whole page:

    document.documentElement.onclick = function() {
        FullScreenManager.toggle();
    }

You can also specify which element should be made full screen. To do that, you
simply pass the element or its id to the `FullScreenManager.request()` or
`FullScreenManager.toggle()` method:

    FullScreenManager.request(document.getElementById("myElement"));

You can also listen for events. For instance, if you wanted to do something after
full screen mode was engaged, you could do that:

    FullScreenManager.on('activation', onActivated);

    function onActivated(e) {
        console.log("We are now in full screen mode!");
    }

#### Caveat ####

By design, navigating to another page, changing tabs, reloading the page, or switching to
another application will exit full screen mode.