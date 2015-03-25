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
        $pointer,

    // Default params
        defaults = {
            size: 100,
            inActiveRadius: 20,
            pointerOffset: 10,
            pointerFixed: true,
            pointerSize: 50,
            rotateRing: true, // If ring must be rotated according to active item or not

            // On change callback. Called when mouseup event is triggered,
            // and if active item exists. It receives item array element as parameter.
            onChange: '',

            // Item element can be either string or object.
            // Object must contain 'content' field, it will be used as item's html.
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
            this.currentActive = '';

            this.createItemsDOM();

            this.el.addEventListener('mousedown', this.onMouseDown.bind(this));
            $html.addEventListener('mouseup', this.onMouseUp.bind(this));
            $html.addEventListener('mousemove', this.onMouseMove.bind(this));
        },

        /**
         * Show menu
         */
        show: function () {
            this.visible = true;

            $el.classList.add('active');
            $ring.classList.add('active');
            this.$itemsConteiner.classList.add('active');
            $html.classList.add('-pie-menu-visible-');

            this.setMenuItemsPosition();

            this.setPiePosition();
        },

        /**
         * Hide menu
         */
        hide: function () {
            this.visible = false;

            $el.classList.remove('active');
            $ring.classList.remove('active');
            $pointer.classList.remove('active');
            this.$itemsConteiner.classList.remove('active');
            $html.classList.remove('-pie-menu-visible-','-pie-menu-moving-');

            $ring.style.top = 0 + 'px';
            $ring.style.left = 0 + 'px';

            this.disable();
        },

        /**
         * Activates received item.
         * @param {Object} item - Cached menu item from this.cache
         */
        activate: function (item) {
            if (this.currentActive) {
                this.disable(this.currentActive);
            }

            var vector = this.getVector(item.x, item.y);

            this.setPointerPosition(vector);
            item.item.classList.add('active');

            $pointer.classList.add('active');
            this.setPointerPosition(vector);
            this.setRingRotation(vector);

            this.currentActive = item;
        },


        /**
         * Disables received item.
         *  @param {Object} [item] - Cached menu item from this.cache
         */
        disable: function (item) {
            item = item ? item : this.currentActive;

            if (!item) return;

            $pointer.classList.remove('active');

            item.item.classList.remove('active');
            this.currentActive = ''
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
         * Loops through each menu item and sets its position.
         * Refreshes items cache array.
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
                    x: position.originalX,
                    y: position.originalY,
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
                x, y,
                originalX, originalY;

            x = originalX = this.getX(angle);
            y = originalY = this.getY(angle);

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
                originalX: originalX,
                originalY: originalY,
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
                '<div class="pie-menu--pointer"></div>';

            $el = doc.createElement('div');
            $el.classList.add('pie-menu-container');

            $el.innerHTML = html;

            $ring = $el.querySelector('.pie-menu--ring');
            $pointer = $el.querySelector('.pie-menu--pointer');

            $ring.style.width = this.opts.size + 'px';
            $ring.style.height = this.opts.size + 'px';

            $body.appendChild($el);
        },

        /**
         * Creates menu items html and appends it to the menu container
         */
        createItemsDOM: function () {
            var $itemsContainer = doc.createElement('div'),
                itemHtml,
                items = '';

            $itemsContainer.classList.add('pie-menu--items');
            $itemsContainer.setAttribute('id', idPrefix + idCounter++);

            this.opts.items.forEach(function (item) {
                if (typeof item == 'string') {
                    itemHtml = item;
                } else {
                    itemHtml = item.content ? item.content : 'undefined'
                }
                items += '<span class="pie-menu--item">' + itemHtml + '</span>';
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
            this.vector = this.getVector(this.currentX, this.currentY);
        },

        getVector: function (x, y) {
            var _x = x - this.centerX,
                _y = y - this.centerY,
                length = Math.sqrt(_x * _x + _y * _y);

            return {
                x: _x,
                y: _y,
                length: length
            };
        },

        /**
         * Calculates angle between vector point and circle center in degrees
         * Begins from 0 to 360
         * @param {Object} [vector] - Vector to calculate from. 'this.vector' by default.
         * @returns {number} - Angle in degrees
         */
        getCursorAngle: function (vector) {
            vector = vector ? vector : this.vector;

            return -Math.atan2(-vector.y, -vector.x) * 180/Math.PI + 180;
        },

        setPointerPosition: function (vector) {
            vector = vector ? vector : this.vector;

            var width = $pointer.offsetWidth,
                height = $pointer.offsetHeight;

            var x = vector.x / vector.length * (this.opts.size/2+this.opts.pointerOffset) + this.centerX - width/2,
                y = vector.y / vector.length * (this.opts.size/2+this.opts.pointerOffset) + this.centerY - height/2,
                angle = this.getCursorAngle(vector);

            $pointer.style.left = x + 'px';
            $pointer.style.top = y + 'px';
            $pointer.style.transform = 'rotate(' + -angle.toFixed(1) + 'deg)'
        },

        setRingRotation: function (vector) {
            var active = this.currentActive,
                angle;

            vector = vector || this.getVector(active.x, active.y);
            angle = this.getCursorAngle(vector);

            $ring.style.transform = 'rotate(' + -angle.toFixed(1) + 'deg)'
        },

        /**
         * Detects intersection between mouse cursor (vector from center to mouse position)
         * and menu item. If detects, activates this item.
         */
        intersection: function () {
            var tan = this.vector.y / this.vector.x,
                _this = this,
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
                        _this.activate(item);
                    }
                } else {
                    if (cursorDegree >= from && cursorDegree <= to) {
                        _this.activate(item);
                    }
                }
            })
        },

        /**
         * Defines if mouse cursor is in inActive radius
         * @returns {boolean} - True if so
         * @private
         */
        _isInactive: function () {
            return this.vector.length < this.opts.inActiveRadius
        },

        //  Events
        // -------------------------------------------------

        onMouseDown: function (e) {
            this.defineCoordsCenter(e);
            this.saveCurrentMousePosition(e);
            this.defineVector();
            this.show();
        },

        onMouseUp: function (e) {
            if (this.currentActive && this.opts.onChange) {
                var index = this.cache.indexOf(this.currentActive);
                this.opts.onChange(this.opts.items[index]);
            }

            this.hide();
        },

        onMouseMove: function (e) {
            if (this.visible) {
                $html.classList.add('-pie-menu-moving-');

                this.saveCurrentMousePosition(e);
                this.defineVector();
                if (!this.opts.pointerFixed) {
                    this.setPointerPosition();
                }
                if (this._isInactive()) {
                    this.disable();
                } else {
                    this.intersection();
                }
            }
        }

    };

})(window);