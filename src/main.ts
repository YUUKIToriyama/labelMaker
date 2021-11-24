import { PDFDocument, PDFImage, PDFFont } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import fetch from 'node-fetch';
import fs from 'fs/promises';
import { arangeText } from './utils';
import { LabelMakerSettings } from './types';

class LabelMaker {
	settings: LabelMakerSettings;
	document: PDFDocument | undefined;
	baseImage: PDFImage | undefined;
	customFont: PDFFont | undefined;
	constructor(settings: LabelMakerSettings) {
		this.settings = settings;
		this.init();
	}

	private init = async () => {
		// ドキュメントの作成
		this.document = await PDFDocument.create();
		// 外部フォントの読み込み
		const fontBinary = await fetch(this.settings.fontURL).then(response => {
			return response.arrayBuffer();
		});
		this.document.registerFontkit(fontkit);
		this.customFont = await this.document.embedFont(fontBinary);
		// ベースイメージの読み込み
		const imageBinary = await fetch(this.settings.baseImageURL).then(response => {
			return response.arrayBuffer();
		});
		this.baseImage = await this.document.embedPng(imageBinary);
	}

	public createNewPage = (args: { postalCode: string, address: string, name: string }) => {
		if (this.document === undefined) {
			throw Error("createNewPage()を実行する前にinit()を実行しておく必要があります。");
		}
		// ページを作成
		const page = this.document.addPage([
			this.settings.pageSize.width,
			this.settings.pageSize.height
		]);
		// ベース画像を貼り付け
		if (this.baseImage === undefined) {
			throw Error("画像が正しく読み込まれていません。");
		}
		page.drawImage(this.baseImage, {
			x: 0,
			y: 0,
			width: this.settings.pageSize.width,
			height: this.settings.pageSize.height
		});
		// 郵便番号を印字
		page.drawText(args.postalCode, {
			x: this.settings.printArea.postalCode.corner[0],
			y: this.settings.printArea.postalCode.corner[1],
			font: this.customFont,
			size: this.settings.fontSize
		});
		// 住所を印字
		arangeText(args.address, this.settings.fontSize, { ...this.settings.printArea.address.size }).forEach(text => {
			page.drawText(text.text, {
				x: this.settings.printArea.address.corner[0],
				y: this.settings.printArea.address.corner[1] - text.yOffset,
				font: this.customFont,
				size: text.fontSize
			});
		});
		// 氏名を印字
		page.drawText(args.name + "様", {
			x: this.settings.printArea.name.corner[0],
			y: this.settings.printArea.name.corner[1],
			font: this.customFont,
			size: this.settings.fontSize
		});
	}

	public saveAsFile = async (fileName: string) => {
		if (this.document === undefined) {
			throw Error("saveFile()を実行する前にinit()を実行しておく必要があります。");
		}
		const pdf = await this.document.save();
		fs.writeFile(fileName, pdf).then(() => {
			console.log(`${fileName} was created!`);
		});
	}

	public exportAsBase64 = () => {
		if (this.document === undefined) {
			throw Error("exportAsBase64()を実行する前にinit()を実行しておく必要があります。");
		}
		return this.document.saveAsBase64();
	}
}