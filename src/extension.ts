import * as vscode from 'vscode';
import * as epubfs from './epubHandler';

export function activate(context: vscode.ExtensionContext) {
	console.log('Extension "vscode-epub-browser" is active');

	const filesystemScheme = "epubfs";

	const fileSystem = new epubfs.ReadonlyFS();
	context.subscriptions.push(vscode.workspace.registerFileSystemProvider(filesystemScheme, fileSystem, { isCaseSensitive: true, isReadonly: true }));

	context.subscriptions.push(vscode.commands.registerCommand('vscode-epub-browser.mount', (epubUri: vscode.Uri) => {
		if (epubUri === undefined) {
			vscode.window.showErrorMessage(`Select an EPUB file to mount`);
			return;
		}

		vscode.window.showInformationMessage(`Mounting ${epubUri}`);

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

	context.subscriptions.push(vscode.commands.registerCommand('vscode-epub-browser.unmount', (workspaceFolderUri: vscode.Uri) => {
		vscode.window.showInformationMessage(`Unmounting ${workspaceFolderUri}`);

		const workspaceFolder = vscode.workspace.getWorkspaceFolder(workspaceFolderUri);
		if (workspaceFolder !== undefined) {
			vscode.workspace.updateWorkspaceFolders(workspaceFolder?.index, 1);
		}
	}));
}

export function deactivate() {}
