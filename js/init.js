window.onload = function () {
    chat.init();

    new WheelMenu('html', {
        size: 170,
        classes: '-dota-',
        pointerOffset: 8,
        borderWidth: 11,
        pointerSize: 80,
        items: [
            'Push',
            'Well played',
            'Missing',
            'Care',
            'Get Back',
            'Need Wards',
            'Stun',
            'Help'
        ],
        onChange: function (value) {
            chat.write('Tusk', value)
        }
    });
};
