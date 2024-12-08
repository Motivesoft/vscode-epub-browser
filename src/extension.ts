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
			return
		}

		vscode.window.showInformationMessage(`Mounting ${epubUri}`);

		const workspaceFolderUri = vscode.Uri.parse(`${filesystemScheme}:/?${epubUri}`);

		if (vscode.workspace.getWorkspaceFolder(workspaceFolderUri) === undefined) {
			const name = vscode.workspace.asRelativePath(epubUri, true);
			const index = vscode.workspace.workspaceFolders?.length || 0;
			const workspaceFolder: vscode.WorkspaceFolder = { uri: workspaceFolderUri, name, index };
			
			vscode.workspace.updateWorkspaceFolders(index, 0, workspaceFolder);
		}
	}));

	context.subscriptions.push(vscode.commands.registerCommand('vscode-epub-browser.unmount', (workspaceFolderUri: vscode.Uri) => {
		vscode.window.showInformationMessage(`Unmounting ${workspaceFolderUri}`);
	}));
}

export function deactivate() {}
