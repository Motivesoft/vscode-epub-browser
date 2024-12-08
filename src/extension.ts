import * as vscode from 'vscode';
import * as path from 'path';
import * as epubfs from './epubHandler';

export function activate(context: vscode.ExtensionContext) {
	console.log('Extension "vscode-epub-browser" is active');

//           "when": "explorerResourceIsRoot && resourceExtname == .epub && resourceScheme == epubfs",


	// Register the file system handler for epubs
	const filesystemScheme = "epubfs";
	const fileSystem = new epubfs.ReadonlyFS();
	context.subscriptions.push(vscode.workspace.registerFileSystemProvider(filesystemScheme, fileSystem, { isCaseSensitive: true, isReadonly: true }));

	// Mount command
	context.subscriptions.push(vscode.commands.registerCommand('vscode-epub-browser.mount', (epubUri: vscode.Uri) => {
		if (epubUri === undefined) {
			vscode.window.showErrorMessage(`Select an EPUB file to mount`);
			return;
		}

		const filename = path.basename(epubUri.fsPath);
		vscode.window.showInformationMessage(`Mounting '${filename}'`);

		// Prepare a workspace to hold the book's contents
		const workspaceFolderUri = vscode.Uri.parse(`${filesystemScheme}:/?${epubUri}`);

		// Don't mount the file if already open
		if (vscode.workspace.getWorkspaceFolder(workspaceFolderUri) === undefined) {
			const name = vscode.workspace.asRelativePath(epubUri, true);
			const index = vscode.workspace.workspaceFolders?.length || 0;
			const workspaceFolder: vscode.WorkspaceFolder = { uri: workspaceFolderUri, name, index };
			
			vscode.workspace.updateWorkspaceFolders(index, 0, workspaceFolder);
		}
	}));

	// Unmount command
	context.subscriptions.push(vscode.commands.registerCommand('vscode-epub-browser.unmount', (workspaceFolderUri: vscode.Uri) => {
		const workspaceFolder = vscode.workspace.getWorkspaceFolder(workspaceFolderUri);
		if (workspaceFolder !== undefined) {
			const filename = path.basename(workspaceFolderUri.query);
			vscode.window.showInformationMessage(`Unmounting '${filename}'`);
	
			vscode.workspace.updateWorkspaceFolders(workspaceFolder?.index, 1);
		}
	}));
}

export function deactivate() {}
