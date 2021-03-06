const fs = require('fs');
const path = require('path');

function mkdirp(dir) {
	const parent = path.dirname(dir);
	if (parent === dir) return;

	mkdirp(parent);

	try {
		fs.mkdirSync(dir);
	} catch (err) {
		if (err.code !== 'EEXIST') throw err;
	}
}

module.exports = function svelte(options = {}) {
	const defaultPluginOptions = {
		file: 'bundle-tree.json',
	};

	const pluginOptions = Object.assign({}, defaultPluginOptions);
	Object.keys(options).forEach(key => {
		if (!(key in defaultPluginOptions))
			throw new Error(`unknown option ${key}`);
		pluginOptions[key] = options[key];
	});

	return {
		name: 'bundle-tree',

		writeBundle(bundle) {
			const tree = {};
			for (const chunk of Object.values(bundle)) {
				const node = {};
				if (chunk.isAsset===true) {
					node.isAsset = true;
				} else {
					if (chunk.isEntry===true) {
						node.isEntry = true;
					}
					if (chunk.isDynamicEntry===true) {
						node.isDynamicEntry = true;
					}
					if (chunk.imports && chunk.imports.length>0) {
						node.imports = [...chunk.imports];
					}
					if (chunk.dynamicImports && chunk.dynamicImports.length>0) {
						node.dynamicImports = [...chunk.dynamicImports];
					}
					if (chunk.assetImports && chunk.assetImports.length>0) {
						node.assetImports = [...chunk.assetImports];
					}
				}
				tree[chunk.fileName] = node;
			}
			mkdirp(path.dirname(pluginOptions.file));
			fs.writeFileSync(pluginOptions.file, JSON.stringify(tree, null, '  '));
		}
	};
};
