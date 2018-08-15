'use strict';

import * as vscode from 'vscode';

export const PYTHON_MODE: vscode.DocumentFilter = { language: 'python', scheme: 'file' };

export function activate(context: vscode.ExtensionContext) {

    console.log('extension "python" activated');

    context.subscriptions.push(vscode.languages.registerDocumentSymbolProvider(PYTHON_MODE, new PythonDocumentSymbolProvider()));
}

export function deactivate() {
    console.log('extension "python" deactivated');
}

class Tokenizer {

    private _text: string;
    private _text_line: vscode.TextLine;
    private _pos: number;
    private _token: string;
    private _char_start: number;
    private _char_end: number;

    constructor(text_line: vscode.TextLine) {
        this._text_line = text_line;
        this._text = text_line.text;
        this._pos = 0;
        this._token = '';
        this._char_start = 0;
        this._char_end = 0;
    }

    public next(): string {

        while(this._text.charAt(this._pos) == ' ' || this._text.charAt(this._pos) == '\t')
        {
            this._pos++;
        }

        if('_abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.includes(this._text.charAt(this._pos)))
        {
            if(this.parseLiteral()) return this._token;
        }

        if(',(#'.includes(this._text.charAt(this._pos)))
        {
            let character: string = this._text.charAt(this._pos);
            this._char_start = this._pos;
            this._char_end = this._pos;
            this._pos++;
            return character;
        }

        console.log('unexpected character ' + this._text.charAt(this._pos));

        let character: string = this._text.charAt(this._pos);
        this._char_start = this._pos;
        this._char_end = this._pos;

        this._pos++;

        return character;
    }

    public range(): vscode.Range {
        return new vscode.Range(this._text_line.lineNumber, this._char_start, this._text_line.lineNumber, this._char_end);
    }

    private parseLiteral(): boolean {
        this._token = '';
        this._char_start = this._pos;

        while ('_abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.'.includes(this._text.charAt(this._pos)) && this._pos < this._text.length) {
            this._token += this._text.charAt(this._pos);
            this._pos++;
        }

        this._char_end = this._pos;

        return true;
    }
}

export class PythonDocumentSymbolProvider implements vscode.DocumentSymbolProvider {

    public provideDocumentSymbols(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.DocumentSymbol[] {
        let results: vscode.DocumentSymbol[] = [];

        let root: vscode.DocumentSymbol;
        root = new vscode.DocumentSymbol('Imports', '', vscode.SymbolKind.Namespace, new vscode.Range(0, 0, 0, 10), new vscode.Range(0, 0, 0, 10));
        results.push(root);

        let current_class: vscode.DocumentSymbol;
        let current_class_depth: number = 0;

        for (let index = 0; index < document.lineCount; index++) {
            let text: vscode.TextLine = document.lineAt(index);

            if(text.isEmptyOrWhitespace) continue;

            let tokenizer: Tokenizer = new Tokenizer(text);

            let token: string = tokenizer.next();

            if(token == 'from')
            {
                let module = tokenizer.next();

                if(tokenizer.next() == 'import')
                {
                    do
                    {
                        let import_name: string = tokenizer.next();
                        if(import_name == '') break;

                        root.children.push(new vscode.DocumentSymbol(import_name, ' from ' + module, vscode.SymbolKind.Interface, tokenizer.range(), tokenizer.range()));

                        if(tokenizer.next() == ',') continue;

                        break;
                    }while(true)
                }
            }

            if(token == 'import')
            {
                console.log('parsing import');
                do{
                    let import_name: string = tokenizer.next();

                    console.log('import_name:' + import_name);

                    if(import_name == '') break;

                    root.children.push(new vscode.DocumentSymbol(import_name, '', vscode.SymbolKind.Namespace, tokenizer.range(), tokenizer.range()));

                    if(tokenizer.next() == ',') continue;

                    break;
                }while(true)
            }

            if(token == 'class')
            {
                let class_name: string = tokenizer.next();
                let class_range: vscode.Range = tokenizer.range();
                let details: string = '';

                if(tokenizer.next() == '(')
                {
                    let inherits: string = tokenizer.next();
                    details += inherits + ' ';
                }

                current_class = new vscode.DocumentSymbol(class_name, details, vscode.SymbolKind.Class, class_range, class_range);
                current_class_depth = text.firstNonWhitespaceCharacterIndex;

                results.push(current_class);
            }

            if(token == 'def')
            {
                let function_name: string = tokenizer.next();
                let function_range: vscode.Range = tokenizer.range();

                if(current_class != undefined && text.firstNonWhitespaceCharacterIndex > current_class_depth)
                {
                    current_class.children.push(new vscode.DocumentSymbol(function_name, '', vscode.SymbolKind.Method, function_range, function_range));
                }else{
                    results.push(new vscode.DocumentSymbol(function_name, '', vscode.SymbolKind.Function, function_range, function_range));
                }
            }
        }

        return results;
    }
}
