;(function (window) {
    var doc = document,
        $body = doc.querySelector('body'),
        $html = doc.querySelector('html'),
        inited = false,
        DOMGenerated = false,
        idCounter = 1,
        idPrefix = 'pie-chat-',
        $el,
        $ring,
        $ringCursor,

        // Default params
        defaults = {
            size: 100,
            cursorOffset: 10,
            pointerSize: 50,
            items: [
                'Hello',
                'Need to go Need to go',
                'Event log Event log',
                'Get back Get backGet back Get back'
            ]
        };


    window.PieMenu = function (el, params) {
        this.inited = false;
        this.el = doc.querySelector(el);

        this.opts = extend({}, defaults, params);

        if (!DOMGenerated) {
            this.createDOM();
        }

        this.init();
    };

    PieMenu.prototype = {
        init: function () {
            this.inited = true;
            this.cache = [];

            this.createItemsDOM();

            this.el.addEventListener('mousedown', this.onMouseDown.bind(this));
            this.el.addEventListener('mouseup', this.onMouseUp.bind(this));
            this.el.addEventListener('mousemove', this.onMouseMove.bind(this));
        },

        /**
         * Show menu
         */
        show: function () {
            this.visible = true;

            $ring.classList.add('active');
            $ringCursor.classList.add('active');
            this.$itemsConteiner.classList.add('active');
            $html.classList.add('-pie-menu-visible-');

            this.setMenuItemsPosition();
            this.setCursorPosition();
            this.setPiePosition();
        },

        /**
         * Hide menu
         */
        hide: function () {
            this.visible = false;

            $ring.classList.remove('active');
            $ringCursor.classList.remove('active');
            this.$itemsConteiner.classList.remove('active');
            $html.classList.remove('-pie-menu-visible-');

            $ring.style.top = 0 + 'px';
            $ring.style.left = 0 + 'px';
        },

        /**
         * Sets circle position
         */
        setPiePosition: function () {
            var x = this.centerX - this.opts.size / 2,
                y = this.centerY - this.opts.size / 2;

            $ring.style.top = y + 'px';
            $ring.style.left = x + 'px';
        },

        /**
         * Loops through each menu item and sets its position
         */
        setMenuItemsPosition: function () {
            var step = Math.PI*2 / this.opts.items.length,
                angle = Math.PI/2,
                opts = this.opts,
                range,
                _this = this,
                position;

            this.cache = [];

            Array.prototype.forEach.call(this.$items, function ($item) {
                position = _this.getItemPosition($item, angle);

                $item.style.left = position.x + 'px';
                $item.style.top = position.y + 'px';

                _this.cache.push({
                    item: $item,
                    range: position.range
                });

                angle -= step;
            });
        },

        getX: function (angle) {
           return Math.cos(angle) * (this.opts.size + this.opts.pointerSize)/2 + this.centerX;
        },

        getY: function (angle) {
            return -Math.sin(angle) * (this.opts.size + this.opts.pointerSize)/2 + this.centerY;
        },

        /**
         * Computes correct 'x' and 'y' item position
         * @param {Object} item - DOM item object
         * @param {Number} angle - Angle at which item should be positioned
         * @returns {{x: *, y: *}}
         */
        getItemPosition: function (item, angle) {
            var width = item.offsetWidth,
                height = item.offsetHeight,
                opts = this.opts,
                degrees = angle * 180/Math.PI,
                range = this.getAngleRange(angle),
                x, y;

            x = this.getX(angle);
            y = this.getY(angle);

            //TODO сделать для диапозона чисел, а не для конкртеных
            // Correct x position
            switch (true) {
                case degrees == 90 || degrees == -90:
                    x = x - width/2;
                    break;
                case  degrees == -225 || degrees == -180 || degrees == -135:
                    x = x - width;
                    break;
                default:
                    break;
            }

            // Correct y position
            switch (true) {
                case degrees == 90:
                    y = y - height;
                    break;
                case degrees == 45 || degrees == -225:
                    y = y - height;
                    break;
                case degrees == 0 || degrees == -180:
                    y = y - height/2;
                    break;
                default:
                    break;
            }

            return {
                x: x,
                y: y,
                range: range
            }
        },

        /**
         * Defines to what angle range item is belong to. Need for activating proper item
         * @param {Number} angle - Angle in radians to compute range from.
         * @returns {Array} - Range array [from, to] in degrees. 'from' can be larger then 'to'
         */
        getAngleRange: function (angle) {
            var range = [],
                opts = this.opts,
                halfStep = (Math.PI*2 / this.opts.items.length) / 2,
                from = angle - halfStep,
                to = angle + halfStep,
                fromX, fromY,
                toX, toY;

            fromX = this.getX(from);
            fromY = this.getY(from);

            toX = this.getX(to);
            toY = this.getY(to);

            range[0] = -Math.atan2(fromY - this.centerY, fromX - this.centerX) * 180/Math.PI;

            range[1] = -Math.atan2(toY - this.centerY, toX - this.centerX) * 180/Math.PI;

            return range;
        },

        /**
         * Defines and saves menu's center position
         * @param {Event} e - Mousedown event
         */
        defineCoordsCenter: function (e) {
            this.centerX = e.clientX;
            this.centerY = e.clientY;
        },

        /**
         * Creates base elements and appends them to the body.
         */
        createDOM: function () {
            DOMGenerated = true;

            var html = '' +
                '<div class="pie-menu--ring"></div>' +
                '<div class="pie-menu--cursor"></div>';

            $el = doc.createElement('div');
            $el.classList.add('pie-menu-container');

            $el.innerHTML = html;

            $ring = $el.querySelector('.pie-menu--ring');
            $ringCursor = $el.querySelector('.pie-menu--cursor');

            $body.appendChild($el);
        },

        /**
         * Creates menu items html and appends it to the menu container
         */
        createItemsDOM: function () {
            var $itemsContainer = doc.createElement('div'),
                items = '';

            $itemsContainer.classList.add('pie-menu--items');
            $itemsContainer.setAttribute('id', idPrefix + idCounter++);

            this.opts.items.forEach(function (item) {
                items += '<span class="pie-menu--item">' + item + '</span>';
            });

            $itemsContainer.innerHTML = items;

            $el.appendChild($itemsContainer);

            this.$itemsConteiner = $itemsContainer;
            this.$items = $itemsContainer.querySelectorAll('.pie-menu--item');
        },

        saveCurrentMousePosition: function (event) {
            this.currentX = event.clientX;
            this.currentY = event.clientY;
        },

        defineVector: function () {
            var x = this.currentX - this.centerX,
                y = this.currentY - this.centerY,
                length = Math.sqrt(x * x + y * y);

            this.vector = {
                x: x,
                y: y,
                length: length
            };
        },

        setCursorPosition: function () {
            var x = this.vector.x / this.vector.length * (this.opts.size/2+this.opts.cursorOffset) + this.centerX - 4,
                y = this.vector.y / this.vector.length * (this.opts.size/2+this.opts.cursorOffset) + this.centerY - 4;

            $ringCursor.style.left = x + 'px';
            $ringCursor.style.top = y + 'px';
        },

        intersection: function () {
            var tan = this.vector.y / this.vector.x,
                from, to,
                cursorDegree = -Math.atan2(this.vector.y, this.vector.x) * 180/Math.PI;

            this.cache.forEach(function (item) {
                from = item.range[0];
                to = item.range[1];

                // If one of item's sides area is on the edge state. For example
                // when we have item which 'from' begins from 157 and ends to -157, when all
                // 'cursorDegree' values are appear hear. To not let this happen, we compare
                // 'from' and 'to' and reverse comparing operations.
                if (from > to) {
                    if (cursorDegree <= from && cursorDegree <= to) {
                        console.log(item.item.innerHTML);
                    }
                } else {
                    if (cursorDegree >= from && cursorDegree <= to) {
                        console.log(item.item.innerHTML);
                    }
                }
            })
        },

        //  Events
        // -------------------------------------------------

        onMouseDown: function (e) {
            this.defineVector();
            this.defineCoordsCenter(e);
            this.saveCurrentMousePosition(e);
            this.show();
        },

        onMouseUp: function (e) {
            this.hide()
        },

        onMouseMove: function (e) {
            if (this.visible) {
                this.saveCurrentMousePosition(e);
                this.defineVector();
                this.setCursorPosition();
                this.intersection();
            }
        }

    };

})(window);