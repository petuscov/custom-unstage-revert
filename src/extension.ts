import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {

	let disposableUnstage = vscode.commands.registerCommand('custom-unstage-revert.unstage', async () => {
		try {
			const activeEditor : vscode.TextEditor = vscode.window.activeTextEditor as vscode.TextEditor;
			const currentFileUri = vscode.window.activeTextEditor?.document.uri;
			
			var selectionsOfRegexps = await getSelectionOfPositionsOfRegexps(currentFileUri as vscode.Uri);
			var currentSelection;
	
			// Hemos probado a unstagear / revertear con selecciones independientes, y no funciona, por lo que el comando tampoco funcionará.
			// Quizás al unstagear de manera secuencial se pierdan índices de líneas correctas, razón por la cual comenzamos por el final.
			for(var i = selectionsOfRegexps.length - 1; i >= 0; i--){
				currentSelection = selectionsOfRegexps[i];
				activeEditor.selections = [currentSelection];
				await vscode.commands.executeCommand<vscode.Location[]>(
					'git.unstageSelectedRanges',
					currentFileUri,
					currentSelection
				);
				// await wait(2000);
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
			
			// Hemos probado a unstagear / revertear con selecciones independientes, y no funciona, por lo que el comando tampoco funcionará.
			// Quizás al unstagear de manera secuencial se pierdan índices de líneas correctas, razón por la cual comenzamos por el final.
			for(var i = selectionsOfRegexps.length - 1; i >= 0; i--){
				currentSelection = selectionsOfRegexps[i];
				currentSelection = activeEditor.selections[i];
				await vscode.commands.executeCommand<vscode.Location[]>(
					'git.revertSelectedRanges',
					currentFileUri,
					currentSelection
				);
				await wait(100);
			}
		} catch(error){
			console.error('Congratulations, your extension "custom-unstage-revert" is now active!');
		}
	});

	context.subscriptions.push(disposableUnstage);
	context.subscriptions.push(disposableRevert);
}

/**
 * Devuelve las selecciones correspondientes a las posiciones (indexs de carácteres) de un texto.
 * Idealmente debería devolver selección completa, para respetar regexps que abarquen más de una línea.
 */
async function getSelectionOfPositionsOfRegexps(currentFileUri: vscode.Uri) : Promise<vscode.Selection[]> {
	const fileContentUint8 = await vscode.workspace.fs.readFile(currentFileUri as vscode.Uri);

	let textContent = new TextDecoder().decode(fileContentUint8);

	let regexps = vscode.workspace.getConfiguration('custom-unstage-revert').regexps;
	var positions : number[] = [];
	var value;

	for(let regexp of regexps){
		var iterator = textContent.matchAll(new RegExp(regexp, "g"));
		var foundMatch = iterator.next();

		while(!foundMatch.done){
			value = foundMatch.value;
			positions.push(value.index as number);
			// idealmente guardar objeto para tener tb length...
			//positions.push({init: value.index, length: value[0].length});
			foundMatch = iterator.next();
		}
	}
	positions = positions.sort((charIndexA,charIndexB)=>{return charIndexA > charIndexB ? 1 : -1});

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

async function wait(miliSeconds: number){
	return new Promise((resolve)=>{
		setTimeout(resolve, miliSeconds);
	});
}

// This method is called when your extension is deactivated
export function deactivate() {}
