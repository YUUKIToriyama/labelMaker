import { ArangedText } from './types';

export const arangeText = (text: string, fontSize: number, areaSize: { width: number, height?: number }): ArangedText[] => {
	if (text.length * fontSize < areaSize.width) {
		return [{
			text: text,
			fontSize: fontSize,
			yOffset: 0
		}]
	} else {
		const maximum = Math.floor(areaSize.width / fontSize);
		const countRow = Math.ceil(text.length / maximum);
		const arangedText: ArangedText[] = [];
		for (let i = 0; i < countRow; i++) {
			arangedText.push({
				text: text.slice(i * maximum, (i + 1) * maximum),
				fontSize: fontSize,
				yOffset: fontSize * 1.5 * i
			});
		}
		return arangedText;
	}
}