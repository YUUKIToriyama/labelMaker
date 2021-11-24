export type Size = {
	width: number
	height: number
}
export type Area = {
	corner: [number, number]
	size: Size
}
export interface LabelMakerSettings {
	pageSize: Size
	baseImageURL: string
	fontURL: string
	fontSize: number
	printArea: {
		postalCode: Area
		address: Area
		name: Area
	}
}

export interface ArangedText {
	text: string,
	fontSize: number,
	yOffset: number
}