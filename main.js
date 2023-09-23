var ImageJS = require("imagejs");
const axios = require('axios');
var FormData = require('form-data');

function rgbToArray(red, green, blue) {
    if (red < 0 || red > 255 || green < 0 || green > 255 || blue < 0 || blue > 255) {
        throw new Error('RGB values must be between 0 and 255.');
    }

    const doubleRed = red / 255.0;
    const doubleGreen = green / 255.0;
    const doubleBlue = blue / 255.0;

    const doubleArray = [doubleRed, doubleGreen, doubleBlue];

    if (doubleArray[0] == 0 && doubleArray[1] == 0 && doubleArray[2] == 0) {
        return [0, 0, 0, 0];
    }

    return [...doubleArray, 1];
}

function bitmapToArray(bitmap) {
    var matrix = [];
    for (let i = 0; i < 8; i++) {
        var array = [];
        for (let j = 0; j < 8; j++) {
            var color = bitmap.getPixel(j, i);
            var r = color["r"];
            var g = color["g"];
            var b = color["b"];
            array.push(rgbToArray(r, g, b))

        }
        matrix.push(array);
    }
    return matrix;
}

(async () => {
    const arguments = process.argv

    const imagePath = arguments[2];

    const nameOptionIndex = arguments.indexOf('--name') > -1 ? arguments.indexOf('--name') : arguments.indexOf('-n');
    let name = nameOptionIndex > -1 ? arguments[nameOptionIndex + 1] : null;

    const categoryOptionIndex = arguments.indexOf('--category') > -1 ? arguments.indexOf('--category') : arguments.indexOf('-c');
    let category = categoryOptionIndex > -1 ? arguments[categoryOptionIndex + 1] : '4';

    if (!name) {
        console.error('Name is required');
        return;
    }

    try {
        var bitmap = new ImageJS.Bitmap();
        await bitmap.readFile(imagePath);

        bitmap = bitmap.resize({
            width: 8,
            height: 8,
            algorithm: "bilinearInterpolation",
            fit: "crop",
        });

        var body = {
            icons: [bitmapToArray(bitmap)],
            delays: []
        }


        const formData = new FormData();
        formData.append('animation[body]', JSON.stringify(body));
        formData.append('animation[name]', name);
        formData.append('animation[category]', category);

        var response = await axios.post('https://developer.lametric.com/api/v1/dev/storeicon', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Origin': 'https://developer.lametric.com',
                'Referer': 'https://developer.lametric.com/icons'
            },
        });

        console.log(response.data);
    } catch (error) {
        console.error(error);
    }
})();

