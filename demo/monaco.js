import { languages } from 'monaco-editor';
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import iniWorker from 'monaco-editor/esm/vs/basic-languages/ini/ini?worker';
import yamlWorker from 'monaco-editor/esm/vs/basic-languages/yaml/yaml?worker';

self.MonacoEnvironment = {
	getWorker(_, label) {
		if (label === 'ini') {
			return new iniWorker();
		}
		if (label === 'yaml') {
			return new yamlWorker();
		}
		return new editorWorker();
	}
};

languages.typescript.typescriptDefaults.setEagerModelSync(true);
