import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('auto-type-code.rewriteCode', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor');
            return;
        }

        const selection = editor.selection;
        const text = editor.document.getText(selection);

        if (!text) {
            vscode.window.showErrorMessage('No text selected');
            return;
        }

        // Delete the selected text
        await editor.edit(editBuilder => {
            editBuilder.delete(selection);
        });

        // Rewrite the text with a specific sequence
        let position = selection.start; // Start from the original position

        // Function to write a character and move the position
        const writeChar = async (char: string) => {
            await editor.edit(editBuilder => {
                editBuilder.insert(position, char);
            });

            if (char === '\n') {
                position = position.with(position.line + 1, 0);
            } else {
                position = position.translate(0, char.length);
            }

            await new Promise(resolve => setTimeout(resolve, 50));
        };

        // Split the text into lines
        const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
        if (lines.length === 0) {return;};

        // Write the selector (first line of the selected code)
        for (const char of lines[0]) {
            await writeChar(char);
        }

        // Write the braces only if they are not present
        if (!lines[0].includes('{')) {
            await writeChar(' ');
            await writeChar('{');
            await writeChar('\n'); // New line after the opening brace
        }

        // Write the content line by line
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i];
            for (const char of line) {
                await writeChar(char);
            }
            await writeChar('\n'); // New line at the end of each line
        }

        // Write the closing brace only if it is not present
        if (!lines[lines.length - 1].includes('}')) {
            await writeChar('}');
        }

        await editor.document.save(); // Save changes after writing all the content
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}