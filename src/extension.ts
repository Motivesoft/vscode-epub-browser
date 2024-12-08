import * as vscode from 'vscode';
import * as epubfs from './epubHandler';

export function activate(context: vscode.ExtensionContext) {
	console.log('Extension "vscode-epub-browser" is active');


	const filesystemScheme = "epubfs";

	const fileSystem = new epubfs.ReadonlyFS();
	context.subscriptions.push(vscode.workspace.registerFileSystemProvider(filesystemScheme, fileSystem, { isCaseSensitive: true, isReadonly: true }));

	context.subscriptions.push(vscode.commands.registerCommand('vscode-epub-browser.mount', async () => {
		vscode.window.showInformationMessage('Mount EPUB file');

		// Let the user choose a file. Don't constrain this to being something in the currently open folder
		const options: vscode.OpenDialogOptions = {
			canSelectMany: false,
			canSelectFiles: true,
			canSelectFolders: false,
			title: 'Select epub file',
			openLabel: 'Mount',
			filters: {
				'EPUB files': ['epub']
			}
		};

		// Display the File dialog
		const fileUri = await vscode.window.showOpenDialog(options);

		// Proceed if a file was selected. 
		// - Assume it is of the correct format (something readable as a zip file)
		// - The file dialog is configured to only allow a single selection, not mulitple
		if (fileUri && fileUri[0]) {
			const _uri = fileUri[0];
			vscode.window.showInformationMessage(`Mounting ${_uri}`);

			const uri = vscode.Uri.parse(`${filesystemScheme}:/?${_uri}`);
			if (vscode.workspace.getWorkspaceFolder(uri) === undefined) {
			  const name = vscode.workspace.asRelativePath(_uri, true);
			  const index = vscode.workspace.workspaceFolders?.length || 0;
			  const workspaceFolder: vscode.WorkspaceFolder = { uri, name, index };
			  vscode.workspace.updateWorkspaceFolders(index, 0, workspaceFolder);
			}
 		}
	}));

	context.subscriptions.push(vscode.commands.registerCommand('vscode-epub-browser.unmount', () => {
		vscode.window.showInformationMessage('Unmount EPUB file');
	}));
}

export function deactivate() {}
