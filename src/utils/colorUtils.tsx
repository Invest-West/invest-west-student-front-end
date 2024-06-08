import colorString from "color-string";

export const toRGBWithOpacity = (color: string, opacity?: number) => {
    const rgbColor: colorString.Color | null = colorString.get.rgb(color);
    if (!rgbColor) {
        return color;
    }
    return colorString.to.hex(rgbColor[0], rgbColor[1], rgbColor[2], opacity === undefined ? 1.0 : opacity);
}