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
            radius: 100,
            items: [
                'Помогите!',
                'Оглушай!',
                'Назад',
                'Не хватает маны'
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
            this.setPiePosition();

            $ring.classList.add('active');

        },

        hide: function () {
            $ring.classList.remove('active');

            $ring.style.top = 0 + 'px';
            $ring.style.left = 0 + 'px';
        },

        setPiePosition: function () {
            var x = parseInt(this.centerX) - this.opts.radius / 2,
                y = parseInt(this.centerY) - this.opts.radius / 2;

            $ring.style.top = y + 'px';
            $ring.style.left = x + 'px';
        },

        setMenuItemsPosition: function () {

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