const readPkgUp = require( 'read-pkg-up' );

module.exports = {
	meta: {
		type: 'suggestion',
		schema: [],
	},
	create( context ) {
		const filename = context.getFilename();

		// Don't lint files in the test folder (otherwise `describe` is flagged).
		// TODO - accept a list of file or function names to ignore as a configuration option.
		if ( filename.includes( '/test/' ) ) {
			return {};
		}

		const { pkg: packageJson, path: packageJsonPath } = readPkgUp.sync( { cwd: filename } );

		// Unable to find a package.json, so don't lint this file.
		if ( ! packageJson ) {
			return {};
		}

		const { sideEffects } = packageJson;

		// Side effects is undefined or true, don't lint this file as side effects are expected.
		if ( sideEffects === undefined || sideEffects === true ) {
			return {};
		}

		const packageRoot = packageJsonPath.replace( 'package.json', '' );
		const relativeFilePath = filename.replace( packageRoot, '' );

		// Side effects is an array. If the filename is in the array, don't lint.
		if ( typeof sideEffects === 'object' && sideEffects.includes ) {
			if ( sideEffects.includes( relativeFilePath ) || sideEffects.includes( `./${ relativeFilePath }` ) ) {
				return {};
			}
		}

		return {
			ExpressionStatement( node ) {
				// Only lint function calls.
				if ( node.expression && node.expression.type !== 'CallExpression' ) {
					return;
				}

				// Only lint nodes in the upper-most scope.
				if ( node.parent && node.parent.type !== 'Program' ) {
					return;
				}

				context.report(
					node,
					`Call to function may introduce package level side-effects. Consider adding '${ relativeFilePath }' to the package's package.json sideEffect property.`
				);
			},
		};
	},
};
