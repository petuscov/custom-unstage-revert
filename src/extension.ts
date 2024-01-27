// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposableUnstage = vscode.commands.registerCommand('custom-unstage-revert.unstage', async () => {
		try {
			const gitExtension = vscode.extensions.getExtension<GitExtension>('vscode.git')?.exports;
			const gitAPI = gitExtension.getAPI(1);
			const currentRepo = gitAPI.repositories[0]; // Sólo los psicópatas abren más de un repositorio en vsCode.

			const currentFileUri = vscode.window.activeTextEditor?.document.uri;
			const currentFilePath = currentFileUri?.fsPath;
			console.log({currentFilePath});
			const fileContentUint8 = await vscode.workspace.fs.readFile(currentFileUri as vscode.Uri);
		
			let textContent = new TextDecoder().decode(fileContentUint8);
			let regexps = vscode.workspace.getConfiguration('custom-unstage-revert').regexps;

			// ¿Se podría llegar a conseguir sin necesidad de decodear y encodear, teniendo en cuenta unsignedint info?
			// podría llegar a ser más eficiente.

			regexps.forEach((regexp : string) => {
				textContent = textContent.replaceAll(new RegExp(regexp, "g"), '');
			});

			const newFileContentUint8 = new TextEncoder().encode(textContent);

			// Igual nos sirve stage con el contenido que queremos: 
			// https://github.com/microsoft/vscode/blob/main/extensions/git/src/repository.ts#L1218
			
			// !!!.
			// TypeError: currentRepo.stage is not a function

			currentRepo.stage(currentFilePath, newFileContentUint8);

			// TODO:
			// The event emitter has a fire method which can be used to notify VS Code when a change has happened in a document. The document which has changed is identified by its uri given as argument to the fire method.
		} catch(error){
			console.error('error: ' + error);
		}
	});
	
	/** 
	 * revert en API/extensión de git es comando completo (se revierte el documento entero, no admite
	 * parámetro de contenido). por ello, lo que necesitamos es actualizar archivo directamente.
	 * https://github.com/microsoft/vscode/blob/main/extensions/git/src/repository.ts#L1227
	 */
	let disposableRevert = vscode.commands.registerCommand('custom-unstage-revert.revert', async () => {
		try {
			const currentFileUri = vscode.window.activeTextEditor?.document.uri;
			const currentFilePath = currentFileUri?.fsPath;
			console.log({currentFilePath});
			const fileContentUint8 = await vscode.workspace.fs.readFile(currentFileUri as vscode.Uri);
		
			let textContent = new TextDecoder().decode(fileContentUint8);
			let regexps = vscode.workspace.getConfiguration('custom-unstage-revert').regexps;

			// ¿Se podría llegar a conseguir sin necesidad de decodear y encodear, teniendo en cuenta unsignedint info?
			// podría llegar a ser más eficiente.

			regexps.forEach((regexp : string) => {
				textContent = textContent.replaceAll(new RegExp(regexp, "g"), '');
			});

			const newFileContentUint8 = new TextEncoder().encode(textContent);

			await vscode.workspace.fs.writeFile(currentFileUri as vscode.Uri, newFileContentUint8);

			// ¿Necesario? fs debería encargarse por debajo.
			// The event emitter has a fire method which can be used to notify VS Code when a change has happened in a document. The document which has changed is identified by its uri given as argument to the fire method.
		} catch(error){
			console.error('Congratulations, your extension "custom-unstage-revert" is now active!');
		}
	});

	context.subscriptions.push(disposableUnstage);
	context.subscriptions.push(disposableRevert);

	var testUris = vscode.commands.registerCommand('cowsay.say', async () => {
		const currentFileUri = vscode.window.activeTextEditor?.document.uri;
		const currentFilePath = currentFileUri?.fsPath;
		console.log({currentFilePath});
		let fileContent = await vscode.workspace.fs.readFile(currentFileUri as vscode.Uri);
		console.log({fileContent});
	  });

	context.subscriptions.push(testUris);

}

// This method is called when your extension is deactivated
export function deactivate() {}
