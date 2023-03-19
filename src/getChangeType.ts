import * as vscode from 'vscode';
import { CodeChangeType } from './enums';
import { logger } from './logger';

export class ChangeTypeInternalInput {
    constructor(
        public numEventChanges: number, 
        public eventReason: string | undefined, 
        public rangeLength: number,
        public text: string) {}
}

export class ChangeTypeInternalInputResult {
    constructor(
        public numEventChanges: number, 
        public eventReason: string | undefined, 
        public rangeLength: number,
        public text: string,
        public changeType: CodeChangeType) {}
}


export function getChangeTypeInternal(
    numEventChanges: number,
    eventReason: string | undefined,
    rangeLength: number,
    text: string) : CodeChangeType {        
        logger.debug(`getChangeTypeInternal`);

        logger.debug(`numEventChanges ${numEventChanges}`);
        logger.debug(`eventReason ${eventReason}`);
        logger.debug(`rangeLength ${rangeLength}`);        
        logger.debug(`text ${text}`);
        if (text.length > 0) {
            const regex = /\S/g;
            const nonWhitespaceCount = (text.match(regex) || []).length;
            if (nonWhitespaceCount === 0) {        
                logger.debug('indentations');
                return CodeChangeType.indentations;
            }
        }
        if (numEventChanges > 1) {
            logger.debug('part of multiple changes, that is not indentations');
            return CodeChangeType.automaticRefactoring;
        }

        if (eventReason === vscode.TextDocumentChangeReason.Undo.toString()) {
            logger.debug('undo');
            return CodeChangeType.undo;
        } 
        
        if (eventReason === vscode.TextDocumentChangeReason.Redo.toString()) {
            logger.debug('redo');
            return CodeChangeType.redo;
        }

        const lines = text.split('\n');
        const numLines = lines.length;
        logger.debug(`numLines ${numLines}`);

        if (numLines === 0) {
            // if (rangeLength === 0) {
            //     return CodeChangeType.additions;
            // }
            if (rangeLength > 0) {
                logger.debug(`0 lines, range>0 => D`);
                return CodeChangeType.deletions;
            }
        }

        if (numLines === 1) {
            if (rangeLength === 0) {
                if (text.length === 1) {
                    logger.debug(`1 line, range=0, text=1 => A`);
                    return CodeChangeType.additions;
                } else if (text.length  < 20) {
                    logger.debug(`1 line, range=0, 1<text<20 => AC`);
                    return CodeChangeType.autoComplete;
                } else {
                    logger.debug(`1 line, range=0, text>20 => P`);
                    return CodeChangeType.paste;
                }
            }
            if (rangeLength > 0) {
                if (text.length === 0) {
                    logger.debug(`1 line, range>0, text=0 => D (possibly AR)`);
                    return CodeChangeType.deletions;
                } else if (text.length === 1) {
                    logger.debug(`1 line, range>0, text=1 => E`);
                    return CodeChangeType.editions;
                } else if (text.length > 1) {
                    logger.debug(`1 line, range>0, text>1 => AC (that overwrites)`);
                    return CodeChangeType.autoComplete;
                }         
            }
        }

        if (numLines > 1) {
            if (rangeLength === 0) {        
                logger.debug(`lines>1, range=0,  => P`);            
                return CodeChangeType.paste;
            }                 
            if (rangeLength > 0) {
                logger.debug(`lines>1, range>0,  => AC`);
                return CodeChangeType.autoComplete;
            }
        }

        logger.debug(`unhandled, default to A`);
        return CodeChangeType.additions;
    }

export function getChangeType(event: vscode.TextDocumentChangeEvent, 
    change: vscode.TextDocumentContentChangeEvent) : CodeChangeType  {
        
        return getChangeTypeInternal(event.contentChanges.length,
            event.reason?.toString(),
            change.rangeLength,
            change.text);
        }

            


    