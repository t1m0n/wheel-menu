;(function (window) {
    var tmpl = '' +
            '<img class="chat-msg--image" src="http://media.steampowered.com/apps/dota2/images/heroes/tusk_sb.png">' +
            '<div class="chat-msg--to-whom">[ALLIES] </div>' +
            '<div class="chat-msg--name">{{name}}</div>:' +
            '<div class="chat-msg--text">{{text}}</div>',
        $body = document.querySelector('body'),
        deleteMessageDelay = 10000,
        max = 5,
        counter = 0,
        $chat, $messages;

    window.chat = {
        init: function () {
            this.initted = true;
            this.createDOM();

            $messages.addEventListener('mousedown', function (e) {
                e.stopPropagation()
            })
        },

        createDOM: function () {
            $chat = document.createElement('div');

            $chat.classList.add('chat');
            $chat.innerHTML = '<div class="chat--messages"></div>';

            $body.appendChild($chat);

            $messages = $chat.querySelector('.chat--messages');
        },

        /**
         * Gets message html and appends it to messages container
         * @param {String} name - Chat name
         * @param {String} message - Chat message
         */
        write: function (name, message) {
            var data = {
                name: name,
                text: message
            };

            var html = tmpl.replace(/{{(\w+)}}/gi, function (match, val) {
                return data[val];
            });

            this.appendMessage(html);
        },

        /**
         * Appends message to messages container
         * @param {String} msg - Message string
         */
        appendMessage: function (msg) {
            var $msg = document.createElement('div');

            counter++;

            if (counter > max) {
                $messages.removeChild($messages.firstChild);
                counter--;
            }

            $msg.innerHTML = msg;

            $msg.classList.add('chat-msg');
            $messages.appendChild($msg);

            setTimeout(function () {
                $msg.classList.add('active');
            }, 4);

            setTimeout(function () {
                if ($msg.parentNode == $messages) {
                    $msg.classList.remove('active');

                    setTimeout(function () {
                        $messages.removeChild($msg);
                    }, 200);

                    counter--
                }
            }, deleteMessageDelay)
        }
    }
})(window);
