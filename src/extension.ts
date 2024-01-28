import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {

	let disposableUnstage = vscode.commands.registerCommand('custom-unstage-revert.unstage', async () => {
		try {
			const activeEditor : vscode.TextEditor = vscode.window.activeTextEditor as vscode.TextEditor;
			const currentFileUri = vscode.window.activeTextEditor?.document.uri;
			
			var selectionsOfRegexps = await getSelectionOfPositionsOfRegexps(currentFileUri as vscode.Uri);
			var currentSelection;

			activeEditor.selections = selectionsOfRegexps;
			
			// Hemos probado a unstagear / revertear con selecciones independientes, y no funciona, por lo que el comando tampoco funcionará.
			// Quizás al unstagear de manera secuencial se pierdan índices de líneas correctas, razón por la cual comenzamos por el final.
			for(var i = activeEditor.selections.length - 1; i > 0; i--){
				currentSelection = activeEditor.selections[i];
				await vscode.commands.executeCommand<vscode.Location[]>(
					'git.unstageSelectedRanges',
					currentFileUri,
					currentSelection
				);
			}
		} catch(error){
			console.error('error: ' + error);
		}
	});
	
	let disposableRevert = vscode.commands.registerCommand('custom-unstage-revert.revert', async () => {
		try {
			const activeEditor : vscode.TextEditor = vscode.window.activeTextEditor as vscode.TextEditor;
			const currentFileUri = vscode.window.activeTextEditor?.document.uri;
			
			var selectionsOfRegexps = await getSelectionOfPositionsOfRegexps(currentFileUri as vscode.Uri);
			var currentSelection;

			activeEditor.selections = selectionsOfRegexps;
			
			// Hemos probado a unstagear / revertear con selecciones independientes, y no funciona, por lo que el comando tampoco funcionará.
			// Quizás al unstagear de manera secuencial se pierdan índices de líneas correctas, razón por la cual comenzamos por el final.
			for(var i = activeEditor.selections.length - 1; i > 0; i--){
				currentSelection = activeEditor.selections[i];
				await vscode.commands.executeCommand<vscode.Location[]>(
					'git.revertSelectedRanges',
					currentFileUri,
					currentSelection
				);
			}
		} catch(error){
			console.error('Congratulations, your extension "custom-unstage-revert" is now active!');
		}
	});

	context.subscriptions.push(disposableUnstage);
	context.subscriptions.push(disposableRevert);

	var testUris = vscode.commands.registerCommand('cowsay.say', async () => {
		const activeEditor : vscode.TextEditor = vscode.window.activeTextEditor as vscode.TextEditor;
		const currentFileUri = vscode.window.activeTextEditor?.document.uri;
		
		var selectionsOfRegexps = await getSelectionOfPositionsOfRegexps(currentFileUri as vscode.Uri);
		activeEditor.selections = selectionsOfRegexps;
	  });

	context.subscriptions.push(testUris);

}

/**
 * Devuelve las selecciones correspondientes a las posiciones (indexs de carácteres) de un texto.
 * Idealmente debería devolver selección completa, para respetar regexps que abarquen más de una línea.
 */
async function getSelectionOfPositionsOfRegexps(currentFileUri: vscode.Uri) : Promise<vscode.Selection[]> {
	const fileContentUint8 = await vscode.workspace.fs.readFile(currentFileUri as vscode.Uri);

	let textContent = new TextDecoder().decode(fileContentUint8);

	const activeEditor : vscode.TextEditor = vscode.window.activeTextEditor as vscode.TextEditor;
	let regexps = vscode.workspace.getConfiguration('custom-unstage-revert').regexps;

	var iterator = textContent.matchAll(new RegExp(regexps[0], "g"));
	activeEditor.selections = [];
	var foundMatch = iterator.next();
	var value;
		
	var positions : number[] = [];

	while(!foundMatch.done){
		value = foundMatch.value;
		positions.push(value.index as number);
		// idealmente guardar objeto para tener tb length...
		//positions.push({init: value.index, length: value[0].length});
		foundMatch = iterator.next();
	}

	// Idealmente deberíamos usar length para aquellas regexps que abarquen más de una línea..

	var lineIndexs = [];
	var currentLineIndex = 0;
	var nextPos = positions.shift();
	var character;

	for(var characterPos = 0; characterPos<textContent.length && nextPos !== undefined; characterPos++){
		character = textContent.charAt(characterPos);	
		if(character === '\n'){currentLineIndex++;}
		if(nextPos === characterPos){lineIndexs.push(currentLineIndex); nextPos = positions.shift();}
	}

	var selections : vscode.Selection[] = [];

	lineIndexs.forEach(lineIndex => {
		// Línea inicio, caracter inicio, línea fin, caracter fin.
		selections.push(new vscode.Selection(lineIndex, 0, lineIndex, 1));
	});

	return selections;
}

// This method is called when your extension is deactivated
export function deactivate() {}
