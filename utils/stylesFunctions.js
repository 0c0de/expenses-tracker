import { Dimensions, Platform, PixelRatio } from "react-native";

const windowDimensions = Dimensions.get('screen');
const sizes = { width: windowDimensions.width, height: windowDimensions.height };

const scale = sizes.width / 320;

const normalize = (fontSize) => {
    const newSize = fontSize * scale;
    switch(Platform.OS){
        case 'android':
            return Math.round(PixelRatio.getPixelSizeForLayoutSize(fontSize));
        
        case 'ios':
            return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2;
    }
}

module.exports = {
    normalize
}