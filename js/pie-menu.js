;(function (window) {
    var doc = document,
        $body = doc.querySelector('body'),
        inited = false,
        DOMGenerated = false,
        idCounter = 1,
        idPrefix = 'pie-chat-',
        $el,
        $ring,
        $ringCursor,

        defaults = {
            size: 100,
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

            this.createItemsDOM();

            this.el.addEventListener('mousedown', this.onMouseDown.bind(this));
            this.el.addEventListener('mouseup', this.onMouseUp.bind(this));
        },

        show: function () {
            $ring.classList.add('active');
            this.$itemsConteiner.classList.add('active');

            this.setMenuItemsPosition();
            this.setPiePosition();
        },

        hide: function () {
            $ring.classList.remove('active');
            this.$itemsConteiner.classList.remove('active');

            $ring.style.top = 0 + 'px';
            $ring.style.left = 0 + 'px';
        },

        setPiePosition: function () {
            var x = this.centerX - this.opts.size / 2,
                y = this.centerY - this.opts.size / 2;

            $ring.style.top = y + 'px';
            $ring.style.left = x + 'px';
        },

        setMenuItemsPosition: function () {
            var step = Math.PI*2 / this.opts.items.length,
                angle = Math.PI/2,
                opts = this.opts,
                _this = this,
                position;

            Array.prototype.forEach.call(this.$items, function ($item) {
                position = _this.getItemPosition($item, angle);

                $item.style.left = position.x + 'px';
                $item.style.top = position.y + 'px';

                angle -= step;
            });
        },

        getItemPosition: function (item, angle) {
            var width = item.offsetWidth,
                height = item.offsetHeight,
                opts = this.opts,
                degrees = angle * 180/Math.PI,
                x, y;

            x = Math.cos(angle) * (opts.size + opts.pointerSize)/2 + this.centerX;
            y = -Math.sin(angle) * (opts.size + opts.pointerSize)/2 + this.centerY;

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
                y: y
            }

        },

        defineCoordsCenter: function (e) {
            this.centerX = e.clientX;
            this.centerY = e.clientY;
        },

        createDOM: function () {
            DOMGenerated = true;

            var html = '' +
                '<div class="pie-menu--ring">' +
                '   <div class="pie-menu--cursor"></div>' +
                '</div>';

            $el = doc.createElement('div');
            $el.classList.add('pie-menu-container');

            $el.innerHTML = html;

            $ring = $el.querySelector('.pie-menu--ring');
            $ringCursor = $el.querySelector('.pie-menu--cursor');

            $body.appendChild($el);
        },

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

        //  Events
        // -------------------------------------------------

        onMouseDown: function (e) {
            this.defineCoordsCenter(e);
            this.show();
        },

        onMouseUp: function (e) {
            this.hide()
        }

    };

})(window);