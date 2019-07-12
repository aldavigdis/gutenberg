/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { Component } from '@wordpress/element';
import {
	withSelect,
	withDispatch,
} from '@wordpress/data';
import { compose } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';

class BlockList extends Component {
	constructor() {
		super( ...arguments );
		this.updateList = this.updateList.bind( this );
		this.state = {
			notes: [],
		};
	}

	componentDidMount() {
		document.addEventListener( 'selectionchange', this.updateList );
	}

	componentWillUnmount() {
		document.removeEventListener( 'selectionchange', this.updateList );
	}

	componentDidUpdate( prevProps ) {
		if ( this.props.contentRef === prevProps.contentRef ) {
			return;
		}

		this.updateList();
	}

	updateList() {
		// This is much faster than having to search all attributes for text
		// and parse the HTML. Perhaps this should also be debounced.
		const noteAnchors = document.querySelectorAll( '.note-anchor' );
		const notes = Array.from( noteAnchors ).map( ( element ) => {
			return {
				id: ( element.getAttribute( 'href' ) || '' ).slice( 1 ),
				isSelected: document.activeElement.isContentEditable && document.activeElement.contains( element ) && !! element.getAttribute( 'data-rich-text-format-boundary' ),
			};
		} );

		this.setState( { notes } );
	}

	render() {
		const {
			footnotes,
			updateFootnotes,
		} = this.props;

		if ( ! this.state.notes.length ) {
			return null;
		}

		return (
			<>
				<h2><small>Notes</small></h2>
				<style
					dangerouslySetInnerHTML={ {
						__html: `
body {
counter-reset: footnotes;
}

.editor-styles-wrapper a.note-anchor {
counter-increment: footnotes;
}

.note-anchor:after {
margin-left: 2px;
content: '[' counter( footnotes ) ']';
vertical-align: super;
font-size: smaller;
}
`,
					} }
				/>
				{ this.state.notes.map( ( { id, isSelected }, index ) =>
					<ol
						key={ id }
						start={ index + 1 }
						className={ classnames( 'note-list', {
							'is-selected': isSelected,
						} ) }
					>
						<li id={ id }>
							<a
								href={ `#${ id }-anchor` }
								aria-label={ __( 'Back to content' ) }
								onClick={ () => {
									// This is a hack to get the target to focus.
									// The attribute will later be removed when selection is set.
									document.getElementById( `${ id }-anchor` ).contentEditable = 'false';
								} }
							>
								↑
							</a>
							{ ' ' }
							<input
								aria-label={ __( 'Note' ) }
								value={ footnotes[ id ] || '' }
								onChange={ ( event ) => {
									updateFootnotes( {
										...footnotes,
										[ id ]: event.target.value,
									} );
								} }
								placeholder={ __( 'Note' ) }
							/>
						</li>
					</ol>
				) }
			</>
		);
	}
}

export default compose( [
	withSelect( ( select ) => {
		const {
			getEditorBlocks,
			getFootnotes,
		} = select( 'core/editor' );

		return {
			contentRef: getEditorBlocks(),
			footnotes: getFootnotes(),
		};
	} ),
	withDispatch( ( dispatch ) => {
		const {
			updateFootnotes,
		} = dispatch( 'core/editor' );

		return {
			updateFootnotes,
		};
	} ),
] )( BlockList );
