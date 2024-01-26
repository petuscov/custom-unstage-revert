// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposableUnstage = vscode.commands.registerCommand('custom-unstage-revert.unstage', () => {
		
		// TODO: Get editor / context.
		
		try {
			let regexps = vscode.workspace.getConfiguration('custom-unstage-revert').regexps;
			console.log({regexps});
			// Leer y debuggear para ver formato.

			vscode.window.showInformationMessage('TO-DO UNSTAGE TAKING REGEXPS!');
		} catch(error){
			console.error('Congratulations, your extension "custom-unstage-revert" is now active!');
		}

	});

	let disposableRevert = vscode.commands.registerCommand('custom-unstage-revert.revert', () => {
		try {
			let regexps = vscode.workspace.getConfiguration('custom-unstage-revert').regexps;
			console.log({regexps});

			vscode.window.showInformationMessage('TO-DO REVERT TAKING REGEXPS!');
		} catch(error){
			console.error('Congratulations, your extension "custom-unstage-revert" is now active!');
		}
	});

	context.subscriptions.push(disposableUnstage);
	context.subscriptions.push(disposableRevert);
}

function unstage(){

}


// This method is called when your extension is deactivated
export function deactivate() {}
