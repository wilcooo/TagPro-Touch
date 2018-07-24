// ==UserScript==
// @name         TagPro Touch
// @version      0.1
// @description  Move your ball using a touchscreen.
// @author       Ko
// @include      http://tagpro-*.koalabeast.com:*
// @grant        none
// ==/UserScript==



/* global tagpro, $ */

tagpro.ready(function(){
    var initKeyComm = function () {    // DO NOT CHANGE THIS FUNCTION, AS IT CAN BREAK OTHER TP SCRIPTS
        if (tagpro.KeyComm) return;
        else tagpro.KeyComm = true;

        tagpro.KeyComm = {
            sentDir: {},
            pressedDir: {},
            keyCount: 1,
        };

        var tse = tagpro.socket.emit;

        tagpro.socket.emit = function(event, args) {
            if (event === 'keydown') {
                tagpro.KeyComm.sentDir[args.k] = true;
                args.t = tagpro.KeyComm.keyCount++;
            }
            if (event === 'keyup') {
                tagpro.KeyComm.sentDir[args.k] = false;
                args.t = tagpro.KeyComm.keyCount++;
            }
            tse(event, args);
        };




        tagpro.KeyComm.stop = function() {

            var keys = ['up','down','left','right'];

            for (var k in keys) {
                if (!tagpro.KeyComm.pressedDir[keys[k]] && tagpro.KeyComm.sentDir[keys[k]])
                    tagpro.socket.emit('keyup', {k: keys[k]} );
            }
        };


        tagpro.KeyComm.send = function(keys,short) {

            for (var k in keys) {
                if (!tagpro.KeyComm.sentDir[keys[k]])
                    tagpro.socket.emit('keydown', {k: keys[k]} );
            }

            if (short) setTimeout(tagpro.KeyComm.stop,20);
        };


        $(document).keydown(function(key) {
            switch (key.which) {
                case tagpro.keys.down[0]:
                case tagpro.keys.down[1]:
                case tagpro.keys.down[2]:
                    tagpro.KeyComm.pressedDir.down = true;
                    break;
                case tagpro.keys.up[0]:
                case tagpro.keys.up[1]:
                case tagpro.keys.up[2]:
                    tagpro.KeyComm.pressedDir.up = true;
                    break;
                case tagpro.keys.left[0]:
                case tagpro.keys.left[1]:
                case tagpro.keys.left[2]:
                    tagpro.KeyComm.pressedDir.left = true;
                    break;
                case tagpro.keys.right[0]:
                case tagpro.keys.right[1]:
                case tagpro.keys.right[2]:
                    tagpro.KeyComm.pressedDir.right = true;
                    break;
            }
        });

        $(document).keyup(function(key) {
            switch (key.which) {
                case tagpro.keys.down[0]:
                case tagpro.keys.down[1]:
                case tagpro.keys.down[2]:
                    tagpro.KeyComm.pressedDir.down = false;
                    break;
                case tagpro.keys.up[0]:
                case tagpro.keys.up[1]:
                case tagpro.keys.up[2]:
                    tagpro.KeyComm.pressedDir.up = false;
                    break;
                case tagpro.keys.left[0]:
                case tagpro.keys.left[1]:
                case tagpro.keys.left[2]:
                    tagpro.KeyComm.pressedDir.left = false;
                    break;
                case tagpro.keys.right[0]:
                case tagpro.keys.right[1]:
                case tagpro.keys.right[2]:
                    tagpro.KeyComm.pressedDir.right = false;
                    break;
            }
        });
    };
    initKeyComm();




    // Disable scrolling / panning / zooming with touch
    document.body.style.touchAction = 'none';

    document.addEventListener('touchstart',handleTouch);
    document.addEventListener('touchmove',handleTouch);
    document.addEventListener('touchend',handleTouch);
    document.addEventListener('touchcancel',handleTouch);


    var origin = null,
        last = null;

    function handleTouch(TouchEvent) {
        if (TouchEvent.touches.length) {
            pointer.hidden = false;
            var x = TouchEvent.touches[0].clientX,
                y = TouchEvent.touches[0].clientY;
            if (!origin) {
                origin = {x: x, y: y};
                pointer.style.left = x-64 + 'px';
                pointer.style.top = y-64 + 'px';
            }

            // Calculate direction:
            var n = Math.floor(0.5 + 4 * Math.atan2(y - origin.y, x - origin.x) / Math.PI);
            if (n != last) {
                console.log(n);
                last = n;

                tagpro.KeyComm.stop();
                switch (n) {
                    case -3:
                        tagpro.KeyComm.send(['left','up']);
                        break;
                    case -2:
                        tagpro.KeyComm.send(['up']);
                        break;
                    case -1:
                        tagpro.KeyComm.send(['right','up']);
                        break;
                    case 0:
                        tagpro.KeyComm.send(['right']);
                        break;
                    case 1:
                        tagpro.KeyComm.send(['right','down']);
                        break;
                    case 2:
                        tagpro.KeyComm.send(['down']);
                        break;
                    case 3:
                        tagpro.KeyComm.send(['down','left']);
                        break;
                    case 4:
                    case -4:
                        tagpro.KeyComm.send(['left']);
                        break;
                    default:
                        tagpro.KeyComm.stop();
                }
            }
        } else {
            pointer.hidden = true;
            origin = null;

            tagpro.KeyComm.stop();
        }
    }



    var pointer = document.createElement('div');
    pointer.style.position = 'fixed';
    pointer.hidden = true;
    pointer.style.backgroundImage = 'url("https://i.imgur.com/CdXxFr0.png")';
    pointer.style.width = '128px';
    pointer.style.height = '128px';
    pointer.style.left = '100px';
    pointer.style.top = '100px';

    document.body.append(pointer);
});
